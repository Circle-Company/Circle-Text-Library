import CONNECTORS from "../../data/pt-br/connectors.json" with { type: "json" }
import EMOJI_SCORES from "../../data/pt-br/emojiScore.json" with { type: "json" }
import INTENSITY_WORDS from "../../data/pt-br/intensityWords.json" with { type: "json" }
import IRONY_INDICATORS from "../../data/pt-br/ironyIndicators.json" with { type: "json" }
import PT_SENTIMENT_WORDS from "../../data/pt-br/sentimentWords.json" with { type: "json" }
import STOPWORDS from "../../data/pt-br/stopwords.json" with { type: "json" }

export interface SentimentExtractorConfig {
    enableCache?: boolean
    enableEmojiAnalysis?: boolean
    enablePunctuationAnalysis?: boolean
    enableRepetitionAnalysis?: boolean
    enableContextAnalysis?: boolean
    enableIronyDetection?: boolean
    enableConnectorsAnalysis?: boolean
    enablePositionWeight?: boolean
}

export interface SentimentReturnProps {
    intensity: number
    sentiment: string
}

export class SentimentExtractor {
    private config: SentimentExtractorConfig
    private scoreCache: Map<string, number>

    constructor(config: SentimentExtractorConfig = {}) {
        this.config = {
            enableCache: true,
            enableEmojiAnalysis: true,
            enablePunctuationAnalysis: true,
            enableRepetitionAnalysis: true,
            enableContextAnalysis: true,
            enableIronyDetection: true,
            enableConnectorsAnalysis: true,
            enablePositionWeight: true,
            ...config
        }

        this.scoreCache = new Map()
    }

    // ========================================
    // MÉTODO PRINCIPAL DE ANÁLISE
    // ========================================

    public analyze(text: string): SentimentReturnProps {
        // ETAPA 1: Validação de entrada
        if (!text) return { intensity: 0, sentiment: "neutral" }

        // ETAPA 2: Verificação de cache
        if (this.config.enableCache && this.scoreCache.has(text)) {
            const cachedScore = this.scoreCache.get(text)!
            return this.determineSentiment(cachedScore)
        }

        // ETAPA 3: Processamento de texto (tokenização e normalização)
        const tokens = this.tokenizeAndNormalize(text)

        // ETAPA 4: Cálculo do score base (análise de sentimento principal)
        let baseScore = this.calculateSentimentScore(tokens)

        // ETAPA 5: Análises adicionais de texto (se habilitadas)
        const emojiScore = this.config.enableEmojiAnalysis ? this.analyzeEmojis(text) : 0
        const punctuationScore = this.config.enablePunctuationAnalysis
            ? this.analyzePunctuation(text)
            : 0
        const repetitionScore = this.config.enableRepetitionAnalysis
            ? this.analyzeCharacterRepetition(text)
            : 0
        const ironyMultiplier = this.config.enableIronyDetection ? this.detectIrony(text) : 1
        const sentenceStructureScore = this.config.enableContextAnalysis
            ? this.analyzeSentenceStructure(tokens)
            : 0

        // ETAPA 6: Aplicação de multiplicadores e cálculo do score final
        let finalScore = baseScore
        if (this.config.enableEmojiAnalysis) finalScore += emojiScore
        if (this.config.enablePunctuationAnalysis) finalScore += punctuationScore
        if (this.config.enableRepetitionAnalysis) finalScore += repetitionScore
        if (this.config.enableContextAnalysis) finalScore += sentenceStructureScore
        finalScore *= ironyMultiplier

        // ETAPA 7: Determinar sentimento e cachear resultado
        const result = this.determineSentiment(finalScore)
        if (this.config.enableCache) {
            this.scoreCache.set(text, finalScore)
        }

        return result
    }

    // ========================================
    // ANÁLISE DE SENTIMENTO REFINADA COM MULTIPLICADORES AVANÇADOS
    // ========================================

