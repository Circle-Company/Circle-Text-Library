import { Timezone, TimezoneCodes } from "../index"
import { beforeEach, describe, expect, it } from "vitest"

describe("Timezone", () => {
    let testDate: Date

    beforeEach(() => {
        // Data de teste: 2024-01-15 15:30:00 UTC
        testDate = new Date("2024-01-15T15:30:00Z")
    })

    describe("Inicialização e Configuração", () => {
        it("deve inicializar com todos os códigos de timezone válidos", () => {
            const allCodes = Object.values(TimezoneCodes)

            allCodes.forEach((code) => {
                expect(() => {
                    new Timezone(code)
                }).not.toThrow()
            })
        })

        it("deve retornar todos os códigos de timezone disponíveis", () => {
            const timezone = new Timezone(TimezoneCodes.UTC)
            const codes = timezone.getTimezoneCodes()

            expect(codes).toHaveLength(14)
            expect(codes).toContain(TimezoneCodes.UTC)
            expect(codes).toContain(TimezoneCodes.BRT)
            expect(codes).toContain(TimezoneCodes.BRST)
            expect(codes).toContain(TimezoneCodes.EST)
            expect(codes).toContain(TimezoneCodes.EDT)
            expect(codes).toContain(TimezoneCodes.CST)
            expect(codes).toContain(TimezoneCodes.CDT)
            expect(codes).toContain(TimezoneCodes.MST)
            expect(codes).toContain(TimezoneCodes.MDT)
            expect(codes).toContain(TimezoneCodes.PST)
            expect(codes).toContain(TimezoneCodes.PDT)
            expect(codes).toContain(TimezoneCodes.AKST)
            expect(codes).toContain(TimezoneCodes.AKDT)
            expect(codes).toContain(TimezoneCodes.HST)
        })

        it("deve manter consistência entre offset e código", () => {
            const timezoneMappings = [
                { code: TimezoneCodes.UTC, expectedOffset: 0 },
                { code: TimezoneCodes.BRT, expectedOffset: -3 },
                { code: TimezoneCodes.BRST, expectedOffset: -2 },
                { code: TimezoneCodes.EST, expectedOffset: -5 },
                { code: TimezoneCodes.EDT, expectedOffset: -4 },
                { code: TimezoneCodes.CST, expectedOffset: -6 },
                { code: TimezoneCodes.CDT, expectedOffset: -5 },
                { code: TimezoneCodes.MST, expectedOffset: -7 },
                { code: TimezoneCodes.MDT, expectedOffset: -6 },
                { code: TimezoneCodes.PST, expectedOffset: -8 },
                { code: TimezoneCodes.PDT, expectedOffset: -7 },
                { code: TimezoneCodes.AKST, expectedOffset: -9 },
                { code: TimezoneCodes.AKDT, expectedOffset: -8 },
                { code: TimezoneCodes.HST, expectedOffset: -10 }
            ]

            timezoneMappings.forEach(({ code, expectedOffset }) => {
                const timezone = new Timezone(code)
                expect(timezone.getTimezoneOffset()).toBe(expectedOffset)
                expect(timezone.getCurrentTimezoneCode()).toBe(code)
            })
        })
    })

    describe("Conversões Avançadas", () => {
        it("deve converter corretamente para todos os timezones simultaneamente", () => {
            const testTimes = [
                { utc: "2024-01-15T12:00:00Z", expected: { BRT: 9, EST: 7, PST: 4, HST: 2 } },
                { utc: "2024-01-15T00:00:00Z", expected: { BRT: 21, EST: 19, PST: 16, HST: 14 } },
                { utc: "2024-01-15T23:59:59Z", expected: { BRT: 20, EST: 18, PST: 15, HST: 13 } }
            ]

            testTimes.forEach(({ utc, expected }) => {
                const utcDate = new Date(utc)

                const brtTimezone = new Timezone(TimezoneCodes.BRT)
                const brtLocal = brtTimezone.UTCToLocal(utcDate)
                expect(brtLocal.getUTCHours()).toBe(expected.BRT)

                const estTimezone = new Timezone(TimezoneCodes.EST)
                const estLocal = estTimezone.UTCToLocal(utcDate)
                expect(estLocal.getUTCHours()).toBe(expected.EST)

                const pstTimezone = new Timezone(TimezoneCodes.PST)
                const pstLocal = pstTimezone.UTCToLocal(utcDate)
                expect(pstLocal.getUTCHours()).toBe(expected.PST)

                const hstTimezone = new Timezone(TimezoneCodes.HST)
                const hstLocal = hstTimezone.UTCToLocal(utcDate)
                expect(hstLocal.getUTCHours()).toBe(expected.HST)
            })
        })

        it("deve manter precisão de segundos e milissegundos", () => {
            const preciseDate = new Date("2024-01-15T15:30:45.789Z")
            const timezones = [
                TimezoneCodes.BRT,
                TimezoneCodes.EST,
                TimezoneCodes.PST,
                TimezoneCodes.HST
            ]

            timezones.forEach((code) => {
                const timezone = new Timezone(code)
                const localDate = timezone.UTCToLocal(preciseDate)
                const backToUTC = timezone.localToUTC(localDate)

                expect(backToUTC.getUTCSeconds()).toBe(45)
                expect(backToUTC.getUTCMilliseconds()).toBe(789)
                expect(backToUTC.getTime()).toBe(preciseDate.getTime())
            })
        })

        it("deve lidar com horário de verão (DST) corretamente", () => {
            // Testa diferenças entre EST (-5) e EDT (-4)
            const winterDate = new Date("2024-01-15T15:30:00Z") // Inverno
            const summerDate = new Date("2024-07-15T15:30:00Z") // Verão

            const estTimezone = new Timezone(TimezoneCodes.EST)
            const edtTimezone = new Timezone(TimezoneCodes.EDT)

            // No inverno, EST e EDT devem ter comportamento diferente
            const winterEST = estTimezone.UTCToLocal(winterDate)
            const winterEDT = edtTimezone.UTCToLocal(winterDate)

            expect(winterEST.getUTCHours()).toBe(10) // 15:30 - 5h = 10:30
            expect(winterEDT.getUTCHours()).toBe(11) // 15:30 - 4h = 11:30

            // No verão, comportamento similar
            const summerEST = estTimezone.UTCToLocal(summerDate)
            const summerEDT = edtTimezone.UTCToLocal(summerDate)

            expect(summerEST.getUTCHours()).toBe(10) // 15:30 - 5h = 10:30
            expect(summerEDT.getUTCHours()).toBe(11) // 15:30 - 4h = 11:30
        })
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
            expect(brtTimezone.getTimezoneOffset()).toBe(-3) // -3 horas
        })

        it("deve retornar offset correto para EST", () => {
            const estTimezone = new Timezone(TimezoneCodes.EST)
            expect(estTimezone.getTimezoneOffset()).toBe(-5) // -5 horas
        })

        it("deve retornar offset correto para PST", () => {
            const pstTimezone = new Timezone(TimezoneCodes.PST)
            expect(pstTimezone.getTimezoneOffset()).toBe(-8) // -8 horas
        })

        it("deve retornar offset zero para UTC", () => {
            const utcTimezone = new Timezone(TimezoneCodes.UTC)
            expect(utcTimezone.getTimezoneOffset()).toBe(0)
        })

        it("deve retornar código de timezone correto", () => {
            const brtTimezone = new Timezone(TimezoneCodes.BRT)
            expect(brtTimezone.getCurrentTimezoneCode()).toBe(TimezoneCodes.BRT)

            const estTimezone = new Timezone(TimezoneCodes.EST)
            expect(estTimezone.getCurrentTimezoneCode()).toBe(TimezoneCodes.EST)

            const utcTimezone = new Timezone(TimezoneCodes.UTC)
            expect(utcTimezone.getCurrentTimezoneCode()).toBe(TimezoneCodes.UTC)
        })
    })

    describe("Detecção de Timezone Atual", () => {
        it("deve detectar timezone atual do sistema", () => {
            const currentTimezone = Timezone.getCurrentTimezone()
            expect(Object.values(TimezoneCodes)).toContain(currentTimezone)
        })

        it("deve retornar um código de timezone válido", () => {
            const currentTimezone = Timezone.getCurrentTimezone()
            expect(typeof currentTimezone).toBe("string")
            expect(currentTimezone.length).toBeGreaterThan(0)
        })

        it("deve ser consistente em múltiplas chamadas", () => {
            const timezone1 = Timezone.getCurrentTimezone()
            const timezone2 = Timezone.getCurrentTimezone()
            const timezone3 = Timezone.getCurrentTimezone()

            expect(timezone1).toBe(timezone2)
            expect(timezone2).toBe(timezone3)
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

    describe("Casos Extremos e Edge Cases", () => {
        it("deve lidar com mudanças de ano", () => {
            const newYearUTC = new Date("2024-01-01T00:00:00Z")
            const timezones = [TimezoneCodes.BRT, TimezoneCodes.PST, TimezoneCodes.HST]

            timezones.forEach((code) => {
                const timezone = new Timezone(code)
                const localDate = timezone.UTCToLocal(newYearUTC)
                const backToUTC = timezone.localToUTC(localDate)

                expect(backToUTC.getTime()).toBe(newYearUTC.getTime())
                expect(backToUTC.getUTCFullYear()).toBe(2024)
            })
        })

        it("deve lidar com anos bissextos", () => {
            const leapYearDate = new Date("2024-02-29T12:00:00Z") // 29 de fevereiro em ano bissexto
            const timezone = new Timezone(TimezoneCodes.BRT)

            const localDate = timezone.UTCToLocal(leapYearDate)
            const backToUTC = timezone.localToUTC(localDate)

            expect(backToUTC.getTime()).toBe(leapYearDate.getTime())
            expect(backToUTC.getUTCDate()).toBe(29)
            expect(backToUTC.getUTCMonth()).toBe(1) // Fevereiro
        })

        it("deve lidar com datas muito antigas", () => {
            const oldDate = new Date("1970-01-01T00:00:00Z") // Unix epoch
            const timezone = new Timezone(TimezoneCodes.UTC)

            const localDate = timezone.UTCToLocal(oldDate)
            const backToUTC = timezone.localToUTC(localDate)

            expect(backToUTC.getTime()).toBe(oldDate.getTime())
        })

        it("deve lidar com datas futuras distantes", () => {
            const futureDate = new Date("2099-12-31T23:59:59Z")
            const timezone = new Timezone(TimezoneCodes.BRT)

            const localDate = timezone.UTCToLocal(futureDate)
            const backToUTC = timezone.localToUTC(localDate)

            expect(backToUTC.getTime()).toBe(futureDate.getTime())
            expect(backToUTC.getUTCFullYear()).toBe(2099)
        })

        it("deve manter precisão de milissegundos", () => {
            const brtTimezone = new Timezone(TimezoneCodes.BRT)
            const preciseDate = new Date("2024-01-15T15:30:45.123Z")

            const localDate = brtTimezone.UTCToLocal(preciseDate)
            const backToUTC = brtTimezone.localToUTC(localDate)

            expect(backToUTC.getTime()).toBe(preciseDate.getTime())
            expect(backToUTC.getUTCMilliseconds()).toBe(123)
        })

        it("deve lidar com conversões em massa", () => {
            const dates = Array.from(
                { length: 100 },
                (_, i) =>
                    new Date(
                        `2024-01-${String((i % 28) + 1).padStart(2, "0")}T${String(i % 24).padStart(2, "0")}:30:00Z`
                    )
            )

            const timezone = new Timezone(TimezoneCodes.BRT)

            dates.forEach((date) => {
                const localDate = timezone.UTCToLocal(date)
                const backToUTC = timezone.localToUTC(localDate)
                expect(backToUTC.getTime()).toBe(date.getTime())
            })
        })

        it("deve manter consistência em conversões múltiplas", () => {
            const originalDate = new Date("2024-06-15T14:30:00Z")
            const timezone = new Timezone(TimezoneCodes.EST)

            let currentDate = originalDate
            for (let i = 0; i < 10; i++) {
                const localDate = timezone.UTCToLocal(currentDate)
                currentDate = timezone.localToUTC(localDate)
            }

            expect(currentDate.getTime()).toBe(originalDate.getTime())
        })
    })

    describe("Validações e Performance", () => {
        it("deve validar entrada de datas inválidas de forma robusta", () => {
            const timezone = new Timezone(TimezoneCodes.BRT)
            const invalidInputs = [
                new Date("invalid"),
                new Date(NaN),
                new Date(Infinity),
                new Date(-Infinity),
                null as any,
                undefined as any,
                "not a date" as any,
                123 as any,
                {} as any
            ]

            invalidInputs.forEach((invalidInput) => {
                expect(() => {
                    timezone.UTCToLocal(invalidInput)
                }).toThrow("Data inválida fornecida")

                expect(() => {
                    timezone.localToUTC(invalidInput)
                }).toThrow("Data inválida fornecida")
            })
        })

        it("deve ter performance adequada para conversões em massa", () => {
            const timezone = new Timezone(TimezoneCodes.BRT)
            const startTime = performance.now()

            // Testa 1000 conversões
            for (let i = 0; i < 1000; i++) {
                const date = new Date(
                    `2024-01-${String((i % 28) + 1).padStart(2, "0")}T${String(i % 24).padStart(2, "0")}:30:00Z`
                )
                const localDate = timezone.UTCToLocal(date)
                const backToUTC = timezone.localToUTC(localDate)
                expect(backToUTC.getTime()).toBe(date.getTime())
            }

            const endTime = performance.now()
            const duration = endTime - startTime

            // Deve completar 1000 conversões em menos de 100ms
            expect(duration).toBeLessThan(100)
        })

        it("deve manter imutabilidade dos objetos Date", () => {
            const originalDate = new Date("2024-01-15T15:30:00Z")
            const originalTime = originalDate.getTime()
            const timezone = new Timezone(TimezoneCodes.BRT)

            const localDate = timezone.UTCToLocal(originalDate)
            const backToUTC = timezone.localToUTC(localDate)

            // A data original não deve ter sido modificada
            expect(originalDate.getTime()).toBe(originalTime)
            expect(backToUTC.getTime()).toBe(originalTime)
        })

        it("deve funcionar corretamente com diferentes tipos de entrada de data", () => {
            const timezone = new Timezone(TimezoneCodes.EST)
            const testDates = [
                new Date("2024-01-15T15:30:00Z"),
                new Date(1705335000000), // Timestamp
                new Date(2024, 0, 15, 15, 30, 0), // Constructor com parâmetros
                new Date("January 15, 2024 15:30:00 UTC") // String format
            ]

            testDates.forEach((date) => {
                const localDate = timezone.UTCToLocal(date)
                const backToUTC = timezone.localToUTC(localDate)
                expect(backToUTC.getTime()).toBe(date.getTime())
            })
        })
    })
})
