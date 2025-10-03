import { describe, expect, it } from "vitest"

import { Validator } from "../index"

const validator = new Validator({
    description: {
        minLength: {
            enabled: true,
            value: 10,
            description: "Descrição deve ter pelo menos 10 caracteres"
        },
        maxLength: {
            enabled: true,
            value: 200,
            description: "Descrição não pode exceder 200 caracteres"
        },
        allowedCharacters: {
            enabled: false,
            value: "[a-zA-Z0-9 .,!?'\"-]",
            description: "Caracteres permitidos na descrição"
        },
        forbiddenWords: {
            enabled: true,
            value: ["spam", "fake", "bot"],
            description: "Descrição contém palavras não permitidas"
        },
        requireAlphanumeric: {
            enabled: true,
            value: true,
            description: "Descrição deve conter pelo menos um caractere alfanumérico"
        },
        cannotStartWith: {
            enabled: true,
            value: "[0-9_-]",
            description: "Descrição não pode começar com número, underscore ou hífen"
        },
        cannotEndWith: {
            enabled: false,
            value: ".",
            description: "Descrição não pode terminar com ponto"
        },
        allowUrls: {
            enabled: false,
            value: false,
            description: "URLs não são permitidas na descrição"
        },
        allowMentions: {
            enabled: false,
            value: false,
            description: "Menções (@usuario) não são permitidas na descrição"
        },
        allowHashtags: {
            enabled: false,
            value: false,
            description: "Hashtags (#tema) não são permitidas na descrição"
        }
    }
})

describe("Description validator of Validator Class", () => {
    it("should be defined", () => {
        expect(validator).toBeDefined()
    })

    it("should validate basic description", () => {
        const result = validator.description("Valid description here")
        expect(result).toBeDefined()
        expect(result.isValid).toBe(true)
        expect(result.errors).toBeDefined()
        expect(result.errors.length).toBe(0)
    })

    it("should validate description with punctuation", () => {
        const result = validator.description("Description with punctuation! Done")
        expect(result).toBeDefined()
        expect(result.isValid).toBe(true)
        expect(result.errors).toBeDefined()
        expect(result.errors.length).toBe(0)
    })

    it("should reject description too short", () => {
        const result = validator.description("Curta")
        expect(result.isValid).toBe(false)
        expect(result.errors).toContain("Descrição deve ter pelo menos 10 caracteres")
    })

    it("should reject description too long", () => {
        const result = validator.description("a".repeat(250))
        expect(result.isValid).toBe(false)
        expect(result.errors).toContain("Descrição não pode exceder 200 caracteres")
    })

    it("should validate description with invalid characters (when rule disabled)", () => {
        const result = validator.description("Valid description with @ symbols!")
        expect(result.isValid).toBe(true)
    })

    it("should reject description with forbidden words", () => {
        const result = validator.description("Esta é uma descrição com spam")
        expect(result.isValid).toBe(false)
        expect(result.errors).toContain("Descrição contém palavras não permitidas")
    })

    it("should reject description without alphanumeric chars", () => {
        const result = validator.description("!!! ??? ...")
        expect(result.isValid).toBe(false)
        expect(result.errors).toContain(
            "Descrição deve conter pelo menos um caractere alfanumérico"
        )
    })

    it("should reject description starting with number", () => {
        const result = validator.description("123 Esta é uma descrição")
        expect(result.isValid).toBe(false)
        expect(result.errors).toContain(
            "Descrição não pode começar com número, underscore ou hífen"
        )
    })

    it("should reject description starting with underscore", () => {
        const result = validator.description("_Esta é uma descrição")
        expect(result.isValid).toBe(false)
        expect(result.errors).toContain(
            "Descrição não pode começar com número, underscore ou hífen"
        )
    })

    it("should reject description starting with hyphen", () => {
        const result = validator.description("-Esta é uma descrição")
        expect(result.isValid).toBe(false)
        expect(result.errors).toContain(
            "Descrição não pode começar com número, underscore ou hífen"
        )
    })

    it("should validate description ending with dot (when rule disabled)", () => {
        const result = validator.description("Valid description ending with point.")
        expect(result.isValid).toBe(true)
    })

    it("should validate description with special elements", () => {
        // Este teste afirma que com regras desabilitadas, elementos especiais são aceitos
        const result = validator.description(
            "Valid description with https://example.com @user and #topic"
        )
        expect(result.isValid).toBe(true)
    })

    it("should reject empty description", () => {
        const result = validator.description("")
        expect(result.isValid).toBe(false)
        expect(result.errors).toContain("Descrição não pode ser vazia")
    })
})
