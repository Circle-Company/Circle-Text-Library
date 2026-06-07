# 📝 Rich Text — Revisão, Simplificação e Novas Funcionalidades (proposta de redesign)

> Objetivo: tornar o Rich Text **simples de usar** (do texto cru direto ao que a UI precisa),
> deixar a implementação **robusta** (uma varredura, sem corrupção de regex), **absorver a
> extração** (a classe `Extractor` passa a viver dentro do RichText, com uma só definição de
> entidade) e **adicionar funcionalidades** que uma rede social pede na prática (e-mails,
> links sem protocolo, hashtags com acento, metadados, render para HTML/tokens). Mantém os
> métodos atuais.

---

## 🔴 O problema atual

A fonte da verdade hoje é uma **string enriquecida** (`[txt:alice, ent:mention, id:u1]`) que
todos os outros métodos **re-parseiam com regex**. Isso gera quatro classes de problema:

### a) Corrupção por substituição em sequência

`formatToEnriched` substitui menção → hashtag → URL, uma passada por vez:

```typescript
// "https://example.com/#section"
//   1) passada de hashtag: #section  →  [txt:section, ent:hashtag]
//      vira "https://example.com/[txt:section, ent:hashtag]"
//   2) passada de URL: https?:\/\/[^\s]+ casa "https://example.com/[txt:section,"
//   ⚠️ URL destruída. O mesmo acontece com "https://twitter.com/@jack" (o @jack some).
```

URLs com âncora (`#`) ou com `@` no caminho **quebram** — caso comuníssimo em rede social.

### b) Duas classes fazendo o mesmo trabalho, com regex divergente

O `Extractor` (`extractor.ts`) e o `RichText` **fazem a mesma coisa** — achar menções,
hashtags e URLs no texto — mas com definições diferentes:

| Entidade | `Extractor` (extractor.ts) | `RichText` (rich.text)        |
| -------- | -------------------------- | ----------------------------- |
| Menção   | `@\w+`                     | `@[a-zA-Z0-9._-]+`            |
| Hashtag  | `#\w+`                     | `#[a-zA-Z0-9_]+`             |
| URL      | `https?:\/\/[^\s,]+`       | `https?:\/\/[^\s]+`          |

`@joao.silva` é **uma** menção no RichText, mas **duas coisas** no Extractor (`@joao` + resto).
O `Extractor` é uma classe separada que **duplica** o que o tokenizador do RichText já faz — e
os dois discordam do que é uma menção. Não há fonte única.

### c) Formato stringly-typed e inseguro

Se o texto do usuário **contém literalmente** `[txt:x, ent:mention]`, ele é interpretado como
entidade (injeção). E `formatToUI` chama `formatToNormal` repetidamente em substrings só para
recalcular posições — caro e difícil de seguir.

### d) Uso em 3 passos e tipos limitados

Para qualquer coisa é preciso `new RichText()` → `setText()` → `getX()`, e entender o formato
enriquecido interno. Só há 3 tipos de entidade (menção, hashtag, URL). Não há render para HTML,
nem metadados além de `id`, nem `stats`, nem hashtags com acento (`#café` não casa).

---

## 💡 O princípio

**Uma varredura, um modelo.** O texto cru é tokenizado **uma vez** num array de *segmentos*
ordenados (texto + entidades, com posições). Esse array é a fonte da verdade; tudo o mais
(normal, UI, HTML, extração, stats) é **derivado** dele. Sem string intermediária frágil,
sem re-parse, sem corrupção.

```
"Olá @alice veja #café"
        │  varredura única (uma regex combinada, prioridade URL/email > @/#)
        ▼
[ {text "Olá "}, {mention "alice" 4..10}, {text " veja "}, {hashtag "café" 16..21} ]
        │
        ├── toNormal()  → "Olá @alice veja #café"   (lossless: junta os .raw)
        ├── toUI()      → { text, entities[] }        (posições já calculadas)
        ├── toHTML()    → "<span>Olá </span><a ...>@alice</a> ..."
        ├── toTokens()  → [{type,value,data,start,end}]  (React-friendly)
        └── stats()     → { mentions:1, hashtags:1, urls:0 }
```

---

## ✅ O fluxo mais simples

### One-shot: do texto direto ao modelo (sem instanciar/setText)

```typescript
import { RichText } from "circle-text-library"

const segments = RichText.parse("Olá @alice veja #café em https://x.com")
// ✅ array de segmentos com type/raw/value/start/end — pronto pra renderizar
```

### Com metadados (id, href, nome de exibição…)

