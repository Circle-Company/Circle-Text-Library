// Copyright 2025 Circle Company, Inc.
// Licensed under the Circle License, Version 1.0

// ============================================================================
// Tipos e Configurações
// ============================================================================

export type DateFormatStyle = "full" | "short" | "abbreviated"
export type DateFormatLocale = "pt" | "en"

export interface DateFormatterConfig {
    /**
     * Estilo de formatação:
     * - "full": "10 minutos atrás", "2 dias atrás"
     * - "short": "10m", "2d", "1h"
     * - "abbreviated": "10min", "2d", "1h"
     */
    style?: DateFormatStyle

    /**
     * Locale para formatação de datas completas
     */
    locale?: DateFormatLocale

    /**
     * Usar "há" antes do tempo (apenas no estilo "full")
     * @example "há 10 minutos" vs "10 minutos atrás"
     */
    usePrefix?: boolean

    /**
     * Mostrar sufixo "atrás" (apenas no estilo "full")
     */
    useSuffix?: boolean

    /**
     * Capitalizar primeira letra
     */
    capitalize?: boolean

    /**
     * Usar tempo aproximado para períodos longos:
     * - Anos: "mais de um ano atrás" ao invés de "2 anos atrás"
     * - Meses: converte para semanas (ex: "12 semanas atrás")
     * - Semanas: "mais de uma semana atrás" quando >= 2 semanas
     */
    useApproximateTime?: boolean

    /**
     * Janela de tempo (em segundos) para considerar como "recente"
     * Qualquer tempo dentro deste limite será mostrado com o recentTimeLabel.
     * @default 0 (desabilitado, mostra tempo exato)
     * @example 120 // qualquer coisa até 2 minutos será mostrado como "agora mesmo"
     */
    recentTimeThreshold?: number

    /**
     * Texto customizado para tempo recente
     * @default "agora"
     * @example "agora mesmo" ou "agora pouco"
     */
    recentTimeLabel?: string
}

// ============================================================================
// Classe DateFormatter
// ============================================================================

/**
 * Classe para formatação de datas em texto humanizado para redes sociais.
 *
 * @example
 * ```ts
 * const formatter = new DateFormatter({ style: "short" })
 * formatter.toRelativeTime(new Date())  // "agora" ou "10m" ou "2h"
 *
 * const fullFormatter = new DateFormatter({ style: "full" })
 * fullFormatter.toRelativeTime(pastDate)  // "10 minutos atrás"
 * ```
 */
export class DateFormatter {
    private style: DateFormatStyle
    private locale: DateFormatLocale
    private usePrefix: boolean
    private useSuffix: boolean
    private capitalize: boolean
    private useApproximateTime: boolean
    private recentTimeThreshold: number
    private recentTimeLabel: string

    constructor(config?: DateFormatterConfig) {
        this.style = config?.style ?? "full"
        this.locale = config?.locale ?? "pt"
        this.usePrefix = config?.usePrefix ?? false
        this.useSuffix = config?.useSuffix ?? true
        this.capitalize = config?.capitalize ?? false
        this.useApproximateTime = config?.useApproximateTime ?? false
        this.recentTimeThreshold = config?.recentTimeThreshold ?? 0
        this.recentTimeLabel = config?.recentTimeLabel ?? "agora"
    }

    public getStyle(): DateFormatStyle {
        return this.style
    }

    public getLocale(): DateFormatLocale {
        return this.locale
    }

    public setStyle(style: DateFormatStyle): void {
        this.style = style
    }

    public setLocale(locale: DateFormatLocale): void {
        this.locale = locale
    }

    public setUsePrefix(usePrefix: boolean): void {
        this.usePrefix = usePrefix
    }

    public setUseSuffix(useSuffix: boolean): void {
        this.useSuffix = useSuffix
    }

    public setCapitalize(capitalize: boolean): void {
        this.capitalize = capitalize
    }

    public setUseApproximateTime(useApproximateTime: boolean): void {
        this.useApproximateTime = useApproximateTime
    }

    public setRecentTimeThreshold(threshold: number): void {
        this.recentTimeThreshold = threshold
    }

    public setRecentTimeLabel(label: string): void {
        this.recentTimeLabel = label
    }

