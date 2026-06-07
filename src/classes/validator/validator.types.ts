// Copyright 2025 Circle LLC
// Licensed under the MIT License

// Tipos de validação compartilhados pelo Validator.
//
// Uma regra é um `ValidationRule { enabled, value?, description? }`. Cada slot de
// validação (`username`, `hashtag`, …) é um conjunto de regras; o `Validator` lê
// cada uma, monta o `RegExp` dinâmico a partir de `value` e empilha `description`
// (ou a mensagem pt-BR padrão) em `errors[]`. Todos retornam `ValidationResult`.

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
