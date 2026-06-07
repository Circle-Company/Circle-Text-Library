// Copyright 2025 Circle LLC
// Licensed under the MIT License

import type { Configurable, DeepPartial } from "../../core/config.js"
import { mergeConfig } from "../../core/config.js"

// Emojis são universais: um único mapa compartilhado entre idiomas.
import EMOJI_SCORES from "../../data/pt-br/emojiScore.json" with { type: "json" }

// Léxicos pt-BR (idioma padrão).
import PT_CONNECTORS from "../../data/pt-br/connectors.json" with { type: "json" }
import PT_INTENSITY_WORDS from "../../data/pt-br/intensityWords.json" with { type: "json" }
import PT_IRONY_MARKERS from "../../data/pt-br/ironyMarkers.json" with { type: "json" }
import PT_SENTIMENT_WORDS from "../../data/pt-br/sentimentWords.json" with { type: "json" }

// Léxicos en (inglês).
import EN_CONNECTORS from "../../data/en/connectors.json" with { type: "json" }
import EN_INTENSITY_WORDS from "../../data/en/intensityWords.json" with { type: "json" }
import EN_IRONY_MARKERS from "../../data/en/ironyMarkers.json" with { type: "json" }
import EN_SENTIMENT_WORDS from "../../data/en/sentimentWords.json" with { type: "json" }

import type {
    AnalyzeOptions,
    SentimentDriver,
    SentimentExtractorConfig,
    SentimentLanguage,
    SentimentReturnProps
} from "./sentimentExtractor.types.js"

// Reexporta os tipos públicos para manter a superfície de import existente.
export type * from "./sentimentExtractor.types.js"

const DEFAULT_CACHE_MAX = 500
const DEFAULT_LANGUAGE: SentimentLanguage = "pt-br"

const DEFAULT_CONFIG: Required<
    Pick<
        SentimentExtractorConfig,
        | "language"
        | "enableCache"
        | "enableEmojiAnalysis"
        | "enablePunctuationAnalysis"
        | "enableRepetitionAnalysis"
        | "enableContextAnalysis"
        | "enableIronyDetection"
        | "cacheMax"
    >
> = {
    language: DEFAULT_LANGUAGE,
    enableCache: true,
    enableEmojiAnalysis: true,
    enablePunctuationAnalysis: true,
    enableRepetitionAnalysis: true,
    enableContextAnalysis: true,
    enableIronyDetection: true,
    cacheMax: DEFAULT_CACHE_MAX
}

/** Léxicos embutidos de um idioma (montados 1× por processo, reusados por instância). */
interface LanguageLexicon {
    sentiment: Record<string, number>
    intensity: Record<string, number>
    connectors: Record<string, number>
    irony: string[]
    /** Conectores adversativos: resetam (não multiplicam) o modificador de contexto. */
    adversatives: string[]
}

// Registro de léxicos por idioma, montado 1× por processo (não por chamada/instância).
const LEXICONS: Record<SentimentLanguage, LanguageLexicon> = {
    "pt-br": {
        sentiment: PT_SENTIMENT_WORDS as Record<string, number>,
        intensity: PT_INTENSITY_WORDS as Record<string, number>,
        connectors: PT_CONNECTORS as Record<string, number>,
        irony: PT_IRONY_MARKERS as string[],
        adversatives: ["mas", "porem", "entretanto", "contudo", "todavia"]
    },
    en: {
        sentiment: EN_SENTIMENT_WORDS as Record<string, number>,
        intensity: EN_INTENSITY_WORDS as Record<string, number>,
        connectors: EN_CONNECTORS as Record<string, number>,
        irony: EN_IRONY_MARKERS as string[],
        adversatives: ["but", "however", "although", "though", "yet", "nonetheless", "nevertheless"]
    }
}

export class SentimentExtractor implements Configurable<SentimentExtractorConfig> {
    public readonly config: Readonly<SentimentExtractorConfig>

    /** Idioma do léxico embutido em uso. */
    public readonly language: SentimentLanguage

    // Léxicos efetivos (base do idioma + custom mesclado). Reusados a cada chamada.
    private readonly sentimentLex: Record<string, number>
    private readonly intensityLex: Record<string, number>
    private readonly connectors: Record<string, number>
    private readonly ironyMarkers: string[]
    private readonly adversatives: string[]
    private readonly cacheMax: number

    private scoreCache: Map<string, number>

    /** Instância default usada pelos atalhos estáticos. */
    private static defaultInstance: SentimentExtractor | undefined