    // ============================================================================
    // Métodos Públicos - Conversão Relativa de Tempo
    // ============================================================================

    /**
     * Converte uma data para texto relativo humanizado.
     *
     * @param date - Data a ser convertida (deve ser no passado)
     * @returns String descrevendo quanto tempo atrás
     *
     * @throws {Error} Se a data for inválida ou estiver no futuro
     *
     * @example
     * ```ts
     * // Estilo "full"
     * formatter.toRelativeTime(date)  // "10 minutos atrás"
     *
     * // Estilo "short"
     * formatter.toRelativeTime(date)  // "10m"
     *
     * // Estilo "abbreviated"
     * formatter.toRelativeTime(date)  // "10min"
     * ```
     */
    public toRelativeTime(date: Date): string {
        this.validateDate(date)

        const now = new Date()
        const diff = now.getTime() - date.getTime()

        if (diff < 0) {
            throw new Error("Data fornecida está no futuro")
        }

        const units = this.calculateTimeUnits(diff)
        let result = this.formatTimeUnit(units)

        if (this.capitalize && result.length > 0) {
            result = result.charAt(0).toUpperCase() + result.slice(1)
        }

        return result
    }

    /**
     * Converte uma data para texto completo formatado.
     *
     * @param date - Data a ser convertida
     * @returns String com data formatada por extenso
     *
     * @throws {Error} Se a data for inválida
     *
     * @example
     * ```ts
     * formatter.toFullDate(new Date('2024-01-15'))
     * // "15 de janeiro de 2024"
     * ```
     */
    public toFullDate(date: Date): string {
        this.validateDate(date)

        const localeString = this.locale === "en" ? "en-US" : "pt-BR"

        let result = date.toLocaleDateString(localeString, {
            year: "numeric",
            month: "long",
            day: "numeric"
        })

        if (this.capitalize && result.length > 0) {
            result = result.charAt(0).toUpperCase() + result.slice(1)
        }

        return result
    }

    /**
     * Converte uma data para formato curto.
     *
     * @param date - Data a ser convertida
     * @returns String com data em formato curto
     *
     * @throws {Error} Se a data for inválida
     *
     * @example
     * ```ts
     * formatter.toShortDate(new Date('2024-01-15'))
     * // "15/01/2024"
     * ```
     */
    public toShortDate(date: Date): string {
        this.validateDate(date)

        const localeString = this.locale === "en" ? "en-US" : "pt-BR"

        return date.toLocaleDateString(localeString, {
            year: "numeric",
            month: "2-digit",
            day: "2-digit"
        })
    }

    /**
     * Converte data para formato de hora.
     *
     * @param date - Data a ser convertida
     * @returns String com hora formatada
     *
     * @throws {Error} Se a data for inválida
     *
     * @example
     * ```ts
     * formatter.toTimeString(new Date('2024-01-15T14:30:00'))
     * // "14:30"
     * ```
     */
    public toTimeString(date: Date): string {
        this.validateDate(date)

        const localeString = this.locale === "en" ? "en-US" : "pt-BR"

        return date.toLocaleTimeString(localeString, {
            hour: "2-digit",
            minute: "2-digit"
        })
    }

    /**
     * Converte data para formato completo com data e hora.
     *
     * @param date - Data a ser convertida
     * @returns String com data e hora
     *
     * @throws {Error} Se a data for inválida
     *
     * @example
     * ```ts
     * formatter.toFullDateTime(new Date('2024-01-15T14:30:00'))
     * // "15 de janeiro de 2024 às 14:30"
     * ```
     */
    public toFullDateTime(date: Date): string {
        this.validateDate(date)

        const dateStr = this.toFullDate(date)
        const timeStr = this.toTimeString(date)

        const connector = this.locale === "en" ? "at" : "às"

        return `${dateStr} ${connector} ${timeStr}`
    }

    // ============================================================================
    // Métodos Privados - Cálculo de Unidades de Tempo
    // ============================================================================

