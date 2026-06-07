// Copyright 2025 Circle LLC.
// Licensed under the Circle License, Version 1.0

/**
 * RichText - Engine de texto enriquecido (v2).
 *
 * O núcleo é um modelo de segmentos: o texto cru é tokenizado UMA vez
 * (uma passada O(n), com prioridade URL/email > @/#) num array de `Segment[]`.
 * Tudo o mais (normal, UI, HTML, tokens, extração, stats, compact) é derivado
 * desse array — sem string intermediária frágil, sem re-parse, sem corrupção.
 *
 * A classe absorve a extração (antes em `Extractor`): `extract` /
 * `RichText.extract` leem os mesmos segmentos — uma única definição de entidade.
 */

import { Configurable, DeepPartial, mergeConfig } from "../../core/config.js"

import type {
    EntityData,
    EntityDef,
    EntityMapping,
    EntityType,
    ExtractOptionsRT,
    ExtractResultRT,
    RichTextConfig,
    RichTextEntity,
    RichTextOptions,
    RichTextRenderers,
    RichTextStats,
    RichTextToken,
    RichTextUIFormat,
    Segment
} from "./richText.types.js"

// Reexporta os tipos públicos para manter a superfície de import existente.
export type * from "./richText.types.js"

// ============================================================================
// Definições de entidade (FONTE ÚNICA da verdade — tokenizer + extração)
// ============================================================================

interface NativeDef {
    type: EntityType
    re: string
    sigil: string
}

// Ordem = prioridade. URL e e-mail ANTES de @/# para que "#ancora" e "/@user"
// dentro de uma URL nunca sejam tokenizados separadamente.
const NATIVE_DEFS: NativeDef[] = [
    { type: "url", re: "https?:\\/\\/[^\\s]+|www\\.[^\\s]+", sigil: "" },
    { type: "email", re: "[\\w.+-]+@[\\w-]+\\.[\\w.-]+", sigil: "" },
    { type: "mention", re: "@[a-zA-Z0-9._-]+", sigil: "@" },
    { type: "hashtag", re: "#[\\p{L}0-9_]+", sigil: "#" }
]

// Pontuação final aparada de URLs.
const TRAILING_PUNCT = ".,;:!?)"

const HTML_ESCAPE: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
}

