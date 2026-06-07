// Copyright 2025 Circle LLC
// Licensed under the MIT License

/**
 * Tipos públicos do `SentimentExtractor`.
 *
 * Config injetável (análises auxiliares + léxico custom), o resultado canônico
 * de uma análise, os "drivers" que explicam o score e as opções por chamada.
 * A implementação vive em `./index.ts`.
 */

/**
 * Idiomas com léxico embutido.
 *
 * `pt-br` (padrão) e `en` carregam léxicos próprios de `src/data/<idioma>`.
 * O léxico custom (`lexicon`/`intensifiers`/`negators`/`ironyMarkers`) ainda
 * mescla sobre o idioma selecionado.
 */
export type SentimentLanguage = "pt-br" | "en"

/**
 * Configuração do `SentimentExtractor`.
 *
 * Permite escolher o idioma do léxico embutido (`language`), alternar as
 * análises auxiliares e injetar léxico customizado
 * (`lexicon`/`intensifiers`/`negators`/`ironyMarkers`), que **mescla sobre a
 * base do idioma** por instância, sem editar o pacote nem vazar para os mapas
 * compartilhados.
 */
export interface SentimentExtractorConfig {
    /** Idioma do léxico embutido. Default `"pt-br"`. */
    language?: SentimentLanguage

    enableCache?: boolean
    enableEmojiAnalysis?: boolean
    enablePunctuationAnalysis?: boolean
    enableRepetitionAnalysis?: boolean
    enableContextAnalysis?: boolean
    enableIronyDetection?: boolean

    /** Léxico custom: palavra → polaridade (-1..1). Mescla SOBRE a base. */
    lexicon?: Record<string, number>
    /** Intensificadores custom: palavra → multiplicador. Mescla SOBRE a base. */
    intensifiers?: Record<string, number>
    /** Negadores custom adicionados ao escopo de negação. */
    negators?: string[]
    /** Marcadores de ironia custom adicionados aos da base. */
    ironyMarkers?: string[]

    /** Teto do cache LRU. Default 500. */
    cacheMax?: number
}

/** Resultado canônico de uma análise. */
export interface SentimentReturnProps {
    intensity: number
    sentiment: string
    /** Presente apenas quando `analyze(text, { explain: true })`. */
    drivers?: SentimentDriver[]
}

/** Palavra que contribuiu para o score, com o motivo. */
export interface SentimentDriver {
    word: string
    base: number
    applied: number
    reason?: string
}

/** Opções por chamada de `analyze`. */
export interface AnalyzeOptions {
    /** Quando `true`, anexa `drivers` (palavras que dirigiram o score). */
    explain?: boolean
}
