// Copyright 2025 Circle LLC
// Licensed under the MIT License

// Configuração de regras enxuta e segura: escalares, charset declarativo e regex
// como escape hatch. `defineRules` é um PRÉ-PROCESSADOR puro: converte a config
// terse na ValidationConfig verbosa que o motor do Validator já consome — sem tocar
// no motor. Strings cruas passam direto (back-compat).

import type { ValidationConfig, ValidationRule } from "./validator.types.js"
import type { RuleInput, TerseValidationConfig } from "./charset.types.js"

// Reexporta os tipos públicos para manter a superfície de import existente.
export type * from "./charset.types.js"

const escapeClassBody = (s: string): string => s.replace(/[\]\\^-]/g, "\\$&")

/** Classe de caracteres composável e escapada. */
export class CharSet {
    constructor(private readonly body: string = "") {}
    private add(part: string): CharSet {
        return new CharSet(this.body + part)
    }
    get lower(): CharSet {
        return this.add("a-z")
    }
    get upper(): CharSet {
        return this.add("A-Z")
    }
    get digit(): CharSet {
        return this.add("0-9")
    }
    get alpha(): CharSet {
        return this.add("a-zA-Z")
    }
    get alnum(): CharSet {
        return this.add("a-zA-Z0-9")
    }
    get accented(): CharSet {
        return this.add("À-ÿ")
    }
    get space(): CharSet {
        return this.add("\\s")
    }
    chars(literal: string): CharSet {
        return this.add(escapeClassBody(literal))
    }
    /** corpo da classe, ex.: "a-z0-9_" */
    toClassBody(): string {
        return this.body
    }
    /** classe entre colchetes, ex.: "[a-z0-9_]" */
    toClass(): string {
        return `[${this.body}]`
    }
    /** lista de caracteres literais (desfaz o escape) p/ a regra de consecutivos */
    toCharList(): string {
        return this.body.replace(/\\([\]\\^-])/g, "$1")
    }
}

export const charset = new CharSet()
export const chars = (literal: string): CharSet => new CharSet().chars(literal)

/** Escape hatch: um regex cru usado como está. */
export class Pattern {
    constructor(public readonly re: RegExp) {}
    get source(): string {
        return this.re.source
    }
}
export const pattern = (re: RegExp): Pattern => new Pattern(re)

// Regras que NÃO embrulham em colchetes (a engine usa a lista literal de caracteres)
const CHAR_LIST_KEYS = new Set(["cannotContainConsecutive"])

function valueFor(key: string, v: unknown): unknown {
    if (v instanceof CharSet) return CHAR_LIST_KEYS.has(key) ? v.toCharList() : v.toClass()
    if (v instanceof Pattern) return v.source
    return v
}

function isRecord(v: unknown): v is Record<string, unknown> {
    return typeof v === "object" && v !== null && !(v instanceof CharSet) && !(v instanceof Pattern)
}

function normalizeRule(key: string, input: RuleInput | undefined): ValidationRule | undefined {
    if (input === undefined || input === null) return undefined
    if (input === false) return { enabled: false }
    // já é uma ValidationRule (forma verbosa) → passa direto, só converte CharSet/Pattern no value
    if (isRecord(input) && "enabled" in input) {
        const r = input as ValidationRule
        return r.value === undefined ? r : ({ ...r, value: valueFor(key, r.value) } as ValidationRule)
    }
    // forma longa { value, message? }
    if (isRecord(input) && "value" in input) {
        const o = input as { value: unknown; message?: string; enabled?: boolean }
        return {
            enabled: o.enabled ?? true,
            value: valueFor(key, o.value),
            ...(o.message ? { description: o.message } : {})
        } as ValidationRule
    }
    // escalar / CharSet / Pattern
    return { enabled: true, value: valueFor(key, input) } as ValidationRule
}

/**
 * Converte a config enxuta na ValidationConfig verbosa. Idempotente sobre configs
 * já verbosas (passam inalteradas), então é seguro envolver configs existentes.
 */
export function defineRules(terse: TerseValidationConfig): ValidationConfig {
    const out: Record<string, Record<string, ValidationRule>> = {}
    for (const type of Object.keys(terse)) {
        const rules = terse[type as keyof ValidationConfig]
        if (!rules) continue
        const norm: Record<string, ValidationRule> = {}
        for (const key of Object.keys(rules)) {
            const r = normalizeRule(key, rules[key])
            if (r) norm[key] = r
        }
        out[type] = norm
    }
    return out as ValidationConfig
}
