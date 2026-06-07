// Copyright 2025 Circle LLC
// Licensed under the MIT License

// Uso real da lib: cenários ponta-a-ponta combinando várias engines, como um
// consumidor faria (moderar/exibir um post, onboarding de usuário, render de feed
// com timezone do leitor, pipeline de review, round-trip de armazenamento).

import { describe, expect, it } from "vitest"

import { RichText, TextLibrary, Timezone } from "../index"

// Expectativa locale-aware computada via Intl — robusto entre versões de ICU.
const intlNumber = (locale: string, options: Intl.NumberFormatOptions, n: number): string =>
    new Intl.NumberFormat(locale, options).format(n)

describe("cenário: moderar e exibir um post de rede social", () => {
    const ct = new TextLibrary({
        validation: {
            username: {
                minLength: { enabled: true, value: 3 },
                maxLength: { enabled: true, value: 20 }
            }
        },
        format: { locale: "pt-BR" }
    })

    const post = "Que evento maravilhoso! Obrigado @ana e @bruno 🎉 #circle https://circle.app"

    it("valida o autor do post", () => {
        expect(ct.validator.username("ana").isValid).toBe(true)
        expect(ct.validator.username("xy").isValid).toBe(false)
    })

    it("extrai menções, hashtags e urls do corpo", () => {
        const r = RichText.extract(post)
        expect(r.mentions).toEqual(["@ana", "@bruno"])
        expect(r.hashtags).toEqual(["#circle"])
        expect(r.urls).toEqual(["https://circle.app"])
    })

    it("classifica o sentimento como positivo", () => {
        expect(ct.sentiment.analyze(post).sentiment).toBe("positive")
    })

    it("deriva keywords para indexação", () => {
        const kws = ct.keywords.extract(post)
        expect(Array.isArray(kws)).toBe(true)
        expect(kws.length).toBeGreaterThan(0)
        expect(kws.every((k) => typeof k === "string")).toBe(true)
    })

    it("formata a contagem de curtidas de forma compacta", () => {
        const compactOpts: Intl.NumberFormatOptions = {
            notation: "compact",
            maximumFractionDigits: 1
        }
        expect(ct.format.number.compact(12500)).toBe(intlNumber("pt-BR", compactOpts, 12500))
    })
})

describe("cenário: render de menções/hashtags para HTML (XSS-safe)", () => {
    it("renderiza entidades com ids e escapa o texto livre", () => {
        const rt = new RichText("Oi @ana, viu o #lancamento? <script>", {
            mentions: { ana: "u_1" },
            hashtags: { lancamento: "t_9" }
        })
        const html = rt.toHTML({
            mention: (s) => `<a class="m" data-id="${s.data?.id}">@${s.value}</a>`,
            hashtag: (s) => `<a class="h" data-id="${s.data?.id}">#${s.value}</a>`
        })
        expect(html).toContain('<a class="m" data-id="u_1">@ana</a>')
        expect(html).toContain('<a class="h" data-id="t_9">#lancamento</a>')
        // o "<script>" do texto livre é escapado, não injetado
        expect(html).toContain("&lt;script&gt;")
        expect(html).not.toContain("<script>")
    })

    it("expõe offsets corretos no formato de UI", () => {
        const ui = new RichText("Olá @alice").toUI()
        const mention = ui.entities.find((e) => e.type === "mention")
        expect(mention).toMatchObject({ type: "mention", text: "alice", start: 4, end: 10 })
    })
})

describe("cenário: armazenamento — round-trip compacto lossless", () => {
    it("normal → compact → fromCompact preserva texto e metadados", () => {
        const text = "Fala @joao! Acesse https://site.com #novidade ou joao@mail.com"
        const rt = new RichText(text, { mentions: { joao: "55" } })

        const code = rt.toCompact()
        const restored = RichText.fromCompact(code)

        expect(restored.toNormal()).toBe(text) // lossless
        const mention = restored.toUI().entities.find((e) => e.type === "mention")
        expect(mention?.data?.id).toBe("55") // metadado sobrevive ao round-trip
    })

    it("truncate nunca parte uma entidade no meio", () => {
        const rt = new RichText("Olá @alice, bem-vinda!")
        const cut = rt.truncate(6)
        // o corte cairia dentro de "@alice"; a entidade inteira é mantida
        expect(cut).toContain("@alice")
        expect(cut.endsWith("…")).toBe(true)
    })
})

describe("cenário: onboarding de usuário", () => {
    const ct = new TextLibrary({
        validation: {
            name: {
                requireFullName: { enabled: true, value: true },
                requireOnlyLetters: { enabled: true, value: true }
            },
            username: {
                minLength: { enabled: true, value: 3 },
                maxLength: { enabled: true, value: 15 },
                onlyAlphaNumeric: { enabled: true, value: true }
            },
            password: {
                minLength: { enabled: true, value: 8 },
                requireUppercase: { enabled: true, value: true },
                requireNumbers: { enabled: true, value: true }
            }
        }
    })

    it("aceita um cadastro válido e gera as iniciais", () => {
        expect(ct.validator.name("Ana Beatriz").isValid).toBe(true)
        expect(ct.validator.username("anabia").isValid).toBe(true)
        expect(ct.validator.password("Senha123").isValid).toBe(true)
        expect(ct.format.text.initials("Ana Beatriz")).toBe("AB")
    })

    it("rejeita um cadastro inválido com mensagens em pt-BR", () => {
        expect(ct.validator.name("ana").isValid).toBe(false) // sem sobrenome
        const pwd = ct.validator.password("fraca")
        expect(pwd.isValid).toBe(false)
        expect(pwd.errors.length).toBeGreaterThan(0)
        expect(pwd.errors.every((e) => typeof e === "string")).toBe(true)
    })
})

describe("cenário: feed exibido no fuso de cada leitor", () => {
    it("o mesmo instante UTC aparece diferente em São Paulo e Tóquio", () => {
        const instant = "2024-12-25T00:30:00Z"
        const sp = new Timezone({ zone: "America/Sao_Paulo", locale: "pt-BR" })
        const tokyo = new Timezone({ zone: "Asia/Tokyo", locale: "pt-BR" })

        const inSp = sp.format(instant)
        const inTokyo = tokyo.format(instant)

        expect(inSp).toContain("21:30") // 00:30Z − 3h
        expect(inTokyo).toContain("09:30") // 00:30Z + 9h
        expect(inSp).not.toBe(inTokyo)
    })

    it("fromNow descreve a idade de um post de forma relativa", () => {
        const tz = new Timezone({
            locale: "pt-BR",
            now: () => new Date("2024-06-01T12:00:00Z")
        })
        expect(tz.fromNow("2024-06-01T09:00:00Z")).toContain("hora") // 3h atrás
    })
})

describe("cenário: pipeline de review (sentimento + formatação)", () => {
    const ct = new TextLibrary({ format: { locale: "pt-BR" } })

    it("classifica reviews positivos e negativos em lote", () => {
        const reviews = ["Produto maravilhoso, recomendo!", "Fiquei muito triste com o atendimento"]
        const out = ct.sentiment.analyzeMany(reviews)
        expect(out[0]?.sentiment).toBe("positive")
        expect(out[1]?.sentiment).toBe("negative")
    })

    it("formata o preço e a avaliação para exibição", () => {
        expect(ct.format.number.currency(49.9)).toContain("R$")
        expect(ct.format.number.percent(0.92)).toContain("92")
        expect(ct.format.number.fileSize(1048576)).toContain("MB")
    })
})
