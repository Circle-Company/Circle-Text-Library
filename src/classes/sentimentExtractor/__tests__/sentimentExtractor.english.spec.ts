import { beforeEach, describe, expect, it } from "vitest"

import { TextLibrary } from "../../../index"
import { SentimentExtractor } from "../index"

describe("SentimentExtractor - Suporte a inglês (language: 'en')", () => {
    let en: SentimentExtractor

    beforeEach(() => {
        en = new SentimentExtractor({ language: "en" })
    })

    describe("Seleção de idioma", () => {
        it("expõe o idioma efetivo", () => {
            expect(en.language).toBe("en")
            expect(en.config.language).toBe("en")
        })

        it("usa pt-br por padrão", () => {
            const def = new SentimentExtractor()
            expect(def.language).toBe("pt-br")
        })

        it("cai no idioma padrão se receber um idioma desconhecido", () => {
            // @ts-expect-error idioma inválido proposital
            const weird = new SentimentExtractor({ language: "xx" })
            // Não deve lançar; analisa com o léxico padrão.
            expect(() => weird.analyze("bom")).not.toThrow()
        })
    })

    describe("Léxico positivo", () => {
        it.each(["great product", "amazing experience", "excellent service", "i love it"])(
            "classifica '%s' como positivo",
            (text) => {
                const r = en.analyze(text)
                expect(r.sentiment).toBe("positive")
                expect(r.intensity).toBeGreaterThan(0)
            }
        )
    })

    describe("Léxico negativo", () => {
        it.each(["terrible product", "awful experience", "i hate this", "worst service ever"])(
            "classifica '%s' como negativo",
            (text) => {
                const r = en.analyze(text)
                expect(r.sentiment).toBe("negative")
                expect(r.intensity).toBeLessThan(0)
            }
        )
    })

    describe("Neutro", () => {
        it("texto sem palavras de sentimento é neutro", () => {
            expect(en.analyze("the product arrived today").sentiment).toBe("neutral")
        })
    })

    describe("Negação", () => {
        it("'not good' é negativo", () => {
            expect(en.analyze("not good").sentiment).toBe("negative")
        })

        it("'not bad' é positivo", () => {
            expect(en.analyze("not bad").sentiment).toBe("positive")
        })

        it("'never recommend' é negativo", () => {
            expect(en.analyze("never recommend").sentiment).toBe("negative")
        })

        it("contrações com apóstrofo são tratadas: \"isn't good\" é negativo", () => {
            expect(en.analyze("isn't good").sentiment).toBe("negative")
        })

        it("\"don't like it\" é negativo", () => {
            expect(en.analyze("don't like it").sentiment).toBe("negative")
        })
    })

    describe("Intensificadores", () => {
        it("'very good' é positivo", () => {
            expect(en.analyze("very good").sentiment).toBe("positive")
        })

        it("'extremely bad' é negativo", () => {
            expect(en.analyze("extremely bad").sentiment).toBe("negative")
        })
    })

    describe("Conectores adversativos", () => {
        it("'terrible but cheap' permanece negativo", () => {
            expect(en.analyze("terrible but cheap").sentiment).toBe("negative")
        })
    })

    describe("Emojis (compartilhados entre idiomas)", () => {
        it("emoji positivo reforça o texto em inglês", () => {
            expect(en.analyze("good 😍").sentiment).toBe("positive")
        })

        it("emoji negativo reforça o texto em inglês", () => {
            expect(en.analyze("bad 😡").sentiment).toBe("negative")
        })
    })

    describe("explain / drivers", () => {
        it("anexa drivers com a palavra em inglês", () => {
            const r = en.analyze("great product", { explain: true })
            expect(r.drivers?.some((d) => d.word === "great")).toBe(true)
        })
    })

    describe("Isolamento entre idiomas", () => {
        it("palavra em inglês é neutra no léxico pt-br", () => {
            expect(new SentimentExtractor().analyze("awesome").sentiment).toBe("neutral")
        })

        it("palavra em português é neutra no léxico en", () => {
            expect(en.analyze("maravilhoso").sentiment).toBe("neutral")
        })
    })

    describe("Léxico custom sobre o idioma", () => {
        it("mescla lexicon custom sobre a base en", () => {
            const sa = new SentimentExtractor({ language: "en", lexicon: { gucci: 0.8 } })
            expect(sa.analyze("that is gucci").sentiment).toBe("positive")
        })
    })

    describe("analyzeMany", () => {
        it("classifica um lote em inglês", () => {
            const out = en.analyzeMany(["great service", "terrible service"])
            expect(out.map((r) => r.sentiment)).toEqual(["positive", "negative"])
        })
    })

    describe("Integração com TextLibrary e withConfig", () => {
        it("o facade aceita language: 'en'", () => {
            const ct = new TextLibrary({ sentiment: { language: "en" } })
            expect(ct.sentiment.analyze("excellent product").sentiment).toBe("positive")
        })

        it("withConfig troca o idioma preservando as demais opções", () => {
            const derived = new SentimentExtractor().withConfig({ language: "en" })
            expect(derived.language).toBe("en")
            expect(derived.analyze("amazing").sentiment).toBe("positive")
        })
    })
})
