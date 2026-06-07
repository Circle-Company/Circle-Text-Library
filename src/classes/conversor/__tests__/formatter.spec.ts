// Copyright 2025 Circle LLC
// Licensed under the MIT License

import { describe, expect, it } from "vitest"

import { Formatter, NumberFormatter, TextFormatter } from "../index"

// Expectativa locale-aware computada via Intl, para não acoplar os testes a uma
// versão específica de ICU (os literais compactos/moeda variam entre runtimes).
const intlNumber = (locale: string, options: Intl.NumberFormatOptions, n: number): string =>
    new Intl.NumberFormat(locale, options).format(n)

describe("NumberFormatter", () => {
    describe("instância (pt-BR default)", () => {
        const num = new NumberFormatter()

        it("expõe a config resolvida e congelada", () => {
            expect(num.config).toEqual({ locale: "pt-BR" })
            expect(Object.isFrozen(num.config)).toBe(true)
        })

        it("thousands usa separador de milhar pt-BR", () => {
            expect(num.thousands(1234567)).toBe(intlNumber("pt-BR", {}, 1234567))
            // pt-BR usa "." como separador de milhar
            expect(num.thousands(1234567)).toBe("1.234.567")
        })

        it("thousands lida com negativos e decimais (corrige o bug legado)", () => {
            expect(num.thousands(-1000)).toBe(intlNumber("pt-BR", {}, -1000))
            expect(num.thousands(1000.5)).toBe(intlNumber("pt-BR", {}, 1000.5))
        })

        it("compact abrevia números grandes corretamente (999999 ≈ 1 mi, não 999 K)", () => {
            const compactOpts: Intl.NumberFormatOptions = {
                notation: "compact",
                maximumFractionDigits: 1
            }
            expect(num.compact(1500)).toBe(intlNumber("pt-BR", compactOpts, 1500))
            expect(num.compact(999999)).toBe(intlNumber("pt-BR", compactOpts, 999999))
            // não deve conter "K" maiúsculo seguido de 999 (precisão preservada)
            expect(num.compact(999999)).not.toMatch(/999/)
        })

        it("currency formata em BRL por padrão", () => {
            expect(num.currency(1234.5)).toBe(
                intlNumber("pt-BR", { style: "currency", currency: "BRL" }, 1234.5)
            )
            expect(num.currency(1234.5)).toContain("R$")
        })

        it("percent trata o valor como fração", () => {
            expect(num.percent(0.25)).toBe(
                intlNumber("pt-BR", { style: "percent", maximumFractionDigits: 0 }, 0.25)
            )
            expect(num.percent(0.25)).toContain("25")
            expect(num.percent(0.2567, 2)).toBe(
                intlNumber("pt-BR", { style: "percent", maximumFractionDigits: 2 }, 0.2567)
            )
        })

        it("decimal fixa o número de casas", () => {
            expect(num.decimal(3.14159, 2)).toBe(
                intlNumber(
                    "pt-BR",
                    { minimumFractionDigits: 2, maximumFractionDigits: 2 },
                    3.14159
                )
            )
            // pt-BR usa vírgula decimal
            expect(num.decimal(3.14159, 2)).toBe("3,14")
        })

        it("ordinal retorna sufixo masculino pt-BR", () => {
            expect(num.ordinal(1)).toBe("1º")
            expect(num.ordinal(3)).toBe("3º")
            expect(num.ordinal(42)).toBe("42º")
        })

        it("fileSize escolhe a unidade legível", () => {
            expect(num.fileSize(0)).toBe("0 B")
            expect(num.fileSize(512)).toBe("512 B")
            expect(num.fileSize(1024)).toBe("1 KB")
            expect(num.fileSize(1048576)).toBe("1 MB")
            expect(num.fileSize(1073741824)).toBe("1 GB")
            // valor fracionário usa o separador decimal do locale
            expect(num.fileSize(2_500_000)).toMatch(/MB$/)
        })
    })

    describe("instância (en-US)", () => {
        const num = new NumberFormatter({ locale: "en-US" })

        it("thousands usa vírgula como separador de milhar", () => {
            expect(num.thousands(1234567)).toBe("1,234,567")
        })

        it("compact usa o formato en-US (1.5K)", () => {
            expect(num.compact(1500)).toBe(
                intlNumber("en-US", { notation: "compact", maximumFractionDigits: 1 }, 1500)
            )
            expect(num.compact(1500)).toBe("1.5K")
        })

        it("currency formata em USD", () => {
            expect(num.currency(1234.5, "USD")).toBe(
                intlNumber("en-US", { style: "currency", currency: "USD" }, 1234.5)
            )
            expect(num.currency(1234.5, "USD")).toBe("$1,234.50")
        })

        it("ordinal usa sufixos ingleses", () => {
            expect(num.ordinal(1)).toBe("1st")
            expect(num.ordinal(2)).toBe("2nd")
            expect(num.ordinal(3)).toBe("3rd")
            expect(num.ordinal(4)).toBe("4th")
            expect(num.ordinal(11)).toBe("11th")
            expect(num.ordinal(21)).toBe("21st")
            expect(num.ordinal(22)).toBe("22nd")
            expect(num.ordinal(23)).toBe("23rd")
        })
    })

    describe("estáticos (locale default pt-BR)", () => {
        it("delegam para uma instância pt-BR", () => {
            expect(NumberFormatter.thousands(1234567)).toBe("1.234.567")
            expect(NumberFormatter.compact(1500)).toBe(new NumberFormatter().compact(1500))
            expect(NumberFormatter.currency(1234.5)).toContain("R$")
            expect(NumberFormatter.percent(0.25)).toContain("25")
            expect(NumberFormatter.decimal(3.14159, 2)).toBe("3,14")
            expect(NumberFormatter.ordinal(3)).toBe("3º")
            expect(NumberFormatter.fileSize(1048576)).toBe("1 MB")
        })
    })

    describe("withConfig", () => {
        it("deriva uma nova instância imutável com o locale mesclado", () => {
            const base = new NumberFormatter()
            const derived = base.withConfig({ locale: "en-US" })
            expect(derived).toBeInstanceOf(NumberFormatter)
            expect(derived).not.toBe(base)
            expect(base.config.locale).toBe("pt-BR")
            expect(derived.config.locale).toBe("en-US")
            expect(derived.thousands(1234567)).toBe("1,234,567")
        })
    })
})

