import { Timezone, TimezoneCode } from "../index"
import { beforeEach, describe, expect, it } from "vitest"

describe("Timezone", () => {
    let testDate: Date

    beforeEach(() => {
        // Data de teste: 2024-01-15 15:30:00 UTC
        testDate = new Date("2024-01-15T15:30:00Z")
    })

    describe("Conversão de Offset para Timezone", () => {
        it("deve converter offset 0 para UTC", () => {
            const timezone = new Timezone()
            const result = timezone.getCodeFromOffset(0)
            expect(result).toBe(TimezoneCode.UTC)
        })

        it("deve converter offset -3 para BRT", () => {
            const timezone = new Timezone()
            const result = timezone.getCodeFromOffset(-3)
            expect(result).toBe(TimezoneCode.BRT)
        })

        it("deve converter offset -5 para EST", () => {
            const timezone = new Timezone()
            const result = timezone.getCodeFromOffset(-5)
            expect(result).toBe(TimezoneCode.EST)
        })

        it("deve converter offset -8 para PST", () => {
            const timezone = new Timezone()
            const result = timezone.getCodeFromOffset(-8)
            expect(result).toBe(TimezoneCode.PST)
        })

        it("deve retornar UTC para offset desconhecido", () => {
            const timezone = new Timezone()
            const result = timezone.getCodeFromOffset(-15)
            expect(result).toBe(TimezoneCode.UTC)
        })

        it("deve retornar UTC para offset positivo desconhecido", () => {
            const timezone = new Timezone()
            const result = timezone.getCodeFromOffset(5)
            expect(result).toBe(TimezoneCode.UTC)
        })

        it("deve converter todos os offsets válidos corretamente", () => {
            const timezone = new Timezone()
            const expectedMappings = [
                { offset: 0, expected: TimezoneCode.UTC },
                { offset: -3, expected: TimezoneCode.BRT },
                { offset: -2, expected: TimezoneCode.BRST },
                { offset: -5, expected: TimezoneCode.EST },
                { offset: -4, expected: TimezoneCode.EDT },
                { offset: -6, expected: TimezoneCode.CST },
                { offset: -7, expected: TimezoneCode.MST },
                { offset: -8, expected: TimezoneCode.PST },
                { offset: -9, expected: TimezoneCode.AKST },
                { offset: -10, expected: TimezoneCode.HST }
            ]

            expectedMappings.forEach(({ offset, expected }) => {
                const result = timezone.getCodeFromOffset(offset)
                expect(result).toBe(expected)
            })
        })
    })

    describe("Inicialização e Configuração", () => {
        it("deve inicializar com todos os códigos de timezone válidos", () => {
            const allCodes = Object.values(TimezoneCode)

            allCodes.forEach((code) => {
                expect(() => {
                    const timezone = new Timezone()
                    timezone.setLocalTimezone(code)
                }).not.toThrow()
            })
        })

        it("deve retornar todos os códigos de timezone disponíveis", () => {
            const allCodes = Object.values(TimezoneCode)
            expect(allCodes).toHaveLength(14)
            expect(allCodes).toContain(TimezoneCode.UTC)
            expect(allCodes).toContain(TimezoneCode.BRT)
            expect(allCodes).toContain(TimezoneCode.BRST)
            expect(allCodes).toContain(TimezoneCode.EST)
            expect(allCodes).toContain(TimezoneCode.EDT)
            expect(allCodes).toContain(TimezoneCode.CST)
            expect(allCodes).toContain(TimezoneCode.CDT)
            expect(allCodes).toContain(TimezoneCode.MST)
            expect(allCodes).toContain(TimezoneCode.MDT)
            expect(allCodes).toContain(TimezoneCode.PST)
            expect(allCodes).toContain(TimezoneCode.PDT)
            expect(allCodes).toContain(TimezoneCode.AKST)
            expect(allCodes).toContain(TimezoneCode.AKDT)
            expect(allCodes).toContain(TimezoneCode.HST)
        })

        it("deve manter consistência entre offset e código", () => {
            const timezoneMappings = [
                { code: TimezoneCode.UTC, expectedOffset: 0 },
                { code: TimezoneCode.BRT, expectedOffset: -3 },
                { code: TimezoneCode.BRST, expectedOffset: -2 },
                { code: TimezoneCode.EST, expectedOffset: -5 },
                { code: TimezoneCode.EDT, expectedOffset: -4 },
                { code: TimezoneCode.CST, expectedOffset: -6 },
                { code: TimezoneCode.CDT, expectedOffset: -5 },
                { code: TimezoneCode.MST, expectedOffset: -7 },
                { code: TimezoneCode.MDT, expectedOffset: -6 },
                { code: TimezoneCode.PST, expectedOffset: -8 },
                { code: TimezoneCode.PDT, expectedOffset: -7 },
                { code: TimezoneCode.AKST, expectedOffset: -9 },
                { code: TimezoneCode.AKDT, expectedOffset: -8 },
                { code: TimezoneCode.HST, expectedOffset: -10 }
            ]

            timezoneMappings.forEach(({ code, expectedOffset }) => {
                const timezone = new Timezone()
                timezone.setLocalTimezone(code)
                expect(timezone.getOffset()).toBe(expectedOffset)
                expect(timezone.getCode()).toBe(code)
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

                const brtTimezone = new Timezone()
                brtTimezone.setLocalTimezone(TimezoneCode.BRT)
                const brtLocal = brtTimezone.UTCToLocal(utcDate)
                expect(brtLocal.getUTCHours()).toBe(expected.BRT)

                const estTimezone = new Timezone()
                estTimezone.setLocalTimezone(TimezoneCode.EST)
                const estLocal = estTimezone.UTCToLocal(utcDate)
                expect(estLocal.getUTCHours()).toBe(expected.EST)

                const pstTimezone = new Timezone()
                pstTimezone.setLocalTimezone(TimezoneCode.PST)
                const pstLocal = pstTimezone.UTCToLocal(utcDate)
                expect(pstLocal.getUTCHours()).toBe(expected.PST)

                const hstTimezone = new Timezone()
                hstTimezone.setLocalTimezone(TimezoneCode.HST)
                const hstLocal = hstTimezone.UTCToLocal(utcDate)
                expect(hstLocal.getUTCHours()).toBe(expected.HST)
            })
        })

        it("deve manter precisão de segundos e milissegundos", () => {
            const preciseDate = new Date("2024-01-15T15:30:45.789Z")
            const timezones = [
                TimezoneCode.BRT,
                TimezoneCode.EST,
                TimezoneCode.PST,
                TimezoneCode.HST
            ]

            timezones.forEach((code) => {
                const timezone = new Timezone()
                timezone.setLocalTimezone(code)
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

            const estTimezone = new Timezone()
            estTimezone.setLocalTimezone(TimezoneCode.EST)
            const edtTimezone = new Timezone()
            edtTimezone.setLocalTimezone(TimezoneCode.EDT)

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
            const brtTimezone = new Timezone()
            brtTimezone.setLocalTimezone(TimezoneCode.BRT)
            const localDate = brtTimezone.UTCToLocal(testDate)

            // 15:30 UTC - 3h = 12:30 local
            expect(localDate.getUTCHours()).toBe(12)
            expect(localDate.getUTCMinutes()).toBe(30)
        })

        it("deve converter UTC para EST corretamente (UTC-5)", () => {
            const estTimezone = new Timezone()
            estTimezone.setLocalTimezone(TimezoneCode.EST)
            const localDate = estTimezone.UTCToLocal(testDate)

            // 15:30 UTC - 5h = 10:30 local
            expect(localDate.getUTCHours()).toBe(10)
            expect(localDate.getUTCMinutes()).toBe(30)
        })

        it("deve converter UTC para PST corretamente (UTC-8)", () => {
            const pstTimezone = new Timezone()
            pstTimezone.setLocalTimezone(TimezoneCode.PST)
            const localDate = pstTimezone.UTCToLocal(testDate)

            // 15:30 UTC - 8h = 07:30 local
            expect(localDate.getUTCHours()).toBe(7)
            expect(localDate.getUTCMinutes()).toBe(30)
        })

        it("deve manter UTC inalterado", () => {
            const utcTimezone = new Timezone()
            utcTimezone.setLocalTimezone(TimezoneCode.UTC)
            const localDate = utcTimezone.UTCToLocal(testDate)

            expect(localDate.getTime()).toBe(testDate.getTime())
        })

        it("deve converter UTC para HST corretamente (UTC-10)", () => {
            const hstTimezone = new Timezone()
            hstTimezone.setLocalTimezone(TimezoneCode.HST)
            const localDate = hstTimezone.UTCToLocal(testDate)

            // 15:30 UTC - 10h = 05:30 local
            expect(localDate.getUTCHours()).toBe(5)
            expect(localDate.getUTCMinutes()).toBe(30)
        })
    })

    describe("Conversão Local para UTC", () => {
        it("deve converter BRT para UTC corretamente", () => {
            const brtTimezone = new Timezone()
            brtTimezone.setLocalTimezone(TimezoneCode.BRT)
            const localDate = new Date("2024-01-15T12:30:00Z") // Simula hora local BRT

            const utcDate = brtTimezone.localToUTC(localDate)

            // 12:30 local + 3h = 15:30 UTC
            expect(utcDate.getUTCHours()).toBe(15)
            expect(utcDate.getUTCMinutes()).toBe(30)
        })

        it("deve converter EST para UTC corretamente", () => {
            const estTimezone = new Timezone()
            estTimezone.setLocalTimezone(TimezoneCode.EST)
            const localDate = new Date("2024-01-15T10:30:00Z") // Simula hora local EST

            const utcDate = estTimezone.localToUTC(localDate)

            // 10:30 local + 5h = 15:30 UTC
            expect(utcDate.getUTCHours()).toBe(15)
            expect(utcDate.getUTCMinutes()).toBe(30)
        })

        it("deve manter UTC inalterado na conversão local para UTC", () => {
            const utcTimezone = new Timezone()
            utcTimezone.setLocalTimezone(TimezoneCode.UTC)
            const utcDate = utcTimezone.localToUTC(testDate)

            expect(utcDate.getTime()).toBe(testDate.getTime())
        })
    })

    describe("Conversões bidirecionais", () => {
        it("deve converter UTC para BRT e voltar para UTC corretamente", () => {
            const brtTimezone = new Timezone()
            brtTimezone.setLocalTimezone(TimezoneCode.BRT)

            const localDate = brtTimezone.UTCToLocal(testDate)
            const backToUTC = brtTimezone.localToUTC(localDate)

            expect(backToUTC.getTime()).toBe(testDate.getTime())
        })

        it("deve converter UTC para EST e voltar para UTC corretamente", () => {
            const estTimezone = new Timezone()
            estTimezone.setLocalTimezone(TimezoneCode.EST)

            const localDate = estTimezone.UTCToLocal(testDate)
            const backToUTC = estTimezone.localToUTC(localDate)

            expect(backToUTC.getTime()).toBe(testDate.getTime())
        })

        it("deve converter entre diferentes timezones corretamente", () => {
            const timezones = [
                TimezoneCode.UTC,
                TimezoneCode.BRT,
                TimezoneCode.BRST,
                TimezoneCode.EST,
                TimezoneCode.EDT,
                TimezoneCode.CST,
                TimezoneCode.CDT,
                TimezoneCode.MST,
                TimezoneCode.MDT,
                TimezoneCode.PST,
                TimezoneCode.PDT,
                TimezoneCode.AKST,
                TimezoneCode.AKDT,
                TimezoneCode.HST
            ]

            timezones.forEach((tz) => {
                const timezone = new Timezone()
                timezone.setLocalTimezone(tz)
                const localTime = timezone.UTCToLocal(testDate)
                const backToUTC = timezone.localToUTC(localTime)

                expect(backToUTC.getTime()).toBe(testDate.getTime())
            })
        })
    })

    describe("Métodos auxiliares", () => {
        it("deve retornar offset correto para BRT", () => {
            const brtTimezone = new Timezone()
            brtTimezone.setLocalTimezone(TimezoneCode.BRT)
            expect(brtTimezone.getOffset()).toBe(-3) // -3 horas
        })

        it("deve retornar offset correto para EST", () => {
            const estTimezone = new Timezone()
            estTimezone.setLocalTimezone(TimezoneCode.EST)
            expect(estTimezone.getOffset()).toBe(-5) // -5 horas
        })

        it("deve retornar offset correto para PST", () => {
            const pstTimezone = new Timezone()
            pstTimezone.setLocalTimezone(TimezoneCode.PST)
            expect(pstTimezone.getOffset()).toBe(-8) // -8 horas
        })

        it("deve retornar offset zero para UTC", () => {
            const utcTimezone = new Timezone()
            utcTimezone.setLocalTimezone(TimezoneCode.UTC)
            expect(utcTimezone.getOffset()).toBe(0)
        })

        it("deve retornar código de timezone correto", () => {
            const brtTimezone = new Timezone()
            brtTimezone.setLocalTimezone(TimezoneCode.BRT)
            expect(brtTimezone.getCode()).toBe(TimezoneCode.BRT)

            const estTimezone = new Timezone()
            estTimezone.setLocalTimezone(TimezoneCode.EST)
            expect(estTimezone.getCode()).toBe(TimezoneCode.EST)

            const utcTimezone = new Timezone()
            utcTimezone.setLocalTimezone(TimezoneCode.UTC)
            expect(utcTimezone.getCode()).toBe(TimezoneCode.UTC)
        })
    })

    describe("Conversão de Código para Offset", () => {
        it("deve retornar offset correto para cada código de timezone", () => {
            const timezone = new Timezone()

            expect(timezone.getOffsetFromCode(TimezoneCode.UTC)).toBe(0)
            expect(timezone.getOffsetFromCode(TimezoneCode.BRT)).toBe(-3)
            expect(timezone.getOffsetFromCode(TimezoneCode.BRST)).toBe(-2)
            expect(timezone.getOffsetFromCode(TimezoneCode.EST)).toBe(-5)
            expect(timezone.getOffsetFromCode(TimezoneCode.EDT)).toBe(-4)
            expect(timezone.getOffsetFromCode(TimezoneCode.CST)).toBe(-6)
            expect(timezone.getOffsetFromCode(TimezoneCode.MST)).toBe(-7)
            expect(timezone.getOffsetFromCode(TimezoneCode.PST)).toBe(-8)
            expect(timezone.getOffsetFromCode(TimezoneCode.AKST)).toBe(-9)
            expect(timezone.getOffsetFromCode(TimezoneCode.HST)).toBe(-10)
        })

        it("deve ser consistente entre getCodeFromOffset e getOffsetFromCode", () => {
            const timezone = new Timezone()
            const offsets = [0, -2, -3, -4, -5, -6, -7, -8, -9, -10]

            offsets.forEach((offset) => {
                const code = timezone.getCodeFromOffset(offset)
                const retrievedOffset = timezone.getOffsetFromCode(code)
                expect(retrievedOffset).toBe(offset)
            })
        })

        it("deve funcionar bidirecionalmente para todos os timezones", () => {
            const timezone = new Timezone()
            const allCodes = Object.values(TimezoneCode)

            allCodes.forEach((code) => {
                const offset = timezone.getOffsetFromCode(code)
                const retrievedCode = timezone.getCodeFromOffset(offset)

                // Deve retornar um código válido (pode não ser exatamente o mesmo devido a múltiplos codes com mesmo offset)
                expect(Object.values(TimezoneCode)).toContain(retrievedCode)
            })
        })
    })

    describe("Validação de entrada", () => {
        it("deve lançar erro para data inválida na conversão UTC para local", () => {
            const brtTimezone = new Timezone()
            brtTimezone.setLocalTimezone(TimezoneCode.BRT)

            expect(() => {
                brtTimezone.UTCToLocal(new Date("invalid"))
            }).toThrow("Data inválida fornecida")

            expect(() => {
                brtTimezone.UTCToLocal(new Date(NaN))
            }).toThrow("Data inválida fornecida")
        })

        it("deve lançar erro para data inválida na conversão local para UTC", () => {
            const brtTimezone = new Timezone()
            brtTimezone.setLocalTimezone(TimezoneCode.BRT)

            expect(() => {
                brtTimezone.localToUTC(new Date("invalid"))
            }).toThrow("Data inválida fornecida")

            expect(() => {
                brtTimezone.localToUTC(new Date(NaN))
            }).toThrow("Data inválida fornecida")
        })

        it("deve aceitar datas válidas", () => {
            const brtTimezone = new Timezone()
            brtTimezone.setLocalTimezone(TimezoneCode.BRT)
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
            const timezones = [TimezoneCode.BRT, TimezoneCode.PST, TimezoneCode.HST]

            timezones.forEach((code) => {
                const timezone = new Timezone()
                timezone.setLocalTimezone(code)
                const localDate = timezone.UTCToLocal(newYearUTC)
                const backToUTC = timezone.localToUTC(localDate)

                expect(backToUTC.getTime()).toBe(newYearUTC.getTime())
                expect(backToUTC.getUTCFullYear()).toBe(2024)
            })
        })

        it("deve lidar com anos bissextos", () => {
            const leapYearDate = new Date("2024-02-29T12:00:00Z") // 29 de fevereiro em ano bissexto
            const timezone = new Timezone()
            timezone.setLocalTimezone(TimezoneCode.BRT)

            const localDate = timezone.UTCToLocal(leapYearDate)
            const backToUTC = timezone.localToUTC(localDate)

            expect(backToUTC.getTime()).toBe(leapYearDate.getTime())
            expect(backToUTC.getUTCDate()).toBe(29)
            expect(backToUTC.getUTCMonth()).toBe(1) // Fevereiro
        })

        it("deve lidar com datas muito antigas", () => {
            const oldDate = new Date("1970-01-01T00:00:00Z") // Unix epoch
            const timezone = new Timezone()
            timezone.setLocalTimezone(TimezoneCode.UTC)

            const localDate = timezone.UTCToLocal(oldDate)
            const backToUTC = timezone.localToUTC(localDate)

            expect(backToUTC.getTime()).toBe(oldDate.getTime())
        })

        it("deve lidar com datas futuras distantes", () => {
            const futureDate = new Date("2099-12-31T23:59:59Z")
            const timezone = new Timezone()
            timezone.setLocalTimezone(TimezoneCode.BRT)

            const localDate = timezone.UTCToLocal(futureDate)
            const backToUTC = timezone.localToUTC(localDate)

            expect(backToUTC.getTime()).toBe(futureDate.getTime())
            expect(backToUTC.getUTCFullYear()).toBe(2099)
        })

        it("deve manter precisão de milissegundos", () => {
            const brtTimezone = new Timezone()
            brtTimezone.setLocalTimezone(TimezoneCode.BRT)
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

            const timezone = new Timezone()
            timezone.setLocalTimezone(TimezoneCode.BRT)

            dates.forEach((date) => {
                const localDate = timezone.UTCToLocal(date)
                const backToUTC = timezone.localToUTC(localDate)
                expect(backToUTC.getTime()).toBe(date.getTime())
            })
        })

        it("deve manter consistência em conversões múltiplas", () => {
            const originalDate = new Date("2024-06-15T14:30:00Z")
            const timezone = new Timezone()
            timezone.setLocalTimezone(TimezoneCode.EST)

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
            const timezone = new Timezone()
            timezone.setLocalTimezone(TimezoneCode.BRT)
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
            const timezone = new Timezone()
            timezone.setLocalTimezone(TimezoneCode.BRT)
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
            const timezone = new Timezone()
            timezone.setLocalTimezone(TimezoneCode.BRT)

            const localDate = timezone.UTCToLocal(originalDate)
            const backToUTC = timezone.localToUTC(localDate)

            // A data original não deve ter sido modificada
            expect(originalDate.getTime()).toBe(originalTime)
            expect(backToUTC.getTime()).toBe(originalTime)
        })

        it("deve funcionar corretamente com diferentes tipos de entrada de data", () => {
            const timezone = new Timezone()
            timezone.setLocalTimezone(TimezoneCode.EST)
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