    constructor(config: SentimentExtractorConfig = {}) {
        this.config = Object.freeze({ ...DEFAULT_CONFIG, ...config })

        // Seleciona o léxico base pelo idioma (cai no padrão se desconhecido).
        this.language = config.language ?? DEFAULT_LANGUAGE
        const base = LEXICONS[this.language] ?? LEXICONS[DEFAULT_LANGUAGE]
        this.adversatives = base.adversatives

        // Léxico de sentimento: base do idioma + lexicon custom.
        this.sentimentLex = config.lexicon
            ? { ...base.sentiment, ...config.lexicon }
            : base.sentiment

        // Intensidade: base + intensificadores custom (>0) + negadores custom (<0).
        const hasCustomIntensity =
            (config.intensifiers && Object.keys(config.intensifiers).length > 0) ||
            (config.negators && config.negators.length > 0)
        if (hasCustomIntensity) {
            const merged: Record<string, number> = { ...base.intensity }
            if (config.intensifiers) Object.assign(merged, config.intensifiers)
            if (config.negators) {
                for (const neg of config.negators) {
                    const norm = this.normalizeWord(neg.toLowerCase())
                    // Negadores entram com valor negativo: o motor trata < 0 como negação.
                    if (merged[norm] === undefined || merged[norm] >= 0) merged[norm] = -0.5
                }
            }
            this.intensityLex = merged
        } else {
            this.intensityLex = base.intensity
        }

        this.connectors = base.connectors
        this.ironyMarkers = config.ironyMarkers
            ? [...base.irony, ...config.ironyMarkers.map((m) => m.toLowerCase())]
            : base.irony

        this.cacheMax =
            typeof config.cacheMax === "number" && config.cacheMax > 0
                ? config.cacheMax
                : DEFAULT_CACHE_MAX

        this.scoreCache = new Map()
    }

    // ========================================
    // CONTRATO Configurable
    // ========================================

    public withConfig(patch: DeepPartial<SentimentExtractorConfig>): this {
        const next = mergeConfig<SentimentExtractorConfig>(
            this.config as SentimentExtractorConfig,
            patch
        )
        return new SentimentExtractor(next) as this
    }

    // ========================================
    // ATALHOS ESTÁTICOS (sem `new`)
    // ========================================

    private static getDefault(): SentimentExtractor {
        if (!SentimentExtractor.defaultInstance) {
            SentimentExtractor.defaultInstance = new SentimentExtractor()
        }
        return SentimentExtractor.defaultInstance
    }

    /** Analisa um texto usando uma instância default (sem `new`). */
    public static analyze(text: string, opts?: AnalyzeOptions): SentimentReturnProps {
        return SentimentExtractor.getDefault().analyze(text, opts)
    }

    /** Analisa vários textos com a instância default. */
    public static analyzeMany(texts: string[], opts?: AnalyzeOptions): SentimentReturnProps[] {
        return SentimentExtractor.getDefault().analyzeMany(texts, opts)
    }

    // ========================================
    // MÉTODO PRINCIPAL DE ANÁLISE
    // ========================================

    public analyze(text: string, opts?: AnalyzeOptions): SentimentReturnProps {
        // ETAPA 1: Validação de entrada
        if (!text) return this.shape(0, "neutral")

        // ETAPA 2: Verificação de cache (não cacheável quando explain, pois drivers
        // não cabem no cache de score numérico — mas o cálculo é o mesmo).
        if (this.config.enableCache && !opts?.explain && this.scoreCache.has(text)) {
            const cachedScore = this.cacheGet(text)!
            return this.determineSentiment(cachedScore)
        }

        // ETAPA 3: Processamento de texto (tokenização e normalização)
        const tokens = this.tokenizeAndNormalize(text)

        // ETAPA 4: Cálculo do score base (análise de sentimento principal)
        const { score: baseScore, drivers } = this.calculateSentimentScore(tokens)

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
        if (this.config.enableCache && !opts?.explain) {
            this.cacheSet(text, finalScore)
        }

        if (opts?.explain) {
            return { ...result, drivers }
        }
        return result
    }

    /** Analisa uma lista de textos, reutilizando os léxicos já montados. */
    public analyzeMany(texts: string[], opts?: AnalyzeOptions): SentimentReturnProps[] {
        return texts.map((t) => this.analyze(t, opts))
    }

    // ========================================
    // ANÁLISE DE SENTIMENTO REFINADA COM MULTIPLICADORES AVANÇADOS
    // ========================================

