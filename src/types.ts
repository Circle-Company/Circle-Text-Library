// Copyright 2025 Circle Company, Inc.
// Licensed under the Circle License, Version 1.0

import { SentimentExtractorConfig, SentimentReturnProps } from "./classes/sentimentExtractor"
import { Timezone, TimezoneConfig } from "./classes/timezone"

import { KeywordExtractorConfig } from "./classes/keywordExtractor"
import { RichText } from "./classes/rich.text"
import { Validator } from "./classes/validator"

export interface CircleTextAnalize {
    sentiment: SentimentAnalizeFunctionProps
}

export interface CircleTextValidation {
    username: (username: string, rules?: UsernameValidationRules) => ValidationResult
    hashtag: (hashtag: string, rules?: HashtagValidationRules) => ValidationResult
    url: (url: string, requireProtocol?: boolean, rules?: UrlValidationRules) => ValidationResult
    description: (description: string, rules?: DescriptionValidationRules) => ValidationResult
    name: (name: string, rules?: NameValidationRules) => ValidationResult
    password: (password: string, rules?: PasswordValidationRules) => ValidationResult
}

export interface CircleTextExtract {
    content: (text: string, options?: ExtractOptions) => PartialExtractResult
    keywords: KeywordsExtractorProps
    sentiment: SentimentAnalizeFunctionProps
}

export interface CircleTextTransform {
    number: {
        formatWithDots: (num: number) => string
        convertToShortUnitText: (number: number) => string
        formatSliceWithDots: (props: { text: string; size: number }) => string
    }
    text: {
        capitalizeFirstLetter: (text: string) => string
        richText: RichText
    }
    timezone: Timezone
}

// Props de configuração (caso queira extender futuramente)
export interface CircleTextProps {
    keywordConfig?: KeywordExtractorConfig // Configuração opcional do extrator de keywords
    sentimentConfig?: SentimentExtractorConfig // Configuração opcional do extrator de sentimento
    timezoneConfig?: TimezoneConfig // Configuração opcional do timezone
    validationRules: ValidationConfig // Regras obrigatórias de validação
}

// Extractor types
export interface ExtractOptions {
    mentions?: boolean
    hashtags?: boolean
    urls?: boolean
}

export interface KeywordsExtractorProps {
    (text: string): string[]
}

export interface PartialExtractResult {
    mentions?: string[]
    hashtags?: string[]
    urls?: string[]
}
export interface SentimentAnalizeFunctionProps {
    (text: string): SentimentReturnProps
}

// Validator types

export interface ValidationRule {
    enabled: boolean
    value?: string | number | boolean | RegExp | string[]
    description?: string
}

export interface UsernameValidationRules {
    minLength?: ValidationRule
    maxLength?: ValidationRule
    allowedCharacters?: ValidationRule
    cannotStartWith?: ValidationRule
    cannotEndWith?: ValidationRule
    cannotContainConsecutive?: ValidationRule
    allowAtPrefix?: ValidationRule
    allowedSpecialCharacters?: ValidationRule
    forbiddenSpecialCharacters?: ValidationRule
    onlyAlphaNumeric?: ValidationRule
    requireSpecialCharacters?: ValidationRule
}

export interface HashtagValidationRules {
    requiredPrefix?: ValidationRule
    minLength?: ValidationRule
    maxLength?: ValidationRule
    allowedCharacters?: ValidationRule
    cannotStartWith?: ValidationRule
    cannotEndWith?: ValidationRule
}

export interface UrlValidationRules {
    requireProtocol?: ValidationRule
    allowedProtocols?: ValidationRule
    minLength?: ValidationRule
    maxLength?: ValidationRule
}

export interface NameValidationRules {
    minLength?: ValidationRule
    maxLength?: ValidationRule
    allowedCharacters?: ValidationRule
    requireOnlyLetters?: ValidationRule
    requireFullName?: ValidationRule
    forbiddenNames?: ValidationRule
    cannotContainNumbers?: ValidationRule
    cannotContainSpecialChars?: ValidationRule
    requireCapitalization?: ValidationRule
    cannotStartWith?: ValidationRule
    cannotEndWith?: ValidationRule
}

export interface PasswordValidationRules {
    minLength?: ValidationRule
    maxLength?: ValidationRule
    requireUppercase?: ValidationRule
    requireLowercase?: ValidationRule
    requireNumbers?: ValidationRule
    requireSpecialChars?: ValidationRule
    allowedSpecialChars?: ValidationRule
    forbiddenSpecialChars?: ValidationRule
    requireCommonPasswords?: ValidationRule
    forbiddenWords?: ValidationRule
    cannotContainUsername?: ValidationRule
    cannotContainEmail?: ValidationRule
    cannotStartWith?: ValidationRule
    cannotEndWith?: ValidationRule
    cannotBeRepeatedChars?: ValidationRule
    cannotBeSequentialChars?: ValidationRule
    requireDigitAtPosition?: ValidationRule
}

export interface DescriptionValidationRules {
    minLength?: ValidationRule
    maxLength?: ValidationRule
    allowedCharacters?: ValidationRule
    forbiddenWords?: ValidationRule
    requireAlphanumeric?: ValidationRule
    cannotStartWith?: ValidationRule
    cannotEndWith?: ValidationRule
    allowUrls?: ValidationRule
    allowMentions?: ValidationRule
    allowHashtags?: ValidationRule
}

export interface ValidationConfig {
    username?: UsernameValidationRules
    hashtag?: HashtagValidationRules
    url?: UrlValidationRules
    description?: DescriptionValidationRules
    name?: NameValidationRules
    password?: PasswordValidationRules
}

export interface ValidationResult {
    isValid: boolean
    errors: string[]
}
