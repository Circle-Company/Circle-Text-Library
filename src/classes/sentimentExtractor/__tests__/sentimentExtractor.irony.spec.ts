import { beforeEach, describe, expect, it } from "vitest"

import { SentimentExtractor } from "../index"

describe("SentimentExtractor - Detecção de Ironia", () => {
    let extractor: SentimentExtractor

    beforeEach(() => {
        extractor = new SentimentExtractor()
    })

    describe("Indicadores de Ironia", () => {
        it("deve detectar ironia com 'rs'", () => {
            const result = extractor.analyze("produto excelente rs")
            expect(result.sentiment).toBe("neutral")
            expect(result.intensity).toBeGreaterThan(0)
            expect(result.intensity).toBeLessThan(0.5)
        })

        it("deve detectar ironia com 'kkk'", () => {
            const result = extractor.analyze("produto maravilhoso kkk")
            expect(result.sentiment).toBe("neutral")
            expect(result.intensity).toBeGreaterThan(0)
            expect(result.intensity).toBeLessThan(0.5)
        })

        it("deve detectar ironia com 'haha'", () => {
            const result = extractor.analyze("produto incrivel haha")
            expect(result.sentiment).toBe("neutral")
            expect(result.intensity).toBeGreaterThan(0)
            expect(result.intensity).toBeLessThan(0.5)
        })

        it("deve detectar ironia com 'hehe'", () => {
            const result = extractor.analyze("produto fantastico hehe")
            expect(result.sentiment).toBe("neutral")
            expect(result.intensity).toBeGreaterThan(0)
            expect(result.intensity).toBeLessThan(0.5)
        })

        it("deve detectar ironia com ':)'", () => {
            const result = extractor.analyze("produto otimo :)")
            expect(result.sentiment).toBe("neutral")
            expect(result.intensity).toBeGreaterThan(0)
            expect(result.intensity).toBeLessThan(0.5)
        })

        it("deve detectar ironia com ';)'", () => {
            const result = extractor.analyze("produto perfeito ;)")
            expect(result.sentiment).toBe("neutral")
            expect(result.intensity).toBeGreaterThan(0)
            expect(result.intensity).toBeLessThan(0.5)
        })

        it("deve detectar ironia com 'ironia'", () => {
            const result = extractor.analyze("produto excelente ironia")
            expect(result.sentiment).toBe("neutral")
            expect(result.intensity).toBeGreaterThan(0)
            expect(result.intensity).toBeLessThan(0.5)
        })

        it("deve detectar ironia com 'sarcasmo'", () => {
            const result = extractor.analyze("produto maravilhoso sarcasmo")
            expect(result.sentiment).toBe("neutral")
            expect(result.intensity).toBeLessThan(0.5)
        })
    })

    describe("Ironia com Sentimento Positivo", () => {
        it("deve neutralizar sentimento positivo com rs", () => {
            const result = extractor.analyze("produto excelente rs")
            expect(result.sentiment).toBe("neutral")
        })

        it("deve neutralizar sentimento positivo com kkk", () => {
            const result = extractor.analyze("produto incrivel kkk")
            expect(result.sentiment).toBe("neutral")
        })

        it("deve neutralizar sentimento positivo com haha", () => {
            const result = extractor.analyze("produto fantastico haha")
            expect(result.sentiment).toBe("neutral")
        })

        it("deve neutralizar sentimento positivo com ironia", () => {
            const result = extractor.analyze("produto maravilhoso ironia")
            expect(result.sentiment).toBe("neutral")
        })
    })

    describe("Ironia com Sentimento Negativo", () => {
        it("deve neutralizar sentimento negativo com rs", () => {
            const result = extractor.analyze("produto terrivel rs")
            expect(result.sentiment).toBe("neutral")
        })

        it("deve neutralizar sentimento negativo com kkk", () => {
            const result = extractor.analyze("produto horrivel kkk")
            expect(result.sentiment).toBe("neutral")
        })

        it("deve neutralizar sentimento negativo com haha", () => {
            const result = extractor.analyze("produto pessimo haha")
            expect(result.sentiment).toBe("neutral")
        })

        it("deve neutralizar sentimento negativo com ironia", () => {
            const result = extractor.analyze("produto ruim ironia")
            expect(result.sentiment).toBe("neutral")
        })
    })

    describe("Ironia com Emojis", () => {
        it("deve neutralizar emojis positivos com rs", () => {
            const result = extractor.analyze("produto bom 😍 rs")
            expect(result.sentiment).toBe("neutral")
        })

        it("deve neutralizar emojis negativos com kkk", () => {
            const result = extractor.analyze("produto ruim 😢 kkk")
            expect(result.sentiment).toBe("neutral")
        })

        it("deve neutralizar múltiplos emojis com ironia", () => {
            const result = extractor.analyze("produto bom 😍❤️🔥 ironia")
            expect(result.sentiment).toBe("neutral")
        })
    })

    describe("Ironia com Pontuação", () => {
        it("deve neutralizar pontuação com rs", () => {
            const result = extractor.analyze("produto excelente!!! rs")
            expect(result.sentiment).toBe("neutral")
        })

        it("deve neutralizar CAPS LOCK com kkk", () => {
            const result = extractor.analyze("PRODUTO EXCELENTE kkk")
            expect(result.sentiment).toBe("neutral")
        })
    })

    describe("Ironia com Repetição", () => {
        it("deve neutralizar repetição com rs", () => {
            const result = extractor.analyze("produto bommmmmm rs")
            expect(result.sentiment).toBe("neutral")
        })

        it("deve neutralizar repetição com ironia", () => {
            const result = extractor.analyze("produto ruimmmmmm ironia")
            expect(result.sentiment).toBe("neutral")
        })
    })

    describe("Configuração de Ironia", () => {
        it("deve funcionar sem detecção de ironia quando desabilitada", () => {
            const customExtractor = new SentimentExtractor({
                enableIronyDetection: false
            })

            const result = customExtractor.analyze("produto excelente rs")
            expect(result.sentiment).toBe("positive")
        })

        it("deve manter análise básica sem detecção de ironia", () => {
            const customExtractor = new SentimentExtractor({
                enableIronyDetection: false
            })

            const result = customExtractor.analyze("produto excelente")
            expect(result.sentiment).toBe("positive")
        })
    })

    describe("Múltiplos Indicadores de Ironia", () => {
        it("deve detectar múltiplos indicadores", () => {
            const result = extractor.analyze("produto excelente rs kkk")
            expect(result.sentiment).toBe("neutral")
        })

        it("deve detectar indicadores em posições diferentes", () => {
            const result = extractor.analyze("rs produto excelente haha")
            expect(result.sentiment).toBe("neutral")
        })

        it("deve detectar indicadores misturados", () => {
            const result = extractor.analyze("produto rs excelente kkk")
            expect(result.sentiment).toBe("neutral")
        })
    })

    describe("Edge Cases de Ironia", () => {
        it("deve lidar com ironia isolada", () => {
            const result = extractor.analyze("rs")
            expect(result.sentiment).toBe("neutral")
        })

        it("deve lidar com ironia no início", () => {
            const result = extractor.analyze("rs produto bom")
            expect(result.sentiment).toBe("neutral")
        })

        it("deve lidar com ironia no final", () => {
            const result = extractor.analyze("produto bom rs")
            expect(result.sentiment).toBe("neutral")
        })

        it("deve lidar com ironia no meio", () => {
            const result = extractor.analyze("produto rs excelente")
            expect(result.sentiment).toBe("neutral")
        })

        it("deve lidar com ironia case insensitive", () => {
            const result = extractor.analyze("produto bom RS")
            expect(result.sentiment).toBe("neutral")
        })

        it("deve lidar com ironia com maiúsculas", () => {
            const result = extractor.analyze("produto bom KKK")
            expect(result.sentiment).toBe("neutral")
        })
    })

    describe("Ironia Complexa", () => {
        it("deve neutralizar texto complexo com ironia", () => {
            const result = extractor.analyze("produto excelente! 😍❤️🔥 rs")
            expect(result.sentiment).toBe("neutral")
        })

        it("deve neutralizar texto com múltiplas características", () => {
            const result = extractor.analyze("PRODUTO EXCELENTE!!! 😍❤️🔥 bommmmmm rs")
            expect(result.sentiment).toBe("neutral")
        })
    })
})
