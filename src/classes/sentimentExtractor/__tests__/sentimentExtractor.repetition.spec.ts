import { beforeEach, describe, expect, it } from "vitest"

import { SentimentExtractor } from "../index"

describe("SentimentExtractor - Análise de Repetição", () => {
    let extractor: SentimentExtractor

    beforeEach(() => {
        extractor = new SentimentExtractor()
    })

    describe("Repetição de Caracteres Positivos", () => {
        it("deve detectar repetição simples", () => {
            const result = extractor.analyze("produto bommm")
            expect(result.sentiment).toBe("positive")
            expect(result.intensity).toBeGreaterThan(0.05)
        })

        it("deve detectar repetição média", () => {
            const result = extractor.analyze("produto bommmmm")
            expect(result.sentiment).toBe("positive")
            expect(result.intensity).toBeGreaterThan(0.1)
        })

        it("deve detectar repetição longa", () => {
            const result = extractor.analyze("produto bommmmmmmm")
            expect(result.sentiment).toBe("positive")
            expect(result.intensity).toBeGreaterThan(0.2)
        })

        it("deve detectar repetição excessiva", () => {
            const result = extractor.analyze("produto bommmmmmmmmmmm")
            expect(result.sentiment).toBe("positive")
            expect(result.intensity).toBeGreaterThan(0.3)
        })

        it("deve detectar repetição em 'excelente'", () => {
            const result = extractor.analyze("produto excelenteeee")
            expect(result.sentiment).toBe("positive")
            expect(result.intensity).toBeGreaterThan(0.1)
        })

        it("deve detectar repetição em 'fantastico'", () => {
            const result = extractor.analyze("produto fantasticooo")
            expect(result.sentiment).toBe("positive")
            expect(result.intensity).toBeGreaterThan(0.1)
        })

        it("deve detectar repetição em 'incrivel'", () => {
            const result = extractor.analyze("produto incriveeeeeel")
            expect(result.sentiment).toBe("positive")
            expect(result.intensity).toBeGreaterThan(0.1)
        })
    })

    describe("Repetição de Caracteres Negativos", () => {
        it("deve detectar repetição em palavra negativa", () => {
            const result = extractor.analyze("produto ruimmmm")
            expect(result.sentiment).toBe("negative")
            expect(result.intensity).toBeLessThan(-0.05)
        })

        it("deve detectar repetição em 'terrivel'", () => {
            const result = extractor.analyze("produto terrrrrivel")
            expect(result.sentiment).toBe("negative")
            expect(result.intensity).toBeLessThan(-0.1)
        })

        it("deve detectar repetição em 'horrivel'", () => {
            const result = extractor.analyze("produto horriveeeel")
            expect(result.sentiment).toBe("negative")
            expect(result.intensity).toBeLessThan(-0.1)
        })

        it("deve detectar repetição em 'pessimo'", () => {
            const result = extractor.analyze("produto pessimooo")
            expect(result.intensity).toBeLessThan(0.41)
        })

        it("deve detectar repetição longa em palavra negativa", () => {
            const result = extractor.analyze("produto ruimmmmmmmmm")
            expect(result.sentiment).toBe("negative")
            expect(result.intensity).toBeLessThan(-0.2)
        })
    })

    describe("Múltiplas Repetições", () => {
        it("deve detectar múltiplas repetições positivas", () => {
            const result = extractor.analyze("produto bommmmmm excelenteeee")
            expect(result.sentiment).toBe("positive")
            expect(result.intensity).toBeGreaterThan(0.2)
        })

        it("deve detectar múltiplas repetições negativas", () => {
            const result = extractor.analyze("produto ruimmmmmm terrrrivel")
            expect(result.sentiment).toBe("negative")
            expect(result.intensity).toBeLessThan(-0.2)
        })

        it("deve balancear repetições positivas e negativas", () => {
            const result = extractor.analyze("produto bommmmmm ruimmmm")
            expect(result.sentiment).toBe("negative")
            expect(result.intensity).toBeLessThan(-0.2)
        })

        it("deve detectar repetições em palavras diferentes", () => {
            const result = extractor.analyze("produto fantasticoooo incriveeeeeel")
            expect(result.sentiment).toBe("positive")
            expect(result.intensity).toBeGreaterThan(0.2)
        })
    })

    describe("Repetição com Emojis", () => {
        it("deve combinar repetição com emojis positivos", () => {
            const result = extractor.analyze("produto bommmmmm 😍")
            expect(result.sentiment).toBe("positive")
            expect(result.intensity).toBeGreaterThan(0.3)
        })

        it("deve combinar repetição com emojis negativos", () => {
            const result = extractor.analyze("produto ruimmmmmm 😢")
            expect(result.sentiment).toBe("negative")
            expect(result.intensity).toBeLessThan(-0.3)
        })

        it("deve intensificar com repetição e emojis", () => {
            const result = extractor.analyze("produto excelenteeee 😍❤️")
            expect(result.sentiment).toBe("positive")
            expect(result.intensity).toBeGreaterThan(0.4)
        })
    })

    describe("Repetição com Pontuação", () => {
        it("deve combinar repetição com exclamações", () => {
            const result = extractor.analyze("produto bommmmmm!!!")
            expect(result.sentiment).toBe("positive")
            expect(result.intensity).toBeGreaterThan(0.2)
        })

        it("deve combinar repetição com CAPS", () => {
            const result = extractor.analyze("PRODUTO BOMMMMMM")
            expect(result.sentiment).toBe("positive")
            expect(result.intensity).toBeGreaterThan(0.25)
        })

        it("deve combinar repetição com pontuação e CAPS", () => {
            const result = extractor.analyze("PRODUTO BOMMMMMM!!!")
            expect(result.sentiment).toBe("positive")
            expect(result.intensity).toBeGreaterThan(0.35)
        })
    })

    describe("Repetição com Ironia", () => {
        it("deve neutralizar repetição com rs", () => {
            const result = extractor.analyze("produto bommmmmm rs")
            expect(result.sentiment).toBe("neutral")
        })

        it("deve neutralizar repetição com kkk", () => {
            const result = extractor.analyze("produto excelenteeee kkk")
            expect(result.sentiment).toBe("neutral")
        })

        it("deve neutralizar repetição com ironia", () => {
            const result = extractor.analyze("produto fantasticoooo ironia")
            expect(result.sentiment).toBe("neutral")
        })
    })

    describe("Configuração de Repetição", () => {
        it("deve funcionar sem análise de repetição quando desabilitada", () => {
            const customExtractor = new SentimentExtractor({
                enableRepetitionAnalysis: false
            })

            const result = customExtractor.analyze("produto bommmmmm")
            expect(result.intensity).toBeLessThan(0.6) // Score de "bom" (0.5) sem repetição
        })

        it("deve manter análise básica sem repetição", () => {
            const customExtractor = new SentimentExtractor({
                enableRepetitionAnalysis: false
            })

            const result = customExtractor.analyze("produto bom")
            expect(result.sentiment).toBe("positive")
        })
    })

    describe("Edge Cases de Repetição", () => {
        it("deve lidar com repetição isolada", () => {
            const result = extractor.analyze("bommmm")
            expect(result.sentiment).toBe("positive")
        })

        it("deve lidar com repetição no início", () => {
            const result = extractor.analyze("bommmm produto")
            expect(result.sentiment).toBe("positive")
        })

        it("deve lidar com repetição no final", () => {
            const result = extractor.analyze("produto bommmm")
            expect(result.sentiment).toBe("positive")
        })

        it("deve lidar com repetição no meio", () => {
            const result = extractor.analyze("produto bommmm excelente")
            expect(result.sentiment).toBe("positive")
        })

        it("deve lidar com repetição em palavras neutras", () => {
            const result = extractor.analyze("produtooooo comum")
            expect(result.sentiment).toBe("neutral")
        })

        it("deve lidar com repetição em números", () => {
            const result = extractor.analyze("produto 123333 bom")
            expect(result.sentiment).toBe("positive")
        })
    })

    describe("Repetição Complexa", () => {
        it("deve analisar texto com múltiplas características", () => {
            const result = extractor.analyze("PRODUTO EXCELENTEEEE!!! 😍❤️🔥 bommmmmm")
            expect(result.sentiment).toBe("positive")
            expect(result.intensity).toBeGreaterThan(0.6)
        })

        it("deve analisar texto negativo com repetição", () => {
            const result = extractor.analyze("PRODUTO TERRRRRIVEL!!! 😢💔 ruimmmmmm")
            expect(result.sentiment).toBe("negative")
            expect(result.intensity).toBeLessThan(-0.3)
            expect(result.intensity).toBeGreaterThan(-0.5)
        })

        it("deve detectar diferentes padrões de repetição", () => {
            const result = extractor.analyze("produto fantasticoooo incriveeeeeel bommmmmm")
            expect(result.sentiment).toBe("positive")
            expect(result.intensity).toBeGreaterThan(0.3)
        })
    })

    describe("Repetição com Contexto", () => {
        it("deve intensificar com repetição e contexto positivo", () => {
            const result = extractor.analyze("muito bommmmmm produto excelenteeee")
            expect(result.sentiment).toBe("positive")
            expect(result.intensity).toBeGreaterThan(0.3)
        })

        it("deve intensificar com repetição e contexto negativo", () => {
            const result = extractor.analyze("muito ruimmmmmm produto terrrrivel")
            expect(result.sentiment).toBe("negative")
            expect(result.intensity).toBeLessThan(-0.3)
        })
    })
})
