// Suíte da API v2 do RichText (modelo de segmentos, HTML, tokens, UI, stats,
// truncate, extração absorvida e notação compacta inline).

import { describe, expect, it } from "vitest"

import { RichText } from "../index"

describe("RichText v2 — modelo de segmentos", () => {
    describe("parse / tokenize", () => {
        it("tokeniza texto + entidades com posições corretas", () => {
            const segs = RichText.parse("Olá @alice")
            expect(segs).toEqual([
                { type: "text", raw: "Olá ", value: "Olá ", start: 0, end: 4 },
                { type: "mention", raw: "@alice", value: "alice", start: 4, end: 10 }
            ])
        })

        it("prioriza URL sobre # e @ (não corrompe âncoras/paths)", () => {
            const a = RichText.parse("veja https://site.com/#secao agora")
            const url = a.find((s) => s.type === "url")
            expect(url?.value).toBe("https://site.com/#secao")
            expect(a.some((s) => s.type === "hashtag")).toBe(false)

            const b = RichText.parse("perfil https://twitter.com/@jack ok")
            const url2 = b.find((s) => s.type === "url")
            expect(url2?.value).toBe("https://twitter.com/@jack")
            expect(b.some((s) => s.type === "mention")).toBe(false)
        })

        it("apara pontuação final de URLs", () => {
            const segs = RichText.parse("veja https://a.com/path, e www.y.com.")
            const urls = segs.filter((s) => s.type === "url").map((s) => s.value)
            expect(urls).toEqual(["https://a.com/path", "www.y.com"])
        })

        it("reconhece e-mails", () => {
            const segs = RichText.parse("fale com a@b.com por favor")
            const email = segs.find((s) => s.type === "email")
            expect(email?.value).toBe("a@b.com")
        })

        it("e-mail tem prioridade sobre mention (não vira @b.com)", () => {
            const segs = RichText.parse("ping joao.silva+tag@mail.co agora")
            const email = segs.find((s) => s.type === "email")
            expect(email?.value).toBe("joao.silva+tag@mail.co")
            expect(segs.some((s) => s.type === "mention")).toBe(false)
        })

        it("reconhece hashtags unicode (acentos/CJK) via \\p{L}", () => {
            const segs = RichText.parse("#café #ação #日本語 #straße")
            const tags = segs.filter((s) => s.type === "hashtag").map((s) => s.value)
            expect(tags).toEqual(["café", "ação", "日本語", "straße"])
        })

        it("mention preserva ._- mas para no espaço", () => {
            const segs = RichText.parse("@a.b-c_d fim")
            const m = segs.find((s) => s.type === "mention")
            expect(m?.value).toBe("a.b-c_d")
        })

        it("trata o formato enriquecido literal como texto (sem injeção)", () => {
            const segs = RichText.parse("[txt:x, ent:mention]")
            expect(segs).toHaveLength(1)
            expect(segs[0]?.type).toBe("text")
        })

        it("texto vazio produz nenhum segmento", () => {
            expect(RichText.parse("")).toEqual([])
        })

        it("suporta entidades customizadas com prioridade", () => {
            const segs = RichText.parse("comprei $AAPL hoje", {
                custom: [{ type: "cashtag", pattern: /\$[A-Z]{1,5}/, sigil: "$" }]
            })
            const cash = segs.find((s) => s.type === "cashtag")
            expect(cash?.value).toBe("AAPL")
            expect(cash?.raw).toBe("$AAPL")
        })

        it("entidade custom sem sigilo mantém value === raw", () => {
            const segs = RichText.parse("oi :smile: tchau", {
                custom: [{ type: "emoji", pattern: /:[a-z]+:/ }]
            })
            const emoji = segs.find((s) => s.type === "emoji")
            expect(emoji?.value).toBe(":smile:")
            expect(emoji?.raw).toBe(":smile:")
        })
    })

    describe("metadados (mapa simples + resolver)", () => {
        it("anexa id via mapa simples (mentions)", () => {
            const segs = RichText.parse("Olá @alice", { mentions: { alice: "u1" } })
            const m = segs.find((s) => s.type === "mention")
            expect(m?.data?.id).toBe("u1")
        })

        it("anexa id via mapa simples (hashtags)", () => {
            const segs = RichText.parse("amo #js", { hashtags: { js: "t1" } })
            const h = segs.find((s) => s.type === "hashtag")
            expect(h?.data?.id).toBe("t1")
        })

        it("anexa dados ricos via resolver", () => {
            const segs = RichText.parse("Olá @alice", {
                resolve: { mention: (h) => ({ id: "x", href: `/u/${h}`, displayName: h }) }
            })
            const m = segs.find((s) => s.type === "mention")
            expect(m?.data).toEqual({ id: "x", href: "/u/alice", displayName: "alice" })
        })

        it("resolver tem precedência de id sobre o mapa simples", () => {
            const segs = RichText.parse("@alice", {
                mentions: { alice: "fromMap" },
                resolve: { mention: () => ({ id: "fromResolver" }) }
            })
            const m = segs.find((s) => s.type === "mention")
            expect(m?.data?.id).toBe("fromResolver")
        })

        it("mapa preenche id quando resolver não devolve id", () => {
            const segs = RichText.parse("@alice", {
                mentions: { alice: "u9" },
                resolve: { mention: () => ({ href: "/u/alice" }) }
            })
            const m = segs.find((s) => s.type === "mention")
            expect(m?.data).toEqual({ href: "/u/alice", id: "u9" })
        })
    })

    describe("toSegments (cópia defensiva)", () => {
        it("não compartilha referência de data com o interno", () => {
            const rt = new RichText("@alice", { mentions: { alice: "u1" } })
            const segs = rt.toSegments()
            const m = segs.find((s) => s.type === "mention")!
            m.data!.id = "MUTATED"
            expect(rt.toSegments().find((s) => s.type === "mention")?.data?.id).toBe("u1")
        })
    })

    describe("toNormal / toTokens / toUI / stats", () => {
        it("toNormal é lossless", () => {
            const text = "Oi @alice veja #café em https://x.com"
            expect(new RichText(text).toNormal()).toBe(text)
        })

        it("toTokens devolve tokens agnósticos", () => {
            const tokens = new RichText("@alice #js").toTokens()
            expect(tokens.map((t) => t.type)).toEqual(["mention", "text", "hashtag"])
        })

        it("toTokens carrega data quando presente", () => {
            const tokens = new RichText("@alice", { mentions: { alice: "u1" } }).toTokens()
            expect(tokens[0]?.data?.id).toBe("u1")
        })

        it("toUI devolve texto plano + entidades estruturadas", () => {
            const ui = new RichText("Oi @alice", { mentions: { alice: "u1" } }).toUI()
            expect(ui.text).toBe("Oi @alice")
            expect(ui.entities).toEqual([
                { type: "text", text: "Oi ", raw: "Oi ", start: 0, end: 3 },
                {
                    type: "mention",
                    text: "alice",
                    raw: "@alice",
                    start: 3,
                    end: 9,
                    data: { id: "u1" }
                }
            ])
        })

        it("stats conta por tipo nativo", () => {
            const s = new RichText("@a @b #c https://x.com d@e.com").stats()
            expect(s).toMatchObject({ mentions: 2, hashtags: 1, urls: 1, emails: 1 })
        })

        it("stats conta entidades custom pelo próprio tipo", () => {
            const s = new RichText("$AAPL $TSLA", {
                custom: [{ type: "cashtag", pattern: /\$[A-Z]{1,5}/, sigil: "$" }]
            }).stats()
            expect(s.cashtag).toBe(2)
        })
    })

    describe("toHTML", () => {
        it("escapa texto (XSS-safe) e aplica templates", () => {
            const html = new RichText("Oi @alice <script>", { mentions: { alice: "u1" } }).toHTML(
                {
                    mention: (e) => `<a href="/u/${e.data?.id}">@${e.value}</a>`
                }
            )
            expect(html).toBe('Oi <a href="/u/u1">@alice</a> &lt;script&gt;')
        })

        it("escapa todos os caracteres perigosos no texto", () => {
            const html = new RichText(`a & b < c > d " e ' f`).toHTML()
            expect(html).toBe("a &amp; b &lt; c &gt; d &quot; e &#39; f")
        })

        it("escapa entidades sem renderer (não há injeção)", () => {
            const html = new RichText("a@b.com").toHTML()
            expect(html).toBe("a@b.com")
        })

        it("entidade sem renderer correspondente cai no escape", () => {
            const html = new RichText("Oi @alice").toHTML({
                hashtag: () => "X"
            })
            expect(html).toBe("Oi @alice")
        })
    })

    describe("truncate", () => {
        it("não corta no meio de uma entidade", () => {
            expect(new RichText("Oi @alice_longa tudo").truncate(5)).toBe("Oi @alice_longa…")
        })

        it("devolve o texto inteiro se couber", () => {
            expect(new RichText("curto").truncate(50)).toBe("curto")
        })

        it("aceita ellipsis customizado", () => {
            expect(new RichText("Oi @alice_longa tudo").truncate(5, "...")).toBe(
                "Oi @alice_longa..."
            )
        })

        it("n negativo devolve o texto inteiro", () => {
            expect(new RichText("abc").truncate(-1)).toBe("abc")
        })
    })

    describe("extract (absorve o Extractor)", () => {
        it("sem options retorna todos os tipos (raw com sigilo)", () => {
            const r = RichText.extract("Oi @alice e @bob #js https://x.com a@b.com")
            expect(r).toEqual({
                mentions: ["@alice", "@bob"],
                hashtags: ["#js"],
                urls: ["https://x.com"],
                emails: ["a@b.com"]
            })
        })

        it("estático e de instância dão o mesmo resultado", () => {
            const text = "@alice #js https://x.com"
            expect(RichText.extract(text)).toEqual(new RichText(text).extract())
        })

        it("seletivo: só o tipo pedido aparece", () => {
            const r = RichText.extract("@alice #js", { mentions: true })
            expect(r).toEqual({ mentions: ["@alice"] })
        })

        it("seletivo múltiplo", () => {
            const r = RichText.extract("@alice #js https://x.com", {
                mentions: true,
                urls: true
            })
            expect(r).toEqual({ mentions: ["@alice"], urls: ["https://x.com"] })
        })

        it("unique remove duplicatas", () => {
            const r = new RichText("@a @a @b").extract({ mentions: true, unique: true })
            expect(r.mentions).toEqual(["@a", "@b"])
        })

        it("raw:false remove o sigilo", () => {
            const r = new RichText("@a #b").extract({ raw: false })
            expect(r.mentions).toEqual(["a"])
            expect(r.hashtags).toEqual(["b"])
        })

        it("emails seletivo", () => {
            const r = RichText.extract("a@b.com @notmail c@d.org", { emails: true })
            expect(r).toEqual({ emails: ["a@b.com", "c@d.org"] })
        })
    })

    describe("toCompact / fromCompact", () => {
        it("entidade sem metadado tem overhead zero", () => {
            expect(new RichText("Oi @alice").toCompact()).toBe("Oi @alice")
        })

        it("entidade com id carrega ~id~ inline", () => {
            expect(new RichText("Oi @alice", { mentions: { alice: "u1" } }).toCompact()).toBe(
                "Oi @alice~u1~"
            )
        })

        it("propriedades extras viram ;chave=valor", () => {
            const code = new RichText("@alice", {
                resolve: { mention: () => ({ id: "u1", href: "/u/alice" }) }
            }).toCompact()
            expect(code).toBe("@alice~u1;href=/u/alice~")
        })

        it("round-trip lossless de texto + ids", () => {
            const code = "Oi @alice~u1~ e @bob~u2~, viram #circle~t5~?"
            const rt = RichText.fromCompact(code)
            expect(rt.toNormal()).toBe("Oi @alice e @bob, viram #circle?")
            const tokens = rt.toTokens().filter((t) => t.type !== "text")
            expect(tokens.map((t) => [t.value, t.data?.id])).toEqual([
                ["alice", "u1"],
                ["bob", "u2"],
                ["circle", "t5"]
            ])
        })

        it("round-trip preserva props extras", () => {
            const original = new RichText("@alice", {
                resolve: { mention: () => ({ id: "u1", href: "/u/alice" }) }
            })
            const rt = RichText.fromCompact(original.toCompact())
            const m = rt.toSegments().find((s) => s.type === "mention")
            expect(m?.data).toEqual({ id: "u1", href: "/u/alice" })
        })

        it("escapa ~ literal como ~~", () => {
            const rt = new RichText("a ~ b")
            const code = rt.toCompact()
            expect(code).toBe("a ~~ b")
            expect(RichText.fromCompact(code).toNormal()).toBe("a ~ b")
        })

        it("fromCompact sem markers funciona como texto plano", () => {
            const rt = RichText.fromCompact("oi @alice #js")
            expect(rt.toNormal()).toBe("oi @alice #js")
            expect(rt.stats()).toMatchObject({ mentions: 1, hashtags: 1 })
        })
    })

    describe("Configurable", () => {
        it("expõe config readonly", () => {
            const rt = new RichText("@alice", { mentions: { alice: "u1" } })
            expect(rt.config.mapping.mentions).toEqual({ alice: "u1" })
        })

        it("withConfig deriva nova instância sem mutar a original", () => {
            const rt = new RichText("@alice", { mentions: { alice: "u1" } })
            const next = rt.withConfig({ mapping: { mentions: { alice: "u2" } } })
            expect(next).not.toBe(rt)
            expect(next.toSegments().find((s) => s.type === "mention")?.data?.id).toBe("u2")
            // original intacta
            expect(rt.toSegments().find((s) => s.type === "mention")?.data?.id).toBe("u1")
        })

        it("withConfig re-tokeniza preservando o texto base", () => {
            const rt = new RichText("oi @alice #js")
            const next = rt.withConfig({ mapping: { hashtags: { js: "t1" } } })
            expect(next.toNormal()).toBe("oi @alice #js")
            expect(next.toSegments().find((s) => s.type === "hashtag")?.data?.id).toBe("t1")
        })
    })
})
