// Copyright 2025 Circle LLC
// Licensed under the MIT License

import { Configurable, DeepPartial, mergeConfig } from "../../core/config.js"

import type { DateInput, TimezoneConfig } from "./timezone.types.js"

// Reexporta os tipos públicos para manter a superfície de import existente.
export type * from "./timezone.types.js"

/** Unidades para o tempo relativo, da menor para a maior. */
const DIVISIONS: { amount: number; unit: Intl.RelativeTimeFormatUnit }[] = [
    { amount: 60, unit: "second" },
    { amount: 60, unit: "minute" },
    { amount: 24, unit: "hour" },
    { amount: 7, unit: "day" },
    { amount: 4.34524, unit: "week" },
    { amount: 12, unit: "month" },
    { amount: Number.POSITIVE_INFINITY, unit: "year" }
]

/**
 * Engine de timezone baseada nas APIs nativas `Intl`. Numa rede social o servidor
 * grava em UTC e o cliente formata na hora de exibir, no fuso de quem lê — tudo
 * com horário de verão tratado automaticamente.
 */
export class Timezone implements Configurable<TimezoneConfig> {
    public readonly config: Readonly<TimezoneConfig>

    private readonly zone: string
    private readonly locale: string
    private readonly now: () => Date

    constructor(config: TimezoneConfig = {}) {
        // exactOptionalPropertyTypes: só copiamos chaves realmente presentes.
        const normalized: TimezoneConfig = {}
        if (config.zone !== undefined) normalized.zone = config.zone
        if (config.locale !== undefined) normalized.locale = config.locale
        if (config.now !== undefined) normalized.now = config.now

        this.config = normalized
        this.zone = normalized.zone ?? Timezone.detect()
        this.locale = normalized.locale ?? "pt-BR"
        this.now = normalized.now ?? (() => new Date())
    }

    /** Fuso IANA do ambiente atual, ex.: "America/Sao_Paulo". */
    public static detect(): string {
        return Intl.DateTimeFormat().resolvedOptions().timeZone
    }

    /**
     * Formata um instante (UTC) para exibição. Horário de verão é tratado pelo
     * `Intl`. Default: `{ dateStyle: "short", timeStyle: "short" }`.
     */
    public format(
        input: DateInput,
        options: Intl.DateTimeFormatOptions & { zone?: string } = {}
    ): string {
        const { zone, ...rest } = options
        const hasExplicitStyle =
            rest.dateStyle !== undefined ||
            rest.timeStyle !== undefined ||
            rest.year !== undefined ||
            rest.month !== undefined ||
            rest.day !== undefined ||
            rest.hour !== undefined ||
            rest.minute !== undefined ||
            rest.second !== undefined ||
            rest.weekday !== undefined ||
            rest.era !== undefined

        const defaults: Intl.DateTimeFormatOptions = hasExplicitStyle
            ? {}
            : { dateStyle: "short", timeStyle: "short" }

        return new Intl.DateTimeFormat(this.locale, {
            timeZone: zone ?? this.zone,
            ...defaults,
            ...rest
        }).format(this.toDate(input))
    }

    /** Tempo relativo a agora: "há 3 horas", "agora", "ontem", "há 2 dias". */
    public fromNow(input: DateInput): string {
        let delta = (this.toDate(input).getTime() - this.now().getTime()) / 1000
        const rtf = new Intl.RelativeTimeFormat(this.locale, { numeric: "auto" })

        for (const { amount, unit } of DIVISIONS) {
            if (Math.abs(delta) < amount) return rtf.format(Math.round(delta), unit)
            delta /= amount
        }
        return rtf.format(Math.round(delta), "year")
    }

    /** Deriva uma nova engine imutável aplicando o patch sobre a config atual. */
    public withConfig(patch: DeepPartial<TimezoneConfig>): this {
        const merged = mergeConfig(this.config, patch)
        return new Timezone(merged) as this
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
}
