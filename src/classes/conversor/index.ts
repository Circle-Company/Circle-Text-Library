// Copyright 2025 Circle LLC
// Licensed under the MIT License

import type { Configurable, DeepPartial } from "../../core/config.js"
import { mergeConfig } from "../../core/config.js"

/**
 * Configuração compartilhada pelos formatters. O único eixo configurável é o
 * `locale`, usado por todas as formatações locale-aware (`Intl`).
 */
export interface FormatterConfig {
    /** Locale BCP-47. Default: `"pt-BR"`. */
    locale?: string
}

/** Locale default usado pelas conveniências estáticas e quando nada é informado. */
const DEFAULT_LOCALE = "pt-BR"

/** Opções do `TextFormatter.truncate`. */
export interface TruncateOptions {
    /** Reticências adicionadas ao final. Contam no orçamento de `size`. Default `"…"`. */
    ellipsis?: string
    /** Se `true`, evita cortar no meio de uma palavra. Default `false`. */
    byWord?: boolean
}

/** Resolve a config para um objeto completo (sem campos opcionais ausentes). */
function resolveConfig(config?: FormatterConfig): Required<FormatterConfig> {
    return { locale: config?.locale ?? DEFAULT_LOCALE }
}

// ────────────────────────────────────────────────────────────────────────────
// NumberFormatter
// ────────────────────────────────────────────────────────────────────────────

/**
 * Formatação de números locale-aware via `Intl.NumberFormat`. Cada método tem
 * uma versão de instância (respeita o locale fixado) e uma estática de
 * conveniência (usa o locale default `pt-BR`).
 */
export class NumberFormatter implements Configurable<FormatterConfig> {
    public readonly config: Readonly<Required<FormatterConfig>>
    private readonly locale: string

    constructor(config: FormatterConfig = {}) {
        this.config = Object.freeze(resolveConfig(config))
        this.locale = this.config.locale
    }

    public withConfig(patch: DeepPartial<FormatterConfig>): this {
        const next = mergeConfig<FormatterConfig>(this.config, patch)
        return new NumberFormatter(next) as this
    }

    /** Separador de milhar locale-aware. Ex (pt-BR): `1234567 → "1.234.567"`. */
    public thousands(n: number): string {
        return new Intl.NumberFormat(this.locale).format(n)
    }

    /** Notação compacta. Ex (pt-BR): `1500 → "1,5 mil"`; (en-US): `1500 → "1.5K"`. */
    public compact(n: number): string {
        return new Intl.NumberFormat(this.locale, {
            notation: "compact",
            maximumFractionDigits: 1
        }).format(n)
    }

    /** Moeda. Ex (pt-BR, BRL): `1234.5 → "R$ 1.234,50"`. */
    public currency(n: number, code: string = "BRL"): string {
        return new Intl.NumberFormat(this.locale, {
            style: "currency",
            currency: code
        }).format(n)
    }

    /**
     * Percentual. O valor é uma fração (`0.25 → "25%"`).
     * @param fraction casas decimais máximas (default `0`).
     */
    public percent(n: number, fraction: number = 0): string {
        return new Intl.NumberFormat(this.locale, {
            style: "percent",
            maximumFractionDigits: fraction
        }).format(n)
    }

    /**
     * Decimal com número fixo de casas. Ex (pt-BR): `3.14159, 2 → "3,14"`.
     * @param places casas decimais (default `2`).
     */
    public decimal(n: number, places: number = 2): string {
        return new Intl.NumberFormat(this.locale, {
            minimumFractionDigits: places,
            maximumFractionDigits: places
        }).format(n)
    }

    /** Ordinal. Ex (pt-BR): `3 → "3º"`; (en-US): `3 → "3rd"`. */
    public ordinal(n: number): string {
        const pr = new Intl.PluralRules(this.locale, { type: "ordinal" })
        const category = pr.select(n)
        if (this.locale.toLowerCase().startsWith("pt")) {
            return `${n}º`
        }
        const suffixes: Record<string, string> = {
            one: "st",
            two: "nd",
            few: "rd",
            other: "th"
        }
        const suffix = suffixes[category] ?? "th"
        return `${n}${suffix}`
    }

