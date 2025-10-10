export enum TimezoneCode {
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
    timezoneCode: TimezoneCode
}

export class Timezone {
    private timezone: number
    private code: TimezoneCode

    constructor() {
        this.code = TimezoneCode.UTC
        this.timezone = 0
    }

    public setLocalTimezone(timezoneCode: TimezoneCode) {
        if (timezoneCode == TimezoneCode.UTC) this.timezone = 0
        if (timezoneCode == TimezoneCode.BRT) this.timezone = -3
        if (timezoneCode == TimezoneCode.BRST) this.timezone = -2
        if (timezoneCode == TimezoneCode.EST) this.timezone = -5
        if (timezoneCode == TimezoneCode.EDT) this.timezone = -4
        if (timezoneCode == TimezoneCode.CST) this.timezone = -6
        if (timezoneCode == TimezoneCode.CDT) this.timezone = -5
        if (timezoneCode == TimezoneCode.MST) this.timezone = -7
        if (timezoneCode == TimezoneCode.MDT) this.timezone = -6
        if (timezoneCode == TimezoneCode.PST) this.timezone = -8
        if (timezoneCode == TimezoneCode.PDT) this.timezone = -7
        if (timezoneCode == TimezoneCode.AKST) this.timezone = -9
        if (timezoneCode == TimezoneCode.AKDT) this.timezone = -8
        if (timezoneCode == TimezoneCode.HST) this.timezone = -10
        this.code = timezoneCode
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

    public getOffset(): number {
        return this.timezone
    }

    public getCode(): TimezoneCode {
        return this.code
    }

    public getOffsetFromCode(code: TimezoneCode): number {
        if (code === TimezoneCode.UTC) return 0
        if (code === TimezoneCode.BRT) return -3
        if (code === TimezoneCode.BRST) return -2
        if (code === TimezoneCode.EST) return -5
        if (code === TimezoneCode.EDT) return -4
        if (code === TimezoneCode.CST) return -6
        if (code === TimezoneCode.MST) return -7
        if (code === TimezoneCode.PST) return -8
        if (code === TimezoneCode.AKST) return -9
        if (code === TimezoneCode.HST) return -10
        return 0
    }
    public getCodeFromOffset(offset: number): TimezoneCode {
        if (offset === 0) return TimezoneCode.UTC
        if (offset === -3) return TimezoneCode.BRT
        if (offset === -2) return TimezoneCode.BRST
        if (offset === -5) return TimezoneCode.EST
        if (offset === -4) return TimezoneCode.EDT
        if (offset === -6) return TimezoneCode.CST
        if (offset === -7) return TimezoneCode.MST
        if (offset === -8) return TimezoneCode.PST
        if (offset === -9) return TimezoneCode.AKST
        if (offset === -10) return TimezoneCode.HST
        return TimezoneCode.UTC
    }
}
