// Copyright 2025 Circle LLC.
// Licensed under the Circle License, Version 1.0

/**
 * Tipos públicos do `RichText`.
 *
 * Contratos da engine de texto enriquecido: segmentos, entidades (nativas e
 * custom), opções de parse, config injetável e os formatos derivados (UI,
 * tokens, stats, extração). A implementação vive em `./index.ts`.
 */

/** Tipos de entidade reconhecidos nativamente. Entidades custom usam `string`. */
export type EntityType = "mention" | "hashtag" | "url" | "email"

/** Metadados não-deriváveis anexados a uma entidade (id, href, displayName…). */
export interface EntityData {
    id?: string
    href?: string
    displayName?: string
    [key: string]: unknown
}

/** Um segmento do texto: texto puro ou uma entidade, com posições. */
export interface Segment {
    type: "text" | EntityType | (string & {})
    /** Texto exato no original, com sigilo — usado p/ round-trip lossless. */
    raw: string
    /** Texto sem o sigilo (ex.: "alice" para "@alice"). */
    value: string
    start: number
    end: number
    data?: EntityData
}

/** Definição de uma entidade custom (cashtags, emojis, slash-commands…). */
export interface EntityDef {
    type: string
    /** Padrão (sem flags) que casa o token inteiro, incluindo o sigilo. */
    pattern: RegExp
    /** Prefixo a remover de `raw` para obter `value`. */
    sigil?: string
}

/** Mapeamento simples texto → id. */
export interface EntityMapping {
    mentions?: Record<string, string> // { "username": "id" }
    hashtags?: Record<string, string> // { "hashtag": "id" }
}

/** Resolver dinâmico de metadados por tipo de entidade. */
export interface EntityResolvers {
    mention?: (value: string) => EntityData | undefined
    hashtag?: (value: string) => EntityData | undefined
    url?: (value: string) => EntityData | undefined
    email?: (value: string) => EntityData | undefined
    [type: string]: ((value: string) => EntityData | undefined) | undefined
}

/** Opções de parse/instanciação. Aceita o mapa simples E o resolver dinâmico. */
export interface RichTextOptions extends EntityMapping {
    /** Resolver dinâmico de metadados (precedência sobre `mentions`/`hashtags`). */
    resolve?: EntityResolvers
    /** Entidades customizadas (prioridade sobre as nativas). */
    custom?: EntityDef[]
}

/** Configuração injetável da engine (contrato `Configurable`). */
export interface RichTextConfig {
    mapping: EntityMapping
    resolve: EntityResolvers
    custom: EntityDef[]
}

/** Entidade no formato de UI. */
export interface RichTextEntity {
    type: "text" | EntityType | (string & {})
    text: string
    raw: string
    start: number
    end: number
    data?: EntityData
}

/** Saída de `toUI`. */
export interface RichTextUIFormat {
    text: string
    entities: RichTextEntity[]
}

/** Token agnóstico de framework (`toTokens`). */
export interface RichTextToken {
    type: "text" | EntityType | (string & {})
    value: string
    raw: string
    start: number
    end: number
    data?: EntityData
}

/** Renderizadores por tipo para `toHTML`. */
export type RichTextRenderers = {
    [type: string]: (entity: Segment) => string
}

/** Contagem de entidades por tipo (`stats`). */
export interface RichTextStats {
    mentions: number
    hashtags: number
    urls: number
    emails: number
    [type: string]: number
}

/** Opções de extração — chaves booleanas + açúcares `unique`/`raw`. */
export interface ExtractOptionsRT {
    mentions?: boolean
    hashtags?: boolean
    urls?: boolean
    emails?: boolean
    unique?: boolean
    raw?: boolean
}

/** Resultado parcial de extração — só as chaves pedidas aparecem. */
export interface ExtractResultRT {
    mentions?: string[]
    hashtags?: string[]
    urls?: string[]
    emails?: string[]
}
