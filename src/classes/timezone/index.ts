export enum TimezoneCodes {
    UTC = "UTC",
    BRT = "BRT",
    BRST = "BRST",
    EST = "EST",
    EDT = "EDT",
    CST = "CST",
    CDT = "CDT",
    MST = "MST",
    MDT = "MDT",
    PST = "PST",
    PDT = "PDT",
    AKST = "AKST",
    AKDT = "AKDT",
    HST = "HST"
}

export interface TimezoneConfig {
    timezoneCode: TimezoneCodes
}

export class Timezone {
    private readonly timezone: number
    private readonly code: TimezoneCodes

    constructor(timezoneCode: TimezoneCodes) {
        this.code = timezoneCode
        this.timezone = this.setTimezone(timezoneCode)
    }

    public getTimezoneCodes(): TimezoneCodes[] {
        return Object.values(TimezoneCodes)
    }

    public setTimezone(timezoneCode: TimezoneCodes): number {
        if (timezoneCode == TimezoneCodes.UTC) return 0
        if (timezoneCode == TimezoneCodes.BRT) return -3
        if (timezoneCode == TimezoneCodes.BRST) return -2
        if (timezoneCode == TimezoneCodes.EST) return -5
        if (timezoneCode == TimezoneCodes.EDT) return -4
        if (timezoneCode == TimezoneCodes.CST) return -6
        if (timezoneCode == TimezoneCodes.CDT) return -5
        if (timezoneCode == TimezoneCodes.MST) return -7
        if (timezoneCode == TimezoneCodes.MDT) return -6
        if (timezoneCode == TimezoneCodes.PST) return -8
        if (timezoneCode == TimezoneCodes.PDT) return -7
        if (timezoneCode == TimezoneCodes.AKST) return -9
        if (timezoneCode == TimezoneCodes.AKDT) return -8
        if (timezoneCode == TimezoneCodes.HST) return -10
        return 0
    }

    public localToUTC(date: Date): Date {
        if (!(date instanceof Date) || isNaN(date.getTime())) {
            throw new Error("Data inválida fornecida")
        }
        return new Date(date.getTime() - this.timezone * 60 * 60 * 1000)
    }

    public UTCToLocal(date: Date): Date {
        if (!(date instanceof Date) || isNaN(date.getTime())) {
            throw new Error("Data inválida fornecida")
        }
        return new Date(date.getTime() + this.timezone * 60 * 60 * 1000)
    }

    public getTimezoneOffset(): number {
        return this.timezone
    }

    public getCurrentTimezoneCode(): TimezoneCodes {
        return this.code
    }

    public static getCurrentTimezone(): TimezoneCodes {
        const offset = new Date().getTimezoneOffset()
        const ourOffset = -offset / 60

        if (ourOffset === 0) return TimezoneCodes.UTC
        if (ourOffset === -3) return TimezoneCodes.BRT
        if (ourOffset === -2) return TimezoneCodes.BRST
        if (ourOffset === -5) return TimezoneCodes.EST
        if (ourOffset === -4) return TimezoneCodes.EDT
        if (ourOffset === -6) return TimezoneCodes.CST
        if (ourOffset === -5) return TimezoneCodes.CDT
        if (ourOffset === -7) return TimezoneCodes.MST
        if (ourOffset === -6) return TimezoneCodes.MDT
        if (ourOffset === -8) return TimezoneCodes.PST
        if (ourOffset === -7) return TimezoneCodes.PDT
        if (ourOffset === -9) return TimezoneCodes.AKST
        if (ourOffset === -8) return TimezoneCodes.AKDT
        if (ourOffset === -10) return TimezoneCodes.HST

        // Se não encontrar correspondência exata, retorna UTC
        return TimezoneCodes.UTC
    }

    /**
     * Converte um número (offset em horas) para o código do timezone correspondente
     * @param offset - Offset em horas (ex: 0 para UTC, -3 para BRT, -5 para EST)
     * @returns TimezoneCodes - Código do timezone correspondente
     *
     * Exemplo:
     * Timezone.getTimezoneFromOffset(0)   // TimezoneCodes.UTC
     * Timezone.getTimezoneFromOffset(-3)  // TimezoneCodes.BRT
     * Timezone.getTimezoneFromOffset(-5)  // TimezoneCodes.EST
     */
    public static getTimezoneFromOffset(offset: number): TimezoneCodes {
        if (offset === 0) return TimezoneCodes.UTC
        if (offset === -3) return TimezoneCodes.BRT
        if (offset === -2) return TimezoneCodes.BRST
        if (offset === -5) return TimezoneCodes.EST
        if (offset === -4) return TimezoneCodes.EDT
        if (offset === -6) return TimezoneCodes.CST
        if (offset === -7) return TimezoneCodes.MST
        if (offset === -8) return TimezoneCodes.PST
        if (offset === -9) return TimezoneCodes.AKST
        if (offset === -10) return TimezoneCodes.HST

        // Se não encontrar correspondência exata, retorna UTC
        return TimezoneCodes.UTC
    }
}
