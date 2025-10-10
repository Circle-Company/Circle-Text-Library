// Copyright 2025 Circle Company, Inc.
// Licensed under the Circle License, Version 1.0

import { ConversorConfig } from "./classes/conversor"
import { DateFormatterConfig } from "./classes/date"
import { ExtractorConfig } from "./classes/extractor"
import { RichTextConfig } from "./classes/rich.text"
import { SentimentExtractorConfig } from "./classes/sentiment"

// ============================================================================
// Configuração Principal
// ============================================================================

export interface CircleTextProps {
    conversorConfig?: ConversorConfig // Configuração opcional do conversor (cortar texto)
    dateFormatterConfig?: DateFormatterConfig // Configuração opcional do formatador de datas
    extractorConfig?: ExtractorConfig // Configuração opcional do extrator (keywords, entities)
    richTextConfig?: RichTextConfig // Configuração opcional do rich text (prefixos de entidades)
    sentimentConfig?: SentimentExtractorConfig // Configuração opcional do extrator de sentimento
    validationRules: ValidationConfig // Regras obrigatórias de validação
}

// ============================================================================
// Tipos de Extração
// ============================================================================

export interface ExtractOptions {
    mentions?: boolean
    hashtags?: boolean
    urls?: boolean
}

export interface PartialExtractResult {
    mentions?: string[]
    hashtags?: string[]
    urls?: string[]
}

// ============================================================================
// Tipos de Validação
// ============================================================================

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
