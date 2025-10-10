import type { CircleTextProps } from "./types"
import { Conversor } from "./classes/conversor/index.js"
import { DateFormatter } from "./classes/date/index.js"
import { Extractor } from "./classes/extractor/index.js"
import { RichText } from "./classes/rich.text/index.js"
import { SentimentExtractor } from "./classes/sentiment/index.js"
// Copyright 2025 Circle Company, Inc.
// Licensed under the Circle License, Version 1.0
import { Timezone } from "./classes/timezone/index.js"
import { Validator } from "./classes/validator/index.js"

/**
 * Biblioteca completa de utilitários de texto para validação, extração e transformação.
 *
 * @example
 * ```ts
 * const textLib = new TextLibrary({
 *   validationRules: {
 *     username: { minLength: { enabled: true, value: 3 } }
 *   },
 *   extractorConfig: {
 *     mentionPrefix: '@',
 *     hashtagPrefix: '#'
 *   },
 *   richTextConfig: {
 *     mentionPrefix: '@',
 *     hashtagPrefix: '#'
 *   }
 * })
 *
 * // Validação
 * const result = textLib.validator.username('@john_doe')
 *
 * // Extração
 * textLib.extractor.setText('Olá @user veja #topic')
 * const keywords = textLib.extractor.keywords()  // ['topic', 'user', ...]
 * const entities = textLib.extractor.entities({ mentions: true })  // { mentions: ['@user'] }
 *
 * // Análise de sentimento
 * const sentiment = textLib.sentiment.analyze('Texto incrível!')
 *
 * // Transformação
 * const formatted = textLib.conversor.formatNumWithDots(1000000)
 * const localTime = textLib.timezone.UTCToLocal(new Date())
 *
 * // Formatação de datas
 * const relativeTime = textLib.date.toRelativeTime(new Date())  // "10 minutos atrás"
 *
 * // Rich Text com prefixos customizados
 * textLib.rich.setText('Olá @user #topic')
 * ```
 */
export class TextLibrary {
    public validator: Validator
    public extractor: Extractor
    public sentiment: SentimentExtractor
    public conversor: Conversor
    public date: DateFormatter
    public readonly rich: RichText
    public readonly timezone: Timezone

    constructor(config: CircleTextProps) {
        // Instancia todas as classes filhas com suas configurações
        this.validator = new Validator(config.validationRules)
        this.extractor = new Extractor(config.extractorConfig)
        this.sentiment = new SentimentExtractor(config.sentimentConfig)
        this.conversor = new Conversor(config.conversorConfig)
        this.date = new DateFormatter(config.dateFormatterConfig)
        this.rich = new RichText(config.richTextConfig)
        this.timezone = new Timezone()
    }
}

// Export default
export default TextLibrary

// Classes utilitárias para uso direto
export { Conversor } from "./classes/conversor/index.js"
export { DateFormatter } from "./classes/date/index.js"
export { Extractor } from "./classes/extractor/index.js"
export { RichText } from "./classes/rich.text/index.js"
export { SentimentExtractor } from "./classes/sentiment/index.js"
export { Timezone, TimezoneCode } from "./classes/timezone/index.js"
export { Validator } from "./classes/validator/index.js"

// Tipos principais
export type { CircleTextProps } from "./types"

// Tipos de validação
export type {
    UsernameValidationRules,
    HashtagValidationRules,
    UrlValidationRules,
    DescriptionValidationRules,
    NameValidationRules,
    PasswordValidationRules,
    ValidationRule
} from "./types"

// Tipos de Extractor
export type { ExtractorConfig } from "./classes/extractor/index.js"
export type { ExtractOptions, PartialExtractResult } from "./types"

// Tipos de RichText
export type {
    EntityMapping,
    RichTextConfig,
    RichTextEntity,
    RichTextUIFormat
} from "./classes/rich.text/index.js"

// Tipos de Sentiment
export type { SentimentReturnProps, SentimentExtractorConfig } from "./classes/sentiment/index.js"

// Tipos de Conversor
export type { ConversorConfig } from "./classes/conversor/index.js"

// Tipos de DateFormatter
export type {
    DateFormatterConfig,
    DateFormatStyle,
    DateFormatLocale
} from "./classes/date/index.js"
