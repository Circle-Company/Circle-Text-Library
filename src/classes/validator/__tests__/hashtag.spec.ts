import { describe, expect, it } from "vitest"

import { Validator } from "../index"

const validator = new Validator({
    hashtag: {
        requiredPrefix: {
            enabled: true,
            value: "#",
            description: "Hashtag deve começar com #"
        },
        minLength: {
            enabled: true,
            value: 4,
            description: "Mínimo 4 caracteres incluindo o #"
        },
        maxLength: {
            enabled: true,
            value: 20,
            description: "Máximo 20 caracteres incluindo o #"
        },
        allowedCharacters: {
            enabled: true,
            value: "[a-zA-Z0-9#]",
            description: "Apenas letras e números são permitidos"
        },
        cannotStartWith: {
            enabled: true,
            value: "[0-9]",
            description: "Hashtag não pode começar com número"
        },
        cannotEndWith: {
            enabled: true,
            value: "_",
            description: "Hashtag não pode terminar com underscore"
        }
    }
})

describe("Hashtag validator of Validator Class", () => {
    it("should be defined", () => {
        expect(validator).toBeDefined()
    })

    it("should validate basic hashtag", () => {
        const result = validator.hashtag("#test")
        expect(result).toBeDefined()
        expect(result.isValid).toBe(true)
        expect(result.errors).toBeDefined()
        expect(result.errors.length).toBe(0)
    })

    it("should validate hashtag with numbers", () => {
        const result = validator.hashtag("#test123")
        expect(result).toBeDefined()
        expect(result.isValid).toBe(true)
        expect(result.errors).toBeDefined()
        expect(result.errors.length).toBe(0)
    })

    it("should reject hashtag without prefix", () => {
        const result = validator.hashtag("test")
        expect(result.isValid).toBe(false)
        expect(result.errors).toContain("Hashtag deve começar com #")
    })

    it("should reject hashtag too short", () => {
        const result = validator.hashtag("#a")
        expect(result.isValid).toBe(false)
        expect(result.errors).toContain("Mínimo 4 caracteres incluindo o #")
    })

    it("should reject hashtag too long", () => {
        const result = validator.hashtag("#verylonghashtagthatexceedslimit")
        expect(result.isValid).toBe(false)
        expect(result.errors).toContain("Máximo 20 caracteres incluindo o #")
    })

    it("should reject hashtag with invalid characters", () => {
        const result = validator.hashtag("#test@invalid")
        expect(result.isValid).toBe(false)
        expect(result.errors).toContain("Apenas letras e números são permitidos")
    })

    it("should reject hashtag starting with number", () => {
        const result = validator.hashtag("#123test")
        expect(result.isValid).toBe(false)
        expect(result.errors).toContain("Hashtag não pode começar com número")
    })

    it("should reject hashtag ending with underscore", () => {
        const result = validator.hashtag("#test_")
        expect(result.isValid).toBe(false)
        expect(result.errors).toContain("Hashtag não pode terminar com underscore")
    })
})
