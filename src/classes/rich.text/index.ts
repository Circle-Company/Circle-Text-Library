/**
 * RichText - Classe para formatação de texto enriquecido
 *
 * Converte texto normal em formato enriquecido com identificação de:
 * - Menções (@username)
 * - Hashtags (#hashtag)
 * - URLs (https://example.com)
 */

export interface RichTextConfig {
    mentionPrefix?: string
    hashtagPrefix?: string
}

export interface EntityMapping {
    mentions?: Record<string, string> // { "username": "id" }
    hashtags?: Record<string, string> // { "hashtag": "id" }
}

export interface RichTextEntity {
    type: "text" | "mention" | "hashtag" | "url"
    text: string
    id?: string
    start: number
    end: number
}

export interface RichTextUIFormat {
    text: string
    entities: RichTextEntity[]
}

export class RichText {
    private baseText: string = ""
    private enrichedText: string = ""
    private entityMapping: EntityMapping = {}
    private readonly mentionPrefix: string
    private readonly hashtagPrefix: string

    constructor(config?: RichTextConfig) {
        this.mentionPrefix = config?.mentionPrefix ?? "@"
        this.hashtagPrefix = config?.hashtagPrefix ?? "#"
    }

    public getEntityMapping(): EntityMapping {
        return this.entityMapping
    }

    public setText(text: string, entityMapping?: EntityMapping) {
        this.baseText = text
        this.entityMapping = entityMapping || {}
        this.enrichedText = this.formatToEnriched(text, entityMapping)
    }
    /**
     * Converte texto normal em formato enriquecido
     * @param {string} text - Texto normal a ser convertido
     * @param {EntityMapping} entityMapping - Mapeamento de usernames/hashtags para IDs
     * @returns {string} - Texto no formato enriquecido
     *
     * Exemplo:
     * Entrada: "Olá, @user.name seja bem vindo! #hashtagName https://example.com"
     * entityMapping: { mentions: { "user.name": "12345" }, hashtags: { "hashtagName": "67890" } }
     * Saída: "Olá, [txt:user.name, ent:mention, id:12345] seja bem vindo! [txt:hashtagName, ent:hashtag, id:67890] [txt:https://example.com, ent:url]"
     */
    public formatToEnriched(text: string, entityMapping?: EntityMapping): string {
        if (!text || typeof text !== "string") {
            return ""
        }

        const mapping = entityMapping || this.entityMapping
        let enrichedText = text

        // Processar menções com prefixo configurável
        const escapedMentionPrefix = this.escapeRegex(this.mentionPrefix)
        const mentionRegex = new RegExp(`${escapedMentionPrefix}([a-zA-Z0-9._-]+)`, "g")
        enrichedText = enrichedText.replace(mentionRegex, (match, username) => {
            const id = mapping.mentions?.[username]
            if (id) {
                return `[txt:${username}, ent:mention, id:${id}]`
            }
            return `[txt:${username}, ent:mention]`
        })

        // Processar hashtags com prefixo configurável
        const escapedHashtagPrefix = this.escapeRegex(this.hashtagPrefix)
        const hashtagRegex = new RegExp(`${escapedHashtagPrefix}([a-zA-Z0-9_]+)`, "g")
        enrichedText = enrichedText.replace(hashtagRegex, (match, hashtag) => {
            const id = mapping.hashtags?.[hashtag]
            if (id) {
                return `[txt:${hashtag}, ent:hashtag, id:${id}]`
            }
            return `[txt:${hashtag}, ent:hashtag]`
        })

        // Processar URLs (http/https)
        enrichedText = enrichedText.replace(/(https?:\/\/[^\s]+)/g, (match, url) => {
            return `[txt:${url}, ent:url]`
        })

        return enrichedText
    }

    /**
     * Escapa caracteres especiais de regex.
     */
    private escapeRegex(str: string): string {
        return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    }

    /**
     * Formata o texto enriquecido para formato de UI
     * @returns {RichTextUIFormat} - Objeto com texto e array de entidades com posições
     *
     * Exemplo de saída:
     * {
     *   text: "Olá, @user.name seja bem vindo!",
     *   entities: [
     *     { type: "text", text: "Olá, ", start: 0, end: 5 },
     *     { type: "mention", text: "user.name", id: "12345", start: 5, end: 15 },
     *     { type: "text", text: " seja bem vindo!", start: 15, end: 32 }
     *   ]
     * }
     */
    public formatToUI(enrichedText?: string): RichTextUIFormat {
        const text = enrichedText || this.enrichedText
        const normalText = this.formatToNormal(text)
        const entities: RichTextEntity[] = []

        let currentPos = 0
        let lastEnd = 0

        // Regex para encontrar todas as entidades enriquecidas
        const entityRegex = /\[txt:([^,]+), ent:(mention|hashtag|url)(?:, id:([^\]]+))?\]/g
        let match

        while ((match = entityRegex.exec(text)) !== null) {
            const [fullMatch, entityText, entityType, entityId] = match
            const matchStart = match.index

            // Verificar se entityText e entityType existem
            if (!entityText || !entityType) continue

            // Calcular posição no texto normal
            const textBeforeMatch = text.substring(0, matchStart)
            const normalTextBeforeMatch = this.formatToNormal(textBeforeMatch)
            const startInNormal = normalTextBeforeMatch.length

            // Adicionar texto anterior se existir
            if (lastEnd < startInNormal) {
                entities.push({
                    type: "text",
                    text: normalText.substring(lastEnd, startInNormal),
                    start: lastEnd,
                    end: startInNormal
                })
            }

            // Adicionar símbolo de prefixo dependendo do tipo (usando prefixos configuráveis)
            const prefix =
                entityType === "mention"
                    ? this.mentionPrefix
                    : entityType === "hashtag"
                      ? this.hashtagPrefix
                      : ""
            const entityFullText = prefix + entityText
            const entityStart = startInNormal
            const entityEnd = entityStart + entityFullText.length

            // Adicionar entidade
            const entity: RichTextEntity = {
                type: entityType as "mention" | "hashtag" | "url",
                text: entityText,
                start: entityStart,
                end: entityEnd
            }

            if (entityId) {
                entity.id = entityId
            }

            entities.push(entity)
            lastEnd = entityEnd
        }

