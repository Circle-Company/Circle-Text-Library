// Copyright 2025 Circle LLC
// Licensed under the MIT License

import { Configurable, DeepPartial } from "./core/config.js"
import { Validator } from "./classes/validator/index.js"
import { SentimentExtractor } from "./classes/sentimentExtractor/index.js"
import { KeywordExtractor } from "./classes/keywordExtractor.js"
import { RichText } from "./classes/rich.text/index.js"
import { Timezone } from "./classes/timezone/index.js"
import { DateFormatter } from "./classes/date/index.js"
import { Formatter } from "./classes/conversor/index.js"

import type { ValidationConfig } from "./types.js"
import type { SentimentExtractorConfig } from "./classes/sentimentExtractor/index.js"
import type { KeywordExtractorConfig } from "./classes/keywordExtractor.js"
import type { RichTextConfig } from "./classes/rich.text/index.js"
import type { TimezoneConfig } from "./classes/timezone/index.js"
import type { DateFormatterConfig } from "./classes/date/index.js"
import type { FormatterConfig } from "./classes/conversor/index.js"

/** Cada slot aceita uma config (a mãe constrói a engine) OU uma instância pronta (DI). */
export interface TextLibraryConfig {
    validation?: DeepPartial<ValidationConfig> | Validator
    sentiment?: DeepPartial<SentimentExtractorConfig> | SentimentExtractor
    keywords?: DeepPartial<KeywordExtractorConfig> | KeywordExtractor
    richText?: DeepPartial<RichTextConfig> | RichText
    timezone?: DeepPartial<TimezoneConfig> | Timezone
    date?: DeepPartial<DateFormatterConfig> | DateFormatter
    format?: DeepPartial<FormatterConfig> | Formatter
}

// engine = qualquer coisa que implemente o contrato (tem withConfig); config = objeto simples
const isEngine = (x: unknown): x is Configurable<unknown> =>
    !!x && typeof (x as { withConfig?: unknown }).withConfig === "function"

function build<T>(slot: unknown, make: (c: never) => T): T {
    return isEngine(slot) ? (slot as unknown as T) : make(slot as never)
}

function applyPatch<T extends { withConfig(p: never): T }>(current: T, slot: unknown): T {
    if (slot === undefined) return current
    return isEngine(slot) ? (slot as unknown as T) : current.withConfig(slot as never)
}

/**
 * Composition root: é dona da config canônica, instancia as engines e injeta a config de
 * cada uma — ou aceita uma instância pronta (DI). Expõe as INSTÂNCIAS (API completa).
 */
export class TextLibrary {
    validator: Validator
    sentiment: SentimentExtractor
    keywords: KeywordExtractor
    richText: RichText
    timezone: Timezone
    date: DateFormatter
    format: Formatter

    constructor(config: TextLibraryConfig = {}) {
        this.validator = build(config.validation, (c) => new Validator(c))
        this.sentiment = build(config.sentiment, (c) => new SentimentExtractor(c))
        this.keywords = build(config.keywords, (c) => new KeywordExtractor(c))
        this.richText = build(config.richText, (c) => new RichText(undefined, c))
        this.timezone = build(config.timezone, (c) => new Timezone(c))
        // DateFormatter conversa com o Timezone da fachada por padrão (DI), mas a
        // config do usuário (locale/zone/instância própria) sempre tem precedência.
        this.date = build(
            config.date,
            (c) => new DateFormatter({ timezone: this.timezone, ...(c as DateFormatterConfig) })
        )
        this.format = build(config.format, (c) => new Formatter(c))
    }

    /** Edita regras no lugar: troca a engine afetada (merge sobre a config atual). */
    configure(patch: TextLibraryConfig): this {
        this.validator = applyPatch(this.validator, patch.validation)
        this.sentiment = applyPatch(this.sentiment, patch.sentiment)
        this.keywords = applyPatch(this.keywords, patch.keywords)
        this.richText = applyPatch(this.richText, patch.richText)
        this.timezone = applyPatch(this.timezone, patch.timezone)
        this.date = applyPatch(this.date, patch.date)
        this.format = applyPatch(this.format, patch.format)
        return this
    }

    /** Deriva um novo facade, reusando as engines não-tocadas (imutável). */
    with(patch: TextLibraryConfig): TextLibrary {
        const next = Object.create(TextLibrary.prototype) as TextLibrary
        next.validator = applyPatch(this.validator, patch.validation)
        next.sentiment = applyPatch(this.sentiment, patch.sentiment)
        next.keywords = applyPatch(this.keywords, patch.keywords)
        next.richText = applyPatch(this.richText, patch.richText)
        next.timezone = applyPatch(this.timezone, patch.timezone)
        next.date = applyPatch(this.date, patch.date)
        next.format = applyPatch(this.format, patch.format)
        return next
    }
}

// === Reexports: classes, helpers e TODAS as tipagens da lib ===
export * from "./core/config.js"
export * from "./types.js"
export * from "./classes/validator/index.js"
export * from "./classes/sentimentExtractor/index.js"
export * from "./classes/keywordExtractor.js"
export * from "./classes/rich.text/index.js"
export * from "./classes/timezone/index.js"
export * from "./classes/date/index.js"
export * from "./classes/conversor/index.js"
