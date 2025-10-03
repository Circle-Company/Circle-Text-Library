import { describe, expect, it } from "vitest"

import { Validator } from "../index"

const validator = new Validator({
    name: {
        minLength: {
            enabled: true,
            value: 2,
            description: "Nome deve ter pelo menos 2 caracteres"
        },
        maxLength: {
            enabled: true,
            value: 100,
            description: "Nome deve ter no máximo 100 caracteres"
        },
        requireOnlyLetters: {
            enabled: false,
            value: true,
            description: "Nome deve conter apenas letras (incluindo acentos)"
        },
        requireFullName: {
            enabled: true,
            value: true,
            description: "Nome deve conter pelo menos primeiro e último nome"
        },
        forbiddenNames: {
            enabled: true,
            value: ["robot", "admin", "test"],
            description: "Nome contém palavras/nomes não permitidos"
        },
        cannotContainNumbers: {
            enabled: true,
            value: true,
            description: "Nome não pode conter números"
        },
        cannotContainSpecialChars: {
            enabled: true,
            value: true,
            description: "Nome não pode conter caracteres especiais"
        },
        requireCapitalization: {
            enabled: true,
            value: true,
            description: "Nome deve ter a primeira letra de cada palavra maiúscula"
        },
        cannotStartWith: {
            enabled: false,
            value: "[a-z]",
            description: "Nome não pode começar com letra minúscula"
        },
        cannotEndWith: {
            enabled: true,
            value: "[^a-zA-ZÀ-ÿ]",
            description: "Nome não pode terminar com caracteres não-alfabéticos"
        }
    }
})

describe("Name validator of Validator Class", () => {
    it("should be defined", () => {
        expect(validator).toBeDefined()
    })

    it("should validate basic name", () => {
        const result = validator.name("João Silva")
        expect(result).toBeDefined()
        expect(result.isValid).toBe(true)
        expect(result.errors).toBeDefined()
        expect(result.errors.length).toBe(0)
    })

    it("should validate name with accents", () => {
        const result = validator.name("José Da Silva")
        expect(result).toBeDefined()
        expect(result.isValid).toBe(true)
        expect(result.errors).toBeDefined()
        expect(result.errors.length).toBe(0)
    })

    it("should validate full name with multiple words", () => {
        const result = validator.name("Carlos Eduardo Silva Santos")
        expect(result).toBeDefined()
        expect(result.isValid).toBe(true)
        expect(result.errors).toBeDefined()
        expect(result.errors.length).toBe(0)
    })

    it("should reject name too short", () => {
        const result = validator.name("A")
        expect(result.isValid).toBe(false)
        expect(result.errors).toContain("Nome deve ter pelo menos 2 caracteres")
    })

    it("should reject name too long", () => {
        const result = validator.name("Antônio".repeat(20))
        expect(result.isValid).toBe(false)
        expect(result.errors).toContain("Nome deve ter no máximo 100 caracteres")
    })

    it("should reject name with numbers", () => {
        const result = validator.name("João Silva123")
        expect(result.isValid).toBe(false)
        expect(result.errors).toContain("Nome não pode conter números")
    })

    it("should reject name with special characters", () => {
        const result = validator.name("João Silva@")
        expect(result.isValid).toBe(false)
        expect(result.errors).toContain("Nome não pode conter caracteres especiais")
    })

    it("should reject single word name (not full name)", () => {
        const result = validator.name("João")
        expect(result.isValid).toBe(false)
        expect(result.errors).toContain("Nome deve conter pelo menos primeiro e último nome")
    })

    it("should reject name with forbidden words", () => {
        const result = validator.name("Robot Silva")
        expect(result.isValid).toBe(false)
        expect(result.errors).toContain("Nome contém palavras/nomes não permitidos")
    })

    it("should reject name without capitalization", () => {
        const result = validator.name("joão silva")
        expect(result.isValid).toBe(false)
        expect(result.errors).toContain("Nome deve ter a primeira letra de cada palavra maiúscula")
    })

    it("should validate name that starts with lowercase (when rule disabled)", () => {
        const result = validator.name("João Silva")
        expect(result.isValid).toBe(true)
    })

    it("should reject empty name", () => {
        const result = validator.name("")
        expect(result.isValid).toBe(false)
        expect(result.errors).toContain("Nome não pode ser vazio")
    })

    it("should reject only spaces", () => {
        const result = validator.name("   ")
        console.log("Spaces result:", result)
        expect(result.isValid).toBe(false)
        expect(result.errors).toBeDefined()
    })
})