    private calculateSentimentScore(tokens: string[]): {
        score: number
        drivers: SentimentDriver[]
    } {
        let score = 0
        let intensityMultiplier = 1.0
        let negationCount = 0
        let contextModifier = 1.0
        const drivers: SentimentDriver[] = []

        for (let i = 0; i < tokens.length; i++) {
            const token = tokens[i]
            if (token === undefined) continue

            // Análise de negação / intensificação
            if (token && Object.prototype.hasOwnProperty.call(this.intensityLex, token)) {
                const intensityValue = this.intensityLex[token] as number

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
            const connectorValue = this.connectors[token as keyof typeof this.connectors]
            if (connectorValue !== undefined) {
                // Conectores adversativos têm efeito mais forte
                if (token && this.adversatives.includes(token)) {
                    contextModifier = connectorValue // Reset para valor adversativo
                } else {
                    contextModifier *= connectorValue
                }
                continue
            }

            // Análise de sentimentos
            const baseScore = this.sentimentLex[token as keyof typeof this.sentimentLex]
            if (baseScore !== undefined) {
                let wordScore = baseScore

                // Aplica intensidade
                wordScore *= intensityMultiplier

                // Aplica negação
                const negated = negationCount % 2 === 1
                if (negated) {
                    wordScore *= -1
                }

                // Aplica contexto
                wordScore *= contextModifier

                // Adiciona ao score total
                score += wordScore

                drivers.push({
                    word: token,
                    base: baseScore,
                    applied: parseFloat(wordScore.toFixed(3)),
                    ...(negated ? { reason: "negado" } : {})
                })

                // Reset para próxima palavra
                intensityMultiplier = 1.0
                negationCount = 0
                contextModifier = 1.0
            }
        }

        return { score: parseFloat(score.toFixed(3)), drivers }
    }

    // ========================================
    // MÉTODOS DE PRÉ-PROCESSAMENTO
    // ========================================

    private tokenizeAndNormalize(text: string): string[] {
        // Primeiro normaliza acentos para evitar quebra de caracteres especiais
        const normalizedText = this.normalizeWord(text)

        return normalizedText
            .toLowerCase()
            // Remove apóstrofos para juntar contrações (en): "don't" → "dont", "it's" → "its".
            .replace(/['’]/g, "")
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
            const current = tokens[i] as keyof typeof this.sentimentLex
            const next = tokens[i + 1] as keyof typeof this.sentimentLex

            const currentScore = this.sentimentLex[current]
            const nextScore = this.sentimentLex[next]

            if (currentScore !== undefined && nextScore !== undefined) {
                // Palavras de sentimento próximas se reforçam
                structureScore += Math.abs(currentScore + nextScore) * 0.1
            }
        }

        return structureScore
    }

    private detectIrony(text: string): number {
        const lower = text.toLowerCase()
        const hasIrony = this.ironyMarkers.some((indicator) =>
            lower.includes(indicator.toLowerCase())
        )
        return hasIrony ? 0 : 1
    }

    // ========================================
    // MÉTODOS PÚBLICOS E UTILITÁRIOS
    // ========================================

    private shape(intensity: number, sentiment: string): SentimentReturnProps {
        return { intensity, sentiment }
    }

    private determineSentiment(score: number): SentimentReturnProps {
        // Normalizar intensidade para valores entre 0 e 1
        const normalizedIntensity = parseFloat(this.normalizeIntensity(score).toFixed(3))

        if (score > 0.05) {
            return this.shape(normalizedIntensity, "positive")
        } else if (score < -0.05) {
            return this.shape(normalizedIntensity, "negative")
        } else {
            return this.shape(normalizedIntensity, "neutral")
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

    // ========================================
    // CACHE LRU
    // ========================================

    private cacheGet(text: string): number | undefined {
        if (!this.scoreCache.has(text)) return undefined
        // Reordena para marcar como recém-usado (LRU).
        const value = this.scoreCache.get(text)!
        this.scoreCache.delete(text)
        this.scoreCache.set(text, value)
        return value
    }

    private cacheSet(text: string, value: number): void {
        if (this.scoreCache.has(text)) this.scoreCache.delete(text)
        this.scoreCache.set(text, value)
        // Descarta o mais antigo ao passar do teto.
        while (this.scoreCache.size > this.cacheMax) {
            const oldest = this.scoreCache.keys().next().value
            if (oldest === undefined) break
            this.scoreCache.delete(oldest)
        }
    }

    public clearCache(): void {
        this.scoreCache.clear()
    }
}
