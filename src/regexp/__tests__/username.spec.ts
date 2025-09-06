import { describe, expect, it } from "vitest"

import { USERNAME_REGEX } from "../regex"

describe("USERNAME_REGEX", () => {
    describe("Casos válidos", () => {
        it("deve aceitar usernames simples", () => {
            expect(USERNAME_REGEX.test("user123")).toBe(true)
            expect(USERNAME_REGEX.test("test_user")).toBe(true)
            expect(USERNAME_REGEX.test("admin")).toBe(true)
        })

        it("deve aceitar usernames com @ no início", () => {
            expect(USERNAME_REGEX.test("@user123")).toBe(true)
            expect(USERNAME_REGEX.test("@test_user")).toBe(true)
        })

        it("deve aceitar usernames com pontos", () => {
            expect(USERNAME_REGEX.test("user.name")).toBe(true)
            expect(USERNAME_REGEX.test("test.user.name")).toBe(true)
            expect(USERNAME_REGEX.test("a.b")).toBe(true)
        })

        it("deve aceitar usernames com underscore", () => {
            expect(USERNAME_REGEX.test("user_name")).toBe(true)
            expect(USERNAME_REGEX.test("test_user_name")).toBe(true)
        })

        it("deve aceitar usernames mistos", () => {
            expect(USERNAME_REGEX.test("user123.name")).toBe(true)
            expect(USERNAME_REGEX.test("test_user.name123")).toBe(true)
            expect(USERNAME_REGEX.test("a1.b2_c3")).toBe(true)
        })

        it("deve aceitar username com exatamente 20 caracteres", () => {
            expect(USERNAME_REGEX.test("a".repeat(20))).toBe(true)
            expect(USERNAME_REGEX.test("user1234567890test")).toBe(true)
        })

        it("deve aceitar username com 1 caractere", () => {
            expect(USERNAME_REGEX.test("a")).toBe(true)
            expect(USERNAME_REGEX.test("1")).toBe(true)
        })
    })

    describe("Casos inválidos", () => {
        it("não deve aceitar usernames com mais de 20 caracteres", () => {
            expect(USERNAME_REGEX.test("a".repeat(21))).toBe(false)
            expect(USERNAME_REGEX.test("user1234567890test123")).toBe(false)
        })

        it("não deve aceitar usernames vazios", () => {
            expect(USERNAME_REGEX.test("")).toBe(false)
            expect(USERNAME_REGEX.test("@")).toBe(false)
        })

        it("não deve aceitar usernames que começam com ponto", () => {
            expect(USERNAME_REGEX.test(".user")).toBe(false)
            expect(USERNAME_REGEX.test(".test")).toBe(false)
            expect(USERNAME_REGEX.test("@.user")).toBe(false)
        })

        it("não deve aceitar usernames que terminam com ponto", () => {
            expect(USERNAME_REGEX.test("user.")).toBe(false)
            expect(USERNAME_REGEX.test("test.")).toBe(false)
            expect(USERNAME_REGEX.test("@user.")).toBe(false)
        })

        it("não deve aceitar usernames com pontos consecutivos", () => {
            expect(USERNAME_REGEX.test("user..name")).toBe(false)
            expect(USERNAME_REGEX.test("test...user")).toBe(false)
            expect(USERNAME_REGEX.test("a..b")).toBe(false)
        })

        it("não deve aceitar usernames com caracteres maiúsculos", () => {
            expect(USERNAME_REGEX.test("User123")).toBe(false)
            expect(USERNAME_REGEX.test("TEST_USER")).toBe(false)
            expect(USERNAME_REGEX.test("User.Name")).toBe(false)
        })

        it("não deve aceitar usernames com caracteres especiais", () => {
            expect(USERNAME_REGEX.test("user-name")).toBe(false)
            expect(USERNAME_REGEX.test("user@name")).toBe(false)
            expect(USERNAME_REGEX.test("user name")).toBe(false)
            expect(USERNAME_REGEX.test("user+name")).toBe(false)
            expect(USERNAME_REGEX.test("user#name")).toBe(false)
        })

        it("não deve aceitar apenas pontos", () => {
            expect(USERNAME_REGEX.test(".")).toBe(false)
            expect(USERNAME_REGEX.test("..")).toBe(false)
            expect(USERNAME_REGEX.test("...")).toBe(false)
        })

        it("não deve aceitar usernames com espaços", () => {
            expect(USERNAME_REGEX.test("user name")).toBe(false)
            expect(USERNAME_REGEX.test(" test ")).toBe(false)
        })
    })

    describe("Casos especiais", () => {
        it("deve aceitar username com apenas números", () => {
            expect(USERNAME_REGEX.test("123456")).toBe(true)
            expect(USERNAME_REGEX.test("@123")).toBe(true)
        })

        it("deve aceitar username com apenas underscore", () => {
            expect(USERNAME_REGEX.test("_")).toBe(true)
            expect(USERNAME_REGEX.test("___")).toBe(true)
        })

        it("deve aceitar username com pontos e underscores misturados", () => {
            expect(USERNAME_REGEX.test("user_name.test")).toBe(true)
            expect(USERNAME_REGEX.test("a_b.c_d")).toBe(true)
        })

        it("deve rejeitar username que é apenas um ponto", () => {
            expect(USERNAME_REGEX.test(".")).toBe(false)
        })

        it("deve aceitar username com @ e caracteres válidos", () => {
            expect(USERNAME_REGEX.test("@user123")).toBe(true)
            expect(USERNAME_REGEX.test("@test.user_name")).toBe(true)
        })
    })
})