    private calculateSentimentScore(tokens: string[]): number {
        let score = 0
        let intensityMultiplier = 1.0
        let negationCount = 0
        let contextModifier = 1.0

        for (let i = 0; i < tokens.length; i++) {
            const token = tokens[i]

            // Análise de negação
            if (token && INTENSITY_WORDS.hasOwnProperty(token)) {
                const intensityValue = INTENSITY_WORDS[token as keyof typeof INTENSITY_WORDS]

                if (intensityValue < 0) {
                    // Palavra de negação
                    negationCount++
                    continue
                } else if (intensityValue > 0) {
                    // Intensificador positivo
                    intensityMultiplier *= intensityValue
                    continue
                }
            }

            // Análise de conectores

            const connectorValue = CONNECTORS[token as keyof typeof CONNECTORS]
            if (connectorValue !== undefined) {
                // Conectores adversativos têm efeito mais forte
                if (token && ["mas", "porem", "entretanto", "contudo"].includes(token)) {
                    contextModifier = connectorValue // Reset para valor adversativo
                } else {
                    contextModifier *= connectorValue
                }
                continue
            }

            // Análise de sentimentos
            //@ts-ignore
            const baseScore = PT_SENTIMENT_WORDS[token]
            if (baseScore !== undefined) {
                let wordScore = baseScore

                // Aplica intensidade
                wordScore *= intensityMultiplier

                // Aplica negação
                if (negationCount % 2 === 1) {
                    wordScore *= -1
                }

                // Aplica contexto
                wordScore *= contextModifier

                // Adiciona ao score total
                score += wordScore

                // Reset para próxima palavra
                intensityMultiplier = 1.0
                negationCount = 0
                contextModifier = 1.0
            }
        }

        return parseFloat(score.toFixed(3))
    }

    // ========================================
    // MÉTODOS DE PRÉ-PROCESSAMENTO
    // ========================================

    private tokenizeAndNormalize(text: string): string[] {
        // Primeiro normaliza acentos para evitar quebra de caracteres especiais
        const normalizedText = this.normalizeWord(text)

        return normalizedText
            .toLowerCase()
            .replace(/[^\w\s]/g, " ")
            .split(/\s+/)
            .filter((word) => word.length > 0)
    }

    private normalizeWord(word: string): string {
        // Normaliza acentos
        const accents: { [key: string]: string } = {
            á: "a",
            à: "a",
            ã: "a",
            â: "a",
            ä: "a",
            é: "e",
            è: "e",
            ê: "e",
            ë: "e",
            í: "i",
            ì: "i",
            î: "i",
            ï: "i",
            ó: "o",
            ò: "o",
            ô: "o",
            õ: "o",
            ö: "o",
            ú: "u",
            ù: "u",
            û: "u",
            ü: "u",
            ç: "c",
            ñ: "n"
        }

        return word
            .split("")
            .map((char) => accents[char] || char)
            .join("")
    }

    // ========================================
    // MÉTODOS DE ANÁLISE ADICIONAL
    // ========================================

    private analyzeEmojis(text: string): number {
        let emojiScore = 0

        // Analisa emojis conhecidos - estrutura chave-valor
        Object.entries(EMOJI_SCORES).forEach(([char, score]) => {
            const matches = (text.match(new RegExp(char, "g")) || []).length
            if (matches > 0) {
                emojiScore += score * matches
            }
        })

        return emojiScore
    }

    private analyzePunctuation(text: string): number {
        let punctuationScore = 0

        // Múltiplos pontos de exclamação
        const exclCount = (text.match(/!/g) || []).length
        if (exclCount > 0) {
            punctuationScore += Math.min(exclCount * 0.12, 0.5)
        }

        // Múltiplos pontos de interrogação
        const questionCount = (text.match(/\?/g) || []).length
        if (questionCount > 0) {
            punctuationScore += Math.min(questionCount * 0.026, 0.15)
        }

        // CAPS LOCK
        const capsRatio = (text.match(/[A-Z]/g) || []).length / text.length
        if (capsRatio > 0.3) punctuationScore += 0.21

        return punctuationScore
    }

