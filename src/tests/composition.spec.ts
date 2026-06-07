// Copyright 2025 Circle LLC
// Licensed under the MIT License

// Mecânica do composition root (`TextLibrary`): exposição das engines, detecção
// config-vs-instância, e a semântica de `configure()` (muta no lugar) vs `with()`
// (deriva imutável reusando as engines não-tocadas).

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

const rules = {
    username: {
        minLength: { enabled: true, value: 4 },
        maxLength: { enabled: true, value: 20 }
    }
}

describe("TextLibrary — composição e exposição das engines", () => {
    it("instancia e expõe as seis engines com os tipos corretos", () => {
        const ct = new TextLibrary({ validation: rules })
        expect(ct.validator).toBeInstanceOf(Validator)
        expect(ct.sentiment).toBeInstanceOf(SentimentExtractor)
        expect(ct.keywords).toBeInstanceOf(KeywordExtractor)
        expect(ct.richText).toBeInstanceOf(RichText)
        expect(ct.timezone).toBeInstanceOf(Timezone)
        expect(ct.format).toBeInstanceOf(Formatter)
    })

    it("funciona sem nenhuma config (todas as engines nos defaults)", () => {
        const ct = new TextLibrary()
        expect(ct.validator).toBeInstanceOf(Validator)
        expect(ct.sentiment.analyze("feliz").sentiment).toBe("positive")
        expect(Array.isArray(ct.keywords.extract("um texto qualquer"))).toBe(true)
        expect(typeof ct.format.number.compact(1000)).toBe("string")
    })

    it("o agregado Formatter propaga o locale para number e text", () => {
        const ct = new TextLibrary({ format: { locale: "en-US" } })
        expect(ct.format.number.config.locale).toBe("en-US")
        expect(ct.format.text.config.locale).toBe("en-US")
    })
})

describe("TextLibrary — configure() (mutação no lugar)", () => {
    it("retorna o próprio facade (encadeável) e muta a engine afetada", () => {
        const ct = new TextLibrary({ validation: rules })
        const ret = ct.configure({ validation: { username: { minLength: { value: 8 } } } })
        expect(ret).toBe(ct)
        expect(ct.validator.username("validuser").isValid).toBe(true) // 9 chars
        expect(ct.validator.username("short").isValid).toBe(false) // 5 < 8
    })

    it("merge sobre a base: regras não-tocadas permanecem ativas", () => {
        const ct = new TextLibrary({ validation: rules })
        ct.configure({ validation: { username: { minLength: { value: 8 } } } })
        // maxLength original (20) continua valendo após o merge.
        expect(ct.validator.username("a".repeat(21)).isValid).toBe(false)
    })

    it("substitui apenas a engine cujo slot foi passado (as demais mantêm identidade)", () => {
        const ct = new TextLibrary({ validation: rules })
        const sentimentBefore = ct.sentiment
        const validatorBefore = ct.validator
        ct.configure({ sentiment: { enableEmojiAnalysis: false } })
        expect(ct.sentiment).not.toBe(sentimentBefore) // trocada
        expect(ct.validator).toBe(validatorBefore) // intacta
    })
})

describe("TextLibrary — with() (derivação imutável)", () => {
    it("deriva um novo facade sem mutar o original", () => {
        const ct = new TextLibrary({ validation: rules })
        const strict = ct.with({ validation: { username: { minLength: { value: 8 } } } })
        expect(strict).not.toBe(ct)
        expect(ct.validator.username("user5").isValid).toBe(true) // base: min 4
        expect(strict.validator.username("user5").isValid).toBe(false) // derivado: min 8
    })

    it("reusa por identidade as engines não-tocadas (structural sharing)", () => {
        const ct = new TextLibrary({ validation: rules })
        const derived = ct.with({ validation: { username: { minLength: { value: 8 } } } })
        expect(derived.validator).not.toBe(ct.validator) // alterada → nova
        expect(derived.sentiment).toBe(ct.sentiment) // intacta → compartilhada
        expect(derived.keywords).toBe(ct.keywords)
        expect(derived.richText).toBe(ct.richText)
        expect(derived.timezone).toBe(ct.timezone)
        expect(derived.format).toBe(ct.format)
    })

    it("é o instanceof TextLibrary correto (criado via Object.create)", () => {
        const ct = new TextLibrary({ validation: rules })
        const derived = ct.with({ sentiment: { enableCache: false } })
        expect(derived).toBeInstanceOf(TextLibrary)
    })
})
