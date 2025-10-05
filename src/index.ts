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
import {
    capitalizeFirstLetter,
    convertNumToShortUnitText,
    formatNumWithDots,
    formatSliceNumWithDots
} from "./conversor/index.js"

import { ExtractOptions } from "./types"
import { Extractor } from "./classes/extractor.js"
import { KeywordExtractor } from "./classes/keywordExtractor.js"
import { Validator } from "./classes/validator/index.js"

// Classe principal
export class CircleTextLibrary {
    public validate: CircleTextValidation
    public extract: CircleTextExtract
    public transform: CircleTextTransform
    private validator: Validator

    constructor(config: CircleTextProps) {
        // Inicializa o gerenciador de validação com regras customizadas
        this.validator = new Validator(config.validationRules)

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
            timezone: new Timezone(config.timezoneConfig?.timezoneCode ?? TimezoneCodes.UTC),
            text: {
                capitalizeFirstLetter: capitalizeFirstLetter
            },
            number: {
                formatWithDots: formatNumWithDots,
                convertToShortUnitText: convertNumToShortUnitText,
                formatSliceWithDots: formatSliceNumWithDots
            }
        }
    }
}
