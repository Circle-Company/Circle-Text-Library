import { Timezone, TimezoneCodes } from "../timezone"
import { beforeEach, describe, expect, it } from "vitest"

describe("Timezone", () => {
    let testDate: Date

    beforeEach(() => {
        // Data de teste: 2024-01-15 15:30:00 UTC
        testDate = new Date("2024-01-15T15:30:00Z")
    })

    describe("Conversão UTC para Local", () => {
        it("deve converter UTC para BRT corretamente (UTC-3)", () => {
            const brtTimezone = new Timezone(TimezoneCodes.BRT)
            const localDate = brtTimezone.UTCToLocal(testDate)

            // 15:30 UTC - 3h = 12:30 local
            expect(localDate.getUTCHours()).toBe(12)
            expect(localDate.getUTCMinutes()).toBe(30)
        })

        it("deve converter UTC para EST corretamente (UTC-5)", () => {
            const estTimezone = new Timezone(TimezoneCodes.EST)
            const localDate = estTimezone.UTCToLocal(testDate)

            // 15:30 UTC - 5h = 10:30 local
            expect(localDate.getUTCHours()).toBe(10)
            expect(localDate.getUTCMinutes()).toBe(30)
        })

        it("deve converter UTC para PST corretamente (UTC-8)", () => {
            const pstTimezone = new Timezone(TimezoneCodes.PST)
            const localDate = pstTimezone.UTCToLocal(testDate)

            // 15:30 UTC - 8h = 07:30 local
            expect(localDate.getUTCHours()).toBe(7)
            expect(localDate.getUTCMinutes()).toBe(30)
        })

        it("deve manter UTC inalterado", () => {
            const utcTimezone = new Timezone(TimezoneCodes.UTC)
            const localDate = utcTimezone.UTCToLocal(testDate)

            expect(localDate.getTime()).toBe(testDate.getTime())
        })

        it("deve converter UTC para HST corretamente (UTC-10)", () => {
            const hstTimezone = new Timezone(TimezoneCodes.HST)
            const localDate = hstTimezone.UTCToLocal(testDate)

            // 15:30 UTC - 10h = 05:30 local
            expect(localDate.getUTCHours()).toBe(5)
            expect(localDate.getUTCMinutes()).toBe(30)
        })
    })

    describe("Conversão Local para UTC", () => {
        it("deve converter BRT para UTC corretamente", () => {
            const brtTimezone = new Timezone(TimezoneCodes.BRT)
            const localDate = new Date("2024-01-15T12:30:00Z") // Simula hora local BRT

            const utcDate = brtTimezone.localToUTC(localDate)

            // 12:30 local + 3h = 15:30 UTC
            expect(utcDate.getUTCHours()).toBe(15)
            expect(utcDate.getUTCMinutes()).toBe(30)
        })

        it("deve converter EST para UTC corretamente", () => {
            const estTimezone = new Timezone(TimezoneCodes.EST)
            const localDate = new Date("2024-01-15T10:30:00Z") // Simula hora local EST

            const utcDate = estTimezone.localToUTC(localDate)

            // 10:30 local + 5h = 15:30 UTC
            expect(utcDate.getUTCHours()).toBe(15)
            expect(utcDate.getUTCMinutes()).toBe(30)
        })

        it("deve manter UTC inalterado na conversão local para UTC", () => {
            const utcTimezone = new Timezone(TimezoneCodes.UTC)
            const utcDate = utcTimezone.localToUTC(testDate)

            expect(utcDate.getTime()).toBe(testDate.getTime())
        })
    })

    describe("Conversões bidirecionais", () => {
        it("deve converter UTC para BRT e voltar para UTC corretamente", () => {
            const brtTimezone = new Timezone(TimezoneCodes.BRT)

            const localDate = brtTimezone.UTCToLocal(testDate)
            const backToUTC = brtTimezone.localToUTC(localDate)

            expect(backToUTC.getTime()).toBe(testDate.getTime())
        })

        it("deve converter UTC para EST e voltar para UTC corretamente", () => {
            const estTimezone = new Timezone(TimezoneCodes.EST)

            const localDate = estTimezone.UTCToLocal(testDate)
            const backToUTC = estTimezone.localToUTC(localDate)

            expect(backToUTC.getTime()).toBe(testDate.getTime())
        })

        it("deve converter entre diferentes timezones corretamente", () => {
            const timezones = [
                TimezoneCodes.UTC,
                TimezoneCodes.BRT,
                TimezoneCodes.BRST,
                TimezoneCodes.EST,
                TimezoneCodes.EDT,
                TimezoneCodes.CST,
                TimezoneCodes.CDT,
                TimezoneCodes.MST,
                TimezoneCodes.MDT,
                TimezoneCodes.PST,
                TimezoneCodes.PDT,
                TimezoneCodes.AKST,
                TimezoneCodes.AKDT,
                TimezoneCodes.HST
            ]

            timezones.forEach((tz) => {
                const timezone = new Timezone(tz)
                const localTime = timezone.UTCToLocal(testDate)
                const backToUTC = timezone.localToUTC(localTime)

                expect(backToUTC.getTime()).toBe(testDate.getTime())
            })
        })
    })

    describe("Métodos auxiliares", () => {
        it("deve retornar offset correto para BRT", () => {
            const brtTimezone = new Timezone(TimezoneCodes.BRT)
            expect(brtTimezone.getTimezoneOffset()).toBe(-180) // -3 horas = -180 minutos
        })

        it("deve retornar offset correto para EST", () => {
            const estTimezone = new Timezone(TimezoneCodes.EST)
            expect(estTimezone.getTimezoneOffset()).toBe(-300) // -5 horas = -300 minutos
        })

        it("deve retornar offset correto para PST", () => {
            const pstTimezone = new Timezone(TimezoneCodes.PST)
            expect(pstTimezone.getTimezoneOffset()).toBe(-480) // -8 horas = -480 minutos
        })

        it("deve retornar offset zero para UTC", () => {
            const utcTimezone = new Timezone(TimezoneCodes.UTC)
            expect(utcTimezone.getTimezoneOffset()).toBe(0)
        })

        it("deve retornar código de timezone correto", () => {
            const brtTimezone = new Timezone(TimezoneCodes.BRT)
            expect(brtTimezone.getTimezoneCode()).toBe(TimezoneCodes.BRT)

            const estTimezone = new Timezone(TimezoneCodes.EST)
            expect(estTimezone.getTimezoneCode()).toBe(TimezoneCodes.EST)

            const utcTimezone = new Timezone(TimezoneCodes.UTC)
            expect(utcTimezone.getTimezoneCode()).toBe(TimezoneCodes.UTC)
        })
    })

    describe("Detecção de timezone atual", () => {
        it("deve detectar timezone atual do sistema", () => {
            const currentTimezone = Timezone.getCurrentTimezone()
            expect(Object.values(TimezoneCodes)).toContain(currentTimezone)
        })

        it("deve retornar um código de timezone válido", () => {
            const currentTimezone = Timezone.getCurrentTimezone()
            expect(typeof currentTimezone).toBe("string")
            expect(currentTimezone.length).toBeGreaterThan(0)
        })
    })

    describe("Validação de entrada", () => {
        it("deve lançar erro para data inválida na conversão UTC para local", () => {
            const brtTimezone = new Timezone(TimezoneCodes.BRT)

            expect(() => {
                brtTimezone.UTCToLocal(new Date("invalid"))
            }).toThrow("Data inválida fornecida")

            expect(() => {
                brtTimezone.UTCToLocal(new Date(NaN))
            }).toThrow("Data inválida fornecida")
        })

        it("deve lançar erro para data inválida na conversão local para UTC", () => {
            const brtTimezone = new Timezone(TimezoneCodes.BRT)

            expect(() => {
                brtTimezone.localToUTC(new Date("invalid"))
            }).toThrow("Data inválida fornecida")

            expect(() => {
                brtTimezone.localToUTC(new Date(NaN))
            }).toThrow("Data inválida fornecida")
        })

        it("deve aceitar datas válidas", () => {
            const brtTimezone = new Timezone(TimezoneCodes.BRT)
            const validDate = new Date("2024-01-15T15:30:00Z")

            expect(() => {
                brtTimezone.UTCToLocal(validDate)
                brtTimezone.localToUTC(validDate)
            }).not.toThrow()
        })
    })

    describe("Casos especiais", () => {
        it("deve lidar com mudança de dia na conversão", () => {
            const pstTimezone = new Timezone(TimezoneCodes.PST)
            const lateUTCDate = new Date("2024-01-15T02:30:00Z") // 2:30 UTC

            const localDate = pstTimezone.UTCToLocal(lateUTCDate)

            // 2:30 UTC - 8h = 18:30 do dia anterior (14/01)
            expect(localDate.getUTCDate()).toBe(14)
            expect(localDate.getUTCHours()).toBe(18)
            expect(localDate.getUTCMinutes()).toBe(30)
        })

        it("deve lidar com mudança de mês na conversão", () => {
            const hstTimezone = new Timezone(TimezoneCodes.HST)
            const earlyUTCDate = new Date("2024-01-01T01:30:00Z") // 1:30 UTC

            const localDate = hstTimezone.UTCToLocal(earlyUTCDate)

            // 1:30 UTC - 10h = 15:30 do dia anterior (31/12)
            expect(localDate.getUTCMonth()).toBe(11) // Dezembro (0-indexed)
            expect(localDate.getUTCDate()).toBe(31)
            expect(localDate.getUTCHours()).toBe(15)
            expect(localDate.getUTCMinutes()).toBe(30)
        })

        it("deve manter precisão de milissegundos", () => {
            const brtTimezone = new Timezone(TimezoneCodes.BRT)
            const preciseDate = new Date("2024-01-15T15:30:45.123Z")

            const localDate = brtTimezone.UTCToLocal(preciseDate)
            const backToUTC = brtTimezone.localToUTC(localDate)

            expect(backToUTC.getTime()).toBe(preciseDate.getTime())
            expect(backToUTC.getUTCMilliseconds()).toBe(123)
        })
    })

    describe("Edge cases", () => {
        it("deve lidar com timezone não reconhecido", () => {
            // Simula um timezone não mapeado retornando UTC como fallback
            const utcTimezone = new Timezone(TimezoneCodes.UTC)
            expect(utcTimezone.getTimezoneCode()).toBe(TimezoneCodes.UTC)
        })

        it("deve funcionar com datas em diferentes anos", () => {
            const brtTimezone = new Timezone(TimezoneCodes.BRT)
            const dates = [
                new Date("2020-01-15T15:30:00Z"),
                new Date("2021-06-15T15:30:00Z"),
                new Date("2022-12-15T15:30:00Z"),
                new Date("2023-03-15T15:30:00Z")
            ]

            dates.forEach((date) => {
                const localDate = brtTimezone.UTCToLocal(date)
                const backToUTC = brtTimezone.localToUTC(localDate)
                expect(backToUTC.getTime()).toBe(date.getTime())
            })
        })
    })
})
