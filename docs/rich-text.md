# 📝 RichText

Detecta **menções** (`@user`), **hashtags** (`#tag`), **URLs** e **e-mails** em uma única varredura e expõe o texto como um modelo de **segmentos** com posições. A partir desse modelo você deriva: extração, render seguro (HTML/tokens), métricas, preview e uma serialização mínima para guardar na URL/banco.

> Arquitetura e fluxo: [`rich-text-flow.md`](./rich-text-flow.md) · [`rich-text-storage-flow.md`](./rich-text-storage-flow.md)

```typescript
import { RichText } from "circle-text-library/rich-text"
```

> **Importante:** os métodos de **instância** operam sobre o texto passado no construtor. Para analisar um texto avulso rapidamente, use os **estáticos** `RichText.parse(texto)` / `RichText.extract(texto)`, ou crie uma instância por texto: `new RichText(texto, opts)`.

---

## As três representações

| Forma | Como obter | Para quê |
|-------|-----------|----------|
| **Normal** (lossless) | `toNormal()` | armazenar/round-trip do texto original |
| **Segmentos / UI** | `toSegments()`, `toUI()`, `toTokens()` | renderizar em React/Vue/Native |
| **Compacta** (lossless) | `toCompact()` / `RichText.fromCompact()` | guardar texto + metadados numa string curta |

Cada **segmento** tem o formato:

```typescript
interface Segment {
    type: "text" | "mention" | "hashtag" | "url" | "email" | (string & {})
    raw: string      // com o sigilo: "@alice", "#js"
    value: string    // sem o sigilo: "alice", "js"
    start: number
    end: number
    data?: { id?: string; href?: string; displayName?: string; [k: string]: unknown }
}
```

---

## Parse → segmentos

```typescript
RichText.parse("Olá @alice veja #js")
// [
//   { type: "text",    raw: "Olá ",   value: "Olá ",  start: 0,  end: 4 },
//   { type: "mention", raw: "@alice", value: "alice", start: 4,  end: 10 },
//   { type: "text",    raw: " veja ", value: " veja ", start: 10, end: 16 },
//   { type: "hashtag", raw: "#js",    value: "js",    start: 16, end: 19 }
// ]
```

---

## Extração de entidades

```typescript
RichText.extract("Oi @alice e @bob #js https://x.com a@b.com", { unique: true })
// { mentions: ["@alice", "@bob"], hashtags: ["#js"], urls: ["https://x.com"], emails: ["a@b.com"] }
```

Opções (`ExtractOptionsRT`): ligue só o que precisa (`mentions`/`hashtags`/`urls`/`emails`), `unique` remove duplicatas, `raw: false` devolve o valor **sem o sigilo**.

```typescript
new RichText("Oi @alice e @bob").extract({ mentions: true, raw: false })
// { mentions: ["alice", "bob"] }
```

---

## Render seguro (HTML com escape automático)

Os segmentos de **texto** são escapados automaticamente (proteção contra XSS); você fornece o render por tipo de entidade:

```typescript
new RichText("Oi @alice <script>", { mentions: { alice: "u1" } }).toHTML({
    mention: (e) => `<a href="/u/${e.data?.id}">@${e.value}</a>`
})
// 'Oi <a href="/u/u1">@alice</a> &lt;script&gt;'
```

### Tokens (para frameworks de UI)

```typescript
new RichText("@alice #js").toTokens()
// [
//   { type: "mention", value: "alice", raw: "@alice", start: 0, end: 6 },
//   { type: "text",    value: " ",     raw: " ",      start: 6, end: 7 },
//   { type: "hashtag", value: "js",    raw: "#js",    start: 7, end: 10 }
// ]
```

---

## Metadados das entidades

Passe um mapa `texto → id` no construtor, ou um `resolve` para metadados ricos (precedência: `resolve` > mapa simples):

```typescript
new RichText("Olá @alice", { mentions: { alice: "u1" } })       // data.id = "u1"

new RichText("Olá @alice", {
    resolve: { mention: (h) => ({ id: "x", href: `/u/${h}`, displayName: h }) }
})
```

---

## Métricas e preview

```typescript
new RichText("@a @b #x https://y.com").stats()
// { mentions: 2, hashtags: 1, urls: 1, emails: 0 }

new RichText("Oi @alice, tudo bem com você hoje?").truncate(15)
// "Oi @alice, tudo…"   (não corta uma menção/URL no meio; o "…" conta no limite)
```

---

## Serialização compacta (lossless, sem compressão)

O tipo é inferido do sigilo (`@`/`#`); só `id`/props ficam colados à entidade (`raw~payload~`). Entidades **sem** metadados não geram overhead.

```typescript
const code = new RichText("Oi @alice", { mentions: { alice: "u1" } }).toCompact()
// "Oi @alice~u1~"

RichText.fromCompact(code).toNormal()
// "Oi @alice"   (round-trip lossless de texto + metadados)
```

---

## Casos de uso

### Feed: renderizar um post com links clicáveis

```typescript
function renderPost(text: string, mentionIds: Record<string, string>) {
    return new RichText(text, { mentions: mentionIds }).toHTML({
        mention: (e) => `<a class="mention" href="/u/${e.data?.id}">@${e.value}</a>`,
        hashtag: (e) => `<a class="tag" href="/t/${e.value}">#${e.value}</a>`,
        url: (e) => `<a href="${e.value}" rel="noopener">${e.value}</a>`
    })
}
```

### Notificações: quem foi mencionado?

```typescript
const mentioned = RichText.extract(post, { mentions: true, unique: true, raw: false }).mentions
// ["alice", "bob"] → dispara notificação para cada um
```

### Persistir um rascunho com metadados resolvidos

```typescript
const code = new RichText(draft, { mentions: resolvedIds }).toCompact()
// salva `code` no banco; depois:
const restored = RichText.fromCompact(code)   // recupera texto + ids exatos
```

### Cashtags (entidade custom)

```typescript
RichText.parse("comprei $AAPL hoje", {
    custom: [{ type: "cashtag", pattern: /\$[A-Z]{1,5}/, sigil: "$" }]
})
// inclui { type: "cashtag", raw: "$AAPL", value: "AAPL", ... }
```
