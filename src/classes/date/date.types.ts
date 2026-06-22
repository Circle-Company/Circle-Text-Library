// Copyright 2025 Circle LLC
// Licensed under the MIT License

/**
 * Tipos públicos do `DateFormatter`.
 *
 * O `DateFormatter` é uma engine independente focada em **tempo relativo**
 * customizável (pt-BR / en-US e qualquer locale BCP-47). Ele conversa com o
 * `Timezone` para formatação absoluta, mas pode ser instanciado sozinho. A
 * implementação vive em `./index.ts`.
 */

import type { Timezone } from "../timezone/index.js"

// `DateInput` é compartilhado com o `Timezone` (ISO string, epoch ms ou `Date`).
import type { DateInput } from "../timezone/timezone.types.js"

/** Unidade de tempo aceita pelo `Intl.RelativeTimeFormat`. */
export type RelativeTimeUnit = Intl.RelativeTimeFormatUnit

/**
 * Configuração da engine de datas. Tudo opcional — os defaults entregam tempo
 * relativo natural em pt-BR (`"long"`, `numeric: "auto"`, "agora mesmo" para o
 * presente imediato).
 */
export interface DateFormatterConfig {
    /** Locale BCP-47, ex.: `"pt-BR"` ou `"en-US"`. Default: `"pt-BR"`. */
    locale?: string
    /** Relógio injetável para testabilidade. Default: `() => new Date()`. */
    now?: () => Date
    /**
     * Estilo das frases do `Intl.RelativeTimeFormat`:
     * `"long"` ("há 3 horas"), `"short"` ("há 3 h"), `"narrow"` ("3 h atrás").
     * Default: `"long"`.
     */
    style?: Intl.RelativeTimeFormatStyle
    /**
     * `"auto"` produz "ontem"/"amanhã"; `"always"` força "há 1 dia"/"em 1 dia".
     * Default: `"auto"`.
     */
    numeric?: "always" | "auto"
    /**
     * Maior unidade permitida (teto). Ex.: `"day"` exibe "há 400 dias" em vez de
     * roer para meses/anos. Default: `"year"`.
     */
    maxUnit?: RelativeTimeUnit
    /**
     * Abaixo deste número de segundos (em valor absoluto) o resultado é
     * `justNowLabel` em vez de "há X segundos". Default: `30`.
     */
    justNowThreshold?: number
    /**
     * Texto usado quando a diferença está dentro de `justNowThreshold`.
     * Default por locale: pt → `"agora mesmo"`, en → `"just now"`.
     */
    justNowLabel?: string
    /**
     * Fuso IANA usado na formatação absoluta (`format` / `fromNowOrDate`).
     * Default: fuso detectado do sistema (via `Timezone`).
     */
    zone?: string
    /**
     * Instância de `Timezone` injetada para a formatação absoluta (DI). Quando
     * ausente, o `DateFormatter` cria uma sob demanda a partir de `zone`/`locale`.
     */
    timezone?: Timezone
}

export type { DateInput }
