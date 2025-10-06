import { describe, expect, it } from "vitest"

import { RichText } from "../index"

describe("RichText", () => {
    describe("constructor e setText", () => {
        it("deve criar instância com texto simples sem IDs", () => {
            const text = "Olá mundo"
            const richText = new RichText()
            richText.setText(text)

            expect(richText.getBaseText()).toBe(text)
            expect(richText.getEnrichedText()).toBe(text)
        })

        it("deve criar instância com texto e mapeamento de entidades", () => {
            const text = "Olá @alice e @bob"
            const mapping = {
                mentions: {
                    alice: "user_123",
                    bob: "user_456"
                }
            }
            const richText = new RichText()
            richText.setText(text, mapping)

            expect(richText.getBaseText()).toBe(text)
            expect(richText.getEnrichedText()).toContain("id:user_123")
            expect(richText.getEnrichedText()).toContain("id:user_456")
        })

        it("deve processar texto com menções, hashtags e URLs", () => {
            const text = "Olá @user veja #tag em https://example.com"
            const richText = new RichText()
            richText.setText(text)

            expect(richText.getEnrichedText()).toContain("[txt:user, ent:mention]")
            expect(richText.getEnrichedText()).toContain("[txt:tag, ent:hashtag]")
            expect(richText.getEnrichedText()).toContain("[txt:https://example.com, ent:url]")
        })
    })

    // ========================================================================
    // TESTES DE formatToEnriched
    // ========================================================================
    describe("formatToEnriched", () => {
        it("deve converter menções sem IDs", () => {
            const richText = new RichText()
            const result = richText.formatToEnriched("Olá @alice")

            expect(result).toBe("Olá [txt:alice, ent:mention]")
        })

        it("deve converter menções com IDs", () => {
            const richText = new RichText()
            const result = richText.formatToEnriched("Olá @alice", {
                mentions: { alice: "user_123" }
            })

            expect(result).toBe("Olá [txt:alice, ent:mention, id:user_123]")
        })

        it("deve converter hashtags sem IDs", () => {
            const richText = new RichText()
            const result = richText.formatToEnriched("Veja #tecnologia")

            expect(result).toBe("Veja [txt:tecnologia, ent:hashtag]")
        })

        it("deve converter hashtags com IDs", () => {
            const richText = new RichText()
            const result = richText.formatToEnriched("Veja #tecnologia", {
                hashtags: { tecnologia: "tag_789" }
            })

            expect(result).toBe("Veja [txt:tecnologia, ent:hashtag, id:tag_789]")
        })

        it("deve converter URLs", () => {
            const richText = new RichText()
            const result = richText.formatToEnriched("Visite https://example.com")

            expect(result).toBe("Visite [txt:https://example.com, ent:url]")
        })

        it("deve converter múltiplas entidades", () => {
            const richText = new RichText()
            const result = richText.formatToEnriched(
                "Olá @alice e @bob #tech https://example.com",
                {
                    mentions: { alice: "u1", bob: "u2" },
                    hashtags: { tech: "t1" }
                }
            )

            expect(result).toContain("[txt:alice, ent:mention, id:u1]")
            expect(result).toContain("[txt:bob, ent:mention, id:u2]")
            expect(result).toContain("[txt:tech, ent:hashtag, id:t1]")
            expect(result).toContain("[txt:https://example.com, ent:url]")
        })

        it("deve aceitar usernames com pontos e hífens", () => {
            const richText = new RichText()
            const result = richText.formatToEnriched("@user.name @user-name @user_name")

            expect(result).toContain("[txt:user.name, ent:mention]")
            expect(result).toContain("[txt:user-name, ent:mention]")
            expect(result).toContain("[txt:user_name, ent:mention]")
        })

        it("deve aceitar hashtags com underscores", () => {
            const richText = new RichText()
            const result = richText.formatToEnriched("#hash_tag")

            expect(result).toBe("[txt:hash_tag, ent:hashtag]")
        })

        it("deve retornar string vazia para texto vazio", () => {
            const richText = new RichText()
            const result = richText.formatToEnriched("")

            expect(result).toBe("")
        })

        it("deve retornar string vazia para null/undefined", () => {
            const richText = new RichText()
            const result = richText.formatToEnriched(null as any)

            expect(result).toBe("")
        })

        it("deve processar IDs parciais (algumas entidades com ID, outras sem)", () => {
            const richText = new RichText()
            const result = richText.formatToEnriched("@alice @bob @charlie", {
                mentions: { alice: "u1", charlie: "u3" }
            })

            expect(result).toContain("[txt:alice, ent:mention, id:u1]")
            expect(result).toContain("[txt:bob, ent:mention]")
            expect(result).toContain("[txt:charlie, ent:mention, id:u3]")
        })
    })

    // ========================================================================
    // TESTES DE formatToNormal
    // ========================================================================
    describe("formatToNormal", () => {
        it("deve converter menções enriquecidas de volta", () => {
            const richText = new RichText()
            const result = richText.formatToNormal("[txt:alice, ent:mention, id:123]")

            expect(result).toBe("@alice")
        })

        it("deve converter menções sem ID de volta", () => {
            const richText = new RichText()
            const result = richText.formatToNormal("[txt:alice, ent:mention]")

            expect(result).toBe("@alice")
        })

        it("deve converter hashtags enriquecidas de volta", () => {
            const richText = new RichText()
            const result = richText.formatToNormal("[txt:tech, ent:hashtag, id:789]")

            expect(result).toBe("#tech")
        })

        it("deve converter hashtags sem ID de volta", () => {
            const richText = new RichText()
            const result = richText.formatToNormal("[txt:tech, ent:hashtag]")

            expect(result).toBe("#tech")
        })

        it("deve converter URLs enriquecidas de volta", () => {
            const richText = new RichText()
            const result = richText.formatToNormal("[txt:https://example.com, ent:url]")

            expect(result).toBe("https://example.com")
        })

        it("deve converter texto completo de volta", () => {
            const enriched =
                "Olá [txt:alice, ent:mention, id:123] veja [txt:tech, ent:hashtag] em [txt:https://example.com, ent:url]"
            const richText = new RichText()
            const result = richText.formatToNormal(enriched)

            expect(result).toBe("Olá @alice veja #tech em https://example.com")
        })

        it("deve usar texto enriquecido interno se não fornecer parâmetro", () => {
            const richText = new RichText()
            richText.setText("Olá @alice", { mentions: { alice: "u1" } })
            const result = richText.formatToNormal()

            expect(result).toBe("Olá @alice")
        })

        it("deve retornar string vazia para texto vazio", () => {
            const richText = new RichText()
            const result = richText.formatToNormal("")

            expect(result).toBe("")
        })

        it("deve preservar texto sem entidades", () => {
            const richText = new RichText()
            const result = richText.formatToNormal("Apenas texto normal")

            expect(result).toBe("Apenas texto normal")
        })
    })

    // ========================================================================
    // TESTES DE extractEntities
    // ========================================================================
    describe("extractEntities", () => {
        it("deve extrair menções com IDs", () => {
            const enriched = "[txt:alice, ent:mention, id:user_123]"
            const richText = new RichText()
            const result = richText.extractEntities(enriched)

            expect(result.mentions).toHaveLength(1)
            expect(result.mentions[0]).toEqual({ text: "alice", id: "user_123" })
        })

        it("deve extrair menções sem IDs", () => {
            const enriched = "[txt:bob, ent:mention]"
            const richText = new RichText()
            const result = richText.extractEntities(enriched)

            expect(result.mentions).toHaveLength(1)
            expect(result.mentions[0]).toEqual({ text: "bob" })
        })

        it("deve extrair hashtags com IDs", () => {
            const enriched = "[txt:tech, ent:hashtag, id:tag_789]"
            const richText = new RichText()
            const result = richText.extractEntities(enriched)

            expect(result.hashtags).toHaveLength(1)
            expect(result.hashtags[0]).toEqual({ text: "tech", id: "tag_789" })
        })

        it("deve extrair hashtags sem IDs", () => {
            const enriched = "[txt:js, ent:hashtag]"
            const richText = new RichText()
            const result = richText.extractEntities(enriched)

            expect(result.hashtags).toHaveLength(1)
            expect(result.hashtags[0]).toEqual({ text: "js" })
        })

        it("deve extrair URLs", () => {
            const enriched = "[txt:https://example.com, ent:url]"
            const richText = new RichText()
            const result = richText.extractEntities(enriched)

            expect(result.urls).toHaveLength(1)
            expect(result.urls[0]).toEqual({ text: "https://example.com" })
        })

        it("deve extrair múltiplas entidades de cada tipo", () => {
            const enriched =
                "[txt:alice, ent:mention, id:u1] [txt:bob, ent:mention] [txt:tech, ent:hashtag, id:t1] [txt:js, ent:hashtag] [txt:https://a.com, ent:url]"
            const richText = new RichText()
            const result = richText.extractEntities(enriched)

            expect(result.mentions).toHaveLength(2)
            expect(result.hashtags).toHaveLength(2)
            expect(result.urls).toHaveLength(1)
        })

        it("deve usar texto enriquecido interno se não fornecer parâmetro", () => {
            const richText = new RichText()
            richText.setText("@alice #tech", {
                mentions: { alice: "u1" },
                hashtags: { tech: "t1" }
            })
            const result = richText.extractEntities()

            expect(result.mentions).toHaveLength(1)
            expect(result.hashtags).toHaveLength(1)
            expect(result.mentions[0]).toEqual({ text: "alice", id: "u1" })
            expect(result.hashtags[0]).toEqual({ text: "tech", id: "t1" })
        })

        it("deve retornar arrays vazios para texto sem entidades", () => {
            const richText = new RichText()
            const result = richText.extractEntities("apenas texto")

            expect(result.mentions).toHaveLength(0)
            expect(result.hashtags).toHaveLength(0)
            expect(result.urls).toHaveLength(0)
        })

        it("deve retornar arrays vazios para string vazia", () => {
            const richText = new RichText()
            const result = richText.extractEntities("")

            expect(result.mentions).toHaveLength(0)
            expect(result.hashtags).toHaveLength(0)
            expect(result.urls).toHaveLength(0)
        })

        it("deve suportar IDs alfanuméricos com underscores", () => {
            const enriched = "[txt:alice, ent:mention, id:user_abc_123]"
            const richText = new RichText()
            const result = richText.extractEntities(enriched)

            expect(result.mentions[0]?.id).toBe("user_abc_123")
        })
    })

    // ========================================================================
    // TESTES DE formatToUI
    // ========================================================================
    describe("formatToUI", () => {
        it("deve retornar texto e entidades com posições", () => {
            const richText = new RichText()
            richText.setText("Olá @alice")
            const result = richText.formatToUI()

            expect(result.text).toBe("Olá @alice")
            expect(result.entities).toBeDefined()
            expect(Array.isArray(result.entities)).toBe(true)
        })

        it("deve calcular posições corretas para texto simples", () => {
            const richText = new RichText()
            richText.setText("Olá @alice")
            const result = richText.formatToUI()

            const textEntity = result.entities.find((e) => e.type === "text")
            const mentionEntity = result.entities.find((e) => e.type === "mention")

            expect(textEntity).toBeDefined()
            expect(textEntity?.text).toBe("Olá ")
            expect(textEntity?.start).toBe(0)
            expect(textEntity?.end).toBe(4)

            expect(mentionEntity).toBeDefined()
            expect(mentionEntity?.text).toBe("alice")
            expect(mentionEntity?.start).toBe(4)
            expect(mentionEntity?.end).toBe(10)
        })

        it("deve incluir IDs nas entidades quando disponíveis", () => {
            const richText = new RichText()
            richText.setText("@alice", {
                mentions: { alice: "user_123" }
            })
            const result = richText.formatToUI()

            const mentionEntity = result.entities.find((e) => e.type === "mention")
            expect(mentionEntity?.id).toBe("user_123")
        })

        it("deve processar múltiplas entidades com posições corretas", () => {
            const richText = new RichText()
            richText.setText("Olá @alice e @bob")
            const result = richText.formatToUI()

            const mentions = result.entities.filter((e) => e.type === "mention")
            expect(mentions).toHaveLength(2)

            const alice = mentions.find((m) => m.text === "alice")
            const bob = mentions.find((m) => m.text === "bob")

            expect(alice).toBeDefined()
            expect(bob).toBeDefined()
            expect(alice!.start).toBeLessThan(bob!.start)
        })

        it("deve processar hashtags com prefixo #", () => {
            const richText = new RichText()
            richText.setText("#tech")
            const result = richText.formatToUI()

            expect(result.text).toBe("#tech")
            const hashtagEntity = result.entities.find((e) => e.type === "hashtag")
            expect(hashtagEntity?.text).toBe("tech")
        })

        it("deve processar URLs sem prefixo", () => {
            const richText = new RichText()
            richText.setText("https://example.com")
            const result = richText.formatToUI()

            expect(result.text).toBe("https://example.com")
            const urlEntity = result.entities.find((e) => e.type === "url")
            expect(urlEntity?.text).toBe("https://example.com")
        })

        it("deve processar texto com todas as entidades misturadas", () => {
            const richText = new RichText()
            richText.setText("Olá @alice veja #tech em https://example.com")
            const result = richText.formatToUI()

            const mentions = result.entities.filter((e) => e.type === "mention")
            const hashtags = result.entities.filter((e) => e.type === "hashtag")
            const urls = result.entities.filter((e) => e.type === "url")
            const texts = result.entities.filter((e) => e.type === "text")

            expect(mentions).toHaveLength(1)
            expect(hashtags).toHaveLength(1)
            expect(urls).toHaveLength(1)
            expect(texts.length).toBeGreaterThan(0)
        })

        it("deve aceitar texto enriquecido personalizado como parâmetro", () => {
            const richText = new RichText()
            richText.setText("texto inicial")
            const customEnriched = "Novo [txt:alice, ent:mention, id:u1]"
            const result = richText.formatToUI(customEnriched)

            expect(result.text).toBe("Novo @alice")
            const mentionEntity = result.entities.find((e) => e.type === "mention")
            expect(mentionEntity?.id).toBe("u1")
        })

        it("deve retornar apenas texto quando não há entidades", () => {
            const richText = new RichText()
            richText.setText("apenas texto")
            const result = richText.formatToUI()

            expect(result.text).toBe("apenas texto")
            expect(result.entities).toHaveLength(1)
            expect(result.entities[0]?.type).toBe("text")
        })
    })

    // ========================================================================
    // TESTES DE updateText
    // ========================================================================
    describe("updateText", () => {
        it("deve atualizar o texto base", () => {
            const richText = new RichText()
            richText.setText("texto inicial")
            richText.updateText("novo texto")

            expect(richText.getBaseText()).toBe("novo texto")
        })

        it("deve regenerar texto enriquecido após atualização", () => {
            const richText = new RichText()
            richText.setText("texto inicial")
            const initialEnriched = richText.getEnrichedText()

            richText.updateText("novo @alice")

            expect(richText.getEnrichedText()).not.toBe(initialEnriched)
            expect(richText.getEnrichedText()).toContain("[txt:alice, ent:mention]")
        })

        it("deve aceitar novo mapeamento de entidades", () => {
            const richText = new RichText()
            richText.setText("@alice")
            richText.updateText("@bob", {
                mentions: { bob: "user_new" }
            })

            expect(richText.getEnrichedText()).toContain("id:user_new")
        })

        it("deve manter mapeamento anterior se não fornecer novo", () => {
            const richText = new RichText()
            richText.setText("@alice", {
                mentions: { alice: "user_1" }
            })

            richText.updateText("@alice novamente")

            expect(richText.getEnrichedText()).toContain("id:user_1")
        })

        it("deve sobrescrever mapeamento anterior se fornecer novo", () => {
            const richText = new RichText()
            richText.setText("@alice", {
                mentions: { alice: "user_old" }
            })

            richText.updateText("@alice", {
                mentions: { alice: "user_new" }
            })

            expect(richText.getEnrichedText()).toContain("id:user_new")
            expect(richText.getEnrichedText()).not.toContain("id:user_old")
        })
    })

    // ========================================================================
    // TESTES DE getBaseText
    // ========================================================================
    describe("getBaseText", () => {
        it("deve retornar o texto base original", () => {
            const text = "Olá @alice"
            const richText = new RichText()
            richText.setText(text)

            expect(richText.getBaseText()).toBe(text)
        })

        it("deve retornar texto atualizado após updateText", () => {
            const richText = new RichText()
            richText.setText("texto inicial")
            richText.updateText("texto novo")

            expect(richText.getBaseText()).toBe("texto novo")
        })
    })

    // ========================================================================
    // TESTES DE getEnrichedText
    // ========================================================================
    describe("getEnrichedText", () => {
        it("deve retornar o texto enriquecido", () => {
            const richText = new RichText()
            richText.setText("@alice")

            expect(richText.getEnrichedText()).toContain("[txt:alice, ent:mention]")
        })

        it("deve retornar texto enriquecido com IDs quando fornecidos", () => {
            const richText = new RichText()
            richText.setText("@alice", {
                mentions: { alice: "u1" }
            })

            expect(richText.getEnrichedText()).toContain("id:u1")
        })

        it("deve retornar texto atualizado após updateText", () => {
            const richText = new RichText()
            richText.setText("@alice")
            const initial = richText.getEnrichedText()

            richText.updateText("@bob")
            const updated = richText.getEnrichedText()

            expect(updated).not.toBe(initial)
            expect(updated).toContain("bob")
        })
    })

    // ========================================================================
    // TESTES DE INTEGRAÇÃO E CASOS EDGE
    // ========================================================================
    describe("Testes de Integração", () => {
        it("deve processar fluxo completo: criar -> enriquecer -> normalizar", () => {
            const original = "Olá @alice veja #tech"
            const richText = new RichText()
            richText.setText(original, {
                mentions: { alice: "u1" },
                hashtags: { tech: "t1" }
            })

            const enriched = richText.getEnrichedText()
            expect(enriched).toContain("id:u1")
            expect(enriched).toContain("id:t1")

            const normalized = richText.formatToNormal()
            expect(normalized).toBe(original)
        })

        it("deve manter consistência entre métodos", () => {
            const richText = new RichText()
            richText.setText("@alice #tech https://example.com", {
                mentions: { alice: "u1" },
                hashtags: { tech: "t1" }
            })

            const entities = richText.extractEntities()
            const ui = richText.formatToUI()

            expect(entities.mentions).toHaveLength(1)
            expect(entities.hashtags).toHaveLength(1)
            expect(entities.urls).toHaveLength(1)

            expect(ui.entities.filter((e) => e.type === "mention")).toHaveLength(1)
            expect(ui.entities.filter((e) => e.type === "hashtag")).toHaveLength(1)
            expect(ui.entities.filter((e) => e.type === "url")).toHaveLength(1)
        })

        it("deve processar texto real de chat", () => {
            const message =
                "Oi @joao.silva, obrigado por compartilhar #javascript e https://github.com/project"
            const richText = new RichText()
            richText.setText(message, {
                mentions: { "joao.silva": "user_abc123" },
                hashtags: { javascript: "tag_xyz789" }
            })

            const entities = richText.extractEntities()
            expect(entities.mentions[0]?.id).toBe("user_abc123")
            expect(entities.hashtags[0]?.id).toBe("tag_xyz789")
            expect(entities.urls[0]?.text).toBe("https://github.com/project")

            const ui = richText.formatToUI()
            expect(ui.text).toBe(message)
        })

        it("deve lidar com emojis e caracteres especiais no texto", () => {
            const text = "Olá @alice! 😀 #tech 🚀"
            const richText = new RichText()
            richText.setText(text)

            const normalized = richText.formatToNormal()
            expect(normalized).toContain("😀")
            expect(normalized).toContain("🚀")
        })

        it("deve processar múltiplas menções da mesma pessoa", () => {
            const richText = new RichText()
            richText.setText("@alice e @alice novamente", {
                mentions: { alice: "u1" }
            })

            const entities = richText.extractEntities()
            expect(entities.mentions).toHaveLength(2)
            expect(entities.mentions[0]?.id).toBe("u1")
            expect(entities.mentions[1]?.id).toBe("u1")
        })
    })
})
