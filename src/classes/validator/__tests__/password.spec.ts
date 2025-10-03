import { describe, expect, it } from "vitest"

import { Validator } from "../index"

const validator = new Validator({
    password: {
        minLength: {
            enabled: true,
            value: 8,
            description: "Senha deve ter pelo menos 8 caracteres"
        },
        maxLength: {
            enabled: true,
            value: 32,
            description: "Senha deve ter no máximo 32 caracteres"
        },
        requireUppercase: {
            enabled: true,
            value: true,
            description: "Senha deve conter pelo menos uma letra maiúscula"
        },
        requireLowercase: {
            enabled: true,
            value: true,
            description: "Senha deve conter pelo menos uma letra minúscula"
        },
        requireNumbers: {
            enabled: true,
            value: true,
            description: "Senha deve conter pelo menos um número"
        },
        requireSpecialChars: {
            enabled: true,
            value: true,
            description: "Senha deve conter pelo menos um caractere especial"
        },
        allowedSpecialChars: {
            enabled: true,
            value: "!@#$%^&*",
            description: "Senha contém caracteres especiais não permitidos"
        },
        requireCommonPasswords: {
            enabled: true,
            value: true,
            description: "Senha muito comum não é permitida"
        },
        forbiddenWords: {
            enabled: true,
            value: ["admin", "root", "password"],
            description: "Senha contém palavra proibida"
        },
        cannotContainUsername: {
            enabled: true,
            value: "testuser",
            description: "Senha não pode conter nome de usuário"
        },
        cannotStartWith: {
            enabled: true,
            value: "[0-9]",
            description: "Senha não pode começar com número"
        },
        cannotEndWith: {
            enabled: true,
            value: "[^a-zA-Z]",
            description: "Senha não pode terminar com caractere não-alfabético"
        },
        cannotBeRepeatedChars: {
            enabled: true,
            value: true,
            description: "Senha não pode conter caracteres repetidos consecutivos"
        },
        cannotBeSequentialChars: {
            enabled: true,
            value: true,
            description: "Senha não pode conter sequências sequenciais"
        }
    }
})

describe("Password validator of Validator Class", () => {
    it("should be defined", () => {
        expect(validator).toBeDefined()
    })

    it("should validate strong password", () => {
        const result = validator.password("MyStr0ng!A")
        expect(result).toBeDefined()
        expect(result.isValid).toBe(true)
        expect(result.errors).toBeDefined()
        expect(result.errors.length).toBe(0)
    })

    it("should validate password with mixed case and special chars", () => {
        const result = validator.password("SecureP@ss1A")
        expect(result).toBeDefined()
        expect(result.isValid).toBe(true)
        expect(result.errors).toBeDefined()
        expect(result.errors.length).toBe(0)
    })

    it("should reject password too short", () => {
        const result = validator.password("Str0!")
        expect(result.isValid).toBe(false)
        expect(result.errors).toContain("Senha deve ter pelo menos 8 caracteres")
    })

    it("should reject password too long", () => {
        const result = validator.password("A".repeat(35))
        expect(result.isValid).toBe(false)
        expect(result.errors).toContain("Senha deve ter no máximo 32 caracteres")
    })

    it("should reject password without uppercase", () => {
        const result = validator.password("mypass123!|")
        expect(result.isValid).toBe(false)
        expect(result.errors).toContain("Senha deve conter pelo menos uma letra maiúscula")
    })

    it("should reject password without lowercase", () => {
        const result = validator.password("MYPASS123!")
        expect(result.isValid).toBe(false)
        expect(result.errors).toContain("Senha deve conter pelo menos uma letra minúscula")
    })

    it("should reject password without numbers", () => {
        const result = validator.password("MyPassword!")
        expect(result.isValid).toBe(false)
        expect(result.errors).toContain("Senha deve conter pelo menos um número")
    })

    it("should reject password without special chars", () => {
        const result = validator.password("MyPassword123")
        expect(result.isValid).toBe(false)
        expect(result.errors).toContain("Senha deve conter pelo menos um caractere especial")
    })

    it("should reject password with forbidden special chars", () => {
        const result = validator.password("MyPass123<>")
        expect(result.isValid).toBe(false)
        expect(result.errors).toContain("Senha contém caracteres especiais não permitidos")
    })

    it("should reject common password", () => {
        const result = validator.password("password")
        expect(result.isValid).toBe(false)
        expect(result.errors).toContain("Senha muito comum não é permitida")
    })

    it("should reject password with forbidden words", () => {
        const result = validator.password("admin123!")
        expect(result.isValid).toBe(false)
        expect(result.errors).toContain("Senha contém palavra proibida")
    })

    it("should reject password containing username", () => {
        const result = validator.password("testuser123!")
        expect(result.isValid).toBe(false)
        expect(result.errors).toContain("Senha não pode conter nome de usuário")
    })

    it("should reject password starting with number", () => {
        const result = validator.password("1MyPass!")
        expect(result.isValid).toBe(false)
        expect(result.errors).toContain("Senha não pode começar com número")
    })

    it("should reject password ending with non-alphabetic", () => {
        const result = validator.password("MyPass1!")
        expect(result.isValid).toBe(false)
        expect(result.errors).toContain("Senha não pode terminar com caractere não-alfabético")
    })

    it("should reject password with repeated chars", () => {
        const result = validator.password("MyPass111!")
        expect(result.isValid).toBe(false)
        expect(result.errors).toContain("Senha não pode conter caracteres repetidos consecutivos")
    })

    it("should reject password with sequential chars", () => {
        const result = validator.password("MyPass123@")
        expect(result.isValid).toBe(false)
        expect(result.errors).toContain("Senha não pode conter sequências sequenciais")
    })

    it("should reject empty password", () => {
        const result = validator.password("")
        expect(result.isValid).toBe(false)
        expect(result.errors).toContain("Senha não pode ser vazia")
    })
})
