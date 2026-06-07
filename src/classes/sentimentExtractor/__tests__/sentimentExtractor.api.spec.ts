import { beforeEach, describe, expect, it } from "vitest"

import { SentimentExtractor } from "../index"

describe("SentimentExtractor - API v2 (adições)", () => {
    let extractor: SentimentExtractor

    beforeEach(() => {
        extractor = new SentimentExtractor()
    })

    describe("API estática", () => {
        it("expõe SentimentExtractor.analyze sem new", () => {
            const result = SentimentExtractor.analyze("produto excelente")
            expect(result.sentiment).toBe("positive")
            expect(result.intensity).toBeGreaterThan(0)
        })

        it("expõe SentimentExtractor.analyzeMany estático", () => {
            const results = SentimentExtractor.analyzeMany(["produto bom", "produto ruim"])
            expect(results).toHaveLength(2)
            expect(results[0].sentiment).toBe("positive")
            expect(results[1].sentiment).toBe("negative")
        })
    })

    describe("Forma de retorno", () => {
        it("expõe somente intensity/sentiment como forma base", () => {
            const r = extractor.analyze("produto bom")
            expect(r).toHaveProperty("intensity")
            expect(r).toHaveProperty("sentiment")
            expect(typeof r.intensity).toBe("number")
            expect(typeof r.sentiment).toBe("string")
        })

        it("texto vazio retorna neutro com intensity 0", () => {
            const r = extractor.analyze("")
            expect(r.intensity).toBe(0)
            expect(r.sentiment).toBe("neutral")
        })
    })

    describe("analyzeMany (instância)", () => {
        it("retorna um array de resultados", () => {
            const results = extractor.analyzeMany(["bom", "ruim", "produto"])
            expect(results.map((r) => r.sentiment)).toEqual([
                "positive",
                "negative",
                "neutral"
            ])
        })
    })

    describe("explain / drivers", () => {
        it("não inclui drivers por padrão", () => {
            const r = extractor.analyze("produto bom")
            expect(r.drivers).toBeUndefined()
        })

        it("inclui drivers quando explain: true", () => {
            const r = extractor.analyze("produto bom", { explain: true })
            expect(Array.isArray(r.drivers)).toBe(true)
            expect(r.drivers!.some((d) => d.word === "bom")).toBe(true)
            const driver = r.drivers!.find((d) => d.word === "bom")!
            expect(typeof driver.base).toBe("number")
            expect(typeof driver.applied).toBe("number")
        })

        it("marca driver negado com reason", () => {
            const r = extractor.analyze("não é bom produto", { explain: true })
            const bom = r.drivers!.find((d) => d.word === "bom")
            expect(bom?.reason).toBe("negado")
        })
    })

    describe("Léxico custom mesclado", () => {
        it("adiciona palavras novas via lexicon", () => {
            const sa = new SentimentExtractor({ lexicon: { based: 0.8 } })
            const r = sa.analyze("isso é based")
            expect(r.sentiment).toBe("positive")
        })

        it("não vaza léxico custom para a base", () => {
            const sa = new SentimentExtractor({ lexicon: { based: 0.8 } })
            sa.analyze("based")
            const base = new SentimentExtractor()
            expect(base.analyze("based").sentiment).toBe("neutral")
        })

        it("aceita intensifiers custom", () => {
            const sa = new SentimentExtractor({ intensifiers: { ultra: 2.0 } })
            const r = sa.analyze("ultra bom produto")
            expect(r.sentiment).toBe("positive")
            expect(r.intensity).toBeGreaterThan(0.1)
        })

        it("aceita negators custom", () => {
            const sa = new SentimentExtractor({ negators: ["zero"] })
            const r = sa.analyze("zero bom produto")
            expect(r.sentiment).toBe("negative")
        })
    })

    describe("Contrato Configurable", () => {
        it("expõe config readonly", () => {
            expect(extractor.config).toBeDefined()
            expect(extractor.config.enableCache).toBe(true)
        })

        it("withConfig deriva nova instância sem mutar a original", () => {
            const derived = extractor.withConfig({ enableEmojiAnalysis: false })
            expect(derived).toBeInstanceOf(SentimentExtractor)
            expect(derived).not.toBe(extractor)
            expect(derived.config.enableEmojiAnalysis).toBe(false)
            expect(extractor.config.enableEmojiAnalysis).toBe(true)
        })

        it("withConfig preserva léxico custom mesclável", () => {
            const sa = new SentimentExtractor({ lexicon: { based: 0.8 } })
            const derived = sa.withConfig({ enableCache: false })
            expect(derived.analyze("based").sentiment).toBe("positive")
        })
    })

    describe("Cache LRU", () => {
        it("respeita o teto cacheMax descartando os mais antigos", () => {
            const sa = new SentimentExtractor({ cacheMax: 2 })
            sa.analyze("produto bom")
            sa.analyze("produto ruim")
            sa.analyze("produto excelente")
            // Sem erro e resultados consistentes mesmo após descarte.
            expect(sa.analyze("produto bom").sentiment).toBe("positive")
            expect(sa.analyze("produto excelente").sentiment).toBe("positive")
        })

        it("clearCache continua funcionando", () => {
            extractor.analyze("produto bom")
            extractor.clearCache()
            expect(extractor.analyze("produto bom").sentiment).toBe("positive")
        })
    })
})