```typescript
// Forma simples (compatível com hoje): texto → id
RichText.parse("Olá @alice", { mentions: { alice: "user_123" } })

// Forma poderosa: resolver dinâmico, ideal pra montar links/perfis
RichText.parse("Olá @alice #café", {
    resolve: {
        mention: (h) => ({ id: lookup(h), href: `/u/${h}`, displayName: `@${h}` }),
        hashtag: (t) => ({ href: `/tag/${t}` })
    }
})
```

### Render direto para HTML (seguro contra XSS por padrão)

```typescript
const html = new RichText("Oi @alice, veja #js <script>", { mentions: { alice: "u1" } })
    .toHTML({
        mention: (e) => `<a href="/u/${e.data?.id}">@${e.value}</a>`,
        hashtag: (e) => `<a href="/tag/${e.value}">#${e.value}</a>`,
        url:     (e) => `<a href="${e.value}" rel="noopener">${e.value}</a>`
        // text: usa escape automático → "<script>" vira "&lt;script&gt;"
    })
// ✅ "Oi <a href="/u/u1">@alice</a>, veja <a href="/tag/js">#js</a> &lt;script&gt;"
```

### Render para tokens (React/Vue, sem string de HTML)

```typescript
const tokens = new RichText("@alice #js").toTokens()
// ✅ [{ type:"mention", value:"alice", data:{...}, start, end }, ...]
//    o componente decide como pintar cada token
```

### Extração (a classe `Extractor` vira parte do RichText)

Extrair menções/hashtags/URLs é só **uma leitura dos segmentos**. Então o `Extractor` é
**absorvido** pelo RichText, com a **mesma** definição de entidade — fim da divergência:

```typescript
// Estático — substitui `new Extractor(text).extract(...)`
RichText.extract("Oi @alice e @bob #js https://x.com")
// ✅ { mentions: ["@alice","@bob"], hashtags: ["#js"], urls: ["https://x.com"], emails: [] }

// Seletivo: só o que você pedir aparece no resultado (compatível com o Extractor de hoje)
RichText.extract(text, { mentions: true })
// ✅ { mentions: ["@alice","@bob"] }

// Na instância: reaproveita os segmentos já parseados + açúcares de usabilidade
const rt = new RichText(post)
rt.extract({ unique: true })     // ✅ sem duplicatas (ex.: @alice citado 2×)
rt.extract({ raw: false })       // ✅ valores sem o sigilo: mentions: ["alice","bob"]
```

O facade `circleText.extract.content(text, options)` **continua igual** — agora apenas delega
para `RichText.extract`. E a classe `Extractor` segue como **alias depreciado** que repassa
para cá, então nada quebra.

> O modelo de segmentos é a única coisa que você precisa entender. A "string enriquecida"
> de hoje vira só **um formato de serialização opcional** (`toEnriched()`), não mais o núcleo.
> Para **armazenar** o rich text no menor espaço possível e embutido na URL, veja
> [`rich-text-storage-flow.md`](./rich-text-storage-flow.md).

---

## ✨ Novas funcionalidades

| Funcionalidade           | Exemplo                                                            |
| ------------------------ | ----------------------------------------------------------------- |
| **E-mails**              | `parse("fale com a@b.com")` → entidade `email`                    |
| **Links sem protocolo**  | `parse("veja www.x.com")` → entidade `url`                        |
| **Hashtags com acento**  | `parse("#café #ação")` → casa via `\p{L}` (hoje não casa)         |
| **Entidades customizadas** | cashtags `$AAPL`, `:emoji:`, slash-commands — via `custom[]`     |
| **Metadados ricos**      | `data: { id, href, displayName, avatar }` por entidade            |
| **`toHTML()`**           | render com escape automático + templates por tipo                 |
| **`toTokens()`**         | tokens agnósticos de framework (React/Vue/Native)                 |
| **`stats()`**            | `{ mentions, hashtags, urls, emails }` p/ aplicar limites          |
| **`extract()`**          | menções/hashtags/URLs/e-mails (absorve o `Extractor`) com `unique`/`raw` |
| **`truncate(n)`**        | corta preview **sem partir** uma menção/URL no meio               |
| **`redact(types)`**      | remove/mascarar entidades (ex.: tirar todas as menções)          |

```typescript
// Entidade customizada: cashtag
RichText.parse("comprei $AAPL", {
    custom: [{ type: "cashtag", pattern: /\$[A-Z]{1,5}/, sigil: "$" }]
})

// Limites de rede social a partir do stats()
const s = new RichText(post).stats()
if (s.mentions > 10) throw new Error("Máximo de 10 menções por post")

// Preview sem quebrar entidades
new RichText("Oi @alice_muito_longa tudo bem?").truncate(12)
// ✅ "Oi @alice_muito_longa…"  (não corta no meio da menção)
```

---

## 🛠️ Como atingimos isso

### a) Tokenizador de passada única (coração da robustez)

Uma regex combinada com prioridade — **URL e e-mail antes de `@`/`#`** — resolve a corrupção:

