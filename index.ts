// Copyright 2025 Circle Company, Inc.
// Licensed under the Circle License, Version 1.0

import {
    isValidUsername,
    extractMentions,
    isValidHashtag,
    extractHashtags,
    isValidUrl,
    extractUrls
} from "./src/validators"

import { KeywordExtractor, KeywordExtractorConfig } from "./src/classes/keywordExtractor"
import {
    SentimentExtractor,
    SentimentExtractorConfig,
    SentimentReturnProps
} from "./src/classes/sentimentExtractor"
import {
    UsernameValidatorFunctionProps,
    UrlValidatorFunctionProps,
    HashtagValidatorFunctionProps,
    MentionsExtractorProps,
    HashtagsExtractorProps,
    UrlsExtractorProps,
    KeywordsExtractorProps,
    SentimentAnalizeFunctionProps
} from "@/types"

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

// Props de configuração (caso queira extender futuramente)
export interface CircleTextProps {
    keywordConfig?: KeywordExtractorConfig // Configuração opcional do extrator de keywords
    sentimentConfig?: SentimentExtractorConfig // Configuração opcional do extrator de sentimento
}

// Classe principal
export class CircleText {
    public analize: CircleTextAnalize
    public validate: CircleTextValidation
    public extract: CircleTextExtract

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
    }
}