function escapeHtml(text: string): string {
    return text.replace(/[&<>"']/g, (c) => HTML_ESCAPE[c] ?? c)
}

interface InternalDef {
    type: string
    pattern: string
    sigil: string
}

function buildDefs(custom: EntityDef[]): InternalDef[] {
    const customDefs: InternalDef[] = custom.map((d) => ({
        type: d.type,
        pattern: d.pattern.source,
        sigil: d.sigil ?? ""
    }))
    const nativeDefs: InternalDef[] = NATIVE_DEFS.map((d) => ({
        type: d.type,
        pattern: d.re,
        sigil: d.sigil
    }))
    return [...customDefs, ...nativeDefs]
}

function textSegment(text: string, start: number): Segment {
    return { type: "text", raw: text, value: text, start, end: start + text.length }
}

// ============================================================================
// RichText
// ============================================================================

export class RichText implements Configurable<RichTextConfig> {
    public readonly config: Readonly<RichTextConfig>

    private baseText: string = ""
    private segments: Segment[] = []

    constructor(text?: string, options?: RichTextOptions) {
        this.config = RichText.normalizeOptions(options)
        if (text !== undefined) {
            this.baseText = text
            this.segments = this.parseText(text)
        }
    }

    private static normalizeOptions(options?: RichTextOptions): Readonly<RichTextConfig> {
        const mapping: EntityMapping = {}
        if (options?.mentions) mapping.mentions = options.mentions
        if (options?.hashtags) mapping.hashtags = options.hashtags
        return {
            mapping,
            resolve: options?.resolve ?? {},
            custom: options?.custom ?? []
        }
    }

    // ------------------------------------------------------------------------
    // Configurable
    // ------------------------------------------------------------------------

    public withConfig(patch: DeepPartial<RichTextConfig>): this {
        const merged = mergeConfig(this.config, patch) as RichTextConfig
        const options: RichTextOptions = { resolve: merged.resolve, custom: merged.custom }
        if (merged.mapping.mentions) options.mentions = merged.mapping.mentions
        if (merged.mapping.hashtags) options.hashtags = merged.mapping.hashtags
        return new RichText(this.baseText, options) as this
    }

    // ========================================================================
    // NÚCLEO: tokenizador de passada única
    // ========================================================================

    /**
     * Tokeniza o texto cru num `Segment[]` em uma única passada O(n).
     * Prioridade: custom > url/email > mention > hashtag.
     */
    private static tokenize(
        text: string,
        custom: EntityDef[],
        annotate?: (seg: Segment) => void
    ): Segment[] {
        if (!text) return []
        const defs = buildDefs(custom)
        const re = new RegExp(defs.map((d, i) => `(?<g${i}>${d.pattern})`).join("|"), "gu")
        const out: Segment[] = []
        let last = 0

        for (const m of text.matchAll(re)) {
            const start = m.index
            const groups = m.groups ?? {}
            const key = Object.keys(groups).find((k) => groups[k] !== undefined)
            if (key === undefined) continue
            const def = defs[Number(key.slice(1))]
            if (def === undefined) continue

            let raw = m[0]

            // Apara pontuação final de URLs (e custom sem sigilo do tipo url).
            if (def.type === "url") {
                while (raw.length > 0 && TRAILING_PUNCT.includes(raw[raw.length - 1]!)) {
                    raw = raw.slice(0, -1)
                }
            }
            if (raw.length === 0) continue

            if (start > last) out.push(textSegment(text.slice(last, start), last))

            const seg: Segment = {
                type: def.type,
                raw,
                value: raw.slice(def.sigil.length),
                start,
                end: start + raw.length
            }
            if (annotate) annotate(seg)
            out.push(seg)
            last = start + raw.length
        }

        if (last < text.length) out.push(textSegment(text.slice(last), last))
        return out
    }

    /** Anexa metadados a uma entidade a partir de mapping + resolvers. */
    private annotate(seg: Segment): void {
        if (seg.type === "text") return
        const resolver = this.config.resolve[seg.type]
        let data: EntityData | undefined
        if (resolver) {
            const resolved = resolver(seg.value)
            if (resolved) data = { ...resolved }
        }
        // Mapa simples texto → id.
        const id =
            seg.type === "mention"
                ? this.config.mapping.mentions?.[seg.value]
                : seg.type === "hashtag"
                  ? this.config.mapping.hashtags?.[seg.value]
                  : undefined
        if (id !== undefined && (data === undefined || data.id === undefined)) {
            data = { ...(data ?? {}), id }
        }
        if (data !== undefined) seg.data = data
    }

    private parseText(text: string): Segment[] {
        return RichText.tokenize(text, this.config.custom, (seg) => this.annotate(seg))
    }

    // ========================================================================
    // API estática (one-shot)
    // ========================================================================

    /** One-shot: do texto cru direto ao `Segment[]` (sem instanciar). */
    public static parse(text: string, options?: RichTextOptions): Segment[] {
        return new RichText(text, options).toSegments()
    }

    /** Extração estática — substitui `new Extractor(text).extract(...)`. */
    public static extract(text: string, options?: ExtractOptionsRT): ExtractResultRT {
        return new RichText(text).extract(options)
    }

    /** Reconstrói uma instância a partir da notação compacta inline. */
    public static fromCompact(code: string): RichText {
        const { text, segments } = RichText.decodeCompact(code)
        const rt = new RichText()
        rt.baseText = text
        rt.segments = segments
        return rt
    }

    // ========================================================================
    // Segmentos
    // ========================================================================

    /** Cópia defensiva dos segmentos atuais. */
    public toSegments(): Segment[] {
        return this.segments.map((s) => ({ ...s, ...(s.data ? { data: { ...s.data } } : {}) }))
    }

    // ========================================================================
    // Saídas derivadas
    // ========================================================================

    /** Texto normal (lossless): junta os `.raw` de cada segmento. */
    public toNormal(): string {
        return this.segments.map((s) => s.raw).join("")
    }

    /** Formato de UI: texto plano + entidades estruturadas, derivado dos segmentos. */
    public toUI(): RichTextUIFormat {
        const entities: RichTextEntity[] = this.segments.map((s) => {
            const entity: RichTextEntity = {
                type: s.type,
                text: s.value,
                raw: s.raw,
                start: s.start,
                end: s.end
            }
            if (s.data) entity.data = { ...s.data }
            return entity
        })
        return { text: this.toNormal(), entities }
    }

    /** Tokens agnósticos de framework (React/Vue/Native). */
    public toTokens(): RichTextToken[] {
        return this.segments.map((s) => {
            const token: RichTextToken = {
                type: s.type,
                value: s.value,
                raw: s.raw,
                start: s.start,
                end: s.end
            }
            if (s.data) token.data = { ...s.data }
            return token
        })
    }

    /** Contagem de entidades por tipo. */
    public stats(): RichTextStats {
        const out: RichTextStats = { mentions: 0, hashtags: 0, urls: 0, emails: 0 }
        const NATIVE_PLURAL: Record<string, keyof RichTextStats> = {
            mention: "mentions",
            hashtag: "hashtags",
            url: "urls",
            email: "emails"
        }
        for (const s of this.segments) {
            if (s.type === "text") continue
            const key = NATIVE_PLURAL[s.type] ?? s.type
            out[key] = (out[key] ?? 0) + 1
        }
        return out
    }

    /** Render para HTML com escape automático de texto (XSS-safe). */
    public toHTML(renderers?: RichTextRenderers): string {
        return this.segments
            .map((s) => {
                if (s.type !== "text") {
                    const render = renderers?.[s.type]
                    if (render) return render({ ...s, ...(s.data ? { data: { ...s.data } } : {}) })
                }
                return escapeHtml(s.raw)
            })
            .join("")
    }

    /**
     * Corta o texto em no máximo `n` caracteres sem partir uma entidade.
     * Se o corte cair no meio de uma entidade, inclui a entidade inteira.
     */
    public truncate(n: number, ellipsis = "…"): string {
        const normal = this.toNormal()
        if (n < 0 || normal.length <= n) return normal
        let cut = n
        for (const s of this.segments) {
            if (s.type === "text") continue
            if (s.start < n && s.end > n) {
                cut = s.end
                break
            }
        }
        if (cut >= normal.length) return normal
        return normal.slice(0, cut) + ellipsis
    }

    // ========================================================================
    // Extração (absorve o Extractor — uma definição de entidade)
    // ========================================================================

    /**
     * Extrai entidades RAW (com sigilo), agrupadas por tipo.
     * - Sem options: retorna todos os tipos.
     * - Com chaves booleanas: só os tipos pedidos aparecem.
     * - `unique`: remove duplicatas. `raw: false`: valores sem sigilo.
     */
    public extract(options?: ExtractOptionsRT): ExtractResultRT {
        const explicit =
            options !== undefined &&
            (options.mentions === true ||
                options.hashtags === true ||
                options.urls === true ||
                options.emails === true)

        const PLURAL: Record<EntityType, keyof ExtractOptionsRT> = {
            mention: "mentions",
            hashtag: "hashtags",
            url: "urls",
            email: "emails"
        }
        const want = (t: EntityType): boolean => {
            if (!explicit) return true
            return options?.[PLURAL[t]] === true
        }

        const useRaw = options?.raw !== false
        const unique = options?.unique === true

        const result: ExtractResultRT = {}
        const buckets: Record<EntityType, string[] | undefined> = {
            mention: want("mention") ? [] : undefined,
            hashtag: want("hashtag") ? [] : undefined,
            url: want("url") ? [] : undefined,
            email: want("email") ? [] : undefined
        }

        for (const s of this.segments) {
            if (s.type === "text") continue
            const bucket = buckets[s.type as EntityType]
            if (bucket === undefined) continue
            bucket.push(useRaw ? s.raw : s.value)
        }

        const finalize = (arr: string[]): string[] => (unique ? [...new Set(arr)] : arr)

        if (buckets.mention !== undefined) result.mentions = finalize(buckets.mention)
        if (buckets.hashtag !== undefined) result.hashtags = finalize(buckets.hashtag)
        if (buckets.url !== undefined) result.urls = finalize(buckets.url)
        if (buckets.email !== undefined) result.emails = finalize(buckets.email)

        return result
    }

    // ========================================================================
    // Notação compacta inline (storage flow) — SÍNCRONA, sem compressão
    // ========================================================================

    /**
     * Serializa para a notação inline mínima: cada entidade COM metadado carrega
     * `~payload~` colado; `@alice` puro continua `@alice` (overhead zero).
     * Sentinela `~`; `~` literal no texto vira `~~`.
     */
    public toCompact(): string {
        let out = ""
        for (const s of this.segments) {
            if (s.type === "text") {
                out += s.raw.replace(/~/g, "~~")
                continue
            }
            const payload = RichText.encodePayload(s.data)
            if (payload === undefined) {
                out += s.raw
            } else {
                out += `${s.raw}~${payload}~`
            }
        }
        return out
    }

    private static encodePayload(data?: EntityData): string | undefined {
        if (data === undefined) return undefined
        const id = typeof data.id === "string" ? data.id : ""
        const props: string[] = []
        for (const key of Object.keys(data)) {
            if (key === "id") continue
            const v = data[key]
            if (typeof v === "string") props.push(`${key}=${v}`)
        }
        if (id === "" && props.length === 0) return undefined
        return [id, ...props].join(";")
    }

    private static decodeCompact(code: string): { text: string; segments: Segment[] } {
        // 1) Tokeniza o texto marcado char-a-char, desfazendo "~~"→"~" e capturando
        //    payloads "~...~" como anotação da entidade imediatamente anterior.
        let base = "" // texto base reconstruído (markers removidos, ~~ desfeito)
        // Marca posições onde há payload para reidratar depois.
        const payloads: { atLength: number; payload: string }[] = []
        let i = 0
        while (i < code.length) {
            const ch = code[i]!
            if (ch === "~") {
                if (code[i + 1] === "~") {
                    base += "~"
                    i += 2
                    continue
                }
                // Sentinela de início de payload — lê até o próximo "~" não-duplicado.
                let j = i + 1
                let payload = ""
                while (j < code.length) {
                    if (code[j] === "~") {
                        if (code[j + 1] === "~") {
                            payload += "~"
                            j += 2
                            continue
                        }
                        break
                    }
                    payload += code[j]
                    j++
                }
                payloads.push({ atLength: base.length, payload })
                i = j + 1
                continue
            }
            base += ch
            i++
        }

        // 2) Tokeniza o texto base (sem custom — notação nativa).
        const segments = RichText.tokenize(base, [])

        // 3) Reidrata payloads: cada payload anotou a entidade que TERMINA em `atLength`.
        for (const { atLength, payload } of payloads) {
            const seg = segments.find((s) => s.type !== "text" && s.end === atLength)
            if (seg) {
                const data = RichText.decodePayload(payload)
                if (data) seg.data = data
            }
        }

        return { text: base, segments }
    }

    private static decodePayload(payload: string): EntityData | undefined {
        const parts = payload.split(";")
        const data: EntityData = {}
        const id = parts[0]
        if (id !== undefined && id !== "") data.id = id
        for (let k = 1; k < parts.length; k++) {
            const prop = parts[k]!
            const eq = prop.indexOf("=")
            if (eq === -1) continue
            const key = prop.slice(0, eq)
            const value = prop.slice(eq + 1)
            if (key) data[key] = value
        }
        return Object.keys(data).length > 0 ? data : undefined
    }
}
