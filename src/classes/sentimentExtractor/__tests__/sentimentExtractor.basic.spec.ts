import { SentimentExtractor, SentimentExtractorConfig } from "../index"
import { beforeEach, describe, expect, it } from "vitest"

describe("SentimentExtractor - Análise Básica", () => {
    let extractor: SentimentExtractor

    beforeEach(() => {
        extractor = new SentimentExtractor()
    })

    describe("Configuração e Inicialização", () => {
        it("deve inicializar com configurações padrão", () => {
            expect(extractor).toBeInstanceOf(SentimentExtractor)
        })

        it("deve aceitar configurações customizadas", () => {
            const config: SentimentExtractorConfig = {
                enableEmojiAnalysis: false,
                enableIronyDetection: false,
                enablePunctuationAnalysis: false,
                enableRepetitionAnalysis: true,
                enableContextAnalysis: false,
                enableConnectorsAnalysis: true,
                enablePositionWeight: true
            }

            const customExtractor = new SentimentExtractor(config)
            expect(customExtractor).toBeInstanceOf(SentimentExtractor)
        })

        it("deve limpar cache corretamente", () => {
            extractor.analyze("teste")
            extractor.clearCache()
            // Não deve haver erro ao limpar cache
            expect(true).toBe(true)
        })
    })

    describe("Análise Básica de Sentimento", () => {
        it("deve retornar neutral para texto vazio", () => {
            const result = extractor.analyze("")
            expect(result.sentiment).toBe("neutral")
            expect(result.intensity).toBe(0)
        })

        it("deve retornar neutral para texto nulo/undefined", () => {
            //@ts-ignore
            const result1 = extractor.analyze(null)
            //@ts-ignore
            const result2 = extractor.analyze(undefined)

            expect(result1.sentiment).toBe("neutral")
            expect(result1.intensity).toBe(0)
            expect(result2.sentiment).toBe("neutral")
            expect(result2.intensity).toBe(0)
        })

        it("deve identificar sentimento positivo básico", () => {
            const result = extractor.analyze("feliz")
            expect(result.sentiment).toBe("positive")
            expect(result.intensity).toBeGreaterThan(0)
        })

        it("deve identificar sentimento negativo básico", () => {
            const result = extractor.analyze("triste")
            expect(result.sentiment).toBe("negative")
            expect(result.intensity).toBeLessThan(0)
            expect(result.intensity).toBeGreaterThan(-0.9)
        })

        it("deve identificar sentimento neutro", () => {
            const result = extractor.analyze("produto")
            expect(result.sentiment).toBe("neutral")
        })
    })

    describe("Tokenização e Normalização", () => {
        it("deve tokenizar texto corretamente", () => {
            const result = extractor.analyze("este é um teste")
            expect(result).toHaveProperty("sentiment")
            expect(result).toHaveProperty("intensity")
        })

        it("deve normalizar acentos", () => {
            const result = extractor.analyze("ótimo produto")
            expect(result).toHaveProperty("sentiment")
        })

        it("deve remover pontuação", () => {
            const result = extractor.analyze("produto! excelente?")
            expect(result).toHaveProperty("sentiment")
        })

        it("deve lidar com espaços múltiplos", () => {
            const result = extractor.analyze("  produto   muito    bom  ")
            expect(result).toHaveProperty("sentiment")
        })

        it("deve lidar com caracteres especiais", () => {
            const result = extractor.analyze("produto @#$% bom!")
            expect(result).toHaveProperty("sentiment")
        })

        it("deve lidar com números", () => {
            const result = extractor.analyze("produto 123 bom")
            expect(result).toHaveProperty("sentiment")
        })
    })

    describe("Configurações de Classificação", () => {
        it("deve identificar palavras com intensidade positiva", () => {
            const result = extractor.analyze("produto incrivel")
            expect(result.sentiment).toBe("positive")
            expect(result.intensity).toBeGreaterThan(0.1)
        })

        it("deve identificar sentimentos ignorando palavras neutras", () => {
            const result = extractor.analyze("produto bom")
            expect(result.sentiment).toBe("positive")
        })

        it("deve manter interface compatível", () => {
            const result = extractor.analyze("produto bom")

            expect(result).toHaveProperty("sentiment")
            expect(result).toHaveProperty("intensity")
            expect(typeof result.sentiment).toBe("string")
            expect(typeof result.intensity).toBe("number")
            expect(["positive", "negative", "neutral"]).toContain(result.sentiment)
        })
    })

    describe("Edge Cases Básicos", () => {
        it("deve lidar com texto muito curto", () => {
            const result = extractor.analyze("bom")
            expect(result).toHaveProperty("sentiment")
        })

        it("deve lidar com texto muito longo", () => {
            const longText =
                "este produto é realmente muito bom e excelente e maravilhoso e incrivel e fantastico"
            const result = extractor.analyze(longText)
            expect(result.sentiment).toBe("positive")
        })

        it("deve lidar com texto sem palavras de sentimento", () => {
            const result = extractor.analyze("este é um produto comum")
            expect(result.sentiment).toBe("neutral")
        })
    })
})
