// Copyright 2025 Circle Company, Inc.
// Licensed under the Circle License, Version 1.0

import { describe, expect, it } from "vitest"

import { TextLibrary } from "../index"

describe("Text Library Tests", () => {
    const circleText = new TextLibrary({
        validationRules: {
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
                    description: "Username não pode começar com underscore ou ponto"
                },
                cannotContainConsecutive: {
                    enabled: true,
                    value: "._",
                    description: "Não pode conter pontos '.' ou underscores consecutivos"
                },
                allowAtPrefix: {
                    enabled: true,
                    value: "@",
                    description: "Permite prefixo @"
                }
            },
            hashtag: {
                requiredPrefix: {
                    enabled: true,
                    value: "#",
                    description: "Deve começar com #"
                },
                minLength: {
                    enabled: true,
                    value: 4,
                    description: "Mínimo 4 caracteres"
                },
                allowedCharacters: {
                    enabled: true,
                    value: "[a-zA-Z0-9#]",
                    description: "Apenas letras e números permitidos"
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
            },
            url: {
                requireProtocol: {
                    enabled: true,
                    value: true,
                    description: "URL deve incluir protocolo (http:// ou https://)"
                },
                minLength: {
                    enabled: true,
                    value: 10,
                    description: "Mínimo 10 caracteres"
                },
                maxLength: {
                    enabled: true,
                    value: 2048,
                    description: "Máximo 2048 caracteres"
                },
                allowedProtocols: {
                    enabled: true,
                    value: ["http", "https"],
                    description: "Apenas protocolos http e https são permitidos"
                }
            },
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
            },
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
                cannotEndWith: {
                    enabled: true,
                    value: "[^a-zA-ZÀ-ÿ]",
                    description: "Nome não pode terminar com caracteres não-alfabéticos"
                }
            },
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
        }
    })

    describe("Library Initialization", () => {
        it("should initialize CircleText correctly", () => {
            expect(circleText).toBeDefined()
            expect(circleText.validate).toBeDefined()
            expect(circleText.extract).toBeDefined()
            expect(circleText.extract.content).toBeDefined()
            expect(circleText.extract.keywords).toBeDefined()
            expect(circleText.extract.sentiment).toBeDefined()
        })
    })

    describe("Username Validation", () => {
        const { username } = circleText.validate

        it("should validate correct username", () => {
            const result = username("validuser")
            expect(result.isValid).toBe(true)
            expect(result.errors).toHaveLength(0)
        })

        it("should validate username with @ prefix", () => {
            const result = username("@validuser")
            expect(result.isValid).toBe(true)
            expect(result.errors).toHaveLength(0)
        })

        it("should validate username with dots", () => {
            const result = username("valid.user")
            expect(result.isValid).toBe(true)
            expect(result.errors).toHaveLength(0)
        })

        it("should reject username too short", () => {
            const result = username("abc")
            expect(result.isValid).toBe(false)
            expect(result.errors).toContain("Mínimo 4 caracteres")
        })

        it("should reject username too long", () => {
            const result = username("a".repeat(21))
            expect(result.isValid).toBe(false)
            expect(result.errors).toContain("Máximo 20 caracteres")
        })

        it("should reject username starting with underscore", () => {
            const result = username("_invalid")
            expect(result.isValid).toBe(false)
            expect(result.errors).toContain("Username não pode começar com underscore ou ponto")
        })

        it("should reject username with consecutive characters", () => {
            const result = username("user..test")
            expect(result.isValid).toBe(false)
            expect(result.errors).toContain(
                "Não pode conter pontos '.' ou underscores consecutivos"
            )
        })

        it("should reject empty username", () => {
            const result = username("")
            expect(result.isValid).toBe(false)
            expect(result.errors).toContain("Username não pode ser vazio")
        })
    })

    describe("Hashtag Validation", () => {
        const { hashtag } = circleText.validate

        it("should validate correct hashtag", () => {
            const result = hashtag("#good")
            expect(result.isValid).toBe(true)
            expect(result.errors).toHaveLength(0)
        })

        it("should reject hashtag without #", () => {
            const result = hashtag("example")
            expect(result.isValid).toBe(false)
            expect(result.errors).toContain("Deve começar com #")
        })

        it("should reject hashtag too short", () => {
            const result = hashtag("#a")
            expect(result.isValid).toBe(false)
            expect(result.errors).toContain("Mínimo 4 caracteres")
        })

        it("should reject hashtag starting with number", () => {
            const result = hashtag("#123test")
            expect(result.isValid).toBe(false)
            expect(result.errors).toContain("Hashtag não pode começar com número")
        })

        it("should reject hashtag ending with underscore", () => {
            const result = hashtag("#test_")
            expect(result.isValid).toBe(false)
            expect(result.errors).toContain("Hashtag não pode terminar com underscore")
        })

        it("should reject empty hashtag", () => {
            const result = hashtag("")
            expect(result.isValid).toBe(false)
            expect(result.errors).toContain("Hashtag não pode ser vazia")
        })
    })

    describe("URL Validation", () => {
        const { url } = circleText.validate

        it("should validate HTTPS URL", () => {
            const result = url("https://example.com")
            expect(result.isValid).toBe(true)
            expect(result.errors).toHaveLength(0)
        })

        it("should validate HTTP URL", () => {
            const result = url("http://example.com")
            expect(result.isValid).toBe(true)
            expect(result.errors).toHaveLength(0)
        })

        it("should reject URL without protocol", () => {
            const result = url("example.com")
            expect(result.isValid).toBe(false)
            expect(result.errors).toContain("URL deve incluir protocolo (http:// ou https://)")
        })

        it("should reject URL too short", () => {
            const result = url("http://")
            expect(result.isValid).toBe(false)
            expect(result.errors).toContain("Mínimo 10 caracteres")
        })

        it("should reject invalid protocol", () => {
            const result = url("ftp://example.com")
            expect(result.isValid).toBe(false)
            expect(result.errors).toContain(
                "Protocolo 'ftp' não é permitido. Protocolos aceitos: http, https"
            )
        })

        it("should reject empty URL", () => {
            const result = url("")
            expect(result.isValid).toBe(false)
            expect(result.errors).toContain("URL não pode ser vazia")
        })
    })

    describe("Description Validation", () => {
        const { description } = circleText.validate

        it("should validate correct description", () => {
            const result = description("Valid description here")
            expect(result.isValid).toBe(true)
            expect(result.errors).toHaveLength(0)
        })

        it("should reject description too short", () => {
            const result = description("Short")
            expect(result.isValid).toBe(false)
            expect(result.errors).toContain("Descrição deve ter pelo menos 10 caracteres")
        })

        it("should reject description too long", () => {
            const result = description("a".repeat(250))
            expect(result.isValid).toBe(false)
            expect(result.errors).toContain("Descrição não pode exceder 200 caracteres")
        })

        it("should reject description with forbidden words", () => {
            const result = description("This is spam content")
            expect(result.isValid).toBe(false)
            expect(result.errors).toContain("Descrição contém palavras não permitidas")
        })

        it("should reject description without alphanumeric chars", () => {
            const result = description("!!! ??? ...")
            expect(result.isValid).toBe(false)
            expect(result.errors).toContain(
                "Descrição deve conter pelo menos um caractere alfanumérico"
            )
        })

        it("should reject description starting with number", () => {
            const result = description("123 This is invalid")
            expect(result.isValid).toBe(false)
            expect(result.errors).toContain(
                "Descrição não pode começar com número, underscore ou hífen"
            )
        })

        it("should reject empty description", () => {
            const result = description("")
            expect(result.isValid).toBe(false)
            expect(result.errors).toContain("Descrição não pode ser vazia")
        })
    })

    describe("Name Validation", () => {
        const { name } = circleText.validate

        it("should validate correct name", () => {
            const result = name("João Silva")
            expect(result.isValid).toBe(true)
            expect(result.errors).toHaveLength(0)
        })

        it("should validate name with accents", () => {
            const result = name("José Da Silva")
            expect(result.isValid).toBe(true)
            expect(result.errors).toHaveLength(0)
        })

        it("should reject name too short", () => {
            const result = name("A")
            expect(result.isValid).toBe(false)
            expect(result.errors).toContain("Nome deve ter pelo menos 2 caracteres")
        })

        it("should reject single word name", () => {
            const result = name("João")
            expect(result.isValid).toBe(false)
            expect(result.errors).toContain("Nome deve conter pelo menos primeiro e último nome")
        })

        it("should reject name with numbers", () => {
            const result = name("João Silva123")
            expect(result.isValid).toBe(false)
            expect(result.errors).toContain("Nome não pode conter números")
        })

        it("should reject name with forbidden words", () => {
            const result = name("Roboti Silva")
            expect(result.isValid).toBe(false)
            expect(result.errors).toContain("Nome contém palavras/nomes não permitidos")
        })

        it("should reject name without capitalization", () => {
            const result = name("joão silva")
            expect(result.isValid).toBe(false)
            expect(result.errors).toContain(
                "Nome deve ter a primeira letra de cada palavra maiúscula"
            )
        })

        it("should reject empty name", () => {
            const result = name("")
            expect(result.isValid).toBe(false)
            expect(result.errors).toContain("Nome não pode ser vazio")
        })
    })

    describe("Password Validation", () => {
        const { password } = circleText.validate

        it("should validate strong password", () => {
            const result = password("MyStr0ng!A")
            expect(result.isValid).toBe(true)
            expect(result.errors).toHaveLength(0)
        })

        it("should validate password with mixed case and special chars", () => {
            const result = password("SecureP@ss1A")
            expect(result.isValid).toBe(true)
            expect(result.errors).toHaveLength(0)
        })

        it("should reject password too short", () => {
            const result = password("Str0!")
            expect(result.isValid).toBe(false)
            expect(result.errors).toContain("Senha deve ter pelo menos 8 caracteres")
        })

        it("should reject password without uppercase", () => {
            const result = password("mypass123!")
            expect(result.isValid).toBe(false)
            expect(result.errors).toContain("Senha deve conter pelo menos uma letra maiúscula")
        })

        it("should reject password without numbers", () => {
            const result = password("MyPassword!")
            expect(result.isValid).toBe(false)
            expect(result.errors).toContain("Senha deve conter pelo menos um número")
        })

        it("should reject common password", () => {
            const result = password("password")
            expect(result.isValid).toBe(false)
            expect(result.errors).toContain("Senha muito comum não é permitida")
        })

        it("should reject password with forbidden words", () => {
            const result = password("admin123!")
            expect(result.isValid).toBe(false)
            expect(result.errors).toContain("Senha contém palavra proibida")
        })

        it("should reject password starting with number", () => {
            const result = password("1MyPass!")
            expect(result.isValid).toBe(false)
            expect(result.errors).toContain("Senha não pode começar com número")
        })

        it("should reject password with repeated chars", () => {
            const result = password("MyPass111!")
            expect(result.isValid).toBe(false)
            expect(result.errors).toContain(
                "Senha não pode conter caracteres repetidos consecutivos"
            )
        })

        it("should reject password with sequential chars", () => {
            const result = password("MyPass123@")
            expect(result.isValid).toBe(false)
            expect(result.errors).toContain("Senha não pode conter sequências sequenciais")
        })

        it("should reject empty password", () => {
            const result = password("")
            expect(result.isValid).toBe(false)
            expect(result.errors).toContain("Senha não pode ser vazia")
        })
    })

    describe("Content Extraction", () => {
        const { content } = circleText.extract

        it("should extract mentions only", () => {
            const text = "Check out @test_user and @another_user!"
            const result = content(text, { mentions: true })
            expect(result.mentions).toEqual(["@test_user", "@another_user"])
            expect(result.hashtags).toBeUndefined()
            expect(result.urls).toBeUndefined()
        })

        it("should extract hashtags only", () => {
            const text = "Check out #example and #test!"
            const result = content(text, { hashtags: true })
            expect(result.hashtags).toEqual(["#example", "#test"])
            expect(result.mentions).toBeUndefined()
            expect(result.urls).toBeUndefined()
        })

        it("should extract URLs only", () => {
            const text = "Visit https://example.com and http://test.com for more info."
            const result = content(text, { urls: true })
            expect(result.urls).toEqual(["https://example.com", "http://test.com"])
            expect(result.mentions).toBeUndefined()
            expect(result.hashtags).toBeUndefined()
        })

        it("should extract all content types", () => {
            const text = "Check @user visit #test at https://example.com"
            const result = content(text)
            expect(result.mentions).toEqual(["@user"])
            expect(result.hashtags).toEqual(["#test"])
            expect(result.urls).toEqual(["https://example.com"])
        })

        it("should extract nothing when no options provided", () => {
            const text = "Check @user visit #test at https://example.com"
            const result = content(text, {})
            expect(result.mentions).toBeUndefined()
            expect(result.hashtags).toBeUndefined()
            expect(result.urls).toBeUndefined()
        })
    })

    describe("Keywords Extraction", () => {
        const { keywords } = circleText.extract

        it("should extract keywords from text", () => {
            const text =
                "Esse é um texto de teste com algumas keywords importantes: fome, test, text, keywords, importantes."
            const result = keywords(text)

            expect(result).toBeInstanceOf(Array)
            expect(result.length).toBeGreaterThan(0)
            // importante é reduzido para "import" devido ao sufixo "ante"
            expect(result).toEqual(["keyword", "import", "texto", "teste", "fome"])
        })

        it("should handle empty text", () => {
            const result = keywords("")
            expect(result).toBeInstanceOf(Array)
            expect(result.length).toBe(0)
        })
    })

    describe("Sentiment Analysis", () => {
        const { sentiment } = circleText.extract

        it("should analyze positive sentiment", () => {
            const text = "Eu amo este trabalho! Me sinto muito feliz e contente."
            const result = sentiment(text)

            expect(result).toBeDefined()
            expect(result.intensity).toBeTypeOf("number")
            expect(result.intensity).toBeGreaterThan(0)
            expect(result.sentiment).toBeTypeOf("string")
            expect(result.sentiment).toEqual("positive")
        })

        it("should analyze negative sentiment", () => {
            const text = "Estou muito decepcionado com os resultados."
            const result = sentiment(text)

            expect(result).toBeDefined()
            expect(result.intensity).toBeTypeOf("number")
            expect(result.sentiment).toBeTypeOf("string")
        })

        it("should analyze neutral sentiment", () => {
            const text = "Estou meio indiferente com o resultado do projeto."
            const result = sentiment(text)

            expect(result).toBeDefined()
            expect(result.intensity).toBeTypeOf("number")
            expect(result.intensity).toBeGreaterThanOrEqual(0)
            expect(result.intensity).toBeLessThanOrEqual(1)
            expect(result.sentiment).toBeTypeOf("string")
        })

        it("should handle empty text", () => {
            const result = sentiment("")
            expect(result).toBeDefined()
            expect(result.intensity).toBeTypeOf("number")
            expect(result.sentiment).toBeTypeOf("string")
        })
    })

    describe("Error Messages Validation", () => {
        describe("Custom Rule Messages", () => {
            it("should use custom username rule messages", () => {
                const customRules = {
                    minLength: {
                        enabled: true,
                        value: 8,
                        description: "Custom: mínimo 8 caracteres"
                    },
                    maxLength: {
                        enabled: true,
                        value: 10,
                        description: "Custom: máximo 10 caracteres"
                    }
                }

                const shortResult = circleText.validate.username("test", customRules)
                expect(shortResult.errors).toContain("Custom: mínimo 8 caracteres")

                const longResult = circleText.validate.username("verylongusername", customRules)
                expect(longResult.errors).toContain("Custom: máximo 10 caracteres")

                const validResult = circleText.validate.username("valid123", customRules)
                expect(validResult.isValid).toBe(true)
                expect(validResult.errors).toHaveLength(0)
            })

            it("should accumulate multiple error messages", () => {
                const multipleErrorsResult = circleText.validate.username("_a")
                expect(multipleErrorsResult.errors).toContain("Mínimo 4 caracteres")
                expect(multipleErrorsResult.errors).toContain(
                    "Username não pode começar com underscore ou ponto"
                )
                expect(multipleErrorsResult.errors.length).toBeGreaterThan(1)
            })
        })
    })

    describe("Timezone Offset Conversion", () => {
        it("should import Timezone and TimezoneCodes correctly", async () => {
            const { Timezone, TimezoneCodes } = await import("../classes/timezone/index.js")

            expect(Timezone).toBeDefined()
            expect(TimezoneCodes).toBeDefined()
            expect(Timezone.getTimezoneFromOffset).toBeDefined()
        })

        it("should convert offset 0 to UTC", async () => {
            const { Timezone, TimezoneCodes } = await import("../classes/timezone/index.js")

            const result = Timezone.getTimezoneFromOffset(0)
            expect(result).toBe(TimezoneCodes.UTC)
        })

        it("should convert offset -3 to BRT", async () => {
            const { Timezone, TimezoneCodes } = await import("../classes/timezone/index.js")

            const result = Timezone.getTimezoneFromOffset(-3)
            expect(result).toBe(TimezoneCodes.BRT)
        })

        it("should convert offset -5 to EST", async () => {
            const { Timezone, TimezoneCodes } = await import("../classes/timezone/index.js")

            const result = Timezone.getTimezoneFromOffset(-5)
            expect(result).toBe(TimezoneCodes.EST)
        })

        it("should convert offset -8 to PST", async () => {
            const { Timezone, TimezoneCodes } = await import("../classes/timezone/index.js")

            const result = Timezone.getTimezoneFromOffset(-8)
            expect(result).toBe(TimezoneCodes.PST)
        })

        it("should convert offset -10 to HST", async () => {
            const { Timezone, TimezoneCodes } = await import("../classes/timezone/index.js")

            const result = Timezone.getTimezoneFromOffset(-10)
            expect(result).toBe(TimezoneCodes.HST)
        })

        it("should return UTC for unknown offset", async () => {
            const { Timezone, TimezoneCodes } = await import("../classes/timezone/index.js")

            const result = Timezone.getTimezoneFromOffset(-15)
            expect(result).toBe(TimezoneCodes.UTC)
        })

        it("should return UTC for positive offset", async () => {
            const { Timezone, TimezoneCodes } = await import("../classes/timezone/index.js")

            const result = Timezone.getTimezoneFromOffset(5)
            expect(result).toBe(TimezoneCodes.UTC)
        })

        it("should convert multiple offsets correctly", async () => {
            const { Timezone, TimezoneCodes } = await import("../classes/timezone/index.js")

            const testCases = [
                { offset: 0, expected: TimezoneCodes.UTC },
                { offset: -2, expected: TimezoneCodes.BRST },
                { offset: -3, expected: TimezoneCodes.BRT },
                { offset: -4, expected: TimezoneCodes.EDT },
                { offset: -5, expected: TimezoneCodes.EST },
                { offset: -6, expected: TimezoneCodes.CST },
                { offset: -7, expected: TimezoneCodes.MST },
                { offset: -8, expected: TimezoneCodes.PST },
                { offset: -9, expected: TimezoneCodes.AKST },
                { offset: -10, expected: TimezoneCodes.HST }
            ]

            testCases.forEach(({ offset, expected }) => {
                const result = Timezone.getTimezoneFromOffset(offset)
                expect(result).toBe(expected)
            })
        })

        it("should integrate with Timezone class", async () => {
            const { Timezone } = await import("../classes/timezone/index.js")

            // Simula receber um offset do cliente
            const userOffset = -3
            const timezoneCode = Timezone.getTimezoneFromOffset(userOffset)

            // Cria uma instância de Timezone com o código obtido
            const timezone = new Timezone(timezoneCode)

            expect(timezone.getTimezoneOffset()).toBe(-3)
            expect(timezone.getCurrentTimezoneCode()).toBe(timezoneCode)
        })

        it("should work in real-world scenario", async () => {
            const { Timezone } = await import("../classes/timezone/index.js")

            // Cenário: Usuário envia offset do cliente
            const clientOffset = -5

            // Converte offset para timezone code
            const timezoneCode = Timezone.getTimezoneFromOffset(clientOffset)

            // Cria timezone e faz conversões
            const timezone = new Timezone(timezoneCode)
            const utcDate = new Date("2024-01-15T15:30:00Z")
            const localDate = timezone.UTCToLocal(utcDate)

            expect(localDate.getUTCHours()).toBe(10) // 15:30 - 5h = 10:30
        })

        it("should handle getCurrentTimezone static method", async () => {
            const { Timezone, TimezoneCodes } = await import("../classes/timezone/index.js")

            const currentTimezone = Timezone.getCurrentTimezone()

            expect(currentTimezone).toBeDefined()
            expect(typeof currentTimezone).toBe("string")
            expect(Object.values(TimezoneCodes)).toContain(currentTimezone)
        })

        it("should be accessible from library export", async () => {
            const { Timezone } = await import("../index.js")

            expect(Timezone).toBeDefined()
            expect(Timezone.getTimezoneFromOffset).toBeDefined()
            expect(typeof Timezone.getTimezoneFromOffset).toBe("function")
        })

        it("should convert array of offsets in batch", async () => {
            const { Timezone } = await import("../classes/timezone/index.js")

            const offsets = [0, -3, -5, -8, -10]
            const results = offsets.map((offset) => ({
                offset,
                code: Timezone.getTimezoneFromOffset(offset)
            }))

            expect(results).toHaveLength(5)
            results.forEach((result) => {
                expect(result.code).toBeDefined()
                expect(typeof result.code).toBe("string")
            })
        })
    })

    describe("Integration Tests", () => {
        it("should handle complex text processing workflow", () => {
            const text = "Olá @usuario! Segue aí nossa empresa https://circle.app #startup #tech"

            // Validation tests
            expect(circleText.validate.username("@usuario").isValid).toBe(true)
            expect(circleText.validate.url("https://circle.app").isValid).toBe(true)
            expect(circleText.validate.hashtag("#startup").isValid).toBe(true)
            expect(circleText.validate.hashtag("#tech").isValid).toBe(true)

            // Extraction tests
            const extracted = circleText.extract.content(text)
            expect(extracted.mentions).toEqual(["@usuario"])
            expect(extracted.urls).toEqual(["https://circle.app"])
            expect(extracted.hashtags).toEqual(["#startup", "#tech"])

            // Keywords extraction
            const keywords = circleText.extract.keywords(text)
            expect(keywords).toBeInstanceOf(Array)
            expect(keywords.length).toBeGreaterThan(0)

            // Sentiment analysis
            const sentiment = circleText.extract.sentiment(text)
            expect(sentiment).toBeDefined()
            expect(sentiment.intensity).toBeTypeOf("number")
            expect(sentiment.sentiment).toBeTypeOf("string")
        })

        it("should integrate timezone offset conversion with full workflow", async () => {
            const { Timezone } = await import("../classes/timezone/index.js")

            // Simula dados de um post com timezone do usuário
            const postData = {
                text: "Ótima experiência! @empresa está fazendo um trabalho incrível! #sucesso #motivacao https://example.com",
                userTimezoneOffset: -3, // BRT
                createdAt: new Date("2024-01-15T18:00:00Z")
            }

            // 1. Validar conteúdo
            const extracted = circleText.extract.content(postData.text)
            expect(extracted.mentions).toEqual(["@empresa"])
            expect(extracted.hashtags).toEqual(["#sucesso", "#motivacao"])
            expect(extracted.urls).toEqual(["https://example.com"])

            // 2. Analisar sentimento
            const sentiment = circleText.extract.sentiment(postData.text)
            expect(sentiment.sentiment).toBe("positive")

            // 3. Converter timezone
            const timezoneCode = Timezone.getTimezoneFromOffset(postData.userTimezoneOffset)
            const timezone = new Timezone(timezoneCode)
            const localTime = timezone.UTCToLocal(postData.createdAt)

            expect(localTime.getUTCHours()).toBe(15) // 18:00 - 3h = 15:00 BRT
        })
    })
})
