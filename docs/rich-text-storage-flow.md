# 🗜️ Rich Text — Notação Inline Mínima e Tudo na URL (proposta de codec)

> Objetivo: guardar o rich text no **menor número de caracteres possível**, **100%
> recuperável**, com **tudo embutido na própria URL** (texto + entidades + ids + propriedades).
> **Sem compressão real** (nada de gzip/deflate) — a economia vem de uma **notação inline**
> enxuta, onde cada entidade carrega seus metadados dentro do texto com o mínimo de caracteres.
> Complementa o modelo de segmentos do [`rich-text-flow.md`](./rich-text-flow.md).

---

## 🔴 O ponto de partida

A "string enriquecida" de hoje é verbosa ao extremo para o que precisa representar:

```
"[txt:alice, ent:mention, id:u_1001]"     ← 35 caracteres
```

Ela repete o tipo por extenso (`ent:mention`), rotula tudo (`txt:`, `id:`) e usa colchetes —
quando, na prática, o `@` **já diz** que é uma menção e `alice` **já é** o texto. Só o `id`
não dá pra deduzir do texto.

---

## 💡 O princípio: o tipo é grátis, anote só o não-derivável — inline e curto

Três fatos cortam quase tudo:

1. **O tipo é grátis.** O `@` indica menção, o `#` indica hashtag, e URL/e-mail se identificam
   pela forma. **Nunca armazenamos o tipo.**
2. **O texto da entidade já está lá.** `@alice` já contém "alice". **Não duplicamos.**
3. **Só o metadado é não-derivável.** `id` (e props como `href`, `nome`) vêm de um resolver,
   não do texto. **Só isso precisa ser anotado** — e bem ao lado da entidade, inline.

Resultado: a entidade continua legível e a anotação é o menor sufixo possível.

```
@alice              →  sem metadado: ZERO caractere extra
@alice (id u1)      →  @alice~u1~          (2 sentinelas + o id, e nada mais)
```

Sem gzip, sem base64 do conteúdo, sem sidecar separado: o metadado **viaja colado** à entidade.

---

## 🔡 A notação mínima

### Gramática

```
textoMarcado   := ( texto | entidadeComMeta | entidade )*
entidade       := @handle | #tag | url | email          // sem metadado → escrita como está
entidadeComMeta:= entidade "~" payload "~"               // "~" = sentinela
payload        := id ( ";" prop )*
prop           := chave "=" valor                        // chave de 1 letra: h=href, n=nome, a=avatar…
```

- **Tipo nunca é armazenado** — vem do sigilo (`@`/`#`) ou da forma (url/email).
- **Só entidades com metadado** ganham o `~...~`. `@alice` puro continua `@alice` (overhead zero).
- **Caso comum = só o id:** `@alice~u1~`.
- **A sentinela é `~`** (caractere *unreserved* de URL, seguro sem escape, e raro em texto social).
  Um `~` literal no texto é escrito **`~~`** (dobrado); um `~` isolado é sempre marcador. Essa
  única regra vale **inclusive dentro de URLs**, então nada fica ambíguo.

### Tamanhos lado a lado

| Representação                                  | Caracteres |
| ---------------------------------------------- | ---------- |
| `[txt:alice, ent:mention, id:u_1001]` (hoje)   | 35         |
| `@alice~u_1001~` (proposta)                     | 14         |
| `@alice` (sem metadado)                         | 6 (zero extra) |

### Com propriedades extras

```
@alice~u1~                          // só id
@alice~u1;h=/u/alice~               // id + href
@alice~u1;h=/u/alice;n=Alice Silva~ // id + href + nome
@alice~;n=Alice~                    // sem id, só uma prop (id vazio)
#circle~t50~                        // hashtag com id
```

Ainda muito mais curto que JSON ou que a string enriquecida — e legível.

---

## ✅ A API

```typescript
// Serializar para a notação mínima (síncrono — mantém o ethos 100% síncrono do RichText)
const code = richText.toCompact()
// "Oi @alice~u1~ e @bob~u2~, viram #circle~t5~?"

// Recuperar — lossless: reconstrói texto base + entidades + ids/props
const restored = RichText.fromCompact(code)
restored.toNormal()   // "Oi @alice e @bob, viram #circle?"   (markers removidos)
restored.toUI()       // entidades com ids/props idênticos
```

