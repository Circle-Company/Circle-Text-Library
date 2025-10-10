// Copyright 2025 Circle Company, Inc.
// Licensed under the Circle License, Version 1.0

import PT_STOPWORDS from "../../data/pt-br/stopwords.json" with { type: "json" }
import PT_SUFFIXES from "../../data/pt-br/suffixes.json" with { type: "json" }
import PT_SLANG_MAP from "../../data/pt-br/slangMap.json" with { type: "json" }

import type { ExtractOptions, PartialExtractResult } from "../../types"

const SLANG_MAP: Record<string, string> = PT_SLANG_MAP

// ============================================================================
// Configurações
// ============================================================================

export interface ExtractorConfig {
    // Configurações de prefixos para entidades
    mentionPrefix?: string
    hashtagPrefix?: string

    // Configurações de keywords
    minWordLength?: number
    maxKeywords?: number
    stopwords?: string[]
    boostFirstSentences?: boolean
}

// ============================================================================
// Classe Extractor Unificada
// ============================================================================

/**
 * Extrator unificado para análise de texto.
 *
 * Funcionalidades:
 * - Extração de entidades (mentions, hashtags, URLs)
 * - Extração de palavras-chave (keywords)
 *
 * @example
 * ```ts
 * const extractor = new Extractor({ mentionPrefix: '@', hashtagPrefix: '#' })
 * extractor.setText('Olá @user veja #topic em https://example.com')
 *
 * // Extrair entidades
 * const entities = extractor.entities({ mentions: true, hashtags: true })
 * // { mentions: ['@user'], hashtags: ['#topic'] }
 *
 * // Extrair keywords
 * const keywords = extractor.keywords()
 * // ['topic', 'user', ...]
 * ```
 */
export class Extractor {
    // ============================================================================
    // Propriedades
    // ============================================================================

    private text: string
    private minWordLength: number
    private maxKeywords: number
    private stopwords: Set<string>
    private boostFirstSentences: boolean
    private mentionPrefix: string
    private hashtagPrefix: string

    // ============================================================================
    // Constructor
    // ============================================================================

    constructor(config?: ExtractorConfig) {
        this.text = ""
        this.minWordLength = config?.minWordLength ?? 3
        this.maxKeywords = config?.maxKeywords ?? 5
        this.boostFirstSentences = config?.boostFirstSentences ?? true
        this.stopwords = new Set(config?.stopwords ?? PT_STOPWORDS)
        this.mentionPrefix = config?.mentionPrefix ?? "@"
        this.hashtagPrefix = config?.hashtagPrefix ?? "#"
    }

    public setText(text: string): void {
        this.text = text
    }

    public setMentionPrefix(prefix: string): void {
        this.mentionPrefix = prefix
    }

    public setHashtagPrefix(prefix: string): void {
        this.hashtagPrefix = prefix
    }

    public setMinWordLength(length: number): void {
        this.minWordLength = length
    }

    public setMaxKeywords(max: number): void {
        this.maxKeywords = max
    }

    public setStopwords(words: string[]): void {
        this.stopwords = new Set(words)
    }

    public setBoostFirstSentences(boost: boolean): void {
        this.boostFirstSentences = boost
    }
    /**
     * Extrai entidades do texto (mentions, hashtags, URLs).
     *
     * @param options - Opções para especificar quais entidades extrair
     * @returns Objeto com as entidades extraídas
     */
    public entities(options: ExtractOptions = {}): PartialExtractResult {
        const result: PartialExtractResult = {}

        if (options.mentions) {
            const mentionRegex = this.getMentionRegex()
            result.mentions = this.text.match(mentionRegex) || []
        }

        if (options.hashtags) {
            const hashtagRegex = this.getHashtagRegex()
            result.hashtags = this.text.match(hashtagRegex) || []
        }

        if (options.urls) {
            const urlRegex = this.getUrlRegex()
            result.urls = this.text.match(urlRegex) || []
        }

        return result
    }
    /**
     * Extrai palavras-chave do texto usando análise de frequência e relevância.
     *
     * @returns Array de palavras-chave ordenadas por relevância
     */
    public keywords(): string[] {
        if (!this.text) return []

        // 1. Normalizar e tokenizar
        let tokens = this.tokenize(this.text)

        // 2. Substituir gírias/abreviações
        tokens = tokens.map((t) => this.normalizeSlang(t))

        // 3. Reduzir palavras para radical (stemming)
        const normalizedTokens = tokens.map((word) => this.lemmatize(word))

        // 4. Calcular pontuação híbrida
        const scoredWords = this.calculateScores(normalizedTokens)

        // 5. Ordenar e retornar top N
        return scoredWords
            .sort((a, b) => b.score - a.score)
            .slice(0, this.maxKeywords)
            .map((entry) => entry.word)
    }

    // ============================================================================
    // Métodos Privados - Geração de Regex Dinâmicos
    // ============================================================================

    /**
     * Gera regex dinâmico para mentions baseado no prefixo configurado.
     */
    private getMentionRegex(): RegExp {
        const escapedPrefix = this.escapeRegex(this.mentionPrefix)
        return new RegExp(`${escapedPrefix}[a-zA-Z0-9._-]+`, "g")
    }

    /**
     * Gera regex dinâmico para hashtags baseado no prefixo configurado.
     */
    private getHashtagRegex(): RegExp {
        const escapedPrefix = this.escapeRegex(this.hashtagPrefix)
        return new RegExp(`${escapedPrefix}\\w+`, "g")
    }

    /**
     * Gera regex para URLs (fixo, não depende de configuração).
     */
    private getUrlRegex(): RegExp {
        return /https?:\/\/[^\s,]+/g
    }

    /**
     * Escapa caracteres especiais de regex.
     */
    private escapeRegex(str: string): string {
        return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    }

    // ============================================================================
    // Métodos Privados - Processamento de Keywords
    // ============================================================================

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
        // Plurais simples
        if (word.endsWith("s") && word.length > 3) {
            word = word.slice(0, -1)
        }

        // Sufixos comuns
        for (const suffix of PT_SUFFIXES) {
            if (word.endsWith(suffix) && word.length - suffix.length >= 3) {
                word = word.slice(0, -suffix.length)
                break
            }
        }

        return word
    }

    private calculateScores(tokens: string[]): Array<{ word: string; score: number }> {
        const frequencyMap = new Map<string, number>()

        tokens.forEach((word, index) => {
            // Filtrar palavras muito curtas e stopwords
            if (word.length < this.minWordLength || this.stopwords.has(word)) {
                return
            }

            // Calcular score base
            let score = 1
            const current = frequencyMap.get(word) || 0
            score += Math.log(current + 1)

            // Boost para palavras no início do texto
            if (this.boostFirstSentences && index < tokens.length * 0.2) {
                score *= 1.5
            }

            frequencyMap.set(word, current + score)
        })

        return Array.from(frequencyMap.entries()).map(([word, score]) => ({ word, score }))
    }
}
