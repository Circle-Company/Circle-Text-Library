// Copyright 2025 Circle LLC
// Licensed under the MIT License

import { Configurable, DeepPartial, mergeConfig } from "../../core/config.js"
import { Timezone } from "../timezone/index.js"

import type { TimezoneConfig } from "../timezone/timezone.types.js"
import type { DateFormatterConfig, DateInput, RelativeTimeUnit } from "./date.types.js"

// Reexporta os tipos públicos para manter a superfície de import do subpath.
export type * from "./date.types.js"

/** Unidades para o tempo relativo, da menor para a maior, com o fator de roll-over. */
const BASE_DIVISIONS: { amount: number; unit: RelativeTimeUnit }[] = [
    { amount: 60, unit: "second" },
    { amount: 60, unit: "minute" },
    { amount: 24, unit: "hour" },
    { amount: 7, unit: "day" },
    { amount: 4.34524, unit: "week" },
    { amount: 12, unit: "month" },
    { amount: Number.POSITIVE_INFINITY, unit: "year" }
]

const DEFAULT_LOCALE = "pt-BR"
const DEFAULT_STYLE: Intl.RelativeTimeFormatStyle = "long"
const DEFAULT_NUMERIC: "always" | "auto" = "auto"
const DEFAULT_MAX_UNIT: RelativeTimeUnit = "year"
const DEFAULT_JUST_NOW_THRESHOLD = 30

/** Rótulo "agora" por idioma, usado quando `justNowLabel` não é informado. */
const JUST_NOW_BY_LANG: Record<string, string> = {
    pt: "agora mesmo",
    en: "just now",
    es: "ahora mismo",
    fr: "à l'instant"
}

/**
 * Engine de datas focada em **tempo relativo customizável** ("to relative time"),
 * separada do `Timezone`. Os defaults entregam frases naturais em pt-BR, e cada
 * eixo é configurável: idioma (pt-BR / en-US / qualquer BCP-47), estilo
 * (`long`/`short`/`narrow`), `numeric`, unidade máxima e o limiar do "agora mesmo".
 *
 * Conversa com o `Timezone` para formatação **absoluta** (`format`,
 * `fromNowOrDate`), mas pode ser instanciada sozinha — o tempo relativo não
 * depende de nenhum fuso.
 */
export class DateFormatter implements Configurable<DateFormatterConfig> {
    public readonly config: Readonly<DateFormatterConfig>

    private readonly locale: string
    private readonly clock: () => Date
    private readonly style: Intl.RelativeTimeFormatStyle
    private readonly numeric: "always" | "auto"
    private readonly maxUnit: RelativeTimeUnit
    private readonly justNowThreshold: number
    private readonly justNowLabel: string
    private readonly zone: string | undefined
    private readonly injectedTz: Timezone | undefined
    /** `Timezone` derivado, memoizado na primeira formatação absoluta. */
    private tz: Timezone | undefined

    constructor(config: DateFormatterConfig = {}) {
        // exactOptionalPropertyTypes: só copiamos chaves realmente presentes.
        const normalized: DateFormatterConfig = {}
        if (config.locale !== undefined) normalized.locale = config.locale
        if (config.now !== undefined) normalized.now = config.now
        if (config.style !== undefined) normalized.style = config.style
        if (config.numeric !== undefined) normalized.numeric = config.numeric
        if (config.maxUnit !== undefined) normalized.maxUnit = config.maxUnit
        if (config.justNowThreshold !== undefined)
            normalized.justNowThreshold = config.justNowThreshold
        if (config.justNowLabel !== undefined) normalized.justNowLabel = config.justNowLabel
        if (config.zone !== undefined) normalized.zone = config.zone
        if (config.timezone !== undefined) normalized.timezone = config.timezone

        this.config = normalized
        this.locale = normalized.locale ?? DEFAULT_LOCALE
        this.clock = normalized.now ?? (() => new Date())
        this.style = normalized.style ?? DEFAULT_STYLE
        this.numeric = normalized.numeric ?? DEFAULT_NUMERIC
        this.maxUnit = normalized.maxUnit ?? DEFAULT_MAX_UNIT
        this.justNowThreshold = normalized.justNowThreshold ?? DEFAULT_JUST_NOW_THRESHOLD
        this.justNowLabel = normalized.justNowLabel ?? DateFormatter.defaultJustNow(this.locale)
        this.zone = normalized.zone
        this.injectedTz = normalized.timezone
    }

    /**
     * Tempo relativo a agora, customizável: "agora mesmo", "há 3 horas",
     * "ontem", "há 2 dias", "em 5 minutos". Respeita `style`, `numeric`,
     * `maxUnit`, `justNowThreshold` e o `locale` (pt-BR, en-US, …).
     */
    public fromNow(input: DateInput): string {
        const deltaSeconds = (this.toDate(input).getTime() - this.clock().getTime()) / 1000
        if (Math.abs(deltaSeconds) < this.justNowThreshold) return this.justNowLabel

        const rtf = new Intl.RelativeTimeFormat(this.locale, {
            numeric: this.numeric,
            style: this.style
        })

        const divisions = this.divisions()
        let delta = deltaSeconds
        for (const { amount, unit } of divisions) {
            if (Math.abs(delta) < amount) return rtf.format(Math.round(delta), unit)
            delta /= amount
        }
        const last = divisions[divisions.length - 1]
        return rtf.format(Math.round(delta), last ? last.unit : "year")
    }

