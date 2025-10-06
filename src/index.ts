// Copyright 2025 Circle Company, Inc.
// Licensed under the Circle License, Version 1.0

import {
    CircleTextExtract,
    CircleTextProps,
    CircleTextTransform,
    CircleTextValidation
} from "./types"
import { SentimentExtractor, SentimentReturnProps } from "./classes/sentimentExtractor/index.js"
import { Timezone, TimezoneCodes } from "./classes/timezone/index.js"

import { Conversor } from "./classes/conversor/index.js"
import { ExtractOptions } from "./types"
import { Extractor } from "./classes/extractor.js"
import { KeywordExtractor } from "./classes/keywordExtractor.js"
import { RichText } from "./classes/rich.text/index.js"
import { Validator } from "./classes/validator/index.js"

// Classe principal
export class CircleTextLibrary {
    public validate: CircleTextValidation
    public extract: CircleTextExtract
    public transform: CircleTextTransform
    public richText: RichText
    private conversor: Conversor
    private validator: Validator

    constructor(config: CircleTextProps) {
        // Inicializa o gerenciador de validação com regras customizadas
        this.conversor = new Conversor()
        this.validator = new Validator(config.validationRules)
        this.richText = new RichText()
        this.validate = {
            username: this.validator.username.bind(this.validator),
            hashtag: this.validator.hashtag.bind(this.validator),
            url: this.validator.url.bind(this.validator),
            description: this.validator.description.bind(this.validator),
            name: this.validator.name.bind(this.validator),
            password: this.validator.password.bind(this.validator)
        }

        this.extract = {
            content: (text: string, options?: ExtractOptions) => {
                const extractor = new Extractor(text)
                // Se nenhuma opção fornecida, extrair tudo por padrão
                if (options === undefined) {
                    return extractor.extract({ mentions: true, hashtags: true, urls: true })
                }
                return extractor.extract(options)
            },
            keywords: (text: string): string[] =>
                new KeywordExtractor(config.keywordConfig).extract(text),

            sentiment: (text: string): SentimentReturnProps =>
                new SentimentExtractor(config.sentimentConfig).analyze(text)
        }
        this.transform = {
            number: {
                formatWithDots: this.conversor.formatNumWithDots,
                convertToShortUnitText: this.conversor.convertNumToShortUnitText,
                formatSliceWithDots: this.conversor.formatSliceNumWithDots
            },
            text: {
                capitalizeFirstLetter: this.conversor.capitalizeFirstLetter,
                richText: this.richText
            },
            timezone: new Timezone(config.timezoneConfig?.timezoneCode ?? TimezoneCodes.UTC)
        }
    }
}