        // Adicionar texto final se existir
        if (lastEnd < normalText.length) {
            entities.push({
                type: "text",
                text: normalText.substring(lastEnd),
                start: lastEnd,
                end: normalText.length
            })
        }

        return {
            text: normalText,
            entities
        }
    }

    /**
     * Converte texto enriquecido de volta para formato normal
     * @param {string} enrichedText - Texto enriquecido a ser convertido
     * @returns {string} - Texto no formato normal
     *
     * Exemplo:
     * Entrada: "Olá, [txt:user.name, ent:mention, id:24235215135135] seja bem vindo!"
     * Saída: "Olá, @user.name seja bem vindo!"
     */
    public formatToNormal(enrichedText?: string): string {
        const text = enrichedText ?? this.enrichedText
        if (!text || typeof text !== "string") {
            return ""
        }

        let normalText = text

        // Converter menções de volta (com ou sem ID) usando prefixo configurável
        normalText = normalText.replace(
            /\[txt:([^,]+), ent:mention(?:, id:[^\]]+)?\]/g,
            `${this.mentionPrefix}$1`
        )

        // Converter hashtags de volta (com ou sem ID) usando prefixo configurável
        normalText = normalText.replace(
            /\[txt:([^,]+), ent:hashtag(?:, id:[^\]]+)?\]/g,
            `${this.hashtagPrefix}$1`
        )

        // Converter URLs de volta (com ou sem ID)
        normalText = normalText.replace(/\[txt:([^,]+), ent:url(?:, id:[^\]]+)?\]/g, "$1")

        return normalText
    }

    /**
     * Extrai todas as entidades de um texto enriquecido
     * @param {string} enrichedText - Texto enriquecido
     * @returns {Object} - Objeto com arrays de entidades encontradas
     */
    public extractEntities(enrichedText?: string): {
        mentions: Array<{ text: string; id?: string }>
        hashtags: Array<{ text: string; id?: string }>
        urls: Array<{ text: string; id?: string }>
    } {
        const text = enrichedText ?? this.enrichedText

        const entities = {
            mentions: [] as Array<{ text: string; id?: string }>,
            hashtags: [] as Array<{ text: string; id?: string }>,
            urls: [] as Array<{ text: string; id?: string }>
        }

        if (!text || typeof text !== "string") {
            return entities
        }

        // Extrair menções (com ou sem ID)
        const mentionMatches = text.match(/\[txt:([^,]+), ent:mention(?:, id:([^\]]+))?\]/g)
        if (mentionMatches) {
            mentionMatches.forEach((match) => {
                const textMatch = match.match(/\[txt:([^,]+), ent:mention(?:, id:([^\]]+))?\]/)
                if (textMatch && textMatch[1]) {
                    const entity: { text: string; id?: string } = { text: textMatch[1] }
                    if (textMatch[2]) {
                        entity.id = textMatch[2]
                    }
                    entities.mentions.push(entity)
                }
            })
        }

        // Extrair hashtags (com ou sem ID)
        const hashtagMatches = text.match(/\[txt:([^,]+), ent:hashtag(?:, id:([^\]]+))?\]/g)
        if (hashtagMatches) {
            hashtagMatches.forEach((match) => {
                const textMatch = match.match(/\[txt:([^,]+), ent:hashtag(?:, id:([^\]]+))?\]/)
                if (textMatch && textMatch[1]) {
                    const entity: { text: string; id?: string } = { text: textMatch[1] }
                    if (textMatch[2]) {
                        entity.id = textMatch[2]
                    }
                    entities.hashtags.push(entity)
                }
            })
        }

        // Extrair URLs (com ou sem ID)
        const urlMatches = text.match(/\[txt:([^,]+), ent:url(?:, id:([^\]]+))?\]/g)
        if (urlMatches) {
            urlMatches.forEach((match) => {
                const textMatch = match.match(/\[txt:([^,]+), ent:url(?:, id:([^\]]+))?\]/)
                if (textMatch && textMatch[1]) {
                    const entity: { text: string; id?: string } = { text: textMatch[1] }
                    if (textMatch[2]) {
                        entity.id = textMatch[2]
                    }
                    entities.urls.push(entity)
                }
            })
        }

        return entities
    }

    /**
     * Atualiza o texto base e regenera o texto enriquecido
     * @param {string} text - Novo texto base
     * @param {EntityMapping} entityMapping - Opcional: novo mapeamento de entidades
     */
    public updateText(text: string, entityMapping?: EntityMapping): void {
        this.baseText = text
        if (entityMapping) {
            this.entityMapping = entityMapping
        }
        this.enrichedText = this.formatToEnriched(text, this.entityMapping)
    }

    /**
     * Obtém o texto base
     */
    public getBaseText(): string {
        return this.baseText
    }

    /**
     * Obtém o texto enriquecido
     */
    public getEnrichedText(): string {
        return this.enrichedText
    }
}
