import { describe, expect, it } from "vitest"

import { Validator } from "../index"

const validator = new Validator({
    url: {
        minLength: {
            enabled: true,
            value: 10,
            description: "URL deve ter pelo menos 10 caracteres"
        },
        maxLength: {
            enabled: true,
            value: 2048,
            description: "URL não pode exceder 2048 caracteres"
        },
        requireProtocol: {
            enabled: true,
            value: true,
            description: "URL deve incluir protocolo (http:// ou https://)"
        },
        allowedProtocols: {
            enabled: true,
            value: ["http", "https"],
            description: "Apenas protocolos http e https são permitidos"
        }
    }
})

describe("URL validator of Validator Class", () => {
    it("should be defined", () => {
        expect(validator).toBeDefined()
    })

    it("should validate basic HTTP URL", () => {
        const result = validator.url("http://example.com")
        expect(result).toBeDefined()
        expect(result.isValid).toBe(true)
        expect(result.errors).toBeDefined()
        expect(result.errors.length).toBe(0)
    })

    it("should validate basic HTTPS URL", () => {
        const result = validator.url("https://example.com")
        expect(result).toBeDefined()
        expect(result.isValid).toBe(true)
        expect(result.errors).toBeDefined()
        expect(result.errors.length).toBe(0)
    })

    it("should validate URL with path", () => {
        const result = validator.url("https://example.com/path/to/page")
        expect(result).toBeDefined()
        expect(result.isValid).toBe(true)
        expect(result.errors).toBeDefined()
        expect(result.errors.length).toBe(0)
    })

    it("should reject URL too short", () => {
        const result = validator.url("http:")
        expect(result.isValid).toBe(false)
        expect(result.errors).toContain("URL deve ter pelo menos 10 caracteres")
    })

    it("should reject URL too long", () => {
        const result = validator.url("https://example.com/" + "a".repeat(2500))
        expect(result.isValid).toBe(false)
        expect(result.errors).toContain("URL não pode exceder 2048 caracteres")
    })

    it("should reject URL without protocol", () => {
        const result = validator.url("example.com")
        expect(result.isValid).toBe(false)
        expect(result.errors).toContain("URL deve incluir protocolo (http:// ou https://)")
    })

    it("should reject URL with disallowed protocol", () => {
        const result = validator.url("ftp://example.com")
        expect(result.isValid).toBe(false)
        expect(result.errors).toContain(
            "Protocolo 'ftp' não é permitido. Protocolos aceitos: http, https"
        )
    })

    it("should reject empty URL", () => {
        const result = validator.url("")
        expect(result.isValid).toBe(false)
        expect(result.errors).toContain("URL não pode ser vazia")
    })
})