Repare que **não há etapa de compressão nem de codificação binária** — `toCompact()` devolve
texto pronto. A diferença para `toNormal()` é só que as entidades com metadado trazem o
sufixo `~...~`.

---

## 🌐 Tudo na URL

A string compacta já é quase URL-safe (as sentinelas `~ ; =` são *unreserved*/seguras). Só o
**conteúdo** do texto (espaços, acentos, `#`) precisa do encode normal de URL:

```typescript
const url = `https://circle.app/p#${encodeURIComponent(richText.toCompact())}`
// https://circle.app/p#Oi%20@alice~u1~%20e%20@bob~u2~%2C%20viram%20%23circle~t5~%3F
```

| Lugar              | Quando usar                                                        |
| ------------------ | ----------------------------------------------------------------- |
| **Fragmento** `#…` | **Recomendado**: não vai ao servidor, limite folgado, render no cliente |
| **Query** `?d=…`   | quando o servidor precisa renderizar (SSR)                        |
| **Path** `/p/…`    | URLs "limpas", para conteúdo curto                               |

```
https://circle.app/p#Oi%20@alice~u1~...   ← texto + ids + props vivem aqui, sem backend
```

---

## 🔬 Por que é lossless por construção

```
encode (toCompact):  segmentos → para cada entidade com metadado, anexa "~payload~"; "~" literal → "~~"
decode (fromCompact): tokeniza o texto marcado; cada "~payload~" reidrata id/props da entidade ao lado;
                      remove markers e desfaz "~~"→"~" para obter o texto base
```

Garantias:

- **O metadado viaja colado à entidade**, então não há risco de desalinhamento de ordem
  (o sidecar separado do desenho anterior precisava casar índices; inline não precisa).
- **O tipo é redescoberto** pelo tokenizador a partir do sigilo/forma — idêntico ao original.
- **Unicode/emoji/acentos/quebras de linha** são preservados: fazem parte do texto e só passam
  pelo `encodeURIComponent` do transporte, que é reversível.
- **Ambiguidade zero** graças à regra única `~`→`~~`, válida até dentro de URLs.

---

## 🚧 Limites e quando NÃO usar

- **Tamanho de URL.** Sem compressão, textos longos geram URLs longas. Browsers aguentam
  dezenas de KB, mas proxies/CDNs variam; para compatibilidade universal mire **≲ 2.000
  caracteres**. A notação minimiza o *overhead de metadado*, não o tamanho do texto em si.
- **Conteúdo grande → guarde no servidor** e ponha só um id curto na URL. O codec é para
  snippets autocontidos (comentário, rascunho, deep-link).
- **Não é criptografia.** É texto legível/reversível — não coloque dado sensível.
- **`~` no texto custa 1 char** (vira `~~`). Como tilde é raro em texto social, o impacto é
  desprezível; ainda assim, é o único caractere com custo de escape.

---

## 📊 Antes vs. Depois

| Critério                          | String enriquecida / JSON            | Notação inline mínima                   |
| --------------------------------- | ------------------------------------ | --------------------------------------- |
| O que é armazenado                | texto + tipo + posição + rótulos + id | **texto + (id/props colados)**          |
| Tipo da entidade                  | escrito por extenso (`ent:mention`)  | **grátis** (sigilo/forma)               |
| Entidade sem metadado             | `[txt:.., ent:..]` (verboso)         | **0 caractere extra**                   |
| Exemplo (`@alice`, id `u_1001`)   | 35 caracteres                        | **14 caracteres**                       |
| Compressão                        | —                                    | **nenhuma** (só notação enxuta)         |
| Codificação binária/base64        | —                                    | nenhuma (texto direto)                  |
| Recuperação                       | re-parse de markup frágil            | **lossless** por re-tokenização         |
| Alinhamento de metadado           | —                                    | inline (sem casar índices)              |
| URL-safe                          | não                                  | sentinelas seguras + `encodeURIComponent` |
| Tudo na URL (sem backend)         | inviável                             | sim, é o objetivo                       |
