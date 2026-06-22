import { DateFormatter } from "../index"
import { Timezone } from "../../timezone/index"
import { describe, expect, it } from "vitest"

// Instante UTC de referência usado como "agora" injetado: 2024-01-15 15:30:00 UTC.
const UTC_INSTANT = "2024-01-15T15:30:00Z"
const fixedNow = () => new Date(UTC_INSTANT)
const baseMs = new Date(UTC_INSTANT).getTime()
const ago = (seconds: number) => new Date(baseMs - seconds * 1000)
const ahead = (seconds: number) => new Date(baseMs + seconds * 1000)

const HOUR = 60 * 60
const DAY = 24 * HOUR

describe("DateFormatter (tempo relativo customizável, v2)", () => {
    describe("fromNow() — pt-BR (default)", () => {
        const df = new DateFormatter({ now: fixedNow })

        it("retorna 'há 3 horas' para 3h no passado", () => {
            expect(df.fromNow(ago(3 * HOUR))).toBe("há 3 horas")
        })

        it("retorna 'agora mesmo' para o instante atual (dentro do limiar)", () => {
            expect(df.fromNow(UTC_INSTANT)).toBe("agora mesmo")
            expect(df.fromNow(ago(10))).toBe("agora mesmo")
        })

        it("retorna 'ontem' para ~24h no passado (numeric auto)", () => {
            expect(df.fromNow(ago(DAY))).toBe("ontem")
        })

        it("retorna 'anteontem' para ~48h no passado", () => {
            expect(df.fromNow(ago(2 * DAY))).toBe("anteontem")
        })

        it("retorna 'há 4 dias' para ~96h no passado", () => {
            expect(df.fromNow(ago(4 * DAY))).toBe("há 4 dias")
        })

        it("suporta futuro: 'em 5 minutos'", () => {
            expect(df.fromNow(ahead(5 * 60))).toBe("em 5 minutos")
        })

        it("toRelativeTime é alias de fromNow", () => {
            expect(df.toRelativeTime(ago(3 * HOUR))).toBe(df.fromNow(ago(3 * HOUR)))
        })
    })

    describe("fromNow() — en-US", () => {
        const df = new DateFormatter({ locale: "en-US", now: fixedNow })

        it("retorna '3 hours ago'", () => {
            expect(df.fromNow(ago(3 * HOUR))).toBe("3 hours ago")
        })

        it("retorna 'yesterday' para ~24h no passado", () => {
            expect(df.fromNow(ago(DAY))).toBe("yesterday")
        })

        it("usa 'just now' como justNow default em inglês", () => {
            expect(df.fromNow(ago(5))).toBe("just now")
        })
    })

    describe("customização", () => {
        it("justNowLabel sobrescreve o texto do 'agora'", () => {
            const df = new DateFormatter({ now: fixedNow, justNowLabel: "agorinha" })
            expect(df.fromNow(ago(5))).toBe("agorinha")
        })

        it("justNowThreshold amplia/reduz a janela do 'agora'", () => {
            const wide = new DateFormatter({ now: fixedNow, justNowThreshold: 120 })
            expect(wide.fromNow(ago(90))).toBe("agora mesmo")

            const tight = new DateFormatter({ now: fixedNow, justNowThreshold: 0 })
            expect(tight.fromNow(ago(1))).toBe("há 1 segundo")
        })

        it("style 'short' encurta a frase", () => {
            const df = new DateFormatter({ now: fixedNow, style: "short" })
            expect(df.fromNow(ago(3 * HOUR))).toContain("3")
        })

        it("numeric 'always' força 'há 1 dia' em vez de 'ontem'", () => {
            const df = new DateFormatter({ now: fixedNow, numeric: "always" })
            expect(df.fromNow(ago(DAY))).toBe("há 1 dia")
        })

        it("maxUnit 'day' capa em dias em vez de rolar para meses/anos", () => {
            const df = new DateFormatter({ now: fixedNow, maxUnit: "day" })
            const out = df.fromNow(ago(400 * DAY))
            expect(out).toContain("400")
            expect(out).toContain("dia")
        })
    })

    describe("format() — absoluto via Timezone", () => {
        it("usa o fuso da config (zone) para formatar o instante UTC", () => {
            const df = new DateFormatter({ zone: "America/Sao_Paulo", locale: "pt-BR", now: fixedNow })
            const out = df.format(UTC_INSTANT)
            // 15:30 UTC = 12:30 em São Paulo (sem horário de verão em jan/2024).
            expect(out).toContain("12:30")
            expect(out).toContain("15/01/2024")
        })

        it("delega a um Timezone injetado (DI)", () => {
            const tz = new Timezone({ zone: "America/New_York", locale: "pt-BR" })
            const df = new DateFormatter({ timezone: tz, now: fixedNow })
            // 15:30 UTC = 10:30 em Nova York (inverno).
            expect(df.format(UTC_INSTANT)).toContain("10:30")
        })

        it("alinha o locale do Timezone injetado ao do DateFormatter", () => {
            const tz = new Timezone({ zone: "UTC", locale: "pt-BR" })
            const df = new DateFormatter({ locale: "en-US", timezone: tz })
            expect(df.format(UTC_INSTANT, { dateStyle: "long" })).toContain("January")
        })

        it("withTimezone deriva uma instância amarrada a outro fuso", () => {
            const df = new DateFormatter({ now: fixedNow }).withTimezone(
                new Timezone({ zone: "UTC", locale: "pt-BR" })
            )
            expect(df.format(UTC_INSTANT)).toContain("15:30")
        })
    })

    describe("fromNowOrDate() — híbrido feed", () => {
        const df = new DateFormatter({ zone: "UTC", locale: "pt-BR", now: fixedNow })

        it("usa tempo relativo quando recente (dentro da janela)", () => {
            expect(df.fromNowOrDate(ago(3 * HOUR))).toBe("há 3 horas")
        })

        it("cai para data absoluta quando passa da janela", () => {
            const out = df.fromNowOrDate(ago(400 * DAY))
            expect(out).toContain("2022")
        })
    })

    describe("withConfig() / Configurable", () => {
        it("expõe config readonly com os valores fornecidos", () => {
            const df = new DateFormatter({ locale: "en-US", style: "short" })
            expect(df.config.locale).toBe("en-US")
            expect(df.config.style).toBe("short")
        })

        it("withConfig deriva nova instância com patch, sem mutar a original", () => {
            const base = new DateFormatter({ locale: "pt-BR", now: fixedNow })
            const derived = base.withConfig({ locale: "en-US" })

            expect(derived).not.toBe(base)
            expect(derived).toBeInstanceOf(DateFormatter)
            expect(base.fromNow(ago(3 * HOUR))).toBe("há 3 horas")
            expect(derived.fromNow(ago(3 * HOUR))).toBe("3 hours ago")
        })
    })

    describe("validação de entrada", () => {
        const df = new DateFormatter({ now: fixedNow })

        it("lança 'Data inválida fornecida' para entrada inválida", () => {
            expect(() => df.fromNow("not a date")).toThrow("Data inválida fornecida")
            expect(() => df.format(new Date("invalid"))).toThrow("Data inválida fornecida")
        })
    })

    describe("conveniências estáticas", () => {
        it("DateFormatter.fromNow retorna uma string não vazia", () => {
            const out = DateFormatter.fromNow(new Date())
            expect(typeof out).toBe("string")
            expect(out.length).toBeGreaterThan(0)
        })
    })
})
