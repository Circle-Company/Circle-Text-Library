// Copyright 2025 Circle LLC
// Licensed under the MIT License

// Configurações personalizadas fluindo pelo facade até cada engine: as regras de
// validação, o léxico custom de sentimento, os limites do keyword, as entidades
// custom do RichText, o fuso/locale/relógio do Timezone e o locale do Formatter.

import { describe, expect, it } from "vitest"

import { EntityDef, RichText, TextLibrary } from "../index"

// Expectativa locale-aware computada via Intl — não acopla a uma versão de ICU.
const intlNumber = (locale: string, options: Intl.NumberFormatOptions, n: number): string =>
    new Intl.NumberFormat(locale, options).format(n)

describe("config custom — validação", () => {
    it("aplica regras de username vindas do construtor", () => {
        const ct = new TextLibrary({
            validation: {
                username: {
                    minLength: { enabled: true, value: 4 },
                    maxLength: { enabled: true, value: 12 },
                    onlyAlphaNumeric: { enabled: true, value: true }
                }
            }
        })
        expect(ct.validator.username("ana123").isValid).toBe(true)
        expect(ct.validator.username("ab").isValid).toBe(false) // < 4
        expect(ct.validator.username("ana_123").isValid).toBe(false) // não alfanumérico
    })

    it("aplica regras de senha (força) vindas do construtor", () => {
        const ct = new TextLibrary({
            validation: {
                password: {
                    minLength: { enabled: true, value: 8 },
                    requireUppercase: { enabled: true, value: true },
                    requireNumbers: { enabled: true, value: true },
                    requireSpecialChars: { enabled: true, value: true }
                }
            }
        })
        expect(ct.validator.password("Str0ng!pass").isValid).toBe(true)
        const weak = ct.validator.password("weak")
        expect(weak.isValid).toBe(false)
        expect(weak.errors.length).toBeGreaterThan(1)
    })

    it("regra por chamada tem precedência sobre a config do construtor", () => {
        const ct = new TextLibrary({
            validation: { username: { minLength: { enabled: true, value: 4 } } }
        })
        // override por chamada exige 10
        const r = ct.validator.username("shortish", { minLength: { enabled: true, value: 10 } })
        expect(r.isValid).toBe(false)
    })

    it("valida nome completo com capitalização", () => {
        const ct = new TextLibrary({
            validation: {
                name: {
                    requireFullName: { enabled: true, value: true },
                    requireCapitalization: { enabled: true, value: true }
                }
            }
        })
        expect(ct.validator.name("Maria Silva").isValid).toBe(true)
        expect(ct.validator.name("maria").isValid).toBe(false)
    })
})

describe("config custom — sentimento", () => {
    it("mescla um léxico custom SOBRE a base (palavra inédita vira positiva)", () => {
        const ct = new TextLibrary({ sentiment: { lexicon: { wakanda: 0.9 } } })
        expect(ct.sentiment.analyze("wakanda").sentiment).toBe("positive")
        // a base continua valendo após o merge
        expect(ct.sentiment.analyze("triste").sentiment).toBe("negative")
    })

    it("adiciona negadores custom ao escopo de negação", () => {
        const ct = new TextLibrary({ sentiment: { negators: ["jamais"] } })
        // "jamais" nega "feliz" → vira negativo
        expect(ct.sentiment.analyze("jamais feliz").sentiment).toBe("negative")
    })

    it("desliga analisadores auxiliares via config", () => {
        const ct = new TextLibrary({
            sentiment: {
                enableEmojiAnalysis: false,
                enablePunctuationAnalysis: false,
                enableIronyDetection: false,
                enableRepetitionAnalysis: false,
                enableContextAnalysis: false
            }
        })
        expect(ct.sentiment.config.enableEmojiAnalysis).toBe(false)
        // sem emojis/pontuação contribuindo, o texto neutro permanece neutro
        expect(ct.sentiment.analyze("um produto qualquer 🎉🎉🎉!!!").sentiment).toBe("neutral")
    })

    it("explain=true devolve os drivers do score", () => {
        const ct = new TextLibrary({ sentiment: { lexicon: { incrivel: 0.8 } } })
        const r = ct.sentiment.analyze("incrivel", { explain: true })
        expect(Array.isArray(r.drivers)).toBe(true)
        expect(r.drivers?.some((d) => d.word === "incrivel")).toBe(true)
    })
})

describe("config custom — keywords", () => {
    it("respeita maxKeywords", () => {
        const ct = new TextLibrary({ keywords: { maxKeywords: 2 } })
        const text =
            "inteligência artificial tecnologia inovação software algoritmo dados aprendizado"
        const kws = ct.keywords.extract(text)
        expect(kws.length).toBeLessThanOrEqual(2)
    })

    it("respeita minWordLength", () => {
        const ct = new TextLibrary({ keywords: { minWordLength: 8, maxKeywords: 10 } })
        const kws = ct.keywords.extract("casa rio sol tecnologia computador")
        // só palavras com radical >= 8 sobrevivem
        expect(kws.every((k) => k.length >= 8)).toBe(true)
    })
})

describe("config custom — RichText (entidades custom)", () => {
    // `custom` é a chave que o facade propaga limpo até o construtor do RichText.
    const cashtag: EntityDef = { type: "cashtag", pattern: /\$[A-Z]+/, sigil: "$" }

    it("propaga a definição custom para a config da engine", () => {
        const ct = new TextLibrary({ richText: { custom: [cashtag] } })
        expect(ct.richText.config.custom).toHaveLength(1)
        expect(ct.richText.config.custom[0]?.type).toBe("cashtag")
    })

    it("a mesma definição custom faz o parser reconhecer a nova entidade", () => {
        const ct = new TextLibrary({ richText: { custom: [cashtag] } })
        // Reaproveita a definição que o facade guarda para tokenizar um texto real.
        const segs = RichText.parse("comprei $AAPL hoje", { custom: ct.richText.config.custom })
        const entity = segs.find((s) => s.type === "cashtag")
        expect(entity?.value).toBe("AAPL")
    })
})

describe("config custom — Timezone (relógio injetado)", () => {
    const ct = new TextLibrary({
        timezone: {
            zone: "America/Sao_Paulo",
            locale: "pt-BR",
            now: () => new Date("2024-01-15T12:00:00Z")
        }
    })

    it("formata um instante UTC no fuso configurado (UTC-3)", () => {
        const out = ct.timezone.format("2024-01-15T15:30:00Z")
        expect(out).toContain("2024")
        expect(out).toContain("12:30") // 15:30Z em São Paulo
    })

    it("fromNow é determinístico com o relógio injetado", () => {
        // 1 hora antes do 'now' injetado
        expect(ct.timezone.fromNow("2024-01-15T11:00:00Z")).toContain("hora")
    })
})

describe("config custom — Formatter (locale en-US)", () => {
    const ct = new TextLibrary({ format: { locale: "en-US" } })

    it("number respeita o locale custom", () => {
        const compactOpts: Intl.NumberFormatOptions = {
            notation: "compact",
            maximumFractionDigits: 1
        }
        expect(ct.format.number.compact(1500)).toBe(intlNumber("en-US", compactOpts, 1500))
        expect(ct.format.number.ordinal(3)).toBe("3rd")
    })

    it("text usa o mesmo locale propagado", () => {
        expect(ct.format.text.slug("Hello World")).toBe("hello-world")
        expect(ct.format.text.capitalize("hello")).toBe("Hello")
    })
})
