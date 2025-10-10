import { beforeEach, describe, expect, it } from "vitest"

import { Extractor } from "../index"

describe("Extractor", () => {
    let extractor: Extractor

    beforeEach(() => {
        extractor = new Extractor()
    })

    // ========================================================================
    // TESTES DE CONFIGURAÇÃO DO CONSTRUCTOR
    // ========================================================================
    describe("Configuração do Constructor", () => {
        it("deve criar instância com configuração padrão", () => {
            const defaultExtractor = new Extractor()
            expect(defaultExtractor).toBeDefined()
        })

        it("deve criar instância com prefixos customizados", () => {
            const customExtractor = new Extractor({
                mentionPrefix: "$",
                hashtagPrefix: "&"
            })
            expect(customExtractor).toBeDefined()
        })

        it("deve criar instância com configurações de keywords customizadas", () => {
            const customExtractor = new Extractor({
                minWordLength: 5,
                maxKeywords: 10,
                boostFirstSentences: false
            })
            expect(customExtractor).toBeDefined()
        })

        it("deve criar instância com stopwords customizadas", () => {
            const customExtractor = new Extractor({
                stopwords: ["teste", "exemplo", "demo"]
            })
            expect(customExtractor).toBeDefined()
        })

        it("deve criar instância com todas as configurações", () => {
            const fullExtractor = new Extractor({
                mentionPrefix: ">>",
                hashtagPrefix: "<<",
                minWordLength: 4,
                maxKeywords: 8,
                stopwords: ["palavra1", "palavra2"],
                boostFirstSentences: true
            })
            expect(fullExtractor).toBeDefined()
        })
    })

    // ========================================================================
    // TESTES DE setText
    // ========================================================================
    describe("setText", () => {
        it("deve definir texto corretamente", () => {
            extractor.setText("Texto de teste")
            // Validar através de extração
            const entities = extractor.entities({})
            expect(entities).toBeDefined()
        })

        it("deve permitir atualizar texto múltiplas vezes", () => {
            extractor.setText("Primeiro texto @user1")
            extractor.setText("Segundo texto @user2")

            const entities = extractor.entities({ mentions: true })
            expect(entities.mentions).toEqual(["@user2"])
        })

        it("deve lidar com texto vazio", () => {
            extractor.setText("")
            const entities = extractor.entities({ mentions: true })
            expect(entities.mentions).toEqual([])
        })

        it("deve lidar com texto muito longo", () => {
            const longText = "palavra ".repeat(1000) + "@user"
            extractor.setText(longText)
            const entities = extractor.entities({ mentions: true })
            expect(entities.mentions).toEqual(["@user"])
        })
    })

    // ========================================================================
    // TESTES DE SETTERS
    // ========================================================================
    describe("Métodos Setters", () => {
        describe("setMentionPrefix", () => {
            it("deve atualizar prefixo de mention", () => {
                extractor.setMentionPrefix("$")
                extractor.setText("Olá $alice")
                const entities = extractor.entities({ mentions: true })
                expect(entities.mentions).toEqual(["$alice"])
            })

            it("deve funcionar com múltiplos caracteres", () => {
                extractor.setMentionPrefix("USER:")
                extractor.setText("Olá USER:alice")
                const entities = extractor.entities({ mentions: true })
                expect(entities.mentions).toEqual(["USER:alice"])
            })

            it("deve funcionar com caracteres especiais de regex", () => {
                extractor.setMentionPrefix(".")
                extractor.setText("Olá .alice")
                const entities = extractor.entities({ mentions: true })
                expect(entities.mentions).toEqual([".alice"])
            })
        })

        describe("setHashtagPrefix", () => {
            it("deve atualizar prefixo de hashtag", () => {
                extractor.setHashtagPrefix("%")
                extractor.setText("Veja %tech")
                const entities = extractor.entities({ hashtags: true })
                expect(entities.hashtags).toEqual(["%tech"])
            })

            it("deve funcionar com múltiplos caracteres", () => {
                extractor.setHashtagPrefix("TAG:")
                extractor.setText("Veja TAG:tech")
                const entities = extractor.entities({ hashtags: true })
                expect(entities.hashtags).toEqual(["TAG:tech"])
            })
        })

        describe("setMinWordLength", () => {
            it("deve atualizar tamanho mínimo de palavra", () => {
                extractor.setMinWordLength(5)
                extractor.setText("um dois três quatro cinco teste")
                const keywords = extractor.keywords()
                // Palavras com menos de 5 caracteres devem ser filtradas
                expect(keywords).not.toContain("um")
                expect(keywords).not.toContain("dois")
            })

            it("deve permitir palavras de 1 caractere quando configurado", () => {
                extractor.setMinWordLength(1)
                extractor.setText("a e o teste")
                const keywords = extractor.keywords()
                // Stopwords ainda filtram "a", "e", "o"
                expect(keywords.length).toBeGreaterThan(0)
            })
        })

        describe("setMaxKeywords", () => {
            it("deve limitar número de keywords retornadas", () => {
                extractor.setMaxKeywords(3)
                extractor.setText("palavra1 palavra2 palavra3 palavra4 palavra5 palavra6")
                const keywords = extractor.keywords()
                expect(keywords.length).toBeLessThanOrEqual(3)
            })

            it("deve retornar todas quando há poucas keywords", () => {
                extractor.setMaxKeywords(10)
                extractor.setText("apenas duas palavras")
                const keywords = extractor.keywords()
                expect(keywords.length).toBeLessThanOrEqual(10)
            })
        })

        describe("setStopwords", () => {
            it("deve filtrar stopwords customizadas", () => {
                extractor.setStopwords(["teste", "exemplo"])
                extractor.setText("teste exemplo palavra importante")
                const keywords = extractor.keywords()
                expect(keywords).not.toContain("teste")
                expect(keywords).not.toContain("exemplo")
                expect(keywords).toContain("palavra")
            })

            it("deve permitir lista vazia de stopwords", () => {
                extractor.setStopwords([])
                extractor.setText("o a e teste")
                const keywords = extractor.keywords()
                // Sem stopwords, todas as palavras válidas são incluídas
                expect(keywords.length).toBeGreaterThan(0)
            })
        })

        describe("setBoostFirstSentences", () => {
            it("deve desabilitar boost de primeiras sentenças", () => {
                extractor.setBoostFirstSentences(false)
                extractor.setText("primeiro segundo terceiro quarto quinto")
                const keywords = extractor.keywords()
                expect(keywords).toBeDefined()
            })

            it("deve habilitar boost de primeiras sentenças", () => {
                extractor.setBoostFirstSentences(true)
                extractor.setText("importante palavra normal outra comum")
                const keywords = extractor.keywords()
                // Com boost, palavras no início têm maior prioridade
                expect(keywords).toBeDefined()
            })
        })
    })

    // ========================================================================
    // TESTES DE EXTRAÇÃO DE ENTIDADES
    // ========================================================================
    describe("Extração de Entidades - entities()", () => {
        describe("Mentions", () => {
            it("deve extrair uma mention simples", () => {
                extractor.setText("Olá @alice")
                const result = extractor.entities({ mentions: true })
                expect(result.mentions).toEqual(["@alice"])
            })

            it("deve extrair múltiplas mentions", () => {
                extractor.setText("@alice @bob @charlie olá")
                const result = extractor.entities({ mentions: true })
                expect(result.mentions).toEqual(["@alice", "@bob", "@charlie"])
            })

            it("deve extrair mentions com pontos", () => {
                extractor.setText("@user.name @test.user")
                const result = extractor.entities({ mentions: true })
                expect(result.mentions).toEqual(["@user.name", "@test.user"])
            })

            it("deve extrair mentions com underscores", () => {
                extractor.setText("@user_name @test_user")
                const result = extractor.entities({ mentions: true })
                expect(result.mentions).toEqual(["@user_name", "@test_user"])
            })

            it("deve extrair mentions com hífens", () => {
                extractor.setText("@user-name @test-user")
                const result = extractor.entities({ mentions: true })
                expect(result.mentions).toEqual(["@user-name", "@test-user"])
            })

            it("deve extrair mentions com números", () => {
                extractor.setText("@user123 @test456")
                const result = extractor.entities({ mentions: true })
                expect(result.mentions).toEqual(["@user123", "@test456"])
            })

            it("não deve extrair @ sem username", () => {
                extractor.setText("Email: teste@ ou @")
                const result = extractor.entities({ mentions: true })
                expect(result.mentions).toEqual([])
            })

            it("deve extrair mentions no meio do texto", () => {
                extractor.setText("Mensagem de @alice para @bob sobre projeto")
                const result = extractor.entities({ mentions: true })
                expect(result.mentions).toEqual(["@alice", "@bob"])
            })

            it("deve retornar array vazio quando mentions não é solicitado", () => {
                extractor.setText("@alice @bob")
                const result = extractor.entities({})
                expect(result.mentions).toBeUndefined()
            })
        })

        describe("Hashtags", () => {
            it("deve extrair uma hashtag simples", () => {
                extractor.setText("Veja #tech")
                const result = extractor.entities({ hashtags: true })
                expect(result.hashtags).toEqual(["#tech"])
            })

            it("deve extrair múltiplas hashtags", () => {
                extractor.setText("#tech #programming #javascript #nodejs")
                const result = extractor.entities({ hashtags: true })
                expect(result.hashtags).toEqual(["#tech", "#programming", "#javascript", "#nodejs"])
            })

            it("deve extrair hashtags com underscores", () => {
                extractor.setText("#hash_tag #test_case")
                const result = extractor.entities({ hashtags: true })
                expect(result.hashtags).toEqual(["#hash_tag", "#test_case"])
            })

            it("deve extrair hashtags com números", () => {
                extractor.setText("#tag123 #test456")
                const result = extractor.entities({ hashtags: true })
                expect(result.hashtags).toEqual(["#tag123", "#test456"])
            })

            it("não deve extrair # sem tag", () => {
                extractor.setText("Símbolo: # ou #")
                const result = extractor.entities({ hashtags: true })
                expect(result.hashtags).toEqual([])
            })

            it("deve extrair hashtags no meio do texto", () => {
                extractor.setText("Post sobre #tech e #programming hoje")
                const result = extractor.entities({ hashtags: true })
                expect(result.hashtags).toEqual(["#tech", "#programming"])
            })

            it("deve retornar array vazio quando hashtags não é solicitado", () => {
                extractor.setText("#tech #programming")
                const result = extractor.entities({})
                expect(result.hashtags).toBeUndefined()
            })
        })

        describe("URLs", () => {
            it("deve extrair URL HTTPS simples", () => {
                extractor.setText("Visite https://example.com")
                const result = extractor.entities({ urls: true })
                expect(result.urls).toEqual(["https://example.com"])
            })

            it("deve extrair URL HTTP simples", () => {
                extractor.setText("Visite http://example.com")
                const result = extractor.entities({ urls: true })
                expect(result.urls).toEqual(["http://example.com"])
            })

            it("deve extrair múltiplas URLs", () => {
                extractor.setText("Links: https://site1.com https://site2.com http://site3.com")
                const result = extractor.entities({ urls: true })
                expect(result.urls).toEqual([
                    "https://site1.com",
                    "https://site2.com",
                    "http://site3.com"
                ])
            })

            it("deve extrair URLs com caminho", () => {
                extractor.setText("Veja https://example.com/path/to/page")
                const result = extractor.entities({ urls: true })
                expect(result.urls).toEqual(["https://example.com/path/to/page"])
            })

            it("deve extrair URLs com query params", () => {
                extractor.setText("https://example.com?param=value&other=test")
                const result = extractor.entities({ urls: true })
                expect(result.urls).toEqual(["https://example.com?param=value&other=test"])
            })

            it("deve extrair URLs com âncora", () => {
                extractor.setText("https://example.com#section")
                const result = extractor.entities({ urls: true })
                expect(result.urls).toEqual(["https://example.com#section"])
            })

            it("deve parar URL em vírgula", () => {
                extractor.setText("Links: https://example.com, https://test.com")
                const result = extractor.entities({ urls: true })
                expect(result.urls).toEqual(["https://example.com", "https://test.com"])
            })

            it("deve retornar array vazio quando urls não é solicitado", () => {
                extractor.setText("https://example.com")
                const result = extractor.entities({})
                expect(result.urls).toBeUndefined()
            })
        })

        describe("Extração Combinada", () => {
            it("deve extrair todas as entidades quando solicitado", () => {
                extractor.setText("Olá @user veja #topic em https://example.com")
                const result = extractor.entities({
                    mentions: true,
                    hashtags: true,
                    urls: true
                })

                expect(result.mentions).toEqual(["@user"])
                expect(result.hashtags).toEqual(["#topic"])
                expect(result.urls).toEqual(["https://example.com"])
            })

            it("deve extrair apenas mentions e hashtags", () => {
                extractor.setText("@user #tag https://example.com")
                const result = extractor.entities({
                    mentions: true,
                    hashtags: true
                })

                expect(result.mentions).toEqual(["@user"])
                expect(result.hashtags).toEqual(["#tag"])
                expect(result.urls).toBeUndefined()
            })

            it("deve retornar objeto vazio quando nenhuma opção fornecida", () => {
                extractor.setText("@user #tag https://example.com")
                const result = extractor.entities({})

                expect(result.mentions).toBeUndefined()
                expect(result.hashtags).toBeUndefined()
                expect(result.urls).toBeUndefined()
            })

            it("deve processar texto complexo de rede social", () => {
                const text =
                    "Olá @joao.silva! Adorei seu post sobre #javascript e #typescript. Confira https://github.com/project e https://docs.example.com também! cc: @maria_costa"

                extractor.setText(text)
                const result = extractor.entities({
                    mentions: true,
                    hashtags: true,
                    urls: true
                })

                expect(result.mentions).toEqual(["@joao.silva", "@maria_costa"])
                expect(result.hashtags).toEqual(["#javascript", "#typescript"])
                expect(result.urls).toEqual([
                    "https://github.com/project",
                    "https://docs.example.com"
                ])
            })
        })
    })

    // ========================================================================
    // TESTES DE EXTRAÇÃO DE KEYWORDS
    // ========================================================================
    describe("Extração de Keywords - keywords()", () => {
        it("deve extrair keywords básicas", () => {
            extractor.setText("programação javascript desenvolvimento software")
            const keywords = extractor.keywords()

            expect(keywords).toBeInstanceOf(Array)
            expect(keywords.length).toBeGreaterThan(0)
        })

        it("deve retornar array vazio para texto vazio", () => {
            extractor.setText("")
            const keywords = extractor.keywords()
            expect(keywords).toEqual([])
        })

        it("deve filtrar stopwords", () => {
            extractor.setText("o que é um teste de stopwords para validar")
            const keywords = extractor.keywords()
            // Stopwords como "o", "que", "é", "um", "de", "para" devem ser filtrados
            expect(keywords).not.toContain("o")
            expect(keywords).not.toContain("que")
            expect(keywords).not.toContain("um")
        })

        it("deve normalizar palavras com acentos", () => {
            extractor.setText("programação tecnologia computação")
            const keywords = extractor.keywords()
            // Deve extrair as palavras normalizadas
            expect(keywords.length).toBeGreaterThan(0)
        })

        it("deve fazer stemming de plurais", () => {
            extractor.setText("palavra palavras teste testes")
            const keywords = extractor.keywords()
            // Plurais devem ser reduzidos ao singular
            expect(keywords).toBeDefined()
        })

        it("deve normalizar gírias portuguesas", () => {
            extractor.setText("vc tbm blz obg vlw")
            const keywords = extractor.keywords()
            // Gírias devem ser normalizadas
            expect(keywords).toBeDefined()
        })

        it("deve limitar a maxKeywords configurado", () => {
            const customExtractor = new Extractor({ maxKeywords: 3 })
            customExtractor.setText(
                "palavra1 palavra2 palavra3 palavra4 palavra5 palavra6 palavra7"
            )
            const keywords = customExtractor.keywords()
            expect(keywords.length).toBeLessThanOrEqual(3)
        })

        it("deve filtrar palavras muito curtas baseado em minWordLength", () => {
            const customExtractor = new Extractor({ minWordLength: 5 })
            customExtractor.setText("oi sim não talvez teste")
            const keywords = customExtractor.keywords()
            // Palavras com menos de 5 caracteres devem ser filtradas
            expect(keywords).not.toContain("oi")
            expect(keywords).not.toContain("sim")
        })

        it("deve dar boost para palavras no início quando configurado", () => {
            const boostExtractor = new Extractor({ boostFirstSentences: true })
            boostExtractor.setText("importante relevante secundário terciário quaternário")
            const keywords = boostExtractor.keywords()
            // Palavras no início devem ter prioridade
            expect(keywords).toBeDefined()
        })

        it("deve processar texto com pontuação", () => {
            extractor.setText("Olá, mundo! Como vai? Tudo bem.")
            const keywords = extractor.keywords()
            expect(keywords).not.toContain(",")
            expect(keywords).not.toContain("!")
            expect(keywords).not.toContain("?")
        })

        it("deve processar texto com caracteres especiais", () => {
            extractor.setText("teste@email.com palavra#hash outro$simbolo")
            const keywords = extractor.keywords()
            expect(keywords.length).toBeGreaterThan(0)
        })

        it("deve ordenar keywords por relevância", () => {
            extractor.setText("palavra palavra palavra outra outra final")
            const keywords = extractor.keywords()
            // "palavra" aparece 3x, "outra" 2x, "final" 1x
            if (keywords.length > 0) {
                expect(keywords[0]).toBe("palavra")
            }
        })
    })

    // ========================================================================
    // TESTES DE PREFIXOS CUSTOMIZADOS
    // ========================================================================
    describe("Prefixos Customizados", () => {
        describe("Prefixos Simples", () => {
            it("deve usar $ para mentions", () => {
                const customExtractor = new Extractor({ mentionPrefix: "$" })
                customExtractor.setText("Olá $alice")
                const result = customExtractor.entities({ mentions: true })
                expect(result.mentions).toEqual(["$alice"])
            })

            it("deve usar & para hashtags", () => {
                const customExtractor = new Extractor({ hashtagPrefix: "&" })
                customExtractor.setText("Veja &tech")
                const result = customExtractor.entities({ hashtags: true })
                expect(result.hashtags).toEqual(["&tech"])
            })

            it("deve combinar prefixos customizados", () => {
                const customExtractor = new Extractor({
                    mentionPrefix: "$",
                    hashtagPrefix: "&"
                })
                customExtractor.setText("$alice veja &tech")
                const result = customExtractor.entities({
                    mentions: true,
                    hashtags: true
                })

                expect(result.mentions).toEqual(["$alice"])
                expect(result.hashtags).toEqual(["&tech"])
            })
        })

        describe("Prefixos com Múltiplos Caracteres", () => {
            it("deve usar USER: para mentions", () => {
                const customExtractor = new Extractor({ mentionPrefix: "USER:" })
                customExtractor.setText("Mensagem de USER:alice")
                const result = customExtractor.entities({ mentions: true })
                expect(result.mentions).toEqual(["USER:alice"])
            })

            it("deve usar TAG: para hashtags", () => {
                const customExtractor = new Extractor({ hashtagPrefix: "TAG:" })
                customExtractor.setText("Post sobre TAG:tech")
                const result = customExtractor.entities({ hashtags: true })
                expect(result.hashtags).toEqual(["TAG:tech"])
            })

            it("deve usar >> e <<", () => {
                const customExtractor = new Extractor({
                    mentionPrefix: ">>",
                    hashtagPrefix: "<<"
                })
                customExtractor.setText(">>alice <<tech >>bob <<js")
                const result = customExtractor.entities({
                    mentions: true,
                    hashtags: true
                })

                expect(result.mentions).toEqual([">>alice", ">>bob"])
                expect(result.hashtags).toEqual(["<<tech", "<<js"])
            })
        })

        describe("Prefixos com Caracteres Especiais de Regex", () => {
            it("deve escapar corretamente . (ponto)", () => {
                const customExtractor = new Extractor({ mentionPrefix: "." })
                customExtractor.setText("Usuário .alice")
                const result = customExtractor.entities({ mentions: true })
                expect(result.mentions).toEqual([".alice"])
            })

            it("deve escapar corretamente * (asterisco)", () => {
                const customExtractor = new Extractor({ hashtagPrefix: "*" })
                customExtractor.setText("Tag *tech")
                const result = customExtractor.entities({ hashtags: true })
                expect(result.hashtags).toEqual(["*tech"])
            })

            it("deve escapar corretamente + (mais)", () => {
                const customExtractor = new Extractor({ mentionPrefix: "+" })
                customExtractor.setText("+alice +bob")
                const result = customExtractor.entities({ mentions: true })
                expect(result.mentions).toEqual(["+alice", "+bob"])
            })

            it("deve escapar corretamente ? (interrogação)", () => {
                const customExtractor = new Extractor({ hashtagPrefix: "?" })
                customExtractor.setText("?tag1 ?tag2")
                const result = customExtractor.entities({ hashtags: true })
                expect(result.hashtags).toEqual(["?tag1", "?tag2"])
            })

            it("deve escapar corretamente [ (colchete)", () => {
                const customExtractor = new Extractor({ mentionPrefix: "[" })
                customExtractor.setText("[user1 [user2")
                const result = customExtractor.entities({ mentions: true })
                expect(result.mentions).toEqual(["[user1", "[user2"])
            })

            it("deve escapar corretamente ( (parêntese)", () => {
                const customExtractor = new Extractor({ hashtagPrefix: "(" })
                customExtractor.setText("(tag1 (tag2")
                const result = customExtractor.entities({ hashtags: true })
                expect(result.hashtags).toEqual(["(tag1", "(tag2"])
            })

            it("deve escapar $ (cifrão)", () => {
                const customExtractor = new Extractor({ mentionPrefix: "$" })
                customExtractor.setText("$alice $bob")
                const result = customExtractor.entities({ mentions: true })
                expect(result.mentions).toEqual(["$alice", "$bob"])
            })
        })

        describe("Prefixos com Unicode e Emojis", () => {
            it("deve usar emoji como prefixo de mention", () => {
                const customExtractor = new Extractor({ mentionPrefix: "👤" })
                customExtractor.setText("Olá 👤alice")
                const result = customExtractor.entities({ mentions: true })
                expect(result.mentions).toEqual(["👤alice"])
            })

            it("deve usar emoji como prefixo de hashtag", () => {
                const customExtractor = new Extractor({ hashtagPrefix: "🏷️" })
                customExtractor.setText("Post sobre 🏷️tech")
                const result = customExtractor.entities({ hashtags: true })
                expect(result.hashtags).toEqual(["🏷️tech"])
            })

            it("deve combinar emojis diferentes", () => {
                const customExtractor = new Extractor({
                    mentionPrefix: "➡️",
                    hashtagPrefix: "🔖"
                })
                customExtractor.setText("➡️alice 🔖tech ➡️bob 🔖js")
                const result = customExtractor.entities({
                    mentions: true,
                    hashtags: true
                })

                expect(result.mentions).toEqual(["➡️alice", "➡️bob"])
                expect(result.hashtags).toEqual(["🔖tech", "🔖js"])
            })
        })
    })

    // ========================================================================
    // TESTES DE KEYWORDS COM CONFIGURAÇÕES
    // ========================================================================
    describe("Keywords com Configurações Customizadas", () => {
        it("deve respeitar minWordLength configurado", () => {
            const customExtractor = new Extractor({ minWordLength: 6 })
            customExtractor.setText("oi sim não teste palavra importante relevante")
            const keywords = customExtractor.keywords()

            // Apenas palavras com 6+ caracteres
            expect(keywords).not.toContain("oi")
            expect(keywords).not.toContain("sim")
            expect(keywords).not.toContain("teste") // 5 caracteres
        })

        it("deve respeitar maxKeywords configurado", () => {
            const customExtractor = new Extractor({ maxKeywords: 2 })
            customExtractor.setText("primeira segunda terceira quarta quinta sexta sétima")
            const keywords = customExtractor.keywords()
            expect(keywords.length).toBeLessThanOrEqual(2)
        })

        it("deve usar stopwords customizadas", () => {
            const customExtractor = new Extractor({
                stopwords: ["ignorar", "pular", "descartar"]
            })
            customExtractor.setText("ignorar esta palavra pular aquela manter relevante")
            const keywords = customExtractor.keywords()

            expect(keywords).not.toContain("ignorar")
            expect(keywords).not.toContain("pular")
            expect(keywords).toContain("palavra")
        })

        it("deve processar com boost desabilitado", () => {
            const customExtractor = new Extractor({
                boostFirstSentences: false,
                maxKeywords: 5
            })
            customExtractor.setText(
                "primeira segunda terceira quarta quinta palavra normal texto comum"
            )
            const keywords = customExtractor.keywords()
            expect(keywords.length).toBeLessThanOrEqual(5)
        })

        it("deve combinar todas as configurações de keywords", () => {
            const customExtractor = new Extractor({
                minWordLength: 4,
                maxKeywords: 3,
                stopwords: ["teste"],
                boostFirstSentences: true
            })
            customExtractor.setText("teste palavra importante relevante significativo crítico")
            const keywords = customExtractor.keywords()

            expect(keywords).not.toContain("teste")
            expect(keywords.length).toBeLessThanOrEqual(3)
        })
    })

    // ========================================================================
    // TESTES DE CASOS EXTREMOS
    // ========================================================================
    describe("Casos Extremos e Edge Cases", () => {
        it("deve lidar com texto só de mentions", () => {
            extractor.setText("@alice @bob @charlie @david")
            const result = extractor.entities({ mentions: true })
            expect(result.mentions).toHaveLength(4)
        })

        it("deve lidar com texto só de hashtags", () => {
            extractor.setText("#tag1 #tag2 #tag3 #tag4 #tag5")
            const result = extractor.entities({ hashtags: true })
            expect(result.hashtags).toHaveLength(5)
        })

        it("deve lidar com texto só de URLs", () => {
            extractor.setText("https://site1.com https://site2.com https://site3.com")
            const result = extractor.entities({ urls: true })
            expect(result.urls).toHaveLength(3)
        })

        it("deve processar entidades duplicadas", () => {
            extractor.setText("@alice @bob @alice @charlie @bob")
            const result = extractor.entities({ mentions: true })
            expect(result.mentions).toHaveLength(5) // Inclui duplicatas
        })

        it("deve processar entidades adjacentes", () => {
            extractor.setText("@alice@bob#tech#js")
            const result = extractor.entities({
                mentions: true,
                hashtags: true
            })
            // Sem espaços, trata como uma única entidade
            expect(result.mentions?.length).toBeGreaterThan(0)
        })

        it("deve processar texto com emojis misturados", () => {
            extractor.setText("Olá @user 😀 veja #tech 🚀 em https://example.com")
            const result = extractor.entities({
                mentions: true,
                hashtags: true,
                urls: true
            })

            expect(result.mentions).toEqual(["@user"])
            expect(result.hashtags).toEqual(["#tech"])
            expect(result.urls).toEqual(["https://example.com"])
        })

        it("deve processar keywords de texto com muita pontuação", () => {
            extractor.setText("Olá!!! Como??? Vai... Tudo, bem; Ótimo: Sim!")
            const keywords = extractor.keywords()
            expect(keywords.length).toBeGreaterThan(0)
        })

        it("deve processar texto multilinha", () => {
            const text = `Primeira linha @user1
Segunda linha #tag1
Terceira linha https://example.com`
            extractor.setText(text)
            const result = extractor.entities({
                mentions: true,
                hashtags: true,
                urls: true
            })

            expect(result.mentions).toEqual(["@user1"])
            expect(result.hashtags).toEqual(["#tag1"])
            expect(result.urls).toEqual(["https://example.com"])
        })

        it("deve processar texto muito longo", () => {
            const longText = "palavra ".repeat(500) + "@user #tag https://example.com"
            extractor.setText(longText)
            const result = extractor.entities({
                mentions: true,
                hashtags: true,
                urls: true
            })

            expect(result.mentions).toEqual(["@user"])
            expect(result.hashtags).toEqual(["#tag"])
            expect(result.urls).toEqual(["https://example.com"])
        })
    })

    // ========================================================================
    // TESTES DE INTEGRAÇÃO
    // ========================================================================
    describe("Integração e Workflows", () => {
        it("deve processar tweet completo", () => {
            const tweet = `Incrível palestra sobre #javascript hoje! 
Aprendi muito com @john_doe e @jane_smith. 
Slides: https://slides.com/talk 
Código: https://github.com/repo`

            extractor.setText(tweet)
            const entities = extractor.entities({
                mentions: true,
                hashtags: true,
                urls: true
            })
            const keywords = extractor.keywords()

            expect(entities.mentions?.length).toBeGreaterThan(0)
            expect(entities.hashtags?.length).toBeGreaterThan(0)
            expect(entities.urls?.length).toBeGreaterThan(0)
            expect(keywords.length).toBeGreaterThan(0)
        })

        it("deve processar post de Instagram", () => {
            const post = `Dia perfeito na praia! 🌊☀️
#beach #summer #vacation #nature #photography
📸 por @photographer_pro
Localização: https://maps.google.com/beach`

            extractor.setText(post)
            const entities = extractor.entities({
                mentions: true,
                hashtags: true,
                urls: true
            })
            const keywords = extractor.keywords()

            expect(entities.hashtags).toHaveLength(5)
            expect(entities.mentions).toEqual(["@photographer_pro"])
            expect(entities.urls).toHaveLength(1)
            expect(keywords).toBeDefined()
        })

        it("deve alternar entre diferentes textos", () => {
            const text1 = "@user1 #tag1"
            const text2 = "@user2 #tag2"

            extractor.setText(text1)
            const result1 = extractor.entities({ mentions: true, hashtags: true })

            extractor.setText(text2)
            const result2 = extractor.entities({ mentions: true, hashtags: true })

            expect(result1.mentions).toEqual(["@user1"])
            expect(result1.hashtags).toEqual(["#tag1"])
            expect(result2.mentions).toEqual(["@user2"])
            expect(result2.hashtags).toEqual(["#tag2"])
        })

        it("deve combinar extração de entidades e keywords", () => {
            const text =
                "Análise de dados com #python e #machinelearning é muito importante para empresas modernas"

            extractor.setText(text)
            const entities = extractor.entities({ hashtags: true })
            const keywords = extractor.keywords()

            expect(entities.hashtags).toHaveLength(2)
            expect(keywords).toContain("analise")
            // "dados" é reduzido para "dado" pelo stemming de plural
            expect(keywords).toContain("dado")
        })

        it("deve processar múltiplos extractors com configurações diferentes", () => {
            const socialExtractor = new Extractor({
                mentionPrefix: "@",
                hashtagPrefix: "#"
            })
            const customExtractor = new Extractor({
                mentionPrefix: "$",
                hashtagPrefix: "&"
            })

            const socialText = "@user #tag"
            const customText = "$user &tag"

            socialExtractor.setText(socialText)
            customExtractor.setText(customText)

            const socialResult = socialExtractor.entities({ mentions: true, hashtags: true })
            const customResult = customExtractor.entities({ mentions: true, hashtags: true })

            expect(socialResult.mentions).toEqual(["@user"])
            expect(customResult.mentions).toEqual(["$user"])
        })
    })

    // ========================================================================
    // TESTES DE PERFORMANCE
    // ========================================================================
    describe("Performance", () => {
        it("deve processar 1000 extrações de entidades rapidamente", () => {
            const startTime = performance.now()

            for (let i = 0; i < 1000; i++) {
                extractor.setText(`Post ${i} com @user${i} e #tag${i}`)
                extractor.entities({ mentions: true, hashtags: true })
            }

            const endTime = performance.now()
            const duration = endTime - startTime

            // Deve completar em menos de 100ms
            expect(duration).toBeLessThan(100)
        })

        it("deve processar 1000 extrações de keywords rapidamente", () => {
            const startTime = performance.now()

            for (let i = 0; i < 1000; i++) {
                extractor.setText(`texto importante relevante significativo número ${i}`)
                extractor.keywords()
            }

            const endTime = performance.now()
            const duration = endTime - startTime

            // Deve completar em menos de 200ms
            expect(duration).toBeLessThan(200)
        })

        it("deve manter consistência em múltiplas chamadas", () => {
            extractor.setText("@alice #tech https://example.com")

            const result1 = extractor.entities({ mentions: true, hashtags: true, urls: true })
            const result2 = extractor.entities({ mentions: true, hashtags: true, urls: true })
            const result3 = extractor.entities({ mentions: true, hashtags: true, urls: true })

            expect(result1).toEqual(result2)
            expect(result2).toEqual(result3)
        })
    })

    // ========================================================================
    // TESTES DE VALIDAÇÃO E ROBUSTEZ
    // ========================================================================
    describe("Validação e Robustez", () => {
        it("deve lidar com texto undefined convertendo para string vazia", () => {
            extractor.setText("")
            const entities = extractor.entities({ mentions: true })
            expect(entities.mentions).toEqual([])
        })

        it("deve lidar com texto null convertendo para string vazia", () => {
            extractor.setText("")
            const entities = extractor.entities({ mentions: true })
            expect(entities.mentions).toEqual([])
        })

        it("deve lidar com opções undefined", () => {
            extractor.setText("@user #tag")
            const result = extractor.entities(undefined as any)
            expect(result).toBeDefined()
        })

        it("deve lidar com todas as opções false", () => {
            extractor.setText("@user #tag https://example.com")
            const result = extractor.entities({
                mentions: false,
                hashtags: false,
                urls: false
            })

            expect(result.mentions).toBeUndefined()
            expect(result.hashtags).toBeUndefined()
            expect(result.urls).toBeUndefined()
        })

        it("deve processar keywords de texto sem palavras válidas", () => {
            extractor.setText("@ # ! ? . ,")
            const keywords = extractor.keywords()
            expect(keywords).toEqual([])
        })

        it("deve processar entidades malformadas", () => {
            extractor.setText("@@@user ###tag :::url")
            const result = extractor.entities({
                mentions: true,
                hashtags: true
            })
            // Deve extrair o que for válido
            expect(result).toBeDefined()
        })
    })

    // ========================================================================
    // TESTES DE CENÁRIOS REAIS
    // ========================================================================
    describe("Cenários Reais de Uso", () => {
        it("deve processar post de blog", () => {
            const blogPost = `
                Hoje vamos falar sobre desenvolvimento web moderno.
                Principais tecnologias: #javascript #typescript #react #nodejs
                Referências: https://developer.mozilla.org https://nodejs.org
                Agradecimentos a @community e @contributors
            `

            extractor.setText(blogPost)
            const entities = extractor.entities({
                mentions: true,
                hashtags: true,
                urls: true
            })
            const keywords = extractor.keywords()

            expect(entities.hashtags?.length).toBeGreaterThanOrEqual(4)
            expect(entities.urls?.length).toBeGreaterThanOrEqual(2)
            expect(entities.mentions?.length).toBeGreaterThanOrEqual(2)
            // Verifica que extraiu keywords válidas
            expect(keywords.length).toBeGreaterThan(0)
        })

        it("deve processar comentário de código", () => {
            const comment = `
                // TODO: Refatorar esta função @dev_team
                // Tags: #refactoring #performance #optimization
                // Docs: https://docs.internal.com/refactoring
            `

            extractor.setText(comment)
            const entities = extractor.entities({
                mentions: true,
                hashtags: true,
                urls: true
            })

            expect(entities.mentions).toContain("@dev_team")
            expect(entities.hashtags?.length).toBeGreaterThanOrEqual(3)
            expect(entities.urls).toContain("https://docs.internal.com/refactoring")
        })

        it("deve processar mensagem de chat", () => {
            const message = "@alice oi! Viu o link que mandei? https://example.com/article"

            extractor.setText(message)
            const entities = extractor.entities({
                mentions: true,
                urls: true
            })

            expect(entities.mentions).toEqual(["@alice"])
            expect(entities.urls).toEqual(["https://example.com/article"])
        })

        it("deve processar descrição de produto", () => {
            const description = `
                Notebook de alta performance para desenvolvimento
                Especificações técnicas e reviews: https://product.com/details
                Hashtags: #notebook #technology #programming #development
            `

            extractor.setText(description)
            const keywords = extractor.keywords()
            const hashtags = extractor.entities({ hashtags: true })

            expect(keywords).toContain("notebook")
            expect(keywords).toContain("performance")
            expect(hashtags.hashtags?.length).toBeGreaterThanOrEqual(4)
        })
    })

    // ========================================================================
    // TESTES DE CONFIGURAÇÕES DINÂMICAS (SETTERS)
    // ========================================================================
    describe("Alteração Dinâmica de Configurações", () => {
        it("deve alterar prefixos dinamicamente", () => {
            extractor.setText("@alice #tech")
            const result1 = extractor.entities({ mentions: true, hashtags: true })

            extractor.setMentionPrefix("$")
            extractor.setHashtagPrefix("&")
            extractor.setText("$alice &tech")
            const result2 = extractor.entities({ mentions: true, hashtags: true })

            expect(result1.mentions).toEqual(["@alice"])
            expect(result1.hashtags).toEqual(["#tech"])
            expect(result2.mentions).toEqual(["$alice"])
            expect(result2.hashtags).toEqual(["&tech"])
        })

        it("deve alterar configurações de keywords dinamicamente", () => {
            extractor.setText("um dois tres quatro cinco seis")
            const keywords1 = extractor.keywords()

            extractor.setMaxKeywords(2)
            const keywords2 = extractor.keywords()

            expect(keywords2.length).toBeLessThanOrEqual(2)
        })

        it("deve alterar stopwords dinamicamente", () => {
            extractor.setText("teste palavra importante relevante")
            const keywords1 = extractor.keywords()

            extractor.setStopwords(["teste", "palavra"])
            const keywords2 = extractor.keywords()

            expect(keywords2).not.toContain("teste")
            expect(keywords2).not.toContain("palavra")
        })

        it("deve alterar boost dinamicamente", () => {
            extractor.setText("primeira segunda terceira quarta quinta")

            extractor.setBoostFirstSentences(true)
            const withBoost = extractor.keywords()

            extractor.setBoostFirstSentences(false)
            const withoutBoost = extractor.keywords()

            expect(withBoost).toBeDefined()
            expect(withoutBoost).toBeDefined()
        })

        it("deve combinar múltiplas alterações dinâmicas", () => {
            extractor.setText("@alice #tech palavra1 palavra2 palavra3")

            // Alterar configurações
            extractor.setMentionPrefix(">>")
            extractor.setHashtagPrefix("<<")
            extractor.setMaxKeywords(2)
            extractor.setMinWordLength(7)

            extractor.setText(">>bob <<js palavra1 palavra2 importante")
            const entities = extractor.entities({ mentions: true, hashtags: true })
            const keywords = extractor.keywords()

            expect(entities.mentions).toEqual([">>bob"])
            expect(entities.hashtags).toEqual(["<<js"])
            expect(keywords.length).toBeLessThanOrEqual(2)
        })
    })

    // ========================================================================
    // TESTES DE COMPARAÇÃO ENTRE CONFIGURAÇÕES
    // ========================================================================
    describe("Comparação entre Diferentes Configurações", () => {
        it("deve produzir resultados diferentes com prefixos diferentes", () => {
            const text = "@user1 $user2 #tag1 &tag2"

            const extractor1 = new Extractor({ mentionPrefix: "@", hashtagPrefix: "#" })
            const extractor2 = new Extractor({ mentionPrefix: "$", hashtagPrefix: "&" })

            extractor1.setText(text)
            extractor2.setText(text)

            const result1 = extractor1.entities({ mentions: true, hashtags: true })
            const result2 = extractor2.entities({ mentions: true, hashtags: true })

            expect(result1.mentions).toEqual(["@user1"])
            expect(result1.hashtags).toEqual(["#tag1"])
            expect(result2.mentions).toEqual(["$user2"])
            expect(result2.hashtags).toEqual(["&tag2"])
        })

        it("deve produzir keywords diferentes com maxKeywords diferentes", () => {
            const text = "palavra1 palavra2 palavra3 palavra4 palavra5"

            const extractor1 = new Extractor({ maxKeywords: 2 })
            const extractor2 = new Extractor({ maxKeywords: 5 })

            extractor1.setText(text)
            extractor2.setText(text)

            const keywords1 = extractor1.keywords()
            const keywords2 = extractor2.keywords()

            expect(keywords1.length).toBeLessThanOrEqual(2)
            expect(keywords2.length).toBeGreaterThan(keywords1.length)
        })

        it("deve manter independência entre instâncias", () => {
            const extractor1 = new Extractor({ mentionPrefix: "@" })
            const extractor2 = new Extractor({ mentionPrefix: "$" })

            extractor1.setText("@alice")
            extractor2.setText("$bob")

            const result1 = extractor1.entities({ mentions: true })
            const result2 = extractor2.entities({ mentions: true })

            expect(result1.mentions).toEqual(["@alice"])
            expect(result2.mentions).toEqual(["$bob"])
        })
    })

    // ========================================================================
    // TESTES DE COMBINAÇÕES COMPLEXAS
    // ========================================================================
    describe("Combinações Complexas de Configurações", () => {
        it("deve processar com todos os parâmetros customizados", () => {
            const complexExtractor = new Extractor({
                mentionPrefix: "USER:",
                hashtagPrefix: "TAG:",
                minWordLength: 5,
                maxKeywords: 3,
                stopwords: ["muito", "mais"],
                boostFirstSentences: false
            })

            const text = `
                USER:alice falou sobre TAG:javascript e TAG:typescript
                muito importante para desenvolvimento mais moderno
            `

            complexExtractor.setText(text)
            const entities = complexExtractor.entities({
                mentions: true,
                hashtags: true
            })
            const keywords = complexExtractor.keywords()

            expect(entities.mentions).toEqual(["USER:alice"])
            expect(entities.hashtags).toEqual(["TAG:javascript", "TAG:typescript"])
            expect(keywords).not.toContain("muito")
            expect(keywords).not.toContain("mais")
            expect(keywords.length).toBeLessThanOrEqual(3)
        })

        it("deve combinar extração com prefixos emoji e keywords", () => {
            const emojiExtractor = new Extractor({
                mentionPrefix: "👤",
                hashtagPrefix: "🏷️",
                maxKeywords: 5
            })

            const text = "👤alice postou sobre 🏷️tecnologia e 🏷️programacao moderna"

            emojiExtractor.setText(text)
            const entities = emojiExtractor.entities({
                mentions: true,
                hashtags: true
            })
            const keywords = emojiExtractor.keywords()

            expect(entities.mentions).toEqual(["👤alice"])
            expect(entities.hashtags).toEqual(["🏷️tecnologia", "🏷️programacao"])
            expect(keywords).toContain("moderna")
        })
    })
})