    /** Tamanho de arquivo legível. Ex (pt-BR): `1048576 → "1 MB"`. */
    public fileSize(bytes: number): string {
        const units = ["B", "KB", "MB", "GB", "TB", "PB"] as const
        const sign = bytes < 0 ? "-" : ""
        let value = Math.abs(bytes)
        let index = 0
        while (value >= 1024 && index < units.length - 1) {
            value /= 1024
            index++
        }
        const unit = units[index] ?? "B"
        const formatted = new Intl.NumberFormat(this.locale, {
            maximumFractionDigits: 1
        }).format(value)
        return `${sign}${formatted} ${unit}`
    }

    // ── conveniências estáticas (locale default pt-BR) ──────────────────────
    private static readonly defaultInstance = new NumberFormatter()

    public static thousands(n: number): string {
        return NumberFormatter.defaultInstance.thousands(n)
    }
    public static compact(n: number): string {
        return NumberFormatter.defaultInstance.compact(n)
    }
    public static currency(n: number, code: string = "BRL"): string {
        return NumberFormatter.defaultInstance.currency(n, code)
    }
    public static percent(n: number, fraction: number = 0): string {
        return NumberFormatter.defaultInstance.percent(n, fraction)
    }
    public static decimal(n: number, places: number = 2): string {
        return NumberFormatter.defaultInstance.decimal(n, places)
    }
    public static ordinal(n: number): string {
        return NumberFormatter.defaultInstance.ordinal(n)
    }
    public static fileSize(bytes: number): string {
        return NumberFormatter.defaultInstance.fileSize(bytes)
    }
}

// ────────────────────────────────────────────────────────────────────────────
// TextFormatter
// ────────────────────────────────────────────────────────────────────────────

/**
 * Formatação de texto. Métodos sensíveis a Unicode usam `[...t]` para preservar
 * pares surrogate (emoji). Versões de instância e estáticas, como o
 * `NumberFormatter`.
 */
export class TextFormatter implements Configurable<FormatterConfig> {
    public readonly config: Readonly<Required<FormatterConfig>>
    private readonly locale: string

    constructor(config: FormatterConfig = {}) {
        this.config = Object.freeze(resolveConfig(config))
        this.locale = this.config.locale
    }

    public withConfig(patch: DeepPartial<FormatterConfig>): this {
        const next = mergeConfig<FormatterConfig>(this.config, patch)
        return new TextFormatter(next) as this
    }

    /** Primeira letra maiúscula, o resto inalterado. Ex: `"olá mundo" → "Olá mundo"`. */
    public capitalize(t: string): string {
        if (!t) return ""
        const chars = [...t]
        const first = chars[0]
        if (first === undefined) return ""
        return first.toLocaleUpperCase(this.locale) + chars.slice(1).join("")
    }

    /** Cada palavra capitalizada. Ex: `"olá mundo" → "Olá Mundo"`. */
    public titleCase(t: string): string {
        if (!t) return ""
        return t.replace(/\S+/g, (word) => {
            const chars = [...word]
            const first = chars[0]
            if (first === undefined) return word
            return (
                first.toLocaleUpperCase(this.locale) +
                chars.slice(1).join("").toLocaleLowerCase(this.locale)
            )
        })
    }

    /** Inverte preservando emoji/surrogate pairs. Ex: `"a😀b" → "b😀a"`. */
    public reverse(t: string): string {
        if (!t) return ""
        return [...t].reverse().join("")
    }

    /** Remove acentos/diacríticos. Ex: `"ação" → "acao"`. */
    public stripAccents(t: string): string {
        if (!t) return ""
        return t.normalize("NFD").replace(/\p{Diacritic}/gu, "")
    }

