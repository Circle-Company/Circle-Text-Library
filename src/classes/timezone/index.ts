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

    constructor(timezoneCode: TimezoneCodes) {
        this.timezone = this.setTimezone(timezoneCode)
    }

    private setTimezone(timezoneCode: TimezoneCodes): number {
        if (timezoneCode == TimezoneCodes.UTC) return 0
        if (timezoneCode == TimezoneCodes.BRT) return -180
        if (timezoneCode == TimezoneCodes.BRST) return -120
        if (timezoneCode == TimezoneCodes.EST) return -300
        if (timezoneCode == TimezoneCodes.EDT) return -240
        if (timezoneCode == TimezoneCodes.CST) return -360
        if (timezoneCode == TimezoneCodes.CDT) return -300
        if (timezoneCode == TimezoneCodes.MST) return -420
        if (timezoneCode == TimezoneCodes.MDT) return -360
        if (timezoneCode == TimezoneCodes.PST) return -480
        if (timezoneCode == TimezoneCodes.PDT) return -420
        if (timezoneCode == TimezoneCodes.AKST) return -540
        if (timezoneCode == TimezoneCodes.AKDT) return -480
        if (timezoneCode == TimezoneCodes.HST) return -600
        return 0
    }

    public localToUTC(date: Date): Date {
        if (!(date instanceof Date) || isNaN(date.getTime())) {
            throw new Error("Data inválida fornecida")
        }
        return new Date(date.getTime() - this.timezone * 60000)
    }

    public UTCToLocal(date: Date): Date {
        if (!(date instanceof Date) || isNaN(date.getTime())) {
            throw new Error("Data inválida fornecida")
        }
        return new Date(date.getTime() + this.timezone * 60000)
    }

    public getTimezoneOffset(): number {
        return this.timezone
    }

    public getTimezoneCode(): TimezoneCodes {
        // Retorna o código de timezone baseado no offset atual
        const offset = this.timezone
        if (offset === 0) return TimezoneCodes.UTC
        if (offset === -180) return TimezoneCodes.BRT
        if (offset === -120) return TimezoneCodes.BRST
        if (offset === -300) return TimezoneCodes.EST
        if (offset === -240) return TimezoneCodes.EDT
        if (offset === -360) return TimezoneCodes.CST
        if (offset === -300) return TimezoneCodes.CDT
        if (offset === -420) return TimezoneCodes.MST
        if (offset === -360) return TimezoneCodes.MDT
        if (offset === -480) return TimezoneCodes.PST
        if (offset === -420) return TimezoneCodes.PDT
        if (offset === -540) return TimezoneCodes.AKST
        if (offset === -480) return TimezoneCodes.AKDT
        if (offset === -600) return TimezoneCodes.HST
        return TimezoneCodes.UTC
    }

    public static getCurrentTimezone(): TimezoneCodes {
        const offset = new Date().getTimezoneOffset()
        // Converte o offset do JavaScript (em minutos, positivo para oeste)
        // para nosso formato (em minutos, negativo para oeste)
        const ourOffset = -offset

        if (ourOffset === 0) return TimezoneCodes.UTC
        if (ourOffset === -180) return TimezoneCodes.BRT
        if (ourOffset === -120) return TimezoneCodes.BRST
        if (ourOffset === -300) return TimezoneCodes.EST
        if (ourOffset === -240) return TimezoneCodes.EDT
        if (ourOffset === -360) return TimezoneCodes.CST
        if (ourOffset === -300) return TimezoneCodes.CDT
        if (ourOffset === -420) return TimezoneCodes.MST
        if (ourOffset === -360) return TimezoneCodes.MDT
        if (ourOffset === -480) return TimezoneCodes.PST
        if (ourOffset === -420) return TimezoneCodes.PDT
        if (ourOffset === -540) return TimezoneCodes.AKST
        if (ourOffset === -480) return TimezoneCodes.AKDT
        if (ourOffset === -600) return TimezoneCodes.HST

        // Se não encontrar correspondência exata, retorna UTC
        return TimezoneCodes.UTC
    }
}