describe("TextFormatter", () => {
    describe("instância (pt-BR default)", () => {
        const text = new TextFormatter()

        it("expõe a config resolvida e congelada", () => {
            expect(text.config).toEqual({ locale: "pt-BR" })
            expect(Object.isFrozen(text.config)).toBe(true)
        })

        it("capitalize maiúscula só a primeira letra", () => {
            expect(text.capitalize("olá mundo")).toBe("Olá mundo")
            expect(text.capitalize("")).toBe("")
        })

        it("titleCase capitaliza cada palavra", () => {
            expect(text.titleCase("olá mundo")).toBe("Olá Mundo")
            expect(text.titleCase("the QUICK brown")).toBe("The Quick Brown")
        })

        it("reverse preserva emoji/surrogate pairs", () => {
            expect(text.reverse("abc")).toBe("cba")
            expect(text.reverse("a😀b")).toBe("b😀a")
            // o emoji não deve ser corrompido (sem U+FFFD)
            expect(text.reverse("a😀b")).not.toContain("�")
            // família com ZWJ — cada code point é mantido
            expect([...text.reverse("x👩‍🚀y")]).toContain("👩")
        })

        it("stripAccents remove diacríticos", () => {
            expect(text.stripAccents("ação")).toBe("acao")
            expect(text.stripAccents("café com leite")).toBe("cafe com leite")
        })

        it("slug gera uma string url-safe", () => {
            expect(text.slug("Olá, Mundo!")).toBe("ola-mundo")
            expect(text.slug("Café com Leite!")).toBe("cafe-com-leite")
            expect(text.slug("Meu Primeiro Post!")).toBe("meu-primeiro-post")
            expect(text.slug("  espaços   múltiplos  ")).toBe("espacos-multiplos")
            expect(text.slug("under_score e-hífen")).toBe("under-score-e-hifen")
        })

        it("initials extrai as iniciais", () => {
            expect(text.initials("João Silva")).toBe("JS")
            expect(text.initials("Maria Clara Souza")).toBe("MC")
            expect(text.initials("Maria Clara Souza", 3)).toBe("MCS")
            expect(text.initials("madonna")).toBe("M")
            expect(text.initials("")).toBe("")
            expect(text.initials("  espaço  duplo ")).toBe("ED")
        })

        it("brToNewlines troca <br> por quebras de linha", () => {
            expect(text.brToNewlines("a<br>b")).toBe("a\nb")
            expect(text.brToNewlines("a<br/>b<BR />c")).toBe("a\nb\nc")
        })
    })

    describe("truncate — orçamento de tamanho", () => {
        const text = new TextFormatter()

        it("nunca excede `size` (reticências contam no orçamento)", () => {
            const out = text.truncate("texto bem longo", 8)
            expect([...out].length).toBe(8)
            expect(out).toBe("texto b…")
            expect(out.endsWith("…")).toBe(true)
        })

        it("retorna o texto intacto quando já cabe", () => {
            expect(text.truncate("curto", 10)).toBe("curto")
            expect(text.truncate("exato", 5)).toBe("exato")
        })

        it("respeita reticências multi-char no orçamento", () => {
            const out = text.truncate("texto bem longo", 8, { ellipsis: "..." })
            expect([...out].length).toBe(8)
            expect(out).toBe("texto...")
        })

        it("byWord não corta no meio da palavra", () => {
            const out = text.truncate("texto bem longo", 8, { byWord: true })
            expect([...out].length).toBeLessThanOrEqual(8)
            expect(out).toBe("texto…")
        })

        it("preserva emoji ao cortar", () => {
            const out = text.truncate("a😀b😀c😀d", 4)
            expect([...out].length).toBe(4)
            expect(out).not.toContain("�")
        })

        it("string vazia retorna vazio", () => {
            expect(text.truncate("", 5)).toBe("")
        })
    })

    describe("truncateWords", () => {
        const text = new TextFormatter()

        it("corta por número de palavras", () => {
            expect(text.truncateWords("a b c d", 2)).toBe("a b…")
            expect(text.truncateWords("a b", 5)).toBe("a b")
            expect(text.truncateWords("um dois três", 2, "...")).toBe("um dois...")
        })
    })

    describe("instância (en-US)", () => {
        const text = new TextFormatter({ locale: "en-US" })

        it("capitalize/titleCase respeitam o locale", () => {
            expect(text.capitalize("hello")).toBe("Hello")
            expect(text.titleCase("hello world")).toBe("Hello World")
        })

        it("config reflete o locale en-US", () => {
            expect(text.config.locale).toBe("en-US")
        })
    })

    describe("estáticos (locale default pt-BR)", () => {
        it("delegam para uma instância pt-BR", () => {
            expect(TextFormatter.capitalize("olá mundo")).toBe("Olá mundo")
            expect(TextFormatter.titleCase("olá mundo")).toBe("Olá Mundo")
            expect(TextFormatter.reverse("a😀b")).toBe("b😀a")
            expect(TextFormatter.stripAccents("ação")).toBe("acao")
            expect(TextFormatter.slug("Olá, Mundo!")).toBe("ola-mundo")
            expect(TextFormatter.truncate("texto bem longo", 8)).toBe("texto b…")
            expect(TextFormatter.truncateWords("a b c d", 2)).toBe("a b…")
            expect(TextFormatter.initials("João Silva")).toBe("JS")
            expect(TextFormatter.brToNewlines("a<br>b")).toBe("a\nb")
        })
    })

    describe("withConfig", () => {
        it("deriva uma nova instância imutável", () => {
            const base = new TextFormatter()
            const derived = base.withConfig({ locale: "en-US" })
            expect(derived).toBeInstanceOf(TextFormatter)
            expect(derived).not.toBe(base)
            expect(base.config.locale).toBe("pt-BR")
            expect(derived.config.locale).toBe("en-US")
        })
    })
})

