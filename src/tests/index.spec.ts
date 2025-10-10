// Copyright 2025 Circle Company, Inc.
// Licensed under the Circle License, Version 1.0

import { describe, expect, it } from "vitest"

import { TextLibrary } from "../index"

describe("Text Library Tests", () => {
    const circleText = new TextLibrary({
        conversorConfig: {
            defaultSliceLength: 100,
            sliceSuffix: "...",
            thousandsSeparator: "."
        },
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
            expect(circleText.validator).toBeDefined()
            expect(circleText.extractor).toBeDefined()
            expect(circleText.sentiment).toBeDefined()
            expect(circleText.conversor).toBeDefined()
            expect(circleText.date).toBeDefined()
            expect(circleText.rich).toBeDefined()
            expect(circleText.timezone).toBeDefined()
        })
    })

    describe("Username Validation", () => {
        const username = circleText.validator.username.bind(circleText.validator)

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
        const hashtag = circleText.validator.hashtag.bind(circleText.validator)

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
        const url = circleText.validator.url.bind(circleText.validator)

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
        const description = circleText.validator.description.bind(circleText.validator)

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
        const name = circleText.validator.name.bind(circleText.validator)

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
        const password = circleText.validator.password.bind(circleText.validator)

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
        it("should extract mentions only", () => {
            const text = "Check out @test_user and @another_user!"
            circleText.extractor.setText(text)
            const result = circleText.extractor.entities({ mentions: true })
            expect(result.mentions).toEqual(["@test_user", "@another_user"])
            expect(result.hashtags).toBeUndefined()
            expect(result.urls).toBeUndefined()
        })

        it("should extract hashtags only", () => {
            const text = "Check out #example and #test!"
            circleText.extractor.setText(text)
            const result = circleText.extractor.entities({ hashtags: true })
            expect(result.hashtags).toEqual(["#example", "#test"])
            expect(result.mentions).toBeUndefined()
            expect(result.urls).toBeUndefined()
        })

        it("should extract URLs only", () => {
            const text = "Visit https://example.com and http://test.com for more info."
            circleText.extractor.setText(text)
            const result = circleText.extractor.entities({ urls: true })
            expect(result.urls).toEqual(["https://example.com", "http://test.com"])
            expect(result.mentions).toBeUndefined()
            expect(result.hashtags).toBeUndefined()
        })

        it("should extract all content types", () => {
            const text = "Check @user visit #test at https://example.com"
            circleText.extractor.setText(text)
            const result = circleText.extractor.entities({
                mentions: true,
                hashtags: true,
                urls: true
            })
            expect(result.mentions).toEqual(["@user"])
            expect(result.hashtags).toEqual(["#test"])
            expect(result.urls).toEqual(["https://example.com"])
        })

        it("should extract nothing when no options provided", () => {
            const text = "Check @user visit #test at https://example.com"
            circleText.extractor.setText(text)
            const result = circleText.extractor.entities({})
            expect(result.mentions).toBeUndefined()
            expect(result.hashtags).toBeUndefined()
            expect(result.urls).toBeUndefined()
        })
    })

    describe("Keywords Extraction", () => {
        it("should extract keywords from text", () => {
            const text =
                "Esse é um texto de teste com algumas keywords importantes: fome, test, text, keywords, importantes."
            circleText.extractor.setText(text)
            const result = circleText.extractor.keywords()

            expect(result).toBeInstanceOf(Array)
            expect(result.length).toBeGreaterThan(0)
            // importante é reduzido para "import" devido ao sufixo "ante"
            expect(result).toEqual(["keyword", "import", "texto", "teste", "fome"])
        })

        it("should handle empty text", () => {
            circleText.extractor.setText("")
            const result = circleText.extractor.keywords()
            expect(result).toBeInstanceOf(Array)
            expect(result.length).toBe(0)
        })
    })

    describe("Sentiment Analysis", () => {
        it("should analyze positive sentiment", () => {
            const text = "Eu amo este trabalho! Me sinto muito feliz e contente."
            const result = circleText.sentiment.analyze(text)

            expect(result).toBeDefined()
            expect(result.intensity).toBeTypeOf("number")
            expect(result.intensity).toBeGreaterThan(0)
            expect(result.sentiment).toBeTypeOf("string")
            expect(result.sentiment).toEqual("positive")
        })

        it("should analyze negative sentiment", () => {
            const text = "Estou muito decepcionado com os resultados."
            const result = circleText.sentiment.analyze(text)

            expect(result).toBeDefined()
            expect(result.intensity).toBeTypeOf("number")
            expect(result.sentiment).toBeTypeOf("string")
        })

        it("should analyze neutral sentiment", () => {
            const text = "Estou meio indiferente com o resultado do projeto."
            const result = circleText.sentiment.analyze(text)

            expect(result).toBeDefined()
            expect(result.intensity).toBeTypeOf("number")
            expect(result.intensity).toBeGreaterThanOrEqual(0)
            expect(result.intensity).toBeLessThanOrEqual(1)
            expect(result.sentiment).toBeTypeOf("string")
        })

        it("should handle empty text", () => {
            const result = circleText.sentiment.analyze("")
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

                const shortResult = circleText.validator.username("test", customRules)
                expect(shortResult.errors).toContain("Custom: mínimo 8 caracteres")

                const longResult = circleText.validator.username("verylongusername", customRules)
                expect(longResult.errors).toContain("Custom: máximo 10 caracteres")

                const validResult = circleText.validator.username("valid123", customRules)
                expect(validResult.isValid).toBe(true)
                expect(validResult.errors).toHaveLength(0)
            })

            it("should accumulate multiple error messages", () => {
                const multipleErrorsResult = circleText.validator.username("_a")
                expect(multipleErrorsResult.errors).toContain("Mínimo 4 caracteres")
                expect(multipleErrorsResult.errors).toContain(
                    "Username não pode começar com underscore ou ponto"
                )
                expect(multipleErrorsResult.errors.length).toBeGreaterThan(1)
            })
        })
    })

    describe("Timezone Offset Conversion", () => {
        it("should import Timezone and TimezoneCode correctly", async () => {
            const { Timezone, TimezoneCode } = await import("../classes/timezone/index.js")

            expect(Timezone).toBeDefined()
            expect(TimezoneCode).toBeDefined()

            const timezone = new Timezone()
            expect(timezone.getCodeFromOffset).toBeDefined()
            expect(timezone.getOffsetFromCode).toBeDefined()
        })

        it("should convert offset 0 to UTC", async () => {
            const { Timezone, TimezoneCode } = await import("../classes/timezone/index.js")

            const timezone = new Timezone()
            const result = timezone.getCodeFromOffset(0)
            expect(result).toBe(TimezoneCode.UTC)
        })

        it("should convert offset -3 to BRT", async () => {
            const { Timezone, TimezoneCode } = await import("../classes/timezone/index.js")

            const result = new Timezone().getCodeFromOffset(-3)
            expect(result).toBe(TimezoneCode.BRT)
        })

        it("should convert offset -5 to EST", async () => {
            const { Timezone, TimezoneCode } = await import("../classes/timezone/index.js")

            const result = new Timezone().getCodeFromOffset(-5)
            expect(result).toBe(TimezoneCode.EST)
        })

        it("should convert offset -8 to PST", async () => {
            const { Timezone, TimezoneCode } = await import("../classes/timezone/index.js")

            const result = new Timezone().getCodeFromOffset(-8)
            expect(result).toBe(TimezoneCode.PST)
        })

        it("should convert offset -10 to HST", async () => {
            const { Timezone, TimezoneCode } = await import("../classes/timezone/index.js")

            const result = new Timezone().getCodeFromOffset(-10)
            expect(result).toBe(TimezoneCode.HST)
        })

        it("should return UTC for unknown offset", async () => {
            const { Timezone, TimezoneCode } = await import("../classes/timezone/index.js")

            const result = new Timezone().getCodeFromOffset(-15)
            expect(result).toBe(TimezoneCode.UTC)
        })

        it("should return UTC for positive offset", async () => {
            const { Timezone, TimezoneCode } = await import("../classes/timezone/index.js")

            const result = new Timezone().getCodeFromOffset(5)
            expect(result).toBe(TimezoneCode.UTC)
        })

        it("should convert multiple offsets correctly", async () => {
            const { Timezone, TimezoneCode } = await import("../classes/timezone/index.js")

            const testCases = [
                { offset: 0, expected: TimezoneCode.UTC },
                { offset: -2, expected: TimezoneCode.BRST },
                { offset: -3, expected: TimezoneCode.BRT },
                { offset: -4, expected: TimezoneCode.EDT },
                { offset: -5, expected: TimezoneCode.EST },
                { offset: -6, expected: TimezoneCode.CST },
                { offset: -7, expected: TimezoneCode.MST },
                { offset: -8, expected: TimezoneCode.PST },
                { offset: -9, expected: TimezoneCode.AKST },
                { offset: -10, expected: TimezoneCode.HST }
            ]

            testCases.forEach(({ offset, expected }) => {
                const result = new Timezone().getCodeFromOffset(offset)
                expect(result).toBe(expected)
            })
        })

        it("should integrate with Timezone class", async () => {
            const { Timezone } = await import("../classes/timezone/index.js")

            // Simula receber um offset do cliente
            const userOffset = -3
            const timezoneCode = new Timezone().getCodeFromOffset(userOffset)

            // Cria uma instância de Timezone com o código obtido
            const timezone = new Timezone()
            timezone.setLocalTimezone(timezoneCode)

            expect(timezone.getOffset()).toBe(-3)
            expect(timezone.getCode()).toBe(timezoneCode)
        })

        it("should work in real-world scenario", async () => {
            const { Timezone } = await import("../classes/timezone/index.js")

            // Cenário: Usuário envia offset do cliente
            const clientOffset = -5

            // Converte offset para timezone code
            const timezoneCode = new Timezone().getCodeFromOffset(clientOffset)

            // Cria timezone e faz conversões
            const timezone = new Timezone()
            timezone.setLocalTimezone(timezoneCode)
            const utcDate = new Date("2024-01-15T15:30:00Z")
            const localDate = timezone.UTCToLocal(utcDate)

            expect(localDate.getUTCHours()).toBe(10) // 15:30 - 5h = 10:30
        })

        it("should handle getCode method correctly", async () => {
            const { Timezone, TimezoneCode } = await import("../classes/timezone/index.js")

            const timezone = new Timezone()
            const currentTimezone = timezone.getCode()

            expect(currentTimezone).toBeDefined()
            expect(typeof currentTimezone).toBe("string")
            expect(Object.values(TimezoneCode)).toContain(currentTimezone)
        })

        it("should be accessible from library export", async () => {
            const { Timezone } = await import("../index.js")

            expect(Timezone).toBeDefined()
            expect(new Timezone().getCodeFromOffset).toBeDefined()
            expect(typeof new Timezone().getCodeFromOffset).toBe("function")
        })

        it("should convert array of offsets in batch", async () => {
            const { Timezone } = await import("../classes/timezone/index.js")

            const offsets = [0, -3, -5, -8, -10]
            const results = offsets.map((offset) => ({
                offset,
                code: new Timezone().getCodeFromOffset(offset)
            }))

            expect(results).toHaveLength(5)
            results.forEach((result) => {
                expect(result.code).toBeDefined()
                expect(typeof result.code).toBe("string")
            })
        })
    })

    describe("Conversor Tests", () => {
        describe("sliceWithDots", () => {
            it("deve cortar texto usando tamanho especificado", () => {
                const result = circleText.conversor.sliceWithDots({
                    text: "Este é um texto muito longo para ser exibido",
                    size: 15
                })
                expect(result).toBe("Este é um texto...")
            })

            it("deve usar tamanho padrão quando size não é fornecido", () => {
                const result = circleText.conversor.sliceWithDots({
                    text: "a".repeat(150)
                })
                expect(result.length).toBe(103) // 100 + "..."
            })

            it("deve retornar texto original se menor que tamanho", () => {
                const result = circleText.conversor.sliceWithDots({
                    text: "Texto curto",
                    size: 50
                })
                expect(result).toBe("Texto curto")
            })

            it("deve lidar com texto vazio", () => {
                const result = circleText.conversor.sliceWithDots({
                    text: "",
                    size: 10
                })
                expect(result).toBe("")
            })
        })

        describe("capitalizeFirstLetter", () => {
            it("deve capitalizar primeira letra", () => {
                const result = circleText.conversor.capitalizeFirstLetter("texto exemplo")
                expect(result).toBe("Texto exemplo")
            })

            it("deve manter texto já capitalizado", () => {
                const result = circleText.conversor.capitalizeFirstLetter("Texto Exemplo")
                expect(result).toBe("Texto Exemplo")
            })

            it("deve lidar com texto vazio", () => {
                const result = circleText.conversor.capitalizeFirstLetter("")
                expect(result).toBe("")
            })

            it("deve capitalizar com acentos", () => {
                const result = circleText.conversor.capitalizeFirstLetter("água")
                expect(result).toBe("Água")
            })
        })

        describe("invertStr", () => {
            it("deve inverter string simples", () => {
                const result = circleText.conversor.invertStr("hello")
                expect(result).toBe("olleh")
            })

            it("deve inverter string com espaços", () => {
                const result = circleText.conversor.invertStr("hello world")
                expect(result).toBe("dlrow olleh")
            })

            it("deve lidar com palíndromo", () => {
                const result = circleText.conversor.invertStr("arara")
                expect(result).toBe("arara")
            })

            it("deve lidar com string vazia", () => {
                const result = circleText.conversor.invertStr("")
                expect(result).toBe("")
            })
        })

        describe("formatNumWithDots", () => {
            it("deve formatar milhares", () => {
                const result = circleText.conversor.formatNumWithDots(1000)
                expect(result).toBe("1.000")
            })

            it("deve formatar milhões", () => {
                const result = circleText.conversor.formatNumWithDots(1000000)
                expect(result).toBe("1.000.000")
            })

            it("deve formatar bilhões", () => {
                const result = circleText.conversor.formatNumWithDots(1000000000)
                expect(result).toBe("1.000.000.000")
            })

            it("deve manter números < 1000", () => {
                const result = circleText.conversor.formatNumWithDots(999)
                expect(result).toBe("999")
            })

            it("deve formatar zero", () => {
                const result = circleText.conversor.formatNumWithDots(0)
                expect(result).toBe("0")
            })
        })

        describe("convertNumToShort", () => {
            it("deve converter milhares para K", () => {
                const result = circleText.conversor.convertNumToShort(1500)
                expect(result).toBe("1.5 K")
            })

            it("deve converter milhões para M", () => {
                const result = circleText.conversor.convertNumToShort(1500000)
                expect(result).toBe("1.5 M")
            })

            it("deve converter bilhões para B", () => {
                const result = circleText.conversor.convertNumToShort(1500000000)
                expect(result).toBe("1.5 B")
            })

            it("deve retornar 0 para zero", () => {
                const result = circleText.conversor.convertNumToShort(0)
                expect(result).toBe("0")
            })

            it("deve retornar 0 para null", () => {
                const result = circleText.conversor.convertNumToShort(null as any)
                expect(result).toBe("0")
            })

            it("deve manter números < 1000", () => {
                const result = circleText.conversor.convertNumToShort(999)
                expect(result).toBe("999")
            })
        })

        describe("Conversor com configurações customizadas", () => {
            it("deve usar separador de milhares customizado", () => {
                const customLib = new TextLibrary({
                    conversorConfig: {
                        thousandsSeparator: ","
                    }
                } as any)

                const result = customLib.conversor.formatNumWithDots(1000000)
                expect(result).toBe("1,000,000")
            })

            it("deve usar sufixo customizado", () => {
                const customLib = new TextLibrary({
                    conversorConfig: {
                        sliceSuffix: "…"
                    }
                } as any)

                const result = customLib.conversor.sliceWithDots({
                    text: "Texto muito longo aqui",
                    size: 10
                })
                expect(result).toBe("Texto muit…")
            })

            it("deve usar tamanho padrão customizado", () => {
                const customLib = new TextLibrary({
                    conversorConfig: {
                        defaultSliceLength: 20
                    }
                } as any)

                const result = customLib.conversor.sliceWithDots({
                    text: "Este é um texto muito longo que será cortado automaticamente"
                })
                expect(result.length).toBe(23) // 20 + "..."
            })

            it("deve combinar múltiplas configurações", () => {
                const customLib = new TextLibrary({
                    conversorConfig: {
                        defaultSliceLength: 15,
                        sliceSuffix: ">>",
                        thousandsSeparator: " "
                    }
                } as any)

                const sliced = customLib.conversor.sliceWithDots({
                    text: "Este é um texto muito longo"
                })
                const formatted = customLib.conversor.formatNumWithDots(1234567)

                expect(sliced).toBe("Este é um texto>>")
                expect(formatted).toBe("1 234 567")
            })
        })
    })

    describe("Integration Tests", () => {
        it("should handle complex text processing workflow", () => {
            const text = "Olá @usuario! Segue aí nossa empresa https://circle.app #startup #tech"

            // Validation tests
            expect(circleText.validator.username("@usuario").isValid).toBe(true)
            expect(circleText.validator.url("https://circle.app").isValid).toBe(true)
            expect(circleText.validator.hashtag("#startup").isValid).toBe(true)
            expect(circleText.validator.hashtag("#tech").isValid).toBe(true)

            // Extraction tests
            circleText.extractor.setText(text)
            const extracted = circleText.extractor.entities({
                mentions: true,
                hashtags: true,
                urls: true
            })
            expect(extracted.mentions).toEqual(["@usuario"])
            expect(extracted.urls).toEqual(["https://circle.app"])
            expect(extracted.hashtags).toEqual(["#startup", "#tech"])

            // Keywords extraction
            const keywords = circleText.extractor.keywords()
            expect(keywords).toBeInstanceOf(Array)
            expect(keywords.length).toBeGreaterThan(0)

            // Sentiment analysis
            const sentiment = circleText.sentiment.analyze(text)
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
            circleText.extractor.setText(postData.text)
            const extracted = circleText.extractor.entities({
                mentions: true,
                hashtags: true,
                urls: true
            })
            expect(extracted.mentions).toEqual(["@empresa"])
            expect(extracted.hashtags).toEqual(["#sucesso", "#motivacao"])
            expect(extracted.urls).toEqual(["https://example.com"])

            // 2. Analisar sentimento
            const sentiment = circleText.sentiment.analyze(postData.text)
            expect(sentiment.sentiment).toBe("positive")

            // 3. Converter timezone
            const timezoneCode = new Timezone().getCodeFromOffset(postData.userTimezoneOffset)
            const timezone = new Timezone()
            timezone.setLocalTimezone(timezoneCode)
            const localTime = timezone.UTCToLocal(postData.createdAt)

            expect(localTime.getUTCHours()).toBe(15) // 18:00 - 3h = 15:00 BRT
        })

        it("deve combinar conversor com extração e validação", () => {
            const text = "Contato: @empresa_tech https://startup.com #inovacao"

            // Extrair entidades
            circleText.extractor.setText(text)
            const entities = circleText.extractor.entities({
                mentions: true,
                hashtags: true,
                urls: true
            })

            // Validar entidades extraídas
            expect(circleText.validator.username(entities.mentions![0]).isValid).toBe(true)
            expect(circleText.validator.url(entities.urls![0]).isValid).toBe(true)
            expect(circleText.validator.hashtag(entities.hashtags![0]).isValid).toBe(true)

            // Formatar texto cortado
            const shortText = circleText.conversor.sliceWithDots({
                text: text,
                size: 20
            })
            expect(shortText.length).toBeLessThanOrEqual(23) // 20 + "..."
        })

        it("deve processar números com formatação e análise", () => {
            const viewCount = 1500000
            const likeCount = 45000
            const shareCount = 8500

            // Formatar números
            const viewsFormatted = circleText.conversor.formatNumWithDots(viewCount)
            const viewsShort = circleText.conversor.convertNumToShort(viewCount)

            expect(viewsFormatted).toBe("1.500.000")
            expect(viewsShort).toBe("1.5 M")

            // Criar texto com estatísticas
            const statsText = `Post com ${viewsShort} views, ${circleText.conversor.convertNumToShort(likeCount)} likes`

            // Analisar sentimento do texto
            const sentiment = circleText.sentiment.analyze(statsText)
            expect(sentiment).toBeDefined()
            expect(sentiment.intensity).toBeGreaterThanOrEqual(0)
            expect(sentiment.intensity).toBeLessThanOrEqual(1)
        })

        it("deve processar workflow completo de publicação de post", () => {
            // Dados do post
            const postData = {
                author: "@tech_enthusiast",
                title: "Inovação Tecnológica",
                content:
                    "Estamos muito empolgados com o lançamento! 🚀 Confira em https://produto.com #tech #inovacao",
                views: 125000,
                userOffset: -3
            }

            // 1. Validar autor
            const authorValidation = circleText.validator.username(postData.author)
            expect(authorValidation.isValid).toBe(true)

            // 2. Validar nome do título
            const titleValidation = circleText.validator.name(postData.title)
            expect(titleValidation.isValid).toBe(true)

            // 3. Extrair entidades do conteúdo
            circleText.extractor.setText(postData.content)
            const entities = circleText.extractor.entities({
                mentions: true,
                hashtags: true,
                urls: true
            })
            expect(entities.urls).toHaveLength(1)
            expect(entities.hashtags).toHaveLength(2)

            // 4. Validar URL extraída
            const urlValidation = circleText.validator.url(entities.urls![0])
            expect(urlValidation.isValid).toBe(true)

            // 5. Analisar sentimento
            const sentiment = circleText.sentiment.analyze(postData.content)
            expect(sentiment.sentiment).toBe("positive")
            expect(sentiment.intensity).toBeGreaterThan(0)

            // 6. Formatar visualizações
            const viewsFormatted = circleText.conversor.convertNumToShort(postData.views)
            expect(viewsFormatted).toBe("125 K")

            // 7. Converter timezone
            const timezoneCode = circleText.timezone.getCodeFromOffset(postData.userOffset)
            expect(timezoneCode).toBeDefined()

            // 8. Criar preview do post
            const preview = circleText.conversor.sliceWithDots({
                text: postData.content,
                size: 50
            })
            expect(preview.length).toBeLessThanOrEqual(53)
        })

        it("deve processar múltiplas configurações de conversor simultaneamente", () => {
            // Conversor padrão (ponto)
            const defaultLib = new TextLibrary({
                conversorConfig: {
                    thousandsSeparator: "."
                }
            } as any)

            // Conversor americano (vírgula)
            const usLib = new TextLibrary({
                conversorConfig: {
                    thousandsSeparator: ","
                }
            } as any)

            // Conversor europeu (espaço)
            const euLib = new TextLibrary({
                conversorConfig: {
                    thousandsSeparator: " "
                }
            } as any)

            const number = 1234567

            expect(defaultLib.conversor.formatNumWithDots(number)).toBe("1.234.567")
            expect(usLib.conversor.formatNumWithDots(number)).toBe("1,234,567")
            expect(euLib.conversor.formatNumWithDots(number)).toBe("1 234 567")
        })

        it("deve testar DateFormatter com tempo aproximado", () => {
            const formatter = circleText.date
            formatter.setStyle("full")
            formatter.setUseApproximateTime(true)

            const twoYearsAgo = new Date(Date.now() - 730 * 24 * 60 * 60000)
            const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60000)
            const twelveWeeksAgo = new Date(Date.now() - 84 * 24 * 60 * 60000)

            expect(formatter.toRelativeTime(twoYearsAgo)).toBe("mais de um ano atrás")
            expect(formatter.toRelativeTime(twoWeeksAgo)).toBe("mais de uma semana atrás")
            expect(formatter.toRelativeTime(twelveWeeksAgo)).toBe("12 semanas atrás")

            // Resetar configuração
            formatter.setUseApproximateTime(false)
        })

        it("deve testar DateFormatter com janela de tempo recente", () => {
            const formatter = circleText.date
            formatter.setStyle("full")
            formatter.setRecentTimeThreshold(120) // 2 minutos
            formatter.setRecentTimeLabel("agora mesmo")

            const thirtySecondsAgo = new Date(Date.now() - 30000)
            const ninetySecondsAgo = new Date(Date.now() - 90000)
            const threeMinutesAgo = new Date(Date.now() - 180000)

            expect(formatter.toRelativeTime(thirtySecondsAgo)).toBe("agora mesmo")
            expect(formatter.toRelativeTime(ninetySecondsAgo)).toBe("agora mesmo")
            expect(formatter.toRelativeTime(threeMinutesAgo)).toBe("3 minutos atrás")

            // Resetar configuração
            formatter.setRecentTimeThreshold(0)
            formatter.setRecentTimeLabel("agora")
        })

        it("deve combinar todas as configurações do DateFormatter", () => {
            const formatter = circleText.date
            formatter.setStyle("full")
            formatter.setUseApproximateTime(true)
            formatter.setRecentTimeThreshold(60)
            formatter.setRecentTimeLabel("agora pouco")
            formatter.setCapitalize(true)
            formatter.setUsePrefix(false)
            formatter.setUseSuffix(true)

            const fortySecondsAgo = new Date(Date.now() - 40000)
            const twoYearsAgo = new Date(Date.now() - 730 * 24 * 60 * 60000)
            const fiveMinutesAgo = new Date(Date.now() - 5 * 60000)

            const result1 = formatter.toRelativeTime(fortySecondsAgo)
            const result2 = formatter.toRelativeTime(twoYearsAgo)
            const result3 = formatter.toRelativeTime(fiveMinutesAgo)

            expect(result1).toBe("Agora pouco")
            expect(result2).toBe("Mais de um ano atrás")
            expect(result3).toBe("5 minutos atrás")

            // Resetar todas as configurações
            formatter.setUseApproximateTime(false)
            formatter.setRecentTimeThreshold(0)
            formatter.setRecentTimeLabel("agora")
            formatter.setCapitalize(false)
        })

        it("deve usar DateFormatter em cenário de rede social", () => {
            // Simula posts de diferentes tempos
            const posts = [
                {
                    id: 1,
                    text: "Post muito recente!",
                    createdAt: new Date(Date.now() - 30000), // 30s atrás
                    expected: "agora pouco"
                },
                {
                    id: 2,
                    text: "Post de alguns minutos",
                    createdAt: new Date(Date.now() - 5 * 60000), // 5min atrás
                    expected: "5m"
                },
                {
                    id: 3,
                    text: "Post antigo",
                    createdAt: new Date(Date.now() - 730 * 24 * 60 * 60000), // 2 anos
                    expected: "mais de um ano atrás"
                }
            ]

            // Formatter para posts recentes (timeline)
            const timelineFormatter = circleText.date
            timelineFormatter.setStyle("short")
            timelineFormatter.setRecentTimeThreshold(60)
            timelineFormatter.setRecentTimeLabel("agora pouco")

            const post1Result = timelineFormatter.toRelativeTime(posts[0].createdAt)
            expect(post1Result).toBe(posts[0].expected)

            const post2Result = timelineFormatter.toRelativeTime(posts[1].createdAt)
            expect(post2Result).toBe(posts[1].expected)

            // Formatter para posts antigos (com aproximação)
            timelineFormatter.setStyle("full")
            timelineFormatter.setUseApproximateTime(true)
            timelineFormatter.setRecentTimeThreshold(0)

            const post3Result = timelineFormatter.toRelativeTime(posts[2].createdAt)
            expect(post3Result).toBe(posts[2].expected)

            // Resetar
            timelineFormatter.setStyle("full")
            timelineFormatter.setUseApproximateTime(false)
            timelineFormatter.setRecentTimeThreshold(0)
            timelineFormatter.setRecentTimeLabel("agora")
        })

        it("deve combinar todas as funcionalidades em cenário real de rede social", () => {
            // Configuração customizada para rede social brasileira
            const socialLib = new TextLibrary({
                conversorConfig: {
                    defaultSliceLength: 280, // Como Twitter
                    sliceSuffix: "...",
                    thousandsSeparator: "."
                },
                validationRules: {
                    username: {
                        minLength: { enabled: true, value: 3, description: "Mínimo 3" },
                        maxLength: { enabled: true, value: 15, description: "Máximo 15" },
                        allowedCharacters: {
                            enabled: true,
                            value: "[a-z0-9_]",
                            description: "Apenas minúsculas"
                        }
                    },
                    url: {
                        requireProtocol: {
                            enabled: true,
                            value: true,
                            description: "URL deve incluir protocolo"
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
                            description: "Protocolos http e https permitidos"
                        }
                    }
                }
            })

            // Simular criação de post
            const postText =
                "Que experiência incrível! @circle_app está revolucionando a comunicação digital. Já temos 1500000 usuários ativos! 🎉 Acesse https://circle.app e confira #tecnologia #inovacao #startup"

            // 1. Extrair e validar username
            socialLib.extractor.setText(postText)
            const mentions = socialLib.extractor.entities({ mentions: true }).mentions!
            const usernameCheck = socialLib.validator.username(mentions[0])
            expect(usernameCheck.isValid).toBe(true)

            // 2. Extrair e validar URL
            const urls = socialLib.extractor.entities({ urls: true }).urls!
            const urlCheck = socialLib.validator.url(urls[0])
            expect(urlCheck.isValid).toBe(true)

            // 3. Extrair hashtags
            const hashtags = socialLib.extractor.entities({ hashtags: true }).hashtags!
            expect(hashtags).toHaveLength(3)

            // 4. Analisar sentimento
            const sentiment = socialLib.sentiment.analyze(postText)
            expect(sentiment.sentiment).toBe("positive")

            // 5. Formatar número de usuários
            const usersShort = socialLib.conversor.convertNumToShort(1500000)
            expect(usersShort).toBe("1.5 M")

            // 6. Criar preview para notificação
            const preview = socialLib.conversor.sliceWithDots({
                text: postText,
                size: 50
            })
            expect(preview).toContain("...")
            expect(preview.length).toBeLessThanOrEqual(53)

            // 7. Extrair keywords
            const keywords = socialLib.extractor.keywords()
            expect(keywords.length).toBeGreaterThan(0)
        })

        it("deve testar RichText com prefixos customizados", () => {
            // Criar biblioteca com prefixos customizados
            const customLib = new TextLibrary({
                validationRules: {
                    username: {
                        minLength: { enabled: true, value: 3, description: "Mínimo 3" },
                        maxLength: { enabled: true, value: 20, description: "Máximo 20" }
                    }
                },
                richTextConfig: {
                    mentionPrefix: "~",
                    hashtagPrefix: "+"
                }
            })

            const text = "Olá ~alice e ~bob confira +technology e +coding"

            // Definir texto com mapeamento de IDs
            customLib.rich.setText(text, {
                mentions: {
                    alice: "user_123",
                    bob: "user_456"
                },
                hashtags: {
                    technology: "tag_789",
                    coding: "tag_012"
                }
            })

            // Testar texto enriquecido
            const enriched = customLib.rich.getEnrichedText()
            expect(enriched).toContain("[txt:alice, ent:mention, id:user_123]")
            expect(enriched).toContain("[txt:bob, ent:mention, id:user_456]")
            expect(enriched).toContain("[txt:technology, ent:hashtag, id:tag_789]")
            expect(enriched).toContain("[txt:coding, ent:hashtag, id:tag_012]")

            // Testar conversão de volta para normal
            const normal = customLib.rich.formatToNormal()
            expect(normal).toBe(text)

            // Testar extração de entidades
            const entities = customLib.rich.extractEntities()
            expect(entities.mentions).toHaveLength(2)
            expect(entities.hashtags).toHaveLength(2)
            expect(entities.mentions[0]).toEqual({ text: "alice", id: "user_123" })
            expect(entities.hashtags[0]).toEqual({ text: "technology", id: "tag_789" })

            // Testar formatação para UI
            const ui = customLib.rich.formatToUI()
            expect(ui.text).toBe(text)

            const mentionEntities = ui.entities.filter((e) => e.type === "mention")
            const hashtagEntities = ui.entities.filter((e) => e.type === "hashtag")

            expect(mentionEntities).toHaveLength(2)
            expect(hashtagEntities).toHaveLength(2)
        })

        it("deve testar RichText com prefixo $ (especial)", () => {
            const customLib = new TextLibrary({
                validationRules: {
                    username: {
                        minLength: { enabled: true, value: 3, description: "Mínimo 3" }
                    }
                },
                richTextConfig: {
                    mentionPrefix: "$"
                }
            })

            const text = "Transferência $user1 para $user2"

            customLib.rich.setText(text, {
                mentions: {
                    user1: "account_123",
                    user2: "account_456"
                }
            })

            const enriched = customLib.rich.getEnrichedText()
            expect(enriched).toContain("[txt:user1, ent:mention, id:account_123]")
            expect(enriched).toContain("[txt:user2, ent:mention, id:account_456]")

            const normal = customLib.rich.formatToNormal()
            expect(normal).toBe(text)
        })

        it("deve não processar prefixo padrão quando customizado está definido", () => {
            const customLib = new TextLibrary({
                validationRules: {
                    username: {
                        minLength: { enabled: true, value: 3, description: "Mínimo 3" }
                    }
                },
                richTextConfig: {
                    mentionPrefix: "~"
                }
            })

            const text = "@alice ~bob"
            customLib.rich.setText(text)

            const enriched = customLib.rich.getEnrichedText()

            // Deve processar apenas ~bob
            expect(enriched).toContain("[txt:bob, ent:mention]")
            expect(enriched).not.toContain("[txt:alice, ent:mention]")

            // @alice permanece como texto normal
            expect(enriched).toContain("@alice")
        })

        it("deve combinar prefixos customizados com extração", () => {
            const customLib = new TextLibrary({
                validationRules: {
                    username: {
                        minLength: { enabled: true, value: 3, description: "Mínimo 3" }
                    }
                },
                extractorConfig: {
                    mentionPrefix: "~",
                    hashtagPrefix: "+"
                },
                richTextConfig: {
                    mentionPrefix: "~",
                    hashtagPrefix: "+"
                }
            })

            const text = "Olá ~alice veja +tech em https://example.com"

            // Testar extração
            customLib.extractor.setText(text)
            const extracted = customLib.extractor.entities({
                mentions: true,
                hashtags: true,
                urls: true
            })

            expect(extracted.mentions).toEqual(["~alice"])
            expect(extracted.hashtags).toEqual(["+tech"])
            expect(extracted.urls).toEqual(["https://example.com"])

            // Testar rich text
            customLib.rich.setText(text, {
                mentions: { alice: "u1" },
                hashtags: { tech: "t1" }
            })

            const entities = customLib.rich.extractEntities()
            expect(entities.mentions[0]).toEqual({ text: "alice", id: "u1" })
            expect(entities.hashtags[0]).toEqual({ text: "tech", id: "t1" })
        })

        it("deve processar workflow completo com prefixos customizados", () => {
            const customLib = new TextLibrary({
                validationRules: {
                    username: {
                        minLength: { enabled: true, value: 3, description: "Mínimo 3" },
                        maxLength: { enabled: true, value: 20, description: "Máximo 20" }
                    }
                },
                extractorConfig: {
                    mentionPrefix: "~",
                    hashtagPrefix: "+"
                },
                richTextConfig: {
                    mentionPrefix: "~",
                    hashtagPrefix: "+"
                },
                conversorConfig: {
                    defaultSliceLength: 50,
                    sliceSuffix: "..."
                }
            })

            const postText =
                "Olá ~alice ~bob! Confiram +technology +coding +webdev em https://example.com. Este é um texto muito longo para testar o corte!"

            // 1. Extrair entidades
            customLib.extractor.setText(postText)
            const extracted = customLib.extractor.entities({
                mentions: true,
                hashtags: true,
                urls: true
            })

            expect(extracted.mentions).toHaveLength(2)
            expect(extracted.hashtags).toHaveLength(3)
            expect(extracted.urls).toHaveLength(1)

            // 2. Criar rich text
            customLib.rich.setText(postText, {
                mentions: {
                    alice: "user_1",
                    bob: "user_2"
                },
                hashtags: {
                    technology: "tag_1",
                    coding: "tag_2",
                    webdev: "tag_3"
                }
            })

            const richEntities = customLib.rich.extractEntities()
            expect(richEntities.mentions).toHaveLength(2)
            expect(richEntities.hashtags).toHaveLength(3)

            // 3. Criar preview
            const preview = customLib.conversor.sliceWithDots({
                text: postText,
                size: 50
            })
            expect(preview).toContain("...")
            expect(preview.length).toBeLessThanOrEqual(53)

            // 4. Validar que o formato UI mantém os prefixos
            const ui = customLib.rich.formatToUI()
            expect(ui.text).toContain("~alice")
            expect(ui.text).toContain("+technology")

            // 5. Verificar que normalização funciona
            const normalized = customLib.rich.formatToNormal()
            expect(normalized).toContain("~alice")
            expect(normalized).toContain("~bob")
            expect(normalized).toContain("+technology")
        })
    })
})