    /** Alias semântico de `fromNow` ("to relative time"). */
    public toRelativeTime(input: DateInput): string {
        return this.fromNow(input)
    }

    /**
     * Formatação **absoluta** delegada ao `Timezone` (DST automático). Aceita as
     * mesmas `Intl.DateTimeFormatOptions` mais um `zone?` pontual.
     */
    public format(
        input: DateInput,
        options: Intl.DateTimeFormatOptions & { zone?: string } = {}
    ): string {
        return this.timezone().format(input, options)
    }

    /**
     * Híbrido estilo "feed": tempo relativo enquanto o instante é recente; data
     * absoluta quando ultrapassa `withinSeconds` (default 7 dias). Ex.: "há 5
     * minutos" agora, "15 de jan. de 2024" semanas depois.
     */
    public fromNowOrDate(
        input: DateInput,
        withinSeconds: number = 7 * 24 * 60 * 60,
        dateOptions: Intl.DateTimeFormatOptions & { zone?: string } = { dateStyle: "medium" }
    ): string {
        const deltaSeconds = Math.abs(
            (this.toDate(input).getTime() - this.clock().getTime()) / 1000
        )
        return deltaSeconds <= withinSeconds ? this.fromNow(input) : this.format(input, dateOptions)
    }

    /** Deriva uma nova engine imutável aplicando o patch sobre a config atual. */
    public withConfig(patch: DeepPartial<DateFormatterConfig>): this {
        // Anota T explicitamente: a `Timezone` em config não deve virar
        // DeepPartial<Timezone> na inferência (mesmo padrão do conversor).
        const merged = mergeConfig<DateFormatterConfig>(this.config, patch)
        return new DateFormatter(merged) as this
    }

    /** Deriva uma engine amarrada a um `Timezone` específico (DI explícita). */
    public withTimezone(timezone: Timezone): this {
        const merged: DateFormatterConfig = { ...this.config, timezone }
        return new DateFormatter(merged) as this
    }

    // ── internos ────────────────────────────────────────────────────────────

    /** Divisões capadas em `maxUnit` (a última nunca rola para a próxima unidade). */
    private divisions(): { amount: number; unit: RelativeTimeUnit }[] {
        const idx = BASE_DIVISIONS.findIndex((d) => d.unit === this.maxUnit)
        const sliced = idx === -1 ? BASE_DIVISIONS : BASE_DIVISIONS.slice(0, idx + 1)
        const lastIndex = sliced.length - 1
        return sliced.map((d, i) =>
            i === lastIndex ? { amount: Number.POSITIVE_INFINITY, unit: d.unit } : d
        )
    }

    /** `Timezone` usado na formatação absoluta: injetado, derivado ou criado. */
    private timezone(): Timezone {
        if (!this.tz) {
            if (this.injectedTz) {
                // Alinha o locale do fuso injetado ao do DateFormatter, mantendo o fuso.
                this.tz =
                    this.injectedTz.config.locale === this.locale
                        ? this.injectedTz
                        : this.injectedTz.withConfig({ locale: this.locale })
            } else {
                const cfg: TimezoneConfig = { locale: this.locale, now: this.clock }
                if (this.zone !== undefined) cfg.zone = this.zone
                this.tz = new Timezone(cfg)
            }
        }
        return this.tz
    }

    /** Normaliza ISO string / epoch ms / Date e valida. */
    private toDate(input: DateInput): Date {
        if (
            input === null ||
            input === undefined ||
            (typeof input !== "string" && typeof input !== "number" && !(input instanceof Date))
        ) {
            throw new Error("Data inválida fornecida")
        }
        const date = input instanceof Date ? input : new Date(input)
        if (isNaN(date.getTime())) throw new Error("Data inválida fornecida")
        return date
    }

    /** Rótulo "agora" default a partir do idioma do locale. */
    private static defaultJustNow(locale: string): string {
        const lang = locale.toLowerCase().slice(0, 2)
        return JUST_NOW_BY_LANG[lang] ?? JUST_NOW_BY_LANG.en ?? "just now"
    }

    // ── conveniências estáticas (locale default pt-BR, relógio do sistema) ────
    private static readonly defaultInstance = new DateFormatter()

    /** Tempo relativo com os defaults (pt-BR). Conveniência sem instanciar. */
    public static fromNow(input: DateInput): string {
        return DateFormatter.defaultInstance.fromNow(input)
    }

    /** Alias estático de `fromNow`. */
    public static toRelativeTime(input: DateInput): string {
        return DateFormatter.defaultInstance.toRelativeTime(input)
    }
}