    /** Gera um slug url-safe. Ex: `"Olá, Mundo!" → "ola-mundo"`. */
    public slug(t: string): string {
        if (!t) return ""
        return this.stripAccents(t)
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, "")
            .replace(/[\s_-]+/g, "-")
            .replace(/^-+|-+$/g, "")
    }

    /**
     * Trunca para no máximo `size` caracteres (incluindo as reticências, que
     * entram no orçamento — o resultado nunca excede `size`).
     * @param opts `ellipsis` (default `"…"`) e `byWord` (não cortar no meio da palavra).
     */
    public truncate(t: string, size: number, opts: TruncateOptions = {}): string {
        const ellipsis = opts.ellipsis ?? "…"
        const byWord = opts.byWord ?? false
        if (!t) return ""
        const chars = [...t]
        if (chars.length <= size) return t
        const ellipsisLength = [...ellipsis].length
        const budget = Math.max(0, size - ellipsisLength)
        let cut = chars.slice(0, budget).join("")
        if (byWord) cut = cut.replace(/\s+\S*$/, "")
        return cut + ellipsis
    }

    /**
     * Trunca por número de palavras. Ex: `"a b c d", 2 → "a b…"`.
     * @param ellipsis reticências quando há corte (default `"…"`).
     */
    public truncateWords(t: string, n: number, ellipsis: string = "…"): string {
        if (!t) return ""
        const words = t.trim().split(/\s+/)
        if (n <= 0) return ellipsis
        if (words.length <= n) return t
        return words.slice(0, n).join(" ") + ellipsis
    }

    /** Iniciais do nome. Ex: `"João Silva" → "JS"`; `"Maria Clara Souza", 2 → "MC"`. */
    public initials(name: string, max: number = 2): string {
        if (!name) return ""
        const words = name.trim().split(/\s+/).filter(Boolean)
        return words
            .slice(0, Math.max(0, max))
            .map((w) => {
                const first = [...w][0]
                return first ? first.toLocaleUpperCase(this.locale) : ""
            })
            .join("")
    }

    /** Troca tags `<br>` por quebras de linha reais. */
    public brToNewlines(t: string): string {
        if (!t) return ""
        return t.replace(/<br\s*\/?>/gi, "\n")
    }

    // ── conveniências estáticas (locale default pt-BR) ──────────────────────
    private static readonly defaultInstance = new TextFormatter()

    public static capitalize(t: string): string {
        return TextFormatter.defaultInstance.capitalize(t)
    }
    public static titleCase(t: string): string {
        return TextFormatter.defaultInstance.titleCase(t)
    }
    public static reverse(t: string): string {
        return TextFormatter.defaultInstance.reverse(t)
    }
    public static stripAccents(t: string): string {
        return TextFormatter.defaultInstance.stripAccents(t)
    }
    public static slug(t: string): string {
        return TextFormatter.defaultInstance.slug(t)
    }
    public static truncate(t: string, size: number, opts: TruncateOptions = {}): string {
        return TextFormatter.defaultInstance.truncate(t, size, opts)
    }
    public static truncateWords(t: string, n: number, ellipsis: string = "…"): string {
        return TextFormatter.defaultInstance.truncateWords(t, n, ellipsis)
    }
    public static initials(name: string, max: number = 2): string {
        return TextFormatter.defaultInstance.initials(name, max)
    }
    public static brToNewlines(t: string): string {
        return TextFormatter.defaultInstance.brToNewlines(t)
    }
}

// ────────────────────────────────────────────────────────────────────────────
// Formatter (agregado)
// ────────────────────────────────────────────────────────────────────────────

/**
 * Agregado de conveniência que espelha `transform.number` / `transform.text`.
 * Propaga o mesmo `locale` para ambos os formatters.
 */
export class Formatter implements Configurable<FormatterConfig> {
    public readonly config: Readonly<Required<FormatterConfig>>
    public readonly number: NumberFormatter
    public readonly text: TextFormatter

    constructor(config: FormatterConfig = {}) {
        this.config = Object.freeze(resolveConfig(config))
        this.number = new NumberFormatter(this.config)
        this.text = new TextFormatter(this.config)
    }

    public withConfig(patch: DeepPartial<FormatterConfig>): this {
        const next = mergeConfig<FormatterConfig>(this.config, patch)
        return new Formatter(next) as this
    }
}
