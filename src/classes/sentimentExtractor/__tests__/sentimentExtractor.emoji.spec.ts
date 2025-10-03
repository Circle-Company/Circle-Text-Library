import { beforeEach, describe, expect, it } from "vitest"

import { SentimentExtractor } from "../index"

describe("SentimentExtractor - Análise de Emojis", () => {
    let extractor: SentimentExtractor

    beforeEach(() => {
        extractor = new SentimentExtractor()
    })

    describe("Emojis Positivos", () => {
        it("deve detectar emoji 😊", () => {
            const result = extractor.analyze("produto bom 😊")
            expect(result.sentiment).toBe("positive")
            expect(result.intensity).toBeGreaterThan(0.2)
        })

        it("deve detectar emoji 😄", () => {
            const result = extractor.analyze("produto bom 😄")
            expect(result.sentiment).toBe("positive")
            expect(result.intensity).toBeGreaterThan(0.3)
        })

        it("deve detectar emoji 😍", () => {
            const result = extractor.analyze("produto bom 😍")
            expect(result.sentiment).toBe("positive")
            expect(result.intensity).toBeGreaterThan(0.4)
        })

        it("deve detectar emoji ❤️", () => {
            const result = extractor.analyze("produto bom ❤️")
            expect(result.sentiment).toBe("positive")
            expect(result.intensity).toBeGreaterThan(0.3)
        })

        it("deve detectar emoji 🥰", () => {
            const result = extractor.analyze("produto bom 🥰")
            expect(result.sentiment).toBe("positive")
            expect(result.intensity).toBeGreaterThan(0.3)
        })

        it("deve detectar emoji 👍", () => {
            const result = extractor.analyze("produto bom 👍")
            expect(result.sentiment).toBe("positive")
            expect(result.intensity).toBeGreaterThan(0.1)
        })

        it("deve detectar emoji 🔥", () => {
            const result = extractor.analyze("produto bom 🔥")
            expect(result.sentiment).toBe("positive")
            expect(result.intensity).toBeGreaterThan(0.2)
        })

        it("deve detectar emoji 💯", () => {
            const result = extractor.analyze("produto bom 💯")
            expect(result.sentiment).toBe("positive")
            expect(result.intensity).toBeGreaterThan(0.2)
        })

        it("deve detectar emoji ✨", () => {
            const result = extractor.analyze("produto bom ✨")
            expect(result.sentiment).toBe("positive")
            expect(result.intensity).toBeGreaterThan(0.1)
        })
    })

    describe("Emojis Negativos", () => {
        it("deve detectar emoji 😢", () => {
            const result = extractor.analyze("produto ruim 😢")
            expect(result.sentiment).toBe("negative")
            expect(result.intensity).toBeLessThan(-0.2)
        })

        it("deve detectar emoji 😭", () => {
            const result = extractor.analyze("produto ruim 😭")
            expect(result.sentiment).toBe("negative")
            expect(result.intensity).toBeLessThan(-0.3)
        })

        it("deve detectar emoji 😡", () => {
            const result = extractor.analyze("produto ruim 😡")
            expect(result.sentiment).toBe("negative")
            expect(result.intensity).toBeLessThan(-0.3)
        })

        it("deve detectar emoji 💔", () => {
            const result = extractor.analyze("produto ruim 💔")
            expect(result.sentiment).toBe("negative")
            expect(result.intensity).toBeLessThan(-0.3)
        })

        it("deve detectar emoji 😞", () => {
            const result = extractor.analyze("produto ruim 😞")
            expect(result.sentiment).toBe("negative")
            expect(result.intensity).toBeLessThan(-0.2)
        })

        it("deve detectar emoji 👎", () => {
            const result = extractor.analyze("produto ruim 👎")
            expect(result.sentiment).toBe("negative")
            expect(result.intensity).toBeLessThan(-0.1)
        })
    })

    describe("Múltiplos Emojis", () => {
        it("deve contar múltiplos emojis positivos", () => {
            const result = extractor.analyze("produto bom 😍❤️🔥")
            expect(result.sentiment).toBe("positive")
            expect(result.intensity).toBeGreaterThan(0.6)
            expect(result.intensity).toBeLessThan(1)
        })

        it("deve contar múltiplos emojis negativos", () => {
            const result = extractor.analyze("produto ruim 😢💔😭")
            expect(result.sentiment).toBe("negative")
            expect(result.intensity).toBeLessThan(-0.3)
            expect(result.intensity).toBeGreaterThan(-0.5)
        })

        it("deve balancear emojis positivos e negativos", () => {
            const result = extractor.analyze("produto bom 😍😢")
            expect(result.sentiment).toBe("positive")
            expect(result.intensity).toBeGreaterThan(0.1)
        })

        it("deve contar emojis repetidos", () => {
            const result = extractor.analyze("produto bom 😍😍😍")
            expect(result.sentiment).toBe("positive")
            expect(result.intensity).toBeGreaterThan(0.6)
            expect(result.intensity).toBeLessThan(1)
        })
    })

    describe("Emojis com Texto", () => {
        it("deve combinar emojis com palavras positivas", () => {
            const result = extractor.analyze("produto excelente! 😍❤️")
            expect(result.sentiment).toBe("positive")
            expect(result.intensity).toBeGreaterThan(0.6)
            expect(result.intensity).toBeLessThan(1)
        })

        it("deve combinar emojis com palavras negativas", () => {
            const result = extractor.analyze("produto terrível! 😢💔")
            expect(result.sentiment).toBe("negative")
            expect(result.intensity).toBeLessThan(-0.1)
            expect(result.intensity).toBeGreaterThan(-0.5)
        })

        it("deve usar emojis para neutralizar texto neutro", () => {
            const result = extractor.analyze("produto comum 😍")
            expect(result.sentiment).toBe("positive")
        })

        it("deve usar emojis para intensificar sentimento", () => {
            const result = extractor.analyze("produto bom 🔥🔥🔥")
            expect(result.sentiment).toBe("positive")
            expect(result.intensity).toBeGreaterThan(0.5)
        })
    })

    describe("Configuração de Emojis", () => {
        it("deve funcionar sem análise de emojis quando desabilitada", () => {
            const customExtractor = new SentimentExtractor({
                enableEmojiAnalysis: false
            })

            const result = customExtractor.analyze("produto bom 😍❤️🔥")
            expect(result.sentiment).toBe("positive")
            expect(result.intensity).toBeGreaterThan(0.6)
            expect(result.intensity).toBeLessThan(0.9)
        })

        it("deve manter análise básica sem emojis", () => {
            const customExtractor = new SentimentExtractor({
                enableEmojiAnalysis: false
            })

            const result = customExtractor.analyze("produto excelente")
            expect(result.sentiment).toBe("positive")
        })
    })

    describe("Edge Cases de Emojis", () => {
        it("deve lidar com emojis isolados", () => {
            const result = extractor.analyze("😍")
            expect(result.sentiment).toBe("positive")
        })

        it("deve lidar com emojis no início", () => {
            const result = extractor.analyze("😍 produto bom")
            expect(result.sentiment).toBe("positive")
        })

        it("deve lidar com emojis no final", () => {
            const result = extractor.analyze("produto bom 😍")
            expect(result.sentiment).toBe("positive")
        })

        it("deve lidar com emojis no meio", () => {
            const result = extractor.analyze("produto 😍 excelente")
            expect(result.sentiment).toBe("positive")
        })

        it("deve lidar com emojis sem texto", () => {
            const result = extractor.analyze("😍❤️🔥")
            expect(result.sentiment).toBe("positive")
        })
    })
})
