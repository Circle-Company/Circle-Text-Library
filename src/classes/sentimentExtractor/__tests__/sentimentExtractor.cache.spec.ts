import { beforeEach, describe, expect, it } from "vitest"

import { SentimentExtractor } from "../index"

describe("SentimentExtractor - Sistema de Cache", () => {
    let extractor: SentimentExtractor

    beforeEach(() => {
        extractor = new SentimentExtractor()
    })

    describe("Cache de Tokens", () => {
        it("deve cachear tokens para texto idêntico", () => {
            const text = "produto muito bom"

            // Primeira execução
            const result1 = extractor.analyze(text)

            // Segunda execução (deve usar cache)
            const result2 = extractor.analyze(text)

            expect(result1).toEqual(result2)
        })

        it("deve cachear tokens para textos diferentes", () => {
            const text1 = "produto bom"
            const text2 = "produto excelente"

            const result1 = extractor.analyze(text1)
            const result2 = extractor.analyze(text2)

            expect(result1).not.toEqual(result2)
        })

        it("deve manter cache entre múltiplas execuções", () => {
            const text = "produto fantastico"

            const result1 = extractor.analyze(text)
            const result2 = extractor.analyze(text)
            const result3 = extractor.analyze(text)

            expect(result1).toEqual(result2)
            expect(result2).toEqual(result3)
        })
    })

    describe("Cache de Scores", () => {
        it("deve cachear scores para texto idêntico", () => {
            const text = "produto incrivel"

            // Primeira execução
            const result1 = extractor.analyze(text)

            // Segunda execução (deve usar cache)
            const result2 = extractor.analyze(text)

            expect(result1).toEqual(result2)
        })

        it("deve cachear scores diferentes para textos diferentes", () => {
            const text1 = "produto bom"
            const text2 = "produto ruim"

            const result1 = extractor.analyze(text1)
            const result2 = extractor.analyze(text2)

            expect(result1).not.toEqual(result2)
        })
    })

    describe("Performance do Cache", () => {
        it("deve melhorar performance com cache", () => {
            const text = "produto muito bom e excelente"

            // Primeira execução (sem cache)
            const start1 = Date.now()
            extractor.analyze(text)
            const time1 = Date.now() - start1

            // Segunda execução (com cache)
            const start2 = Date.now()
            extractor.analyze(text)
            const time2 = Date.now() - start2

            expect(time2).toBeLessThanOrEqual(time1)
        })

        it("deve ter performance consistente com cache", () => {
            const text = "produto fantastico"

            // Múltiplas execuções
            const times = []
            for (let i = 0; i < 10; i++) {
                const start = Date.now()
                extractor.analyze(text)
                times.push(Date.now() - start)
            }

            // Cache deve manter performance baixa
            expect(times.every((time) => time <= 5)).toBe(true)
        })

        it("deve processar múltiplos textos rapidamente", () => {
            const texts = [
                "produto bom",
                "produto excelente",
                "produto fantastico",
                "produto incrivel",
                "produto maravilhoso"
            ]

            const start = Date.now()

            // Primeira passada (sem cache)
            texts.forEach((text) => extractor.analyze(text))

            // Segunda passada (com cache)
            texts.forEach((text) => extractor.analyze(text))

            const duration = Date.now() - start

            expect(duration).toBeLessThan(100) // Menos de 100ms para 10 análises
        })
    })

    describe("Limpeza de Cache", () => {
        it("deve limpar cache corretamente", () => {
            const text = "produto bom"

            // Primeira execução
            const result1 = extractor.analyze(text)

            // Limpar cache
            extractor.clearCache()

            // Segunda execução (deve recalcular)
            const result2 = extractor.analyze(text)

            expect(result1).toEqual(result2) // Resultado deve ser igual
        })

        it("deve limpar cache de tokens e scores", () => {
            const text = "produto excelente"

            // Executar para popular cache
            extractor.analyze(text)

            // Limpar cache
            extractor.clearCache()

            // Verificar se cache foi limpo (não há como verificar diretamente,
            // mas não deve haver erro)
            const result = extractor.analyze(text)
            expect(result).toHaveProperty("sentiment")
            expect(result).toHaveProperty("intensity")
        })
    })

    describe("Configuração de Cache", () => {
        it("deve funcionar sem cache quando desabilitado", () => {
            const customExtractor = new SentimentExtractor({
                enableCache: false
            })

            const text = "produto bom"

            // Múltiplas execuções sem cache
            const result1 = customExtractor.analyze(text)
            const result2 = customExtractor.analyze(text)

            expect(result1).toEqual(result2) // Resultado deve ser igual
        })

        it("deve manter funcionalidade sem cache", () => {
            const customExtractor = new SentimentExtractor({
                enableCache: false
            })

            const result = customExtractor.analyze("produto excelente")
            expect(result.sentiment).toBe("positive")
        })
    })

    describe("Cache com Diferentes Configurações", () => {
        it("deve cachear com configurações customizadas", () => {
            const customExtractor = new SentimentExtractor({
                enableEmojiAnalysis: false,
                enableIronyDetection: false
            })

            const text = "produto bom 😍 rs"

            const result1 = customExtractor.analyze(text)
            const result2 = customExtractor.analyze(text)

            expect(result1).toEqual(result2)
        })

        it("deve manter cache separado por configuração", () => {
            const extractor1 = new SentimentExtractor({
                enableEmojiAnalysis: true
            })

            const extractor2 = new SentimentExtractor({
                enableEmojiAnalysis: false
            })

            const text = "produto bom 😍"

            const result1 = extractor1.analyze(text)
            const result2 = extractor2.analyze(text)

            // Resultados devem ser diferentes devido às configurações
            expect(result1).not.toEqual(result2)
        })
    })

    describe("Edge Cases do Cache", () => {
        it("deve lidar com cache de texto vazio", () => {
            const result1 = extractor.analyze("")
            const result2 = extractor.analyze("")

            expect(result1).toEqual(result2)
        })

        it("deve lidar com cache de texto muito longo", () => {
            const longText =
                "este produto é realmente muito bom e excelente e maravilhoso e incrivel e fantastico e perfeito e otimo"

            const result1 = extractor.analyze(longText)
            const result2 = extractor.analyze(longText)

            expect(result1).toEqual(result2)
        })

        it("deve lidar com cache de texto com caracteres especiais", () => {
            const text = "produto @#$% bom!"

            const result1 = extractor.analyze(text)
            const result2 = extractor.analyze(text)

            expect(result1).toEqual(result2)
        })

        it("deve lidar com cache de texto com emojis", () => {
            const text = "produto bom 😍❤️🔥"

            const result1 = extractor.analyze(text)
            const result2 = extractor.analyze(text)

            expect(result1).toEqual(result2)
        })

        it("deve lidar com cache de texto com ironia", () => {
            const text = "produto excelente rs"

            const result1 = extractor.analyze(text)
            const result2 = extractor.analyze(text)

            expect(result1).toEqual(result2)
        })
    })

    describe("Cache com Múltiplas Análises", () => {
        it("deve cachear múltiplas análises diferentes", () => {
            const texts = [
                "produto bom",
                "produto excelente",
                "produto fantastico",
                "produto incrivel",
                "produto maravilhoso",
                "produto ruim",
                "produto terrivel",
                "produto horrivel"
            ]

            // Primeira passada
            const results1 = texts.map((text) => extractor.analyze(text))

            // Segunda passada (com cache)
            const results2 = texts.map((text) => extractor.analyze(text))

            // Todos os resultados devem ser iguais
            results1.forEach((result, index) => {
                expect(result).toEqual(results2[index])
            })
        })

        it("deve manter performance com muitas análises", () => {
            const texts = Array(100)
                .fill(0)
                .map((_, i) => `produto ${i % 2 === 0 ? "bom" : "ruim"}`)

            const start = Date.now()

            // Executar todas as análises
            texts.forEach((text) => extractor.analyze(text))

            const duration = Date.now() - start

            expect(duration).toBeLessThan(1000) // Menos de 1 segundo para 100 análises
        })
    })

    describe("Integridade do Cache", () => {
        it("deve manter integridade após limpeza", () => {
            const text = "produto bom"

            // Executar e limpar cache várias vezes
            for (let i = 0; i < 5; i++) {
                const result = extractor.analyze(text)
                extractor.clearCache()

                expect(result).toHaveProperty("sentiment")
                expect(result).toHaveProperty("intensity")
            }
        })

        it("deve manter consistência com diferentes textos", () => {
            const texts = ["bom", "ruim", "excelente", "terrivel"]

            // Executar cada texto várias vezes
            texts.forEach((text) => {
                for (let i = 0; i < 3; i++) {
                    const result = extractor.analyze(text)
                    expect(result).toHaveProperty("sentiment")
                    expect(result).toHaveProperty("intensity")
                }
            })
        })
    })
})
