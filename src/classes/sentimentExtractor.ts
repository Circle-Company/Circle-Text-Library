import PT_STOPWORDS from "../data/pt-br/stopwords.json"
import PT_SUFFIXES from "../data/pt-br/suffixes.json"
import PT_SLANG_MAP from "../data/pt-br/slangMap.json"
import PT_SENTIMENT_WORDS from "../data/pt-br/sentimentWords.json"

const SLANG_MAP: Record<string, string> = PT_SLANG_MAP

export interface SentimentExtractorConfig {
    customStopwords?: string[]
    boostWordsList?: { word: string; boost: number }[]
}

export interface SentimentReturnProps {
    intensity: number
    sentiment: "positive" | "negative" | "neutral"
}

export class SentimentExtractor {
    private stopwords: Set<string>
    private boostWordsList: { word: string; boost: number }[]

    constructor(config?: SentimentExtractorConfig) {
        this.stopwords = new Set(config?.customStopwords ?? PT_STOPWORDS)
        this.boostWordsList = config?.boostWordsList ?? []
    }

    public analyze(text: string): SentimentReturnProps {
        if (!text) return { intensity: 0, sentiment: "neutral" }

        // 1. Tokenizar e normalizar
        let tokens = this.tokenize(text)
        tokens = tokens.map((t) => this.normalizeSlang(t))
        tokens = tokens.map((t) => this.lemmatize(t))

        // 2. Calcular score
        const intensity = this.calculateSentimentScore(tokens)

        // 3. Determinar label
        let sentiment: "positive" | "negative" | "neutral" = "neutral"
        if (intensity > 0.05) sentiment = "positive"
        else if (intensity < -0.05) sentiment = "negative"

        return { intensity, sentiment }
    }

    private tokenize(text: string): string[] {
        return text
            .toLowerCase()
            .replace(/[.,!?;:()"'`]/g, " ")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .split(/\s+/)
            .filter(Boolean)
    }

    private normalizeSlang(word: string): string {
        return SLANG_MAP[word] || word
    }

    private lemmatize(word: string): string {
        // Normaliza repetição e acentos
        word = word
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/([^s])\1{2,}/g, "$1")
            .replace(/s{3,}/g, "ss")

        // Remove plural simples
        if (word.endsWith("s") && word.length > 3) {
            word = word.slice(0, -1)
        }

        // Remove sufixos
        for (const suf of PT_SUFFIXES) {
            if (word.endsWith(suf) && word.length - suf.length >= 3) {
                word = word.slice(0, -suf.length)
                break
            }
        }

        return word
    }

    private calculateSentimentScore(tokens: string[]): number {
        let score = 0

        for (const token of tokens) {
            if (this.stopwords.has(token)) continue

            // Busca peso básico no dicionário
            //@ts-ignore
            let weight = PT_SENTIMENT_WORDS[token]
            if (weight !== undefined) {
                // Aplica boost se existir para esta palavra
                const boost = this.boostWordsList.find((b) => b.word === token)?.boost ?? 1
                weight *= boost

                score += weight
            }
        }

        return parseFloat(score.toFixed(3))
    }
}