    private calculateTimeUnits(diffMs: number) {
        const diffSeconds = Math.floor(diffMs / 1000)
        const diffMinutes = Math.floor(diffSeconds / 60)
        const diffHours = Math.floor(diffMinutes / 60)
        const diffDays = Math.floor(diffHours / 24)
        const diffWeeks = Math.floor(diffDays / 7)
        const diffMonths = Math.floor(diffDays / 30)
        const diffYears = Math.floor(diffDays / 365)

        return {
            seconds: diffSeconds,
            minutes: diffMinutes,
            hours: diffHours,
            days: diffDays,
            weeks: diffWeeks,
            months: diffMonths,
            years: diffYears
        }
    }

    // ============================================================================
    // Métodos Privados - Formatação
    // ============================================================================

    private formatTimeUnit(units: ReturnType<typeof this.calculateTimeUnits>): string {
        const { seconds, minutes, hours, days, weeks, months, years } = units

        // Se threshold configurado, verifica se está dentro da janela de tempo recente
        if (this.recentTimeThreshold > 0 && seconds < this.recentTimeThreshold) {
            return this.formatRecentTime()
        }

        // Nomes das unidades por idioma
        const unitNames =
            this.locale === "en"
                ? {
                      second: "second",
                      minute: "minute",
                      hour: "hour",
                      day: "day",
                      week: "week",
                      month: "month",
                      year: "year",
                      yesterday: "yesterday"
                  }
                : {
                      second: "segundo",
                      minute: "minuto",
                      hour: "hora",
                      day: "dia",
                      week: "semana",
                      month: "mês",
                      year: "ano",
                      yesterday: "ontem"
                  }

        // Abreviações por idioma
        const abbrev =
            this.locale === "en"
                ? { sec: "sec", week: "wk", month: "mo", year: "y" }
                : { sec: "seg", week: "sem", month: "mes", year: "a" }

        // Segundos (comportamento padrão quando threshold = 0)
        if (seconds < 60) {
            // Caso especial: 0 segundos sempre mostra "agora"
            if (seconds === 0) {
                return this.formatRecentTime()
            }
            return this.formatUnit(seconds, unitNames.second, "s", abbrev.sec)
        }

        // Minutos
        if (minutes < 60) {
            return this.formatUnit(minutes, unitNames.minute, "m", "min")
        }

        // Horas
        if (hours < 24) {
            return this.formatUnit(hours, unitNames.hour, "h", "h")
        }

        // Dias
        if (days < 7) {
            if (this.style === "full" && days === 1) {
                return unitNames.yesterday
            }
            return this.formatUnit(days, unitNames.day, "d", "d")
        }

        // Com tempo aproximado ativado
        if (this.useApproximateTime) {
            // Se for mais de um ano, mostrar "mais de um ano atrás" / "over a year ago"
            if (years >= 1) {
                return this.formatApproximateUnit(this.locale === "en" ? "year" : "ano")
            }

            // Se for mais de um mês (4+ semanas), mostrar em semanas
            if (weeks >= 4) {
                return this.formatUnit(weeks, unitNames.week, abbrev.week, abbrev.week)
            }

            // Se for mais de uma semana, mostrar "mais de uma semana atrás" / "over a week ago"
            if (weeks >= 1) {
                return this.formatApproximateUnit(this.locale === "en" ? "week" : "semana")
            }
        }

        // Semanas (sem tempo aproximado ou menos de 4 semanas)
        if (weeks < 4) {
            return this.formatUnit(weeks, unitNames.week, abbrev.week, abbrev.week)
        }

        // Meses
        if (months < 12) {
            return this.formatUnit(months, unitNames.month, abbrev.month, abbrev.month)
        }

        // Anos
        return this.formatUnit(years, unitNames.year, abbrev.year, abbrev.year)
    }

    private formatRecentTime(): string {
        return this.recentTimeLabel
    }

