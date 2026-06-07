import { Timezone } from "../index"
import { describe, expect, it } from "vitest"

// Instante UTC de referência usado em vários testes: 2024-01-15 15:30:00 UTC.
const UTC_INSTANT = "2024-01-15T15:30:00Z"

describe("Timezone (Intl-based, v2)", () => {
    describe("detect()", () => {
        it("retorna uma string IANA não vazia", () => {
            const zone = Timezone.detect()
            expect(typeof zone).toBe("string")
            expect(zone.length).toBeGreaterThan(0)
        })

        it("é consistente em múltiplas chamadas", () => {
            expect(Timezone.detect()).toBe(Timezone.detect())
        })
    })

    describe("defaults", () => {
        it("aplica zone detectado, locale pt-BR e relógio padrão quando nada é passado", () => {
            const tz = new Timezone()
            // config readonly não expõe defaults implícitos, mas detect() é usado.
            expect(tz.config.zone).toBeUndefined()
            expect(tz.config.locale).toBeUndefined()
            // formata sem lançar, usando o locale pt-BR padrão (data curta dd/mm/aaaa).
            expect(tz.format(UTC_INSTANT)).toContain("2024")
        })
    })

    describe("format()", () => {
        it("formata um instante UTC no fuso de São Paulo (UTC-3) com locale pt-BR", () => {
            const tz = new Timezone({ zone: "America/Sao_Paulo", locale: "pt-BR" })
            const out = tz.format(UTC_INSTANT)
            // 15:30 UTC = 12:30 em São Paulo (sem horário de verão em jan/2024).
            expect(out).toContain("12:30")
            expect(out).toContain("15/01/2024")
        })

        it("formata o mesmo instante em Nova York (UTC-5) via opção zone", () => {
            const tz = new Timezone({ zone: "America/Sao_Paulo", locale: "pt-BR" })
            const out = tz.format(UTC_INSTANT, { zone: "America/New_York" })
            // 15:30 UTC = 10:30 em Nova York (inverno).
            expect(out).toContain("10:30")
        })

        it("respeita dateStyle long (somente data)", () => {
            const tz = new Timezone({ zone: "America/Sao_Paulo", locale: "pt-BR" })
            const out = tz.format(UTC_INSTANT, { dateStyle: "long" })
            expect(out.toLowerCase()).toContain("janeiro")
            expect(out).toContain("2024")
        })

        it("aceita epoch em milissegundos", () => {
            const tz = new Timezone({ zone: "UTC", locale: "pt-BR" })
            const epoch = new Date(UTC_INSTANT).getTime()
            expect(tz.format(epoch)).toContain("15:30")
        })

        it("aceita objeto Date", () => {
            const tz = new Timezone({ zone: "UTC", locale: "pt-BR" })
            expect(tz.format(new Date(UTC_INSTANT))).toContain("15:30")
        })

        it("lança 'Data inválida fornecida' para entrada inválida", () => {
            const tz = new Timezone({ zone: "UTC", locale: "pt-BR" })
            expect(() => tz.format("not a date")).toThrow("Data inválida fornecida")
            expect(() => tz.format(new Date("invalid"))).toThrow("Data inválida fornecida")
        })
    })

    describe("fromNow()", () => {
        // Relógio fixo injetado: 2024-01-15 15:30:00 UTC.
        const fixedNow = () => new Date(UTC_INSTANT)
        const tz = new Timezone({ locale: "pt-BR", now: fixedNow })

        it("retorna 'há 3 horas' para um instante 3h no passado", () => {
            const threeHoursAgo = new Date("2024-01-15T12:30:00Z")
            expect(tz.fromNow(threeHoursAgo)).toBe("há 3 horas")
        })

        it("retorna 'agora' para o instante atual", () => {
            expect(tz.fromNow(UTC_INSTANT)).toBe("agora")
        })

        it("retorna 'ontem' para ~24h no passado", () => {
            const yesterday = new Date("2024-01-14T15:30:00Z")
            expect(tz.fromNow(yesterday)).toBe("ontem")
        })

        it("retorna 'anteontem' para ~48h no passado (numeric: auto)", () => {
            const twoDaysAgo = new Date("2024-01-13T15:30:00Z")
            expect(tz.fromNow(twoDaysAgo)).toBe("anteontem")
        })

        it("retorna 'há 4 dias' para ~96h no passado", () => {
            const fourDaysAgo = new Date("2024-01-11T15:30:00Z")
            expect(tz.fromNow(fourDaysAgo)).toBe("há 4 dias")
        })

        it("suporta futuro: 'em 5 minutos'", () => {
            const inFiveMinutes = new Date("2024-01-15T15:35:00Z")
            expect(tz.fromNow(inFiveMinutes)).toBe("em 5 minutos")
        })

        it("lança 'Data inválida fornecida' para entrada inválida", () => {
            expect(() => tz.fromNow("invalid")).toThrow("Data inválida fornecida")
        })
    })

    describe("withConfig() / Configurable", () => {
        it("expõe config readonly com os valores fornecidos", () => {
            const tz = new Timezone({ zone: "America/Sao_Paulo", locale: "en-US" })
            expect(tz.config.zone).toBe("America/Sao_Paulo")
            expect(tz.config.locale).toBe("en-US")
        })

        it("withConfig deriva uma nova instância com patch aplicado, sem mutar a original", () => {
            const base = new Timezone({ zone: "UTC", locale: "pt-BR" })
            const derived = base.withConfig({ zone: "America/New_York" })

            expect(derived).not.toBe(base)
            expect(derived).toBeInstanceOf(Timezone)
            expect(derived.config.zone).toBe("America/New_York")
            expect(derived.config.locale).toBe("pt-BR") // herdado da base
            expect(base.config.zone).toBe("UTC") // base intacta
        })

        it("a nova instância usa o fuso atualizado ao formatar", () => {
            const base = new Timezone({ zone: "America/Sao_Paulo", locale: "pt-BR" })
            const ny = base.withConfig({ zone: "America/New_York" })
            expect(ny.format(UTC_INSTANT)).toContain("10:30")
        })
    })
})