```typescript
export type EntityType = "mention" | "hashtag" | "url" | "email"
export interface Segment {
    type: "text" | EntityType | string   // string = entidade custom
    raw: string                          // "@alice"  (exato, p/ round-trip lossless)
    value: string                        // "alice"   (sem o sigilo)
    start: number
    end: number
    data?: { id?: string; href?: string; [k: string]: unknown }
}

// Ordem = prioridade. URL casa o token inteiro (inclui "#ancora" e "/@user"), então
// o "#" e o "@" dentro da URL nunca são tokenizados separadamente.
const DEFS: { type: EntityType; re: string; sigil: string }[] = [
    { type: "url",     re: "https?:\\/\\/[^\\s]+|www\\.[^\\s]+",       sigil: "" },
    { type: "email",   re: "[\\w.+-]+@[\\w-]+\\.[\\w.-]+",            sigil: "" },
    { type: "mention", re: "@[a-zA-Z0-9._-]+",                        sigil: "@" },
    { type: "hashtag", re: "#[\\p{L}0-9_]+",                          sigil: "#" } // \p{L} = acentos
]

function tokenize(text: string, custom: EntityDef[] = []): Segment[] {
    const defs = [...custom, ...DEFS]                       // custom têm prioridade
    const re = new RegExp(defs.map((d, i) => `(?<g${i}>${d.re})`).join("|"), "gu")
    const out: Segment[] = []
    let last = 0
    for (const m of text.matchAll(re)) {
        const start = m.index
        if (start > last) out.push(textSeg(text.slice(last, start), last))
        const i = Object.keys(m.groups!).find((k) => m.groups![k] !== undefined)!
        const def = defs[Number(i.slice(1))]
        out.push({
            type: def.type, raw: m[0], value: m[0].slice(def.sigil.length),
            start, end: start + m[0].length
        })
        last = start + m[0].length
    }
    if (last < text.length) out.push(textSeg(text.slice(last), last))
    return out
}
```

Uma passada O(n), posições calculadas direto, nada de re-parse. A injeção do formato
enriquecido deixa de existir porque o núcleo não é mais uma string parseável.

### b) Extração absorvida (uma fonte da verdade, uma classe a menos)

`DEFS` deixa de ser um módulo compartilhado entre duas classes: o **`Extractor` é removido** e
a extração vira método do RichText (`extract` / `RichText.extract`), lendo os mesmos segmentos.
O arquivo `src/classes/extractor.ts` se dissolve dentro de `rich.text/`, e "o que é uma menção"
passa a ter **uma definição só** — acabando com a divergência da tabela acima. A definição de
URL unificada ainda **apara pontuação final** (`. , ; : ! ? )`), pegando o melhor dos dois
mundos (o `Extractor` parava na vírgula; o RichText pegava tudo, inclusive a pontuação grudada).

### c) Saídas derivadas (todas leem o mesmo `Segment[]`)

```typescript
toNormal()  // segments.map(s => s.raw).join("")  → idêntico ao texto original (lossless)
toUI()      // { text: toNormal(), entities: segments.filter(s => s.type !== "text") }
extract(o)  // agrupa por tipo: { mentions, hashtags, urls, emails } (absorve o Extractor)
toHTML(r)   // map: renderer[type] ?? default; text sempre escapado
stats()     // contagem por tipo
```

### d) Compatibilidade: métodos atuais viram wrappers finos

Nada quebra. `formatToEnriched`, `formatToNormal`, `formatToUI`, `extractEntities`,
`updateText`, `setText`, `getBaseText`, `getEnrichedText` continuam — agora implementados
sobre o modelo de segmentos. O formato `[txt:..., ent:...]` permanece disponível via
`toEnriched()`/`formatToEnriched()` para quem já o serializou.

---

## 📦 RichText como classe independente (igual ao Timezone)

Hoje o `package.json` dá subpath próprio para `./timezone` e `./sentiment`, mas **RichText só
sai pelo barril principal** (`circle-text-library`) e por `transform.text.richText` — para usar
o RichText você arrasta a lib inteira. A proposta é dar a ele o **mesmo tratamento do Timezone**:
um ponto de entrada próprio, consumível sozinho.

### Subpath de export

```jsonc
// package.json
"exports": {
    ".":           { "import": "./dist/src/index.js", "types": "./dist/src/index.d.ts" },
    "./timezone":  { "import": "./dist/src/classes/timezone/index.js", "types": "..." },
    "./sentiment": { "import": "./dist/src/classes/sentimentExtractor/index.js", "types": "..." },
    "./rich-text": {                                   // ⬅️ novo, espelhando o timezone
        "import":  "./dist/src/classes/rich.text/index.js",
        "require": "./dist/src/classes/rich.text/index.js",
        "types":   "./dist/src/classes/rich.text/index.d.ts"
    }
}
```