    private formatUnit(
        value: number,
        fullName: string,
        shortName: string,
        abbreviatedName: string
    ): string {
        switch (this.style) {
            case "short":
                return `${value}${shortName}`

            case "abbreviated":
                return `${value}${abbreviatedName}`

            case "full":
            default:
                const plural = value !== 1
                let unit = fullName

                // Pluralização por idioma
                if (this.locale === "en") {
                    // Pluralização em inglês
                    if (plural && !fullName.endsWith("s")) {
                        unit = fullName + "s"
                    }
                } else {
                    // Pluralização em português
                    if (plural) {
                        if (fullName === "mês") {
                            unit = "meses"
                        } else if (!fullName.endsWith("s")) {
                            unit = fullName + "s"
                        }
                    }
                }

                const number = value.toString()

                // Formatação por idioma
                if (this.locale === "en") {
                    // Formato em inglês
                    if (this.useSuffix) {
                        return `${number} ${unit} ago`
                    } else {
                        return `${number} ${unit}`
                    }
                } else {
                    // Formato em português
                    if (this.usePrefix && this.useSuffix) {
                        return `há ${number} ${unit} atrás`
                    } else if (this.usePrefix) {
                        return `há ${number} ${unit}`
                    } else if (this.useSuffix) {
                        return `${number} ${unit} atrás`
                    } else {
                        return `${number} ${unit}`
                    }
                }
        }
    }

    private formatApproximateUnit(unit: "ano" | "semana" | "year" | "week"): string {
        switch (this.style) {
            case "short":
                if (this.locale === "en") {
                    return unit === "year" ? ">1y" : ">1w"
                }
                return unit === "ano" ? ">1a" : ">1sem"

            case "abbreviated":
                if (this.locale === "en") {
                    return unit === "year" ? ">1y" : ">1w"
                }
                return unit === "ano" ? ">1a" : ">1sem"

            case "full":
            default:
                if (this.locale === "en") {
                    // Formato em inglês
                    const unitName = unit === "year" ? "year" : "week"
                    if (this.useSuffix) {
                        return `over a ${unitName} ago`
                    } else {
                        return `over a ${unitName}`
                    }
                } else {
                    // Formato em português
                    const article = unit === "ano" ? "um" : "uma"
                    const unitName = unit

                    if (this.usePrefix && this.useSuffix) {
                        return `há mais de ${article} ${unitName} atrás`
                    } else if (this.usePrefix) {
                        return `há mais de ${article} ${unitName}`
                    } else if (this.useSuffix) {
                        return `mais de ${article} ${unitName} atrás`
                    } else {
                        return `mais de ${article} ${unitName}`
                    }
                }
        }
    }

    // ============================================================================
    // Métodos Privados - Validação
    // ============================================================================

    private validateDate(date: Date): void {
        if (!(date instanceof Date) || isNaN(date.getTime())) {
            throw new Error("Data inválida fornecida")
        }
    }

    // ============================================================================
    // Métodos Públicos - Utilitários
    // ============================================================================

    /**
     * Verifica se uma data está no passado.
     *
     * @param date - Data a ser verificada
     * @returns true se a data está no passado
     */
    public isPast(date: Date): boolean {
        this.validateDate(date)
        return date.getTime() < Date.now()
    }

    /**
     * Verifica se uma data está no futuro.
     *
     * @param date - Data a ser verificada
     * @returns true se a data está no futuro
     */
    public isFuture(date: Date): boolean {
        this.validateDate(date)
        return date.getTime() > Date.now()
    }

    /**
     * Verifica se uma data é hoje.
     *
     * @param date - Data a ser verificada
     * @returns true se a data é hoje
     */
    public isToday(date: Date): boolean {
        this.validateDate(date)
        const today = new Date()
        return (
            date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear()
        )
    }

    /**
     * Verifica se uma data foi ontem.
     *
     * @param date - Data a ser verificada
     * @returns true se a data foi ontem
     */
    public isYesterday(date: Date): boolean {
        this.validateDate(date)
        const yesterday = new Date()
        yesterday.setDate(yesterday.getDate() - 1)
        return (
            date.getDate() === yesterday.getDate() &&
            date.getMonth() === yesterday.getMonth() &&
            date.getFullYear() === yesterday.getFullYear()
        )
    }

    /**
     * Retorna a diferença em dias entre duas datas.
     *
     * @param date1 - Primeira data
     * @param date2 - Segunda data (padrão: agora)
     * @returns Número de dias de diferença
     */
    public daysBetween(date1: Date, date2: Date = new Date()): number {
        this.validateDate(date1)
        this.validateDate(date2)

        const diff = Math.abs(date2.getTime() - date1.getTime())
        return Math.floor(diff / (1000 * 60 * 60 * 24))
    }
}