describe("Formatter (agregado)", () => {
    it("expõe number e text com o locale default", () => {
        const fmt = new Formatter()
        expect(fmt.number).toBeInstanceOf(NumberFormatter)
        expect(fmt.text).toBeInstanceOf(TextFormatter)
        expect(fmt.config).toEqual({ locale: "pt-BR" })
        expect(fmt.number.thousands(1234567)).toBe("1.234.567")
        expect(fmt.text.capitalize("olá")).toBe("Olá")
    })

    it("propaga o locale configurado para ambos os sub-formatters", () => {
        const fmt = new Formatter({ locale: "en-US" })
        expect(fmt.number.config.locale).toBe("en-US")
        expect(fmt.text.config.locale).toBe("en-US")
        expect(fmt.number.compact(1500)).toBe("1.5K")
        expect(fmt.text.capitalize("hello")).toBe("Hello")
    })

    it("withConfig deriva um novo agregado imutável", () => {
        const base = new Formatter()
        const derived = base.withConfig({ locale: "en-US" })
        expect(derived).toBeInstanceOf(Formatter)
        expect(derived).not.toBe(base)
        expect(base.config.locale).toBe("pt-BR")
        expect(derived.config.locale).toBe("en-US")
        expect(derived.number.thousands(1234567)).toBe("1,234,567")
    })
})
