import PT_STOPWORDS from "../data/pt-br/stopwords.json"
import PT_SUFFIXES from "../data/pt-br/suffixes.json"
import PT_SLANG_MAP from "../data/pt-br/slangMap.json"

const SLANG_MAP: Record<string, string> = PT_SLANG_MAP

export interface KeywordExtractorConfig {
    minWordLength?: number
    maxKeywords?: number
    stopwords?: string[]
    boostFirstSentences?: boolean
}

export class KeywordExtractor {
    private minWordLength: number
    private maxKeywords: number
    private stopwords: Set<string>
    private boostFirstSentences: boolean

    constructor(config?: KeywordExtractorConfig) {
        this.minWordLength = config?.minWordLength ?? 3
        this.maxKeywords = config?.maxKeywords ?? 5
        this.boostFirstSentences = config?.boostFirstSentences ?? true
        this.stopwords = new Set(config?.stopwords ?? PT_STOPWORDS)
    }

    public extract(text: string): string[] {
        if (!text) return []

        // 1. Normalizar e tokenizar
        let tokens = this.tokenize(text)

        // 2. Substituir gírias/abreviações
        tokens = tokens.map((t) => this.normalizeSlang(t))

        // 3. Reduzir palavras para radical
        const normalizedTokens = tokens.map((word) => this.lemmatize(word))

        // 4. Calcular pontuação híbrida
        const scoredWords = this.calculateScores(normalizedTokens)

        // 5. Ordenar e pegar top N
        return scoredWords
            .sort((a, b) => b.score - a.score)
            .slice(0, this.maxKeywords)
            .map((entry) => entry.word)
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
        // Se a palavra for gíria conhecida, substitui
        return SLANG_MAP[word] || word
    }

    private lemmatize(word: string): string {
        // Plurais simples
        if (word.endsWith("s") && word.length > 3) word = word.slice(0, -1)

        // Sufixos comuns
        const suffixes = PT_SUFFIXES
        for (const suf of suffixes) {
            if (word.endsWith(suf) && word.length - suf.length >= 3) {
                word = word.slice(0, -suf.length)
                break
            }
        }

        return word
    }

    private calculateScores(tokens: string[]): { word: string; score: number }[] {
        const frequencyMap = new Map<string, number>()

        tokens.forEach((word, index) => {
            if (word.length < this.minWordLength || this.stopwords.has(word)) return

            let score = 1
            const current = frequencyMap.get(word) || 0
            score += Math.log(current + 1)

            if (this.boostFirstSentences && index < tokens.length * 0.2) {
                score *= 1.5
            }

            frequencyMap.set(word, current + score)
        })

        return [...frequencyMap.entries()].map(([word, score]) => ({ word, score }))
    }
}
