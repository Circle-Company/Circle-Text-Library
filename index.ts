// Copyright 2025 Circle Company, Inc.
// Licensed under the Circle License, Version 1.0

import {
    HashtagValidatorFunctionProps,
    HashtagsExtractorProps,
    KeywordsExtractorProps,
    MentionsExtractorProps,
    SentimentAnalizeFunctionProps,
    UrlValidatorFunctionProps,
    UrlsExtractorProps,
    UsernameValidatorFunctionProps
} from "@/types"
import { KeywordExtractor, KeywordExtractorConfig } from "./src/classes/keywordExtractor"
import {
    SentimentExtractor,
    SentimentExtractorConfig,
    SentimentReturnProps
} from "./src/classes/sentimentExtractor"
import { Timezone, TimezoneCodes, TimezoneConfig } from "./src/classes/timezone"
import {
    capitalizeFirstLetter,
    convertNumToShortUnitText,
    formatNumWithDots,
    formatSliceNumWithDots
} from "./src/conversor"
import {
    extractHashtags,
    extractMentions,
    extractUrls,
    isValidHashtag,
    isValidUrl,
    isValidUsername
} from "./src/validators"

export interface CircleTextAnalize {
    sentiment: SentimentAnalizeFunctionProps
}

export interface CircleTextValidation {
    username: UsernameValidatorFunctionProps
    hashtag: HashtagValidatorFunctionProps
    url: UrlValidatorFunctionProps
}
export interface CircleTextExtract {
    mentions: MentionsExtractorProps
    hashtags: HashtagsExtractorProps
    urls: UrlsExtractorProps
    keywords: KeywordsExtractorProps
}

export interface CircleTextTransform {
    number: {
        formatWithDots: (num: number) => string
        convertToShortUnitText: (number: number) => string
        formatSliceWithDots: (props: { text: string; size: number }) => string
    }
    text: {
        capitalizeFirstLetter: (text: string) => string
    }
    timezone: Timezone
}

// Props de configuração (caso queira extender futuramente)
export interface CircleTextProps {
    keywordConfig?: KeywordExtractorConfig // Configuração opcional do extrator de keywords
    sentimentConfig?: SentimentExtractorConfig // Configuração opcional do extrator de sentimento
    timezoneConfig?: TimezoneConfig // Configuração opcional do timezone
}

// Classe principal
export class CircleText {
    public analize: CircleTextAnalize
    public validate: CircleTextValidation
    public extract: CircleTextExtract
    public transform: CircleTextTransform

    constructor(config?: CircleTextProps) {
        this.analize = {
            sentiment: (text: string): SentimentReturnProps =>
                new SentimentExtractor(config?.sentimentConfig).analyze(text)
        }

        this.validate = {
            username: isValidUsername,
            hashtag: isValidHashtag,
            url: isValidUrl
        }

        this.extract = {
            mentions: extractMentions,
            hashtags: extractHashtags,
            urls: extractUrls,
            keywords: (text: string): string[] =>
                new KeywordExtractor(config?.keywordConfig).extract(text)
        }

        this.transform = {
            timezone: new Timezone(config?.timezoneConfig?.timezoneCode ?? TimezoneCodes.UTC),
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
