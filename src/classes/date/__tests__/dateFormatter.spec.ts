import { beforeEach, describe, expect, it, vi } from "vitest"

import { DateFormatter } from "../index"

describe("DateFormatter", () => {
    let now: Date

    beforeEach(() => {
        // Fixar a data atual para testes consistentes
        now = new Date("2024-01-20T12:00:00Z")
        vi.setSystemTime(now)
    })

    // ========================================================================
    // TESTES DE INICIALIZAÇÃO E CONFIGURAÇÃO
    // ========================================================================
    describe("Inicialização e Configuração", () => {
        it("deve criar instância com configuração padrão", () => {
            const formatter = new DateFormatter()
            expect(formatter).toBeDefined()
        })

        it("deve criar instância com estilo full", () => {
            const formatter = new DateFormatter({ style: "full" })
            expect(formatter).toBeDefined()
        })

        it("deve criar instância com estilo short", () => {
            const formatter = new DateFormatter({ style: "short" })
            expect(formatter).toBeDefined()
        })

        it("deve criar instância com estilo abbreviated", () => {
            const formatter = new DateFormatter({ style: "abbreviated" })
            expect(formatter).toBeDefined()
        })

        it("deve criar instância com todas as configurações", () => {
            const formatter = new DateFormatter({
                style: "full",
                locale: "pt",
                usePrefix: true,
                useSuffix: true,
                capitalize: true
            })
            expect(formatter).toBeDefined()
        })
    })

    // ========================================================================
    // TESTES DE TEMPO RELATIVO - ESTILO FULL
    // ========================================================================
    describe("Tempo Relativo - Estilo Full", () => {
        let formatter: DateFormatter

        beforeEach(() => {
            formatter = new DateFormatter({ style: "full" })
        })

        describe("Segundos", () => {
            it("deve retornar 'agora' para tempo presente", () => {
                const result = formatter.toRelativeTime(now)
                expect(result).toBe("agora")
            })

            it("deve formatar 1 segundo", () => {
                const past = new Date(now.getTime() - 1000)
                const result = formatter.toRelativeTime(past)
                expect(result).toBe("1 segundo atrás")
            })

            it("deve formatar 30 segundos", () => {
                const past = new Date(now.getTime() - 30000)
                const result = formatter.toRelativeTime(past)
                expect(result).toBe("30 segundos atrás")
            })

            it("deve formatar 59 segundos", () => {
                const past = new Date(now.getTime() - 59000)
                const result = formatter.toRelativeTime(past)
                expect(result).toBe("59 segundos atrás")
            })
        })

        describe("Minutos", () => {
            it("deve formatar 1 minuto", () => {
                const past = new Date(now.getTime() - 60000)
                const result = formatter.toRelativeTime(past)
                expect(result).toBe("1 minuto atrás")
            })

            it("deve formatar 10 minutos", () => {
                const past = new Date(now.getTime() - 10 * 60000)
                const result = formatter.toRelativeTime(past)
                expect(result).toBe("10 minutos atrás")
            })

            it("deve formatar 59 minutos", () => {
                const past = new Date(now.getTime() - 59 * 60000)
                const result = formatter.toRelativeTime(past)
                expect(result).toBe("59 minutos atrás")
            })
        })

        describe("Horas", () => {
            it("deve formatar 1 hora", () => {
                const past = new Date(now.getTime() - 60 * 60000)
                const result = formatter.toRelativeTime(past)
                expect(result).toBe("1 hora atrás")
            })

            it("deve formatar 5 horas", () => {
                const past = new Date(now.getTime() - 5 * 60 * 60000)
                const result = formatter.toRelativeTime(past)
                expect(result).toBe("5 horas atrás")
            })

            it("deve formatar 23 horas", () => {
                const past = new Date(now.getTime() - 23 * 60 * 60000)
                const result = formatter.toRelativeTime(past)
                expect(result).toBe("23 horas atrás")
            })
        })

        describe("Dias", () => {
            it("deve formatar 1 dia como 'ontem'", () => {
                const past = new Date(now.getTime() - 24 * 60 * 60000)
                const result = formatter.toRelativeTime(past)
                expect(result).toBe("ontem")
            })

            it("deve formatar 2 dias", () => {
                const past = new Date(now.getTime() - 2 * 24 * 60 * 60000)
                const result = formatter.toRelativeTime(past)
                expect(result).toBe("2 dias atrás")
            })

            it("deve formatar 6 dias", () => {
                const past = new Date(now.getTime() - 6 * 24 * 60 * 60000)
                const result = formatter.toRelativeTime(past)
                expect(result).toBe("6 dias atrás")
            })
        })

        describe("Semanas", () => {
            it("deve formatar 1 semana", () => {
                const past = new Date(now.getTime() - 7 * 24 * 60 * 60000)
                const result = formatter.toRelativeTime(past)
                expect(result).toBe("1 semana atrás")
            })

            it("deve formatar 2 semanas", () => {
                const past = new Date(now.getTime() - 14 * 24 * 60 * 60000)
                const result = formatter.toRelativeTime(past)
                expect(result).toBe("2 semanas atrás")
            })

            it("deve formatar 3 semanas", () => {
                const past = new Date(now.getTime() - 21 * 24 * 60 * 60000)
                const result = formatter.toRelativeTime(past)
                expect(result).toBe("3 semanas atrás")
            })
        })

        describe("Meses", () => {
            it("deve formatar 1 mês", () => {
                const past = new Date(now.getTime() - 30 * 24 * 60 * 60000)
                const result = formatter.toRelativeTime(past)
                expect(result).toBe("1 mês atrás")
            })

            it("deve formatar 3 meses", () => {
                const past = new Date(now.getTime() - 90 * 24 * 60 * 60000)
                const result = formatter.toRelativeTime(past)
                expect(result).toBe("3 meses atrás")
            })

            it("deve formatar 11 meses", () => {
                const past = new Date(now.getTime() - 330 * 24 * 60 * 60000)
                const result = formatter.toRelativeTime(past)
                expect(result).toBe("11 meses atrás")
            })
        })

        describe("Anos", () => {
            it("deve formatar 1 ano", () => {
                const past = new Date(now.getTime() - 365 * 24 * 60 * 60000)
                const result = formatter.toRelativeTime(past)
                expect(result).toBe("1 ano atrás")
            })

            it("deve formatar 2 anos", () => {
                const past = new Date(now.getTime() - 730 * 24 * 60 * 60000)
                const result = formatter.toRelativeTime(past)
                expect(result).toBe("2 anos atrás")
            })

            it("deve formatar 5 anos", () => {
                const past = new Date(now.getTime() - 1825 * 24 * 60 * 60000)
                const result = formatter.toRelativeTime(past)
                expect(result).toBe("5 anos atrás")
            })
        })
    })

    // ========================================================================
    // TESTES DE TEMPO RELATIVO - ESTILO SHORT
    // ========================================================================
    describe("Tempo Relativo - Estilo Short", () => {
        let formatter: DateFormatter

        beforeEach(() => {
            formatter = new DateFormatter({ style: "short" })
        })

        it("deve retornar 'agora' para tempo presente", () => {
            const result = formatter.toRelativeTime(now)
            expect(result).toBe("agora")
        })

        it("deve formatar segundos (30s)", () => {
            const past = new Date(now.getTime() - 30000)
            const result = formatter.toRelativeTime(past)
            expect(result).toBe("30s")
        })

        it("deve formatar minutos (10m)", () => {
            const past = new Date(now.getTime() - 10 * 60000)
            const result = formatter.toRelativeTime(past)
            expect(result).toBe("10m")
        })

        it("deve formatar horas (5h)", () => {
            const past = new Date(now.getTime() - 5 * 60 * 60000)
            const result = formatter.toRelativeTime(past)
            expect(result).toBe("5h")
        })

        it("deve formatar dias (2d)", () => {
            const past = new Date(now.getTime() - 2 * 24 * 60 * 60000)
            const result = formatter.toRelativeTime(past)
            expect(result).toBe("2d")
        })

        it("deve formatar semanas (2sem)", () => {
            const past = new Date(now.getTime() - 14 * 24 * 60 * 60000)
            const result = formatter.toRelativeTime(past)
            expect(result).toBe("2sem")
        })

        it("deve formatar meses (3mes)", () => {
            const past = new Date(now.getTime() - 90 * 24 * 60 * 60000)
            const result = formatter.toRelativeTime(past)
            expect(result).toBe("3mes")
        })

        it("deve formatar anos (2a)", () => {
            const past = new Date(now.getTime() - 730 * 24 * 60 * 60000)
            const result = formatter.toRelativeTime(past)
            expect(result).toBe("2a")
        })
    })

    // ========================================================================
    // TESTES DE TEMPO RELATIVO - ESTILO ABBREVIATED
    // ========================================================================
    describe("Tempo Relativo - Estilo Abbreviated", () => {
        let formatter: DateFormatter

        beforeEach(() => {
            formatter = new DateFormatter({ style: "abbreviated" })
        })

        it("deve retornar 'agora' para tempo presente", () => {
            const result = formatter.toRelativeTime(now)
            expect(result).toBe("agora")
        })

        it("deve formatar segundos (30seg)", () => {
            const past = new Date(now.getTime() - 30000)
            const result = formatter.toRelativeTime(past)
            expect(result).toBe("30seg")
        })

        it("deve formatar minutos (10min)", () => {
            const past = new Date(now.getTime() - 10 * 60000)
            const result = formatter.toRelativeTime(past)
            expect(result).toBe("10min")
        })

        it("deve formatar horas (5h)", () => {
            const past = new Date(now.getTime() - 5 * 60 * 60000)
            const result = formatter.toRelativeTime(past)
            expect(result).toBe("5h")
        })

        it("deve formatar dias (2d)", () => {
            const past = new Date(now.getTime() - 2 * 24 * 60 * 60000)
            const result = formatter.toRelativeTime(past)
            expect(result).toBe("2d")
        })

        it("deve formatar semanas (2sem)", () => {
            const past = new Date(now.getTime() - 14 * 24 * 60 * 60000)
            const result = formatter.toRelativeTime(past)
            expect(result).toBe("2sem")
        })

        it("deve formatar meses (3mes)", () => {
            const past = new Date(now.getTime() - 90 * 24 * 60 * 60000)
            const result = formatter.toRelativeTime(past)
            expect(result).toBe("3mes")
        })

        it("deve formatar anos (2a)", () => {
            const past = new Date(now.getTime() - 730 * 24 * 60 * 60000)
            const result = formatter.toRelativeTime(past)
            expect(result).toBe("2a")
        })
    })

    // ========================================================================
    // TESTES DE CONFIGURAÇÕES ESPECIAIS
    // ========================================================================
    describe("Configurações Especiais", () => {
        it("deve usar prefixo 'há' quando configurado", () => {
            const formatter = new DateFormatter({
                style: "full",
                usePrefix: true,
                useSuffix: true
            })

            const past = new Date(now.getTime() - 10 * 60000)
            const result = formatter.toRelativeTime(past)
            expect(result).toBe("há 10 minutos atrás")
        })

        it("deve usar apenas prefixo 'há' sem sufixo", () => {
            const formatter = new DateFormatter({
                style: "full",
                usePrefix: true,
                useSuffix: false
            })

            const past = new Date(now.getTime() - 10 * 60000)
            const result = formatter.toRelativeTime(past)
            expect(result).toBe("há 10 minutos")
        })

        it("deve usar apenas sufixo 'atrás' sem prefixo", () => {
            const formatter = new DateFormatter({
                style: "full",
                usePrefix: false,
                useSuffix: true
            })

            const past = new Date(now.getTime() - 10 * 60000)
            const result = formatter.toRelativeTime(past)
            expect(result).toBe("10 minutos atrás")
        })

        it("deve não usar nem prefixo nem sufixo", () => {
            const formatter = new DateFormatter({
                style: "full",
                usePrefix: false,
                useSuffix: false
            })

            const past = new Date(now.getTime() - 10 * 60000)
            const result = formatter.toRelativeTime(past)
            expect(result).toBe("10 minutos")
        })

        it("deve capitalizar quando configurado", () => {
            const formatter = new DateFormatter({
                style: "full",
                capitalize: true
            })

            const past = new Date(now.getTime() - 10 * 60000)
            const result = formatter.toRelativeTime(past)
            // Capitaliza apenas a primeira letra
            expect(result.charAt(0)).toBe(result.charAt(0).toUpperCase())
            expect(result).toBe("10 minutos atrás")
        })

        it("deve capitalizar 'ontem'", () => {
            const formatter = new DateFormatter({
                style: "full",
                capitalize: true
            })

            const past = new Date(now.getTime() - 24 * 60 * 60000)
            const result = formatter.toRelativeTime(past)
            expect(result).toBe("Ontem")
        })
    })

    // ========================================================================
    // TESTES DE FORMATAÇÃO DE DATA COMPLETA
    // ========================================================================
    describe("Formatação de Data Completa", () => {
        it("deve formatar data completa em pt-BR", () => {
            const formatter = new DateFormatter({ locale: "pt" })
            const date = new Date("2024-01-15T12:00:00Z")
            const result = formatter.toFullDate(date)
            expect(result).toContain("janeiro")
            expect(result).toContain("2024")
        })

        it("deve formatar data completa em en-US", () => {
            const formatter = new DateFormatter({ locale: "en" })
            const date = new Date("2024-01-15T12:00:00Z")
            const result = formatter.toFullDate(date)
            expect(result).toContain("January")
            expect(result).toContain("2024")
        })

        it("deve capitalizar data completa quando configurado", () => {
            const formatter = new DateFormatter({
                locale: "pt",
                capitalize: true
            })
            const date = new Date("2024-01-15T12:00:00Z")
            const result = formatter.toFullDate(date)
            const firstChar = result.charAt(0)
            expect(firstChar).toBe(firstChar.toUpperCase())
        })
    })

    // ========================================================================
    // TESTES DE DATA CURTA
    // ========================================================================
    describe("Formatação de Data Curta", () => {
        it("deve formatar data curta", () => {
            const formatter = new DateFormatter({ locale: "pt" })
            const date = new Date("2024-01-15T12:00:00Z")
            const result = formatter.toShortDate(date)
            expect(result).toMatch(/\d{2}\/\d{2}\/\d{4}/)
        })

        it("deve formatar diferentes datas corretamente", () => {
            const formatter = new DateFormatter()
            const date1 = new Date("2024-12-25T12:00:00Z")
            const date2 = new Date("2024-06-01T12:00:00Z")

            const result1 = formatter.toShortDate(date1)
            const result2 = formatter.toShortDate(date2)

            expect(result1).toContain("2024")
            expect(result2).toContain("2024")
        })
    })

    // ========================================================================
    // TESTES DE HORA
    // ========================================================================
    describe("Formatação de Hora", () => {
        it("deve formatar hora corretamente", () => {
            const formatter = new DateFormatter({ locale: "pt" })
            const date = new Date("2024-01-15T14:30:00Z")
            const result = formatter.toTimeString(date)
            expect(result).toMatch(/\d{2}:\d{2}/)
        })

        it("deve formatar meia-noite", () => {
            const formatter = new DateFormatter()
            const date = new Date("2024-01-15T00:00:00Z")
            const result = formatter.toTimeString(date)
            expect(result).toBeDefined()
        })

        it("deve formatar meio-dia", () => {
            const formatter = new DateFormatter()
            const date = new Date("2024-01-15T12:00:00Z")
            const result = formatter.toTimeString(date)
            expect(result).toBeDefined()
        })
    })

    // ========================================================================
    // TESTES DE DATA E HORA COMPLETA
    // ========================================================================
    describe("Formatação de Data e Hora Completa", () => {
        it("deve formatar data e hora completa", () => {
            const formatter = new DateFormatter({ locale: "pt" })
            const date = new Date("2024-01-15T14:30:00Z")
            const result = formatter.toFullDateTime(date)
            expect(result).toContain("2024")
            expect(result).toContain("às")
        })

        it("deve incluir minutos na hora", () => {
            const formatter = new DateFormatter()
            const date = new Date("2024-01-15T14:30:00Z")
            const result = formatter.toFullDateTime(date)
            expect(result).toMatch(/\d{2}:\d{2}/)
        })
    })

    // ========================================================================
    // TESTES DE VALIDAÇÃO
    // ========================================================================
    describe("Validação de Datas", () => {
        const formatter = new DateFormatter()

        it("deve lançar erro para data inválida em toRelativeTime", () => {
            expect(() => {
                formatter.toRelativeTime(new Date("invalid"))
            }).toThrow("Data inválida fornecida")
        })

        it("deve lançar erro para data NaN em toRelativeTime", () => {
            expect(() => {
                formatter.toRelativeTime(new Date(NaN))
            }).toThrow("Data inválida fornecida")
        })

        it("deve lançar erro para data no futuro em toRelativeTime", () => {
            const future = new Date(now.getTime() + 10000)
            expect(() => {
                formatter.toRelativeTime(future)
            }).toThrow("Data fornecida está no futuro")
        })

        it("deve lançar erro para data inválida em toFullDate", () => {
            expect(() => {
                formatter.toFullDate(new Date("invalid"))
            }).toThrow("Data inválida fornecida")
        })

        it("deve lançar erro para data inválida em toShortDate", () => {
            expect(() => {
                formatter.toShortDate(new Date("invalid"))
            }).toThrow("Data inválida fornecida")
        })

        it("deve lançar erro para data inválida em toTimeString", () => {
            expect(() => {
                formatter.toTimeString(new Date("invalid"))
            }).toThrow("Data inválida fornecida")
        })

        it("deve lançar erro para data inválida em toFullDateTime", () => {
            expect(() => {
                formatter.toFullDateTime(new Date("invalid"))
            }).toThrow("Data inválida fornecida")
        })
    })

    // ========================================================================
    // TESTES DE MÉTODOS UTILITÁRIOS
    // ========================================================================
    describe("Métodos Utilitários", () => {
        const formatter = new DateFormatter()

        describe("isPast", () => {
            it("deve retornar true para data no passado", () => {
                const past = new Date(now.getTime() - 10000)
                expect(formatter.isPast(past)).toBe(true)
            })

            it("deve retornar false para data no futuro", () => {
                const future = new Date(now.getTime() + 10000)
                expect(formatter.isPast(future)).toBe(false)
            })

            it("deve lançar erro para data inválida", () => {
                expect(() => {
                    formatter.isPast(new Date("invalid"))
                }).toThrow("Data inválida fornecida")
            })
        })

        describe("isFuture", () => {
            it("deve retornar true para data no futuro", () => {
                const future = new Date(now.getTime() + 10000)
                expect(formatter.isFuture(future)).toBe(true)
            })

            it("deve retornar false para data no passado", () => {
                const past = new Date(now.getTime() - 10000)
                expect(formatter.isFuture(past)).toBe(false)
            })

            it("deve lançar erro para data inválida", () => {
                expect(() => {
                    formatter.isFuture(new Date("invalid"))
                }).toThrow("Data inválida fornecida")
            })
        })

        describe("isToday", () => {
            it("deve retornar true para data de hoje", () => {
                const today = new Date(now)
                expect(formatter.isToday(today)).toBe(true)
            })

            it("deve retornar true para horário diferente mas mesmo dia", () => {
                const morning = new Date(now)
                morning.setHours(6, 0, 0, 0)
                expect(formatter.isToday(morning)).toBe(true)
            })

            it("deve retornar false para ontem", () => {
                const yesterday = new Date(now.getTime() - 24 * 60 * 60000)
                expect(formatter.isToday(yesterday)).toBe(false)
            })

            it("deve retornar false para amanhã", () => {
                const tomorrow = new Date(now.getTime() + 24 * 60 * 60000)
                expect(formatter.isToday(tomorrow)).toBe(false)
            })

            it("deve lançar erro para data inválida", () => {
                expect(() => {
                    formatter.isToday(new Date("invalid"))
                }).toThrow("Data inválida fornecida")
            })
        })

        describe("isYesterday", () => {
            it("deve retornar true para ontem", () => {
                const yesterday = new Date(now.getTime() - 24 * 60 * 60000)
                expect(formatter.isYesterday(yesterday)).toBe(true)
            })

            it("deve retornar false para hoje", () => {
                expect(formatter.isYesterday(now)).toBe(false)
            })

            it("deve retornar false para 2 dias atrás", () => {
                const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60000)
                expect(formatter.isYesterday(twoDaysAgo)).toBe(false)
            })

            it("deve lançar erro para data inválida", () => {
                expect(() => {
                    formatter.isYesterday(new Date("invalid"))
                }).toThrow("Data inválida fornecida")
            })
        })

        describe("daysBetween", () => {
            it("deve calcular dias entre duas datas", () => {
                const date1 = new Date("2024-01-15T12:00:00Z")
                const date2 = new Date("2024-01-20T12:00:00Z")
                const result = formatter.daysBetween(date1, date2)
                expect(result).toBe(5)
            })

            it("deve funcionar com datas invertidas", () => {
                const date1 = new Date("2024-01-20T12:00:00Z")
                const date2 = new Date("2024-01-15T12:00:00Z")
                const result = formatter.daysBetween(date1, date2)
                expect(result).toBe(5)
            })

            it("deve retornar 0 para mesma data", () => {
                const date = new Date("2024-01-15T12:00:00Z")
                const result = formatter.daysBetween(date, date)
                expect(result).toBe(0)
            })

            it("deve calcular dias entre data e agora por padrão", () => {
                const past = new Date(now.getTime() - 3 * 24 * 60 * 60000)
                const result = formatter.daysBetween(past)
                expect(result).toBe(3)
            })

            it("deve lançar erro para data inválida", () => {
                expect(() => {
                    formatter.daysBetween(new Date("invalid"))
                }).toThrow("Data inválida fornecida")
            })
        })
    })

    // ========================================================================
    // TESTES DE CASOS EXTREMOS E EDGE CASES
    // ========================================================================
    describe("Casos Extremos e Edge Cases", () => {
        it("deve lidar com transição de unidades (59s -> 1m)", () => {
            const fullFormatter = new DateFormatter({ style: "full" })
            const shortFormatter = new DateFormatter({ style: "short" })

            const at59s = new Date(now.getTime() - 59000)
            const at60s = new Date(now.getTime() - 60000)

            expect(fullFormatter.toRelativeTime(at59s)).toBe("59 segundos atrás")
            expect(fullFormatter.toRelativeTime(at60s)).toBe("1 minuto atrás")

            expect(shortFormatter.toRelativeTime(at59s)).toBe("59s")
            expect(shortFormatter.toRelativeTime(at60s)).toBe("1m")
        })

        it("deve lidar com transição de unidades (59m -> 1h)", () => {
            const fullFormatter = new DateFormatter({ style: "full" })
            const shortFormatter = new DateFormatter({ style: "short" })

            const at59m = new Date(now.getTime() - 59 * 60000)
            const at60m = new Date(now.getTime() - 60 * 60000)

            expect(fullFormatter.toRelativeTime(at59m)).toBe("59 minutos atrás")
            expect(fullFormatter.toRelativeTime(at60m)).toBe("1 hora atrás")

            expect(shortFormatter.toRelativeTime(at59m)).toBe("59m")
            expect(shortFormatter.toRelativeTime(at60m)).toBe("1h")
        })

        it("deve lidar com transição de unidades (23h -> 1d)", () => {
            const fullFormatter = new DateFormatter({ style: "full" })
            const shortFormatter = new DateFormatter({ style: "short" })

            const at23h = new Date(now.getTime() - 23 * 60 * 60000)
            const at24h = new Date(now.getTime() - 24 * 60 * 60000)

            expect(fullFormatter.toRelativeTime(at23h)).toBe("23 horas atrás")
            expect(fullFormatter.toRelativeTime(at24h)).toBe("ontem")

            expect(shortFormatter.toRelativeTime(at23h)).toBe("23h")
            expect(shortFormatter.toRelativeTime(at24h)).toBe("1d")
        })

        it("deve processar anos bissextos corretamente", () => {
            const formatter = new DateFormatter()
            const leapYearDate = new Date("2024-02-29T12:00:00Z")
            const result = formatter.toShortDate(leapYearDate)
            expect(result).toBeDefined()
        })

        it("deve processar datas muito antigas", () => {
            const formatter = new DateFormatter({ style: "full" })
            const oldDate = new Date("1990-01-15T12:00:00Z")
            const result = formatter.toRelativeTime(oldDate)
            expect(result).toContain("anos atrás")
        })

        it("deve processar milissegundos com precisão", () => {
            const formatter = new DateFormatter({ style: "full" })
            const date = new Date(now.getTime() - 500)
            const result = formatter.toRelativeTime(date)
            expect(result).toBe("agora")
        })
    })

    // ========================================================================
    // TESTES DE PLURALIZAÇÃO
    // ========================================================================
    describe("Pluralização", () => {
        const formatter = new DateFormatter({ style: "full" })

        it("deve usar singular para 1 segundo", () => {
            const past = new Date(now.getTime() - 1000)
            const result = formatter.toRelativeTime(past)
            expect(result).toBe("1 segundo atrás")
        })

        it("deve usar plural para 2 segundos", () => {
            const past = new Date(now.getTime() - 2000)
            const result = formatter.toRelativeTime(past)
            expect(result).toBe("2 segundos atrás")
        })

        it("deve usar singular para 1 minuto", () => {
            const past = new Date(now.getTime() - 60000)
            const result = formatter.toRelativeTime(past)
            expect(result).toBe("1 minuto atrás")
        })

        it("deve usar plural para 2 minutos", () => {
            const past = new Date(now.getTime() - 2 * 60000)
            const result = formatter.toRelativeTime(past)
            expect(result).toBe("2 minutos atrás")
        })

        it("deve usar singular para 1 hora", () => {
            const past = new Date(now.getTime() - 60 * 60000)
            const result = formatter.toRelativeTime(past)
            expect(result).toBe("1 hora atrás")
        })

        it("deve usar plural para 2 horas", () => {
            const past = new Date(now.getTime() - 2 * 60 * 60000)
            const result = formatter.toRelativeTime(past)
            expect(result).toBe("2 horas atrás")
        })

        it("deve usar singular para 1 dia (ontem)", () => {
            const past = new Date(now.getTime() - 24 * 60 * 60000)
            const result = formatter.toRelativeTime(past)
            expect(result).toBe("ontem")
        })

        it("deve usar plural para 2 dias", () => {
            const past = new Date(now.getTime() - 2 * 24 * 60 * 60000)
            const result = formatter.toRelativeTime(past)
            expect(result).toBe("2 dias atrás")
        })

        it("deve usar singular para 1 semana", () => {
            const past = new Date(now.getTime() - 7 * 24 * 60 * 60000)
            const result = formatter.toRelativeTime(past)
            expect(result).toBe("1 semana atrás")
        })

        it("deve usar plural para 2 semanas", () => {
            const past = new Date(now.getTime() - 14 * 24 * 60 * 60000)
            const result = formatter.toRelativeTime(past)
            expect(result).toBe("2 semanas atrás")
        })

        it("deve usar singular para 1 mês", () => {
            const past = new Date(now.getTime() - 30 * 24 * 60 * 60000)
            const result = formatter.toRelativeTime(past)
            expect(result).toBe("1 mês atrás")
        })

        it("deve usar plural 'meses' para 2 meses", () => {
            const past = new Date(now.getTime() - 60 * 24 * 60 * 60000)
            const result = formatter.toRelativeTime(past)
            expect(result).toBe("2 meses atrás")
        })

        it("deve usar singular para 1 ano", () => {
            const past = new Date(now.getTime() - 365 * 24 * 60 * 60000)
            const result = formatter.toRelativeTime(past)
            expect(result).toBe("1 ano atrás")
        })

        it("deve usar plural para 2 anos", () => {
            const past = new Date(now.getTime() - 730 * 24 * 60 * 60000)
            const result = formatter.toRelativeTime(past)
            expect(result).toBe("2 anos atrás")
        })
    })

    // ========================================================================
    // TESTES DE INTEGRAÇÃO E CENÁRIOS REAIS
    // ========================================================================
    describe("Cenários Reais de Rede Social", () => {
        it("deve formatar post recente (Instagram style)", () => {
            const shortFormatter = new DateFormatter({ style: "short" })

            const justNow = new Date(now.getTime() - 0)
            const fiveMinutes = new Date(now.getTime() - 5 * 60000)
            const oneHour = new Date(now.getTime() - 60 * 60000)
            const yesterday = new Date(now.getTime() - 24 * 60 * 60000)

            expect(shortFormatter.toRelativeTime(justNow)).toBe("agora")
            expect(shortFormatter.toRelativeTime(fiveMinutes)).toBe("5m")
            expect(shortFormatter.toRelativeTime(oneHour)).toBe("1h")
            expect(shortFormatter.toRelativeTime(yesterday)).toBe("1d")
        })

        it("deve formatar post antigo (Twitter style)", () => {
            const abbrFormatter = new DateFormatter({ style: "abbreviated" })

            const tenMinutes = new Date(now.getTime() - 10 * 60000)
            const twoHours = new Date(now.getTime() - 2 * 60 * 60000)
            const threeDays = new Date(now.getTime() - 3 * 24 * 60 * 60000)

            expect(abbrFormatter.toRelativeTime(tenMinutes)).toBe("10min")
            expect(abbrFormatter.toRelativeTime(twoHours)).toBe("2h")
            expect(abbrFormatter.toRelativeTime(threeDays)).toBe("3d")
        })

        it("deve formatar notificações (Full style)", () => {
            const fullFormatter = new DateFormatter({ style: "full", capitalize: true })

            const fiveMinutes = new Date(now.getTime() - 5 * 60000)
            const oneHour = new Date(now.getTime() - 60 * 60000)
            const yesterday = new Date(now.getTime() - 24 * 60 * 60000)

            const result1 = fullFormatter.toRelativeTime(fiveMinutes)
            const result2 = fullFormatter.toRelativeTime(oneHour)
            const result3 = fullFormatter.toRelativeTime(yesterday)

            // Verifica capitalização
            expect(result1.charAt(0)).toBe(result1.charAt(0).toUpperCase())
            expect(result2.charAt(0)).toBe(result2.charAt(0).toUpperCase())
            expect(result3.charAt(0)).toBe(result3.charAt(0).toUpperCase())

            expect(result1).toBe("5 minutos atrás")
            expect(result2).toBe("1 hora atrás")
            expect(result3).toBe("Ontem")
        })

        it("deve formatar timeline de posts (Mixed)", () => {
            const formatter = new DateFormatter({ style: "full" })

            const posts = [
                { date: new Date(now.getTime() - 30000), expected: "30 segundos atrás" },
                { date: new Date(now.getTime() - 5 * 60000), expected: "5 minutos atrás" },
                { date: new Date(now.getTime() - 2 * 60 * 60000), expected: "2 horas atrás" },
                { date: new Date(now.getTime() - 24 * 60 * 60000), expected: "ontem" },
                { date: new Date(now.getTime() - 7 * 24 * 60 * 60000), expected: "1 semana atrás" },
                {
                    date: new Date(now.getTime() - 30 * 24 * 60 * 60000),
                    expected: "1 mês atrás"
                }
            ]

            posts.forEach(({ date, expected }) => {
                const result = formatter.toRelativeTime(date)
                expect(result).toBe(expected)
            })
        })
    })

    // ========================================================================
    // TESTES DE COMBINAÇÕES DE CONFIGURAÇÕES
    // ========================================================================
    describe("Combinações de Configurações", () => {
        it("deve combinar short + capitalize", () => {
            const formatter = new DateFormatter({
                style: "short",
                capitalize: true
            })

            const past = new Date(now.getTime() - 10 * 60000)
            const result = formatter.toRelativeTime(past)
            expect(result).toBe("10m")
        })

        it("deve combinar full + usePrefix + sem useSuffix", () => {
            const formatter = new DateFormatter({
                style: "full",
                usePrefix: true,
                useSuffix: false
            })

            const past = new Date(now.getTime() - 10 * 60000)
            const result = formatter.toRelativeTime(past)
            expect(result).toBe("há 10 minutos")
        })

        it("deve combinar full + capitalize + usePrefix", () => {
            const formatter = new DateFormatter({
                style: "full",
                capitalize: true,
                usePrefix: true,
                useSuffix: false
            })

            const past = new Date(now.getTime() - 10 * 60000)
            const result = formatter.toRelativeTime(past)
            expect(result).toBe("Há 10 minutos")
        })

        it("deve funcionar com todas as opções desabilitadas", () => {
            const formatter = new DateFormatter({
                style: "full",
                usePrefix: false,
                useSuffix: false,
                capitalize: false
            })

            const past = new Date(now.getTime() - 10 * 60000)
            const result = formatter.toRelativeTime(past)
            expect(result).toBe("10 minutos")
        })
    })

    // ========================================================================
    // TESTES DE PERFORMANCE
    // ========================================================================
    describe("Performance", () => {
        it("deve processar 1000 formatações rapidamente", () => {
            const formatter = new DateFormatter({ style: "short" })
            const startTime = performance.now()

            for (let i = 0; i < 1000; i++) {
                const past = new Date(now.getTime() - i * 60000)
                formatter.toRelativeTime(past)
            }

            const endTime = performance.now()
            const duration = endTime - startTime

            // Deve completar 1000 formatações em menos de 50ms
            expect(duration).toBeLessThan(50)
        })

        it("deve manter consistência em múltiplas chamadas", () => {
            const formatter = new DateFormatter({ style: "full" })
            const date = new Date(now.getTime() - 10 * 60000)

            const result1 = formatter.toRelativeTime(date)
            const result2 = formatter.toRelativeTime(date)
            const result3 = formatter.toRelativeTime(date)

            expect(result1).toBe(result2)
            expect(result2).toBe(result3)
        })
    })

    // ========================================================================
    // TESTES DE DIFERENTES LOCALES
    // ========================================================================
    describe("Suporte a Diferentes Locales", () => {
        it("deve formatar data em pt-BR", () => {
            const formatter = new DateFormatter({ locale: "pt" })
            const date = new Date("2024-06-15T12:00:00Z")
            const result = formatter.toFullDate(date)
            expect(result).toContain("junho")
        })

        it("deve formatar data em en-US", () => {
            const formatter = new DateFormatter({ locale: "en" })
            const date = new Date("2024-06-15T12:00:00Z")
            const result = formatter.toFullDate(date)
            expect(result).toContain("June")
        })
    })

    // ========================================================================
    // TESTES DE TODOS OS MESES
    // ========================================================================
    describe("Formatação de Todos os Meses", () => {
        const formatter = new DateFormatter({ locale: "pt" })

        const months = [
            { month: 0, name: "janeiro" },
            { month: 1, name: "fevereiro" },
            { month: 2, name: "março" },
            { month: 3, name: "abril" },
            { month: 4, name: "maio" },
            { month: 5, name: "junho" },
            { month: 6, name: "julho" },
            { month: 7, name: "agosto" },
            { month: 8, name: "setembro" },
            { month: 9, name: "outubro" },
            { month: 10, name: "novembro" },
            { month: 11, name: "dezembro" }
        ]

        months.forEach(({ month, name }) => {
            it(`deve formatar ${name} corretamente`, () => {
                const date = new Date(2024, month, 15)
                const result = formatter.toFullDate(date)
                expect(result.toLowerCase()).toContain(name.toLowerCase())
            })
        })
    })

    // ========================================================================
    // TESTES DE TEMPO APROXIMADO (useApproximateTime)
    // ========================================================================
    describe("Tempo Aproximado", () => {
        describe("Anos", () => {
            it("deve mostrar 'mais de um ano atrás' para 1 ano", () => {
                const formatter = new DateFormatter({
                    style: "full",
                    useApproximateTime: true
                })

                const past = new Date(now.getTime() - 365 * 24 * 60 * 60000)
                const result = formatter.toRelativeTime(past)
                expect(result).toBe("mais de um ano atrás")
            })

            it("deve mostrar 'mais de um ano atrás' para 2 anos", () => {
                const formatter = new DateFormatter({
                    style: "full",
                    useApproximateTime: true
                })

                const past = new Date(now.getTime() - 730 * 24 * 60 * 60000)
                const result = formatter.toRelativeTime(past)
                expect(result).toBe("mais de um ano atrás")
            })

            it("deve mostrar 'mais de um ano atrás' para 5 anos", () => {
                const formatter = new DateFormatter({
                    style: "full",
                    useApproximateTime: true
                })

                const past = new Date(now.getTime() - 1825 * 24 * 60 * 60000)
                const result = formatter.toRelativeTime(past)
                expect(result).toBe("mais de um ano atrás")
            })

            it("deve usar formato curto para anos com tempo aproximado", () => {
                const formatter = new DateFormatter({
                    style: "short",
                    useApproximateTime: true
                })

                const past = new Date(now.getTime() - 730 * 24 * 60 * 60000)
                const result = formatter.toRelativeTime(past)
                expect(result).toBe(">1a")
            })
        })

        describe("Meses e Semanas", () => {
            it("deve converter 4 semanas para semanas ao invés de meses", () => {
                const formatter = new DateFormatter({
                    style: "full",
                    useApproximateTime: true
                })

                const past = new Date(now.getTime() - 28 * 24 * 60 * 60000)
                const result = formatter.toRelativeTime(past)
                expect(result).toBe("4 semanas atrás")
            })

            it("deve converter 12 semanas ao invés de 3 meses", () => {
                const formatter = new DateFormatter({
                    style: "full",
                    useApproximateTime: true
                })

                const past = new Date(now.getTime() - 84 * 24 * 60 * 60000)
                const result = formatter.toRelativeTime(past)
                expect(result).toBe("12 semanas atrás")
            })

            it("deve mostrar 'mais de uma semana atrás' para 2 semanas", () => {
                const formatter = new DateFormatter({
                    style: "full",
                    useApproximateTime: true
                })

                const past = new Date(now.getTime() - 14 * 24 * 60 * 60000)
                const result = formatter.toRelativeTime(past)
                expect(result).toBe("mais de uma semana atrás")
            })

            it("deve mostrar 'mais de uma semana atrás' para 3 semanas", () => {
                const formatter = new DateFormatter({
                    style: "full",
                    useApproximateTime: true
                })

                const past = new Date(now.getTime() - 21 * 24 * 60 * 60000)
                const result = formatter.toRelativeTime(past)
                expect(result).toBe("mais de uma semana atrás")
            })

            it("deve mostrar exatamente 1 semana com aproximação", () => {
                const formatter = new DateFormatter({
                    style: "full",
                    useApproximateTime: true
                })

                const past = new Date(now.getTime() - 7 * 24 * 60 * 60000)
                const result = formatter.toRelativeTime(past)
                expect(result).toBe("mais de uma semana atrás")
            })
        })

        describe("Sem tempo aproximado (comportamento padrão)", () => {
            it("deve mostrar anos normalmente sem aproximação", () => {
                const formatter = new DateFormatter({
                    style: "full",
                    useApproximateTime: false
                })

                const past = new Date(now.getTime() - 730 * 24 * 60 * 60000)
                const result = formatter.toRelativeTime(past)
                expect(result).toBe("2 anos atrás")
            })

            it("deve mostrar meses normalmente sem aproximação", () => {
                const formatter = new DateFormatter({
                    style: "full",
                    useApproximateTime: false
                })

                const past = new Date(now.getTime() - 90 * 24 * 60 * 60000)
                const result = formatter.toRelativeTime(past)
                expect(result).toBe("3 meses atrás")
            })

            it("deve mostrar semanas normalmente sem aproximação", () => {
                const formatter = new DateFormatter({
                    style: "full",
                    useApproximateTime: false
                })

                const past = new Date(now.getTime() - 14 * 24 * 60 * 60000)
                const result = formatter.toRelativeTime(past)
                expect(result).toBe("2 semanas atrás")
            })
        })

        describe("Combinações com prefixo e sufixo", () => {
            it("deve combinar aproximação com prefixo", () => {
                const formatter = new DateFormatter({
                    style: "full",
                    useApproximateTime: true,
                    usePrefix: true,
                    useSuffix: false
                })

                const past = new Date(now.getTime() - 730 * 24 * 60 * 60000)
                const result = formatter.toRelativeTime(past)
                expect(result).toBe("há mais de um ano")
            })

            it("deve combinar aproximação sem prefixo nem sufixo", () => {
                const formatter = new DateFormatter({
                    style: "full",
                    useApproximateTime: true,
                    usePrefix: false,
                    useSuffix: false
                })

                const past = new Date(now.getTime() - 14 * 24 * 60 * 60000)
                const result = formatter.toRelativeTime(past)
                expect(result).toBe("mais de uma semana")
            })
        })
    })

    // ========================================================================
    // TESTES DE JANELA DE TEMPO RECENTE (recentTimeThreshold)
    // ========================================================================
    describe("Janela de Tempo Recente", () => {
        describe("Threshold customizado", () => {
            it("deve mostrar 'agora' para 30 segundos com threshold de 60s", () => {
                const formatter = new DateFormatter({
                    style: "full",
                    recentTimeThreshold: 60
                })

                const past = new Date(now.getTime() - 30000)
                const result = formatter.toRelativeTime(past)
                expect(result).toBe("agora")
            })

            it("deve mostrar 'agora' para 59 segundos com threshold de 60s", () => {
                const formatter = new DateFormatter({
                    style: "full",
                    recentTimeThreshold: 60
                })

                const past = new Date(now.getTime() - 59000)
                const result = formatter.toRelativeTime(past)
                expect(result).toBe("agora")
            })

            it("deve mostrar tempo exato para 61 segundos com threshold de 60s", () => {
                const formatter = new DateFormatter({
                    style: "full",
                    recentTimeThreshold: 60
                })

                const past = new Date(now.getTime() - 61000)
                const result = formatter.toRelativeTime(past)
                expect(result).toBe("1 minuto atrás")
            })

            it("deve mostrar 'agora' para quase 2 minutos com threshold de 120s", () => {
                const formatter = new DateFormatter({
                    style: "full",
                    recentTimeThreshold: 120
                })

                const past = new Date(now.getTime() - 119000)
                const result = formatter.toRelativeTime(past)
                expect(result).toBe("agora")
            })

            it("deve mostrar 'agora' para 5 minutos com threshold de 300s", () => {
                const formatter = new DateFormatter({
                    style: "full",
                    recentTimeThreshold: 300
                })

                const past = new Date(now.getTime() - 290000)
                const result = formatter.toRelativeTime(past)
                expect(result).toBe("agora")
            })
        })

        describe("Label customizado", () => {
            it("deve usar 'agora mesmo' como label customizado", () => {
                const formatter = new DateFormatter({
                    style: "full",
                    recentTimeThreshold: 120,
                    recentTimeLabel: "agora mesmo"
                })

                const past = new Date(now.getTime() - 90000)
                const result = formatter.toRelativeTime(past)
                expect(result).toBe("agora mesmo")
            })

            it("deve usar 'agora pouco' como label customizado", () => {
                const formatter = new DateFormatter({
                    style: "full",
                    recentTimeThreshold: 180,
                    recentTimeLabel: "agora pouco"
                })

                const past = new Date(now.getTime() - 120000)
                const result = formatter.toRelativeTime(past)
                expect(result).toBe("agora pouco")
            })

            it("deve usar 'há poucos instantes' como label customizado", () => {
                const formatter = new DateFormatter({
                    style: "full",
                    recentTimeThreshold: 60,
                    recentTimeLabel: "há poucos instantes"
                })

                const past = new Date(now.getTime() - 45000)
                const result = formatter.toRelativeTime(past)
                expect(result).toBe("há poucos instantes")
            })
        })

        describe("Threshold desabilitado (padrão)", () => {
            it("deve mostrar tempo exato com threshold 0 (padrão)", () => {
                const formatter = new DateFormatter({
                    style: "full",
                    recentTimeThreshold: 0
                })

                const past = new Date(now.getTime() - 30000)
                const result = formatter.toRelativeTime(past)
                expect(result).toBe("30 segundos atrás")
            })

            it("deve mostrar 'agora' apenas para 0 segundos", () => {
                const formatter = new DateFormatter({
                    style: "full",
                    recentTimeThreshold: 0
                })

                const result = formatter.toRelativeTime(now)
                expect(result).toBe("agora")
            })
        })

        describe("Estilo short com threshold", () => {
            it("deve retornar label no estilo short com threshold", () => {
                const formatter = new DateFormatter({
                    style: "short",
                    recentTimeThreshold: 60,
                    recentTimeLabel: "agora"
                })

                const past = new Date(now.getTime() - 30000)
                const result = formatter.toRelativeTime(past)
                expect(result).toBe("agora")
            })

            it("deve retornar formato normal após threshold no estilo short", () => {
                const formatter = new DateFormatter({
                    style: "short",
                    recentTimeThreshold: 60
                })

                const past = new Date(now.getTime() - 90000)
                const result = formatter.toRelativeTime(past)
                expect(result).toBe("1m")
            })
        })
    })

    // ========================================================================
    // TESTES DE SETTERS DAS NOVAS CONFIGURAÇÕES
    // ========================================================================
    describe("Setters de Configuração", () => {
        it("deve permitir configurar useApproximateTime via setter", () => {
            const formatter = new DateFormatter({ style: "full" })
            formatter.setUseApproximateTime(true)

            const past = new Date(now.getTime() - 730 * 24 * 60 * 60000)
            const result = formatter.toRelativeTime(past)
            expect(result).toBe("mais de um ano atrás")
        })

        it("deve permitir configurar recentTimeThreshold via setter", () => {
            const formatter = new DateFormatter({ style: "full" })
            formatter.setRecentTimeThreshold(120)

            const past = new Date(now.getTime() - 90000)
            const result = formatter.toRelativeTime(past)
            expect(result).toBe("agora")
        })

        it("deve permitir configurar recentTimeLabel via setter", () => {
            const formatter = new DateFormatter({
                style: "full",
                recentTimeThreshold: 60
            })
            formatter.setRecentTimeLabel("agora mesmo")

            const past = new Date(now.getTime() - 30000)
            const result = formatter.toRelativeTime(past)
            expect(result).toBe("agora mesmo")
        })

        it("deve permitir alterar configurações dinamicamente", () => {
            const formatter = new DateFormatter({ style: "full" })
            const past = new Date(now.getTime() - 30000)

            // Sem threshold
            let result = formatter.toRelativeTime(past)
            expect(result).toBe("30 segundos atrás")

            // Com threshold
            formatter.setRecentTimeThreshold(60)
            result = formatter.toRelativeTime(past)
            expect(result).toBe("agora")

            // Alterando label
            formatter.setRecentTimeLabel("agora pouco")
            result = formatter.toRelativeTime(past)
            expect(result).toBe("agora pouco")
        })
    })

    // ========================================================================
    // TESTES DE SUPORTE AO IDIOMA INGLÊS
    // ========================================================================
    describe("Suporte ao Idioma Inglês (locale: en)", () => {
        let formatter: DateFormatter

        beforeEach(() => {
            formatter = new DateFormatter({ style: "full", locale: "en" })
        })

        describe("Tempo Relativo em Inglês", () => {
            it("deve formatar segundos em inglês", () => {
                const past = new Date(now.getTime() - 30000)
                const result = formatter.toRelativeTime(past)
                expect(result).toBe("30 seconds ago")
            })

            it("deve formatar 1 segundo no singular", () => {
                const past = new Date(now.getTime() - 1000)
                const result = formatter.toRelativeTime(past)
                expect(result).toBe("1 second ago")
            })

            it("deve formatar minutos em inglês", () => {
                const past = new Date(now.getTime() - 10 * 60000)
                const result = formatter.toRelativeTime(past)
                expect(result).toBe("10 minutes ago")
            })

            it("deve formatar 1 minuto no singular", () => {
                const past = new Date(now.getTime() - 60000)
                const result = formatter.toRelativeTime(past)
                expect(result).toBe("1 minute ago")
            })

            it("deve formatar horas em inglês", () => {
                const past = new Date(now.getTime() - 5 * 60 * 60000)
                const result = formatter.toRelativeTime(past)
                expect(result).toBe("5 hours ago")
            })

            it("deve formatar 1 hora no singular", () => {
                const past = new Date(now.getTime() - 60 * 60000)
                const result = formatter.toRelativeTime(past)
                expect(result).toBe("1 hour ago")
            })

            it("deve formatar 1 dia como 'yesterday'", () => {
                const past = new Date(now.getTime() - 24 * 60 * 60000)
                const result = formatter.toRelativeTime(past)
                expect(result).toBe("yesterday")
            })

            it("deve formatar dias em inglês", () => {
                const past = new Date(now.getTime() - 3 * 24 * 60 * 60000)
                const result = formatter.toRelativeTime(past)
                expect(result).toBe("3 days ago")
            })

            it("deve formatar semanas em inglês", () => {
                const past = new Date(now.getTime() - 2 * 7 * 24 * 60 * 60000)
                const result = formatter.toRelativeTime(past)
                expect(result).toBe("2 weeks ago")
            })

            it("deve formatar 1 semana no singular", () => {
                const past = new Date(now.getTime() - 7 * 24 * 60 * 60000)
                const result = formatter.toRelativeTime(past)
                expect(result).toBe("1 week ago")
            })

            it("deve formatar meses em inglês", () => {
                const past = new Date(now.getTime() - 90 * 24 * 60 * 60000)
                const result = formatter.toRelativeTime(past)
                expect(result).toBe("3 months ago")
            })

            it("deve formatar 1 mês no singular", () => {
                const past = new Date(now.getTime() - 30 * 24 * 60 * 60000)
                const result = formatter.toRelativeTime(past)
                expect(result).toBe("1 month ago")
            })

            it("deve formatar anos em inglês", () => {
                const past = new Date(now.getTime() - 730 * 24 * 60 * 60000)
                const result = formatter.toRelativeTime(past)
                expect(result).toBe("2 years ago")
            })

            it("deve formatar 1 ano no singular", () => {
                const past = new Date(now.getTime() - 365 * 24 * 60 * 60000)
                const result = formatter.toRelativeTime(past)
                expect(result).toBe("1 year ago")
            })
        })

        describe("Estilos em Inglês", () => {
            it("deve formatar no estilo short", () => {
                formatter.setStyle("short")
                const past = new Date(now.getTime() - 5 * 60000)
                const result = formatter.toRelativeTime(past)
                expect(result).toBe("5m")
            })

            it("deve formatar no estilo abbreviated", () => {
                formatter.setStyle("abbreviated")
                const past = new Date(now.getTime() - 30000)
                const result = formatter.toRelativeTime(past)
                expect(result).toBe("30sec")
            })
        })

        describe("Tempo Aproximado em Inglês", () => {
            beforeEach(() => {
                formatter.setUseApproximateTime(true)
            })

            it("deve mostrar 'over a year ago' para 2 anos", () => {
                const past = new Date(now.getTime() - 730 * 24 * 60 * 60000)
                const result = formatter.toRelativeTime(past)
                expect(result).toBe("over a year ago")
            })

            it("deve mostrar 'over a week ago' para 2 semanas", () => {
                const past = new Date(now.getTime() - 14 * 24 * 60 * 60000)
                const result = formatter.toRelativeTime(past)
                expect(result).toBe("over a week ago")
            })

            it("deve converter meses para semanas", () => {
                const past = new Date(now.getTime() - 84 * 24 * 60 * 60000)
                const result = formatter.toRelativeTime(past)
                expect(result).toBe("12 weeks ago")
            })

            it("deve usar formato curto com aproximação", () => {
                formatter.setStyle("short")
                const past = new Date(now.getTime() - 730 * 24 * 60 * 60000)
                const result = formatter.toRelativeTime(past)
                expect(result).toBe(">1y")
            })
        })

        describe("Configurações em Inglês", () => {
            it("deve funcionar sem sufixo", () => {
                formatter.setUseSuffix(false)
                const past = new Date(now.getTime() - 10 * 60000)
                const result = formatter.toRelativeTime(past)
                expect(result).toBe("10 minutes")
            })

            it("deve capitalizar em inglês", () => {
                formatter.setCapitalize(true)
                const past = new Date(now.getTime() - 10 * 60000)
                const result = formatter.toRelativeTime(past)
                // Capitaliza apenas a primeira letra da string
                expect(result.charAt(0)).toBe(result.charAt(0).toUpperCase())
                expect(result).toBe("10 minutes ago")
            })

            it("deve capitalizar 'Yesterday'", () => {
                formatter.setCapitalize(true)
                const past = new Date(now.getTime() - 24 * 60 * 60000)
                const result = formatter.toRelativeTime(past)
                expect(result).toBe("Yesterday")
            })
        })

        describe("Janela de Tempo Recente em Inglês", () => {
            it("deve usar label em inglês", () => {
                formatter.setRecentTimeThreshold(60)
                formatter.setRecentTimeLabel("just now")

                const past = new Date(now.getTime() - 30000)
                const result = formatter.toRelativeTime(past)
                expect(result).toBe("just now")
            })

            it("deve usar 'moments ago'", () => {
                formatter.setRecentTimeThreshold(120)
                formatter.setRecentTimeLabel("moments ago")

                const past = new Date(now.getTime() - 90000)
                const result = formatter.toRelativeTime(past)
                expect(result).toBe("moments ago")
            })
        })

        describe("Formatação de Datas Completas em Inglês", () => {
            it("deve formatar data completa em inglês", () => {
                const date = new Date("2024-01-15T12:00:00Z")
                const result = formatter.toFullDate(date)
                expect(result).toContain("January")
                expect(result).toContain("2024")
            })

            it("deve formatar data curta em formato americano", () => {
                const date = new Date("2024-01-15T12:00:00Z")
                const result = formatter.toShortDate(date)
                // Formato americano: MM/DD/YYYY
                expect(result).toMatch(/\d{2}\/\d{2}\/\d{4}/)
            })

            it("deve formatar data e hora completa em inglês", () => {
                const date = new Date("2024-01-15T14:30:00Z")
                const result = formatter.toFullDateTime(date)
                expect(result).toContain("January")
                expect(result).toContain("2024")
                expect(result).toContain("at")
            })
        })

        describe("Meses em Inglês", () => {
            const months = [
                { month: 0, name: "january" },
                { month: 1, name: "february" },
                { month: 2, name: "march" },
                { month: 3, name: "april" },
                { month: 4, name: "may" },
                { month: 5, name: "june" },
                { month: 6, name: "july" },
                { month: 7, name: "august" },
                { month: 8, name: "september" },
                { month: 9, name: "october" },
                { month: 10, name: "november" },
                { month: 11, name: "december" }
            ]

            months.forEach(({ month, name }) => {
                it(`deve formatar ${name} corretamente em inglês`, () => {
                    const date = new Date(2024, month, 15)
                    const result = formatter.toFullDate(date)
                    expect(result.toLowerCase()).toContain(name.toLowerCase())
                })
            })
        })
    })

    // ========================================================================
    // TESTES DE COMPARAÇÃO ENTRE IDIOMAS
    // ========================================================================
    describe("Comparação entre Português e Inglês", () => {
        it("deve formatar diferente em português e inglês", () => {
            const ptFormatter = new DateFormatter({ style: "full", locale: "pt" })
            const enFormatter = new DateFormatter({ style: "full", locale: "en" })

            const past = new Date(now.getTime() - 10 * 60000)

            const ptResult = ptFormatter.toRelativeTime(past)
            const enResult = enFormatter.toRelativeTime(past)

            expect(ptResult).toBe("10 minutos atrás")
            expect(enResult).toBe("10 minutes ago")
        })

        it("deve formatar 'ontem' vs 'yesterday'", () => {
            const ptFormatter = new DateFormatter({ style: "full", locale: "pt" })
            const enFormatter = new DateFormatter({ style: "full", locale: "en" })

            const past = new Date(now.getTime() - 24 * 60 * 60000)

            expect(ptFormatter.toRelativeTime(past)).toBe("ontem")
            expect(enFormatter.toRelativeTime(past)).toBe("yesterday")
        })

        it("deve formatar tempo aproximado diferente", () => {
            const ptFormatter = new DateFormatter({
                style: "full",
                locale: "pt",
                useApproximateTime: true
            })
            const enFormatter = new DateFormatter({
                style: "full",
                locale: "en",
                useApproximateTime: true
            })

            const past = new Date(now.getTime() - 730 * 24 * 60 * 60000)

            expect(ptFormatter.toRelativeTime(past)).toBe("mais de um ano atrás")
            expect(enFormatter.toRelativeTime(past)).toBe("over a year ago")
        })

        it("deve formatar datas completas diferente", () => {
            const ptFormatter = new DateFormatter({ locale: "pt" })
            const enFormatter = new DateFormatter({ locale: "en" })

            const date = new Date("2024-06-15T12:00:00Z")

            const ptResult = ptFormatter.toFullDate(date)
            const enResult = enFormatter.toFullDate(date)

            expect(ptResult).toContain("junho")
            expect(enResult).toContain("June")
        })
    })

    // ========================================================================
    // TESTES DE INTEGRAÇÃO COMPLETA
    // ========================================================================
    describe("Integração Completa", () => {
        it("deve processar workflow completo de rede social", () => {
            const shortFormatter = new DateFormatter({ style: "short" })
            const fullFormatter = new DateFormatter({ style: "full" })

            const recentPost = new Date(now.getTime() - 5 * 60000)
            const oldPost = new Date(now.getTime() - 3 * 24 * 60 * 60000)

            // Timeline mostra versão curta
            expect(shortFormatter.toRelativeTime(recentPost)).toBe("5m")
            expect(shortFormatter.toRelativeTime(oldPost)).toBe("3d")

            // Detalhes mostram versão completa
            expect(fullFormatter.toRelativeTime(recentPost)).toBe("5 minutos atrás")
            expect(fullFormatter.toRelativeTime(oldPost)).toBe("3 dias atrás")

            // Data completa para posts muito antigos
            expect(fullFormatter.toFullDate(oldPost)).toBeDefined()
        })

        it("deve suportar diferentes formatters para diferentes contextos", () => {
            const timelineFormatter = new DateFormatter({ style: "short" })
            const notificationFormatter = new DateFormatter({
                style: "full",
                capitalize: true
            })
            const detailFormatter = new DateFormatter({
                style: "full",
                usePrefix: true,
                useSuffix: false
            })

            const date = new Date(now.getTime() - 10 * 60000)

            const result1 = timelineFormatter.toRelativeTime(date)
            const result2 = notificationFormatter.toRelativeTime(date)
            const result3 = detailFormatter.toRelativeTime(date)

            expect(result1).toBe("10m")
            expect(result2.charAt(0)).toBe(result2.charAt(0).toUpperCase())
            expect(result2).toBe("10 minutos atrás")
            expect(result3).toBe("há 10 minutos")
        })
    })
})
