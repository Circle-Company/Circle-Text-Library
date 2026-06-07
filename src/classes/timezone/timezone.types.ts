// Copyright 2025 Circle LLC
// Licensed under the MIT License

/**
 * Tipos públicos do `Timezone`.
 *
 * A entrada de datas aceita pela engine e a config injetável (fuso, locale e
 * relógio). A implementação vive em `./index.ts`.
 */

/** ISO string, epoch em milissegundos ou objeto `Date`. */
export type DateInput = string | number | Date

/**
 * Configuração da engine de timezone. Tudo opcional — os defaults entregam o
 * comportamento esperado numa rede social (fuso detectado + locale pt-BR).
 */
export interface TimezoneConfig {
    /** Nome IANA, ex.: "America/Sao_Paulo". Default: fuso detectado do sistema. */
    zone?: string
    /** Locale BCP-47, ex.: "pt-BR". Default: "pt-BR". */
    locale?: string
    /** Relógio injetável para testabilidade. Default: () => new Date(). */
    now?: () => Date
}
