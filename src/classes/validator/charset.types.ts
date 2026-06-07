// Copyright 2025 Circle LLC
// Licensed under the MIT License

/**
 * Tipos públicos da config enxuta (`charset.ts`).
 *
 * `RuleInput` é tudo que uma regra terse aceita (escalar, `CharSet`, `Pattern`,
 * ou a forma verbosa); `TerseValidationConfig` é o mapa terse que `defineRules`
 * converte na `ValidationConfig`. A implementação vive em `./charset.ts`.
 */

import type { CharSet, Pattern } from "./charset.js"
import type { ValidationConfig, ValidationRule } from "./validator.types.js"

export type RuleInput =
    | number
    | string
    | boolean
    | CharSet
    | Pattern
    | ValidationRule
    | { value: unknown; message?: string; enabled?: boolean }

export type TerseValidationConfig = {
    [type in keyof ValidationConfig]?: Record<string, RuleInput | undefined>
}