    private analyzeCharacterRepetition(text: string): number {
        let repetitionScore = 0

        // Detecta repetição de caracteres
        const repeatedChars = text.match(/(.)\1{2,}/g) || []
        repeatedChars.forEach((match) => {
            const extraChars = match.length - 2

            // Normaliza o texto removendo repetições excessivas para verificar dicionário
            const textLower = text.toLowerCase()
            const normalizedText = this.normalizeRepetitions(textLower)

            // Busca por padrões conhecidos de palavras com sentimentos definidos
            const hasNegativePattern =
                /terr+ivel/.test(textLower) ||
                /horr*vel/.test(textLower) ||
                /horrivel/.test(textLower) ||
                /ruim+/.test(textLower) ||
                /pesim+o/.test(textLower) ||
                normalizedText.includes("terrivel") ||
                normalizedText.includes("horrivel") ||
                normalizedText.includes("ruim") ||
                normalizedText.includes("pessimo")

            const hasPositivePattern =
                /bo+m/.test(textLower) ||
                /excelent*/.test(textLower) ||
                /fantastic*/.test(textLower) ||
                /incriv*l*/.test(textLower) ||
                textLower.includes("otimo") ||
                textLower.includes("maravilhoso")

            let hasPositiveSentiment = false
            let hasNegativeSentiment = false

            if (hasNegativePattern) {
                hasNegativeSentiment = true
            } else if (hasPositivePattern) {
                hasPositiveSentiment = true
            }

            if (hasNegativeSentiment) {
                // Para palavras negativas: intensifica negativo
                repetitionScore -= Math.min(extraChars * 0.15, 0.4)
            } else if (hasPositiveSentiment) {
                // Para palavras positivas: intensifica positivo
                repetitionScore += Math.min(extraChars * 0.12, 0.5)
            }
            // Para palavras neutras: não adiciona nada
        })

        return repetitionScore
    }

    private normalizeRepetitions(text: string): string {
        // Para RR e SS: mantém máximo 2 caracteres (rr, ss)
        // Para outros: remove todas as repetições extras (aaaa → a)
        return text.replace(/(.)\1+/g, (match, char) => {
            if (char === "r" || char === "s") {
                // Para 'r' e 's': mantém máximo 2 caracteres (rr, ss)
                return char + char
            } else {
                // Para outros caracteres: mantém apenas 1 caractere
                return char
            }
        })
    }

    private analyzeSentenceStructure(tokens: string[]): number {
        if (!this.config.enableContextAnalysis) return 0

        let structureScore = 0

        // Análise de conexão entre palavras
        for (let i = 0; i < tokens.length - 1; i++) {
            const current = tokens[i]
            const next = tokens[i + 1]

            //@ts-ignore
            const currentScore = PT_SENTIMENT_WORDS[current]
            //@ts-ignore
            const nextScore = PT_SENTIMENT_WORDS[next]

            if (currentScore !== undefined && nextScore !== undefined) {
                // Palavras de sentimento próximas se reforçam
                structureScore += Math.abs(currentScore + nextScore) * 0.1
            }
        }

        return structureScore
    }

    private detectIrony(text: string): number {
        const hasIrony = IRONY_INDICATORS.some((indicator: string) =>
            text.toLowerCase().includes(indicator.toLowerCase())
        )
        return hasIrony ? 0 : 1
    }

    // ========================================
    // MÉTODOS PÚBLICOS E UTILITÁRIOS
    // ========================================

    private determineSentiment(score: number): SentimentReturnProps {
        // Normalizar intensidade para valores entre 0 e 1
        const normalizedIntensity = this.normalizeIntensity(score)

        if (score > 0.05) {
            return { intensity: parseFloat(normalizedIntensity.toFixed(3)), sentiment: "positive" }
        } else if (score < -0.05) {
            return { intensity: parseFloat(normalizedIntensity.toFixed(3)), sentiment: "negative" }
        } else {
            return { intensity: parseFloat(normalizedIntensity.toFixed(3)), sentiment: "neutral" }
        }
    }

    private normalizeIntensity(score: number): number {
        // Normalização que preserva a informação do sentimento mantendo valores negativos quando apropriado

        // Para valores em range pequeno (-1 a 1), manter diferenças
        if (Math.abs(score) <= 1) {
            if (score >= 0) {
                return Math.max(0.1, Math.min(0.9, 0.4 + score * 0.5))
            } else {
                return Math.max(-0.9, Math.min(-0.1, -0.4 + score * 0.5))
            }
        }

        // Para valores extremos, aplicar compressão logarítmica
        if (score > 0) return Math.max(0.1, Math.min(0.9, 1 - 1 / (1 + score)))
        else return Math.max(-0.9, Math.min(-0.1, -(1 / (1 + Math.abs(score)))))
    }

    public clearCache(): void {
        this.scoreCache.clear()
    }
}