### Uso standalone (como `circle-text-library/timezone`)

```typescript
import { RichText } from "circle-text-library/rich-text"

const segments = RichText.parse("Olá @alice veja #café")
const html = new RichText("@alice", { mentions: { alice: "u1" } }).toHTML({ ... })
const code = await new RichText(post).toURLSafeCompressed()   // codec de storage junto
```

### O que "independente" exige

- **Sem depender de outras classes** (`Validator`, `Conversor`…). Os `DEFS` (padrões de
  entidade) agora são **internos ao próprio módulo** `rich.text` — com o `Extractor` absorvido,
  nem há mais um módulo compartilhado a manter. É o mesmo espírito do Timezone, que não importa
  ninguém: o RichText é autocontido, **incluindo a extração**.
- **Tipos exportados pelo próprio módulo**: `Segment`, `EntityData`, `EntityMapping`,
  `RichTextUIFormat`, `RichTextEntity` saem de `rich.text/index.ts`.
- **O facade continua reexportando** RichText (como já faz: `export { RichText }` no `index.ts`
  e `transform.text.richText`), para quem quer tudo junto. Independência **adiciona** um caminho
  de import, não remove o atual.

### Nota sobre o nome da pasta

O diretório é `rich.text` (com ponto). Para um subpath limpo o **nome de import** vira
`rich-text` (com hífen) — o caminho em disco pode continuar `rich.text` ou ser renomeado para
`rich-text` por consistência (recomendado, mas é troca opcional e isolada).

---

## 🐛 Bugs corrigidos pela revisão

| Caso                                  | Hoje                                  | Depois (passada única) |
| ------------------------------------- | ------------------------------------- | ---------------------- |
| `https://site.com/#secao`             | URL quebra (`#secao` vira hashtag)    | URL inteira ✔          |
| `https://twitter.com/@jack`           | URL quebra (`@jack` vira menção)      | URL inteira ✔          |
| `@joao.silva` (Extractor vs RichText) | duas classes, definições divergentes  | uma classe, uma definição ✔ |
| `visite x.com, e veja`                | URL pega a vírgula (`x.com,`)         | pontuação final aparada ✔ |
| Texto com `[txt:x, ent:mention]`      | interpretado como entidade (injeção)  | tratado como texto ✔   |
| `#café`                               | não casa (sem acento)                 | casa via `\p{L}` ✔     |

---

## 🔁 Migração (de → para)

| Hoje                                              | Proposta (mais simples)                          |
| ------------------------------------------------- | ------------------------------------------------ |
| `const r = new RichText(); r.setText(t, map)`     | `new RichText(t, map)` ou `RichText.parse(t, map)` |
| Entender a string `[txt:..., ent:...]`            | trabalhar com `Segment[]`                        |
| `r.formatToUI()`                                  | `r.toUI()` (mesmo shape) — `formatToUI` mantido  |
| `new Extractor(t).extract({ mentions: true })`    | `RichText.extract(t, { mentions: true })` — `Extractor` vira alias depreciado |
| montar o HTML na mão a partir das posições        | `r.toHTML({ ... })` com escape automático        |
| só `id` por entidade                              | `data: { id, href, displayName, ... }`           |
| menção/hashtag/URL                                | + e-mail, www-links, acentos, entidades custom   |

---

## 📊 Antes vs. Depois

| Critério                        | Antes                                  | Depois                                   |
| ------------------------------- | -------------------------------------- | ---------------------------------------- |
| Fonte da verdade                | string enriquecida re-parseada         | `Segment[]` (uma varredura)              |
| Passos para usar                | `new` + `setText` + `getX`             | `RichText.parse(text)` (1 chamada)       |
| URLs com `#`/`@`                | quebram                                | corretas                                 |
| Extração de entidades           | classe `Extractor` separada (divergente) | método do RichText (`extract`), uma definição |
| Segurança (injeção/XSS)         | formato injetável, render manual       | núcleo não-parseável + escape no `toHTML`|
| Tipos de entidade               | 3 fixos                                | 5+ e **extensível** (`custom[]`)         |
| Metadados por entidade          | só `id`                                | `id`, `href`, `displayName`, livre       |
| Render                          | por conta do dev                       | `toHTML()` / `toTokens()`                |
| Utilitários de rede social      | nenhum                                 | `stats()`, `truncate()`, `redact()`      |
| Custo de `formatToUI`           | re-parse repetido de substrings        | leitura direta dos segmentos             |
