import { beforeEach, describe, expect, it } from "vitest"

import { SentimentExtractor } from "../index"

describe("SentimentExtractor - Análise de Pontuação", () => {
    let extractor: SentimentExtractor

    beforeEach(() => {
        extractor = new SentimentExtractor()
    })

    describe("Pontos de Exclamação", () => {
        it("deve detectar uma exclamação", () => {
            const result = extractor.analyze("produto bom!")
            expect(result.intensity).toBeGreaterThan(0.05)
        })

        it("deve detectar múltiplas exclamações", () => {
            const result = extractor.analyze("produto excelente!!")
            expect(result.intensity).toBeGreaterThan(0.1)
        })

        it("deve detectar muitas exclamações", () => {
            const result = extractor.analyze("produto excelente!!!")
            expect(result.intensity).toBeGreaterThan(0.15)
        })

        it("deve detectar excesso de exclamações", () => {
            const result = extractor.analyze("produto excelente!!!!!")
            expect(result.intensity).toBeGreaterThan(0.2)
        })

        it("deve intensificar sentimento positivo", () => {
            const result = extractor.analyze("produto excelente!!!")
            expect(result.sentiment).toBe("positive")
        })

        it("deve intensificar sentimento negativo", () => {
            const result = extractor.analyze("produto terrivel!!!")
            expect(result.sentiment).toBe("negative")
        })
    })

    describe("Pontos de Interrogação", () => {
        it("deve detectar uma interrogação", () => {
            const result = extractor.analyze("o que foi isso?")
            expect(result.intensity).toBeGreaterThan(0.02)
        })

        it("deve detectar múltiplas interrogações", () => {
            const result = extractor.analyze("o que foi isso??")
            expect(result.intensity).toBeGreaterThan(0.05)
        })

        it("deve detectar muitas interrogações", () => {
            const result = extractor.analyze("o que foi isso???")
            expect(result.intensity).toBeGreaterThan(0.075)
        })

        it("deve detectar excesso de interrogações", () => {
            const result = extractor.analyze("o que foi isso?????")
            expect(result.intensity).toBeGreaterThan(0.1)
        })

        it("deve aumentar intensidade em perguntas", () => {
            const result = extractor.analyze("por que isso aconteceu???")
            expect(result.intensity).toBeGreaterThan(0.05)
        })
    })

    describe("CAPS LOCK", () => {
        it("deve detectar CAPS LOCK parcial", () => {
            const result = extractor.analyze("EXCELENTE produto")
            expect(result.intensity).toBeGreaterThan(0.1)
        })

        it("deve detectar CAPS LOCK total", () => {
            const result = extractor.analyze("EXCELENTE PRODUTO")
            expect(result.intensity).toBeGreaterThan(0.2)
        })

        it("deve detectar CAPS LOCK com texto positivo", () => {
            const result = extractor.analyze("PRODUTO EXCELENTE")
            expect(result.sentiment).toBe("positive")
        })

        it("deve detectar CAPS LOCK com texto negativo", () => {
            const result = extractor.analyze("PRODUTO TERRIVEL")
            expect(result.sentiment).toBe("negative")
        })

        it("deve intensificar sentimento com CAPS", () => {
            const result = extractor.analyze("EU AMEI ESTE PRODUTO")
            expect(result.intensity).toBeGreaterThan(0.2)
        })

        it("deve detectar CAPS LOCK em porcentagem alta", () => {
            const result = extractor.analyze("EXCELENTE produto bom")
            expect(result.intensity).toBeGreaterThan(0.15)
        })
    })

    describe("Combinações de Pontuação", () => {
        it("deve combinar exclamações com CAPS", () => {
            const result = extractor.analyze("PRODUTO EXCELENTE!!!")
            expect(result.intensity).toBeGreaterThan(0.3)
        })

        it("deve combinar interrogações com CAPS", () => {
            const result = extractor.analyze("O QUE FOI ISSO???")
            expect(result.intensity).toBeGreaterThan(0.15)
        })

        it("deve combinar exclamações e interrogações", () => {
            const result = extractor.analyze("produto excelente!?")
            expect(result.intensity).toBeGreaterThan(0.1)
        })

        it("deve combinar todos os tipos", () => {
            const result = extractor.analyze("PRODUTO EXCELENTE!?")
            expect(result.intensity).toBeGreaterThan(0.25)
        })
    })

    describe("Pontuação com Emojis", () => {
        it("deve combinar pontuação com emojis positivos", () => {
            const result = extractor.analyze("produto excelente! 😍")
            expect(result.sentiment).toBe("positive")
            expect(result.intensity).toBeGreaterThan(0.3)
        })

        it("deve combinar pontuação com emojis negativos", () => {
            const result = extractor.analyze("produto terrivel! 😢")
            expect(result.sentiment).toBe("negative")
            expect(result.intensity).toBeLessThan(-0.3)
        })

        it("deve combinar CAPS com emojis", () => {
            const result = extractor.analyze("PRODUTO EXCELENTE 😍")
            expect(result.sentiment).toBe("positive")
            expect(result.intensity).toBeGreaterThan(0.4)
        })
    })

    describe("Pontuação com Ironia", () => {
        it("deve neutralizar pontuação com rs", () => {
            const result = extractor.analyze("produto excelente!!! rs")
            expect(result.sentiment).toBe("neutral")
        })

        it("deve neutralizar CAPS com ironia", () => {
            const result = extractor.analyze("PRODUTO EXCELENTE kkk")
            expect(result.sentiment).toBe("neutral")
        })

        it("deve neutralizar tudo com ironia", () => {
            const result = extractor.analyze("PRODUTO EXCELENTE!!! 😍 rs")
            expect(result.sentiment).toBe("neutral")
        })
    })

    describe("Configuração de Pontuação", () => {
        it("deve funcionar sem análise de pontuação quando desabilitada", () => {
            const customExtractor = new SentimentExtractor({
                enablePunctuationAnalysis: false
            })

            const result = customExtractor.analyze("produto bom!!!")
            expect(result.intensity).toBeLessThanOrEqual(0.8) // Score de "bom" (0.6) sem pontuação
        })

        it("deve manter análise básica sem pontuação", () => {
            const customExtractor = new SentimentExtractor({
                enablePunctuationAnalysis: false
            })

            const result = customExtractor.analyze("produto excelente")
            expect(result.sentiment).toBe("positive")
        })
    })

    describe("Edge Cases de Pontuação", () => {
        it("deve lidar com pontuação isolada", () => {
            const result = extractor.analyze("!!!")
            expect(result.intensity).toBeGreaterThan(0.1)
        })

        it("deve lidar com pontuação no início", () => {
            const result = extractor.analyze("!!! produto bom")
            expect(result.intensity).toBeGreaterThan(0.1)
        })

        it("deve lidar com pontuação no final", () => {
            const result = extractor.analyze("produto bom !!!")
            expect(result.intensity).toBeGreaterThan(0.1)
        })

        it("deve lidar com pontuação no meio", () => {
            const result = extractor.analyze("produto !!! excelente")
            expect(result.intensity).toBeGreaterThan(0.1)
        })

        it("deve lidar com pontuação mista", () => {
            const result = extractor.analyze("produto!? excelente")
            expect(result.intensity).toBeGreaterThan(0.05)
        })

        it("deve lidar com pontuação com espaços", () => {
            const result = extractor.analyze("produto ! ! ! excelente")
            expect(result.intensity).toBeGreaterThan(0.05)
        })
    })

    describe("Pontuação Complexa", () => {
        it("deve analisar texto com múltiplas características", () => {
            const result = extractor.analyze("PRODUTO EXCELENTE!!! 😍❤️🔥 bommmmmm")
            expect(result.sentiment).toBe("positive")
            expect(result.intensity).toBeGreaterThan(0.5)
        })

        it("deve analisar texto negativo com pontuação", () => {
            const result = extractor.analyze("PRODUTO TERRIVEL!!! 😢💔 ruimmmmmm")
            expect(result.sentiment).toBe("negative")
            expect(result.intensity).toBeLessThan(-0.3)
            expect(result.intensity).toBeGreaterThan(-0.5)
        })
    })
})
