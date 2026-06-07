// Copyright 2025 Circle LLC
// Licensed under the MIT License

// Injeção de dependência: cada engine pode ser instanciada SEPARADAMENTE e passada
// pronta ao facade. O composition root deve detectá-la (tem `withConfig`), usá-la
// como está (mesma identidade) e preservar o comportamento pré-configurado.

import { describe, expect, it } from "vitest"

import {
    Formatter,
    KeywordExtractor,
    RichText,
    SentimentExtractor,
    TextLibrary,
    Timezone,
    Validator
} from "../index"

describe("DI — injeção de instâncias prontas", () => {
    it("usa o Validator injetado (mesma identidade) e preserva suas regras", () => {
        const validator = new Validator({
            username: { minLength: { enabled: true, value: 6 } }
        })
        const ct = new TextLibrary({ validation: validator })
        expect(ct.validator).toBe(validator)
        expect(ct.validator.username("abcdef").isValid).toBe(true)
        expect(ct.validator.username("abc").isValid).toBe(false)
    })

    it("usa o SentimentExtractor injetado com léxico próprio", () => {
        const sentiment = new SentimentExtractor({ lexicon: { hypezera: 0.7 } })
        const ct = new TextLibrary({ sentiment })
        expect(ct.sentiment).toBe(sentiment)
        expect(ct.sentiment.analyze("hypezera").sentiment).toBe("positive")
    })

    it("usa o KeywordExtractor injetado respeitando seus limites", () => {
        const keywords = new KeywordExtractor({ maxKeywords: 3 })
        const ct = new TextLibrary({ keywords })
        expect(ct.keywords).toBe(keywords)
        const kws = ct.keywords.extract(
            "tecnologia inovação software inteligência dados algoritmo nuvem"
        )
        expect(kws.length).toBeLessThanOrEqual(3)
    })

    it("usa o RichText injetado já com texto e mapping (id nas entidades)", () => {
        const richText = new RichText("Bora @alice #js", {
            mentions: { alice: "42" },
            hashtags: { js: "7" }
        })
        const ct = new TextLibrary({ richText })
        expect(ct.richText).toBe(richText)

        const ui = ct.richText.toUI()
        const mention = ui.entities.find((e) => e.type === "mention")
        const hashtag = ui.entities.find((e) => e.type === "hashtag")
        expect(mention?.data?.id).toBe("42")
        expect(hashtag?.data?.id).toBe("7")
    })

    it("usa o Timezone injetado com fuso e relógio próprios", () => {
        const timezone = new Timezone({
            zone: "America/Sao_Paulo",
            now: () => new Date("2024-06-01T12:00:00Z")
        })
        const ct = new TextLibrary({ timezone })
        expect(ct.timezone).toBe(timezone)
        expect(ct.timezone.fromNow("2024-06-01T11:00:00Z")).toContain("hora")
    })

    it("usa o Formatter injetado com locale próprio", () => {
        const format = new Formatter({ locale: "en-US" })
        const ct = new TextLibrary({ format })
        expect(ct.format).toBe(format)
        expect(ct.format.number.ordinal(2)).toBe("2nd")
    })
})

describe("DI — composição mista (instâncias + configs no mesmo facade)", () => {
    it("aceita umas engines injetadas e outras montadas por config", () => {
        const sentiment = new SentimentExtractor({ lexicon: { gg: 0.6 } })
        const ct = new TextLibrary({
            sentiment, // injetada
            validation: { username: { minLength: { enabled: true, value: 4 } } } // por config
        })
        expect(ct.sentiment).toBe(sentiment)
        expect(ct.validator).toBeInstanceOf(Validator)
        expect(ct.sentiment.analyze("gg").sentiment).toBe("positive")
        expect(ct.validator.username("nome").isValid).toBe(true)
    })

    it("uma engine injetada compartilhada vive em dois facades distintos", () => {
        const shared = new SentimentExtractor({ lexicon: { combo: 0.8 } })
        const a = new TextLibrary({ sentiment: shared })
        const b = new TextLibrary({ sentiment: shared })
        expect(a.sentiment).toBe(shared)
        expect(b.sentiment).toBe(shared)
        expect(a.sentiment).toBe(b.sentiment)
    })
})

describe("DI — via configure() e with()", () => {
    it("configure() troca uma engine por uma instância injetada", () => {
        const ct = new TextLibrary({ validation: { username: { minLength: { enabled: true, value: 4 } } } })
        const fresh = new SentimentExtractor({ lexicon: { brabo: 0.9 } })
        ct.configure({ sentiment: fresh })
        expect(ct.sentiment).toBe(fresh)
        expect(ct.sentiment.analyze("brabo").sentiment).toBe("positive")
    })

    it("with() deriva um facade que aponta para a instância injetada, sem mutar o original", () => {
        const ct = new TextLibrary()
        const injected = new Formatter({ locale: "en-US" })
        const derived = ct.with({ format: injected })
        expect(derived.format).toBe(injected)
        expect(ct.format).not.toBe(injected) // original intacto
    })
})
