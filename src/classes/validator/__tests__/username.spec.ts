import { describe, expect, it } from "vitest"

import { Validator } from "../index"

const validator = new Validator({
    username: {
        minLength: {
            enabled: true,
            value: 4,
            description: "Mínimo 4 caracteres"
        },
        maxLength: {
            enabled: true,
            value: 20,
            description: "Máximo 20 caracteres"
        },
        allowedCharacters: {
            enabled: true,
            value: "[a-z0-9_].",
            description: "Apenas letras minúsculas, números e underscore"
        },
        cannotStartWith: {
            enabled: true,
            value: "_.",
            description: "Não pode começar com underscore ou ponto"
        },
        cannotContainConsecutive: {
            enabled: true,
            value: "._",
            description: "Não pode conter pontos '.' ou underscores consecutivos"
        },
        cannotEndWith: {
            enabled: true,
            value: "_",
            description: "Não pode terminar com underscore"
        },
        allowAtPrefix: {
            enabled: true,
            value: "@",
            description: "Permite prefixo @"
        }
    }
})

describe("Username validator of Validator Class", () => {
    it("should be defined", () => {
        expect(validator).toBeDefined()
    })
    it("should valid basic username", () => {
        const result = validator.username("validuser") // Sem underscore nem pontos
        expect(result).toBeDefined()
        expect(result.isValid).toBe(true)
        expect(result.errors).toBeDefined()
        expect(result.errors.length).toBe(0)
    })

    it("should valid username with '.'", () => {
        const result = validator.username("valid.user")
        expect(result).toBeDefined()
        expect(result.isValid).toBe(true)
        expect(result.errors).toBeDefined()
        expect(result.errors.length).toBe(0)
    })
    it("should valid username with '@' prefix", () => {
        const result = validator.username("@validuser")
        expect(result).toBeDefined()
        expect(result.isValid).toBe(true)
        expect(result.errors).toBeDefined()
        expect(result.errors.length).toBe(0)
    })

    it("should reject usernames starting or ending with underscore", () => {
        // Teste começando com underscore
        const result1 = validator.username("_invalid")
        expect(result1.isValid).toBe(false)
        expect(result1.errors).toContain("Não pode começar com underscore ou ponto")

        // Teste terminando com underscore
        const result2 = validator.username("invalid_")
        expect(result2.isValid).toBe(false)
        expect(result2.errors).toContain("Não pode terminar com underscore")
    })

    it("should reject usernames with consecutive dots and underscores characters", () => {
        // Teste com ponto consecutivo
        const result1 = validator.username("user..test")
        expect(result1.isValid).toBe(false)
        expect(result1.errors).toContain("Não pode conter pontos '.' ou underscores consecutivos")

        // Teste com underscore consecutivo
        const result2 = validator.username("user__test")
        expect(result2.isValid).toBe(false)
        expect(result2.errors).toContain("Não pode conter pontos '.' ou underscores consecutivos")

        // Username válido sem caracteres consecutivos
        const result3 = validator.username("user.test")
        expect(result3.isValid).toBe(true)
    })
})
