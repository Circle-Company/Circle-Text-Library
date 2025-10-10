# Rich Text

O módulo Rich Text fornece formatação enriquecida de texto com identificação automática e mapeamento de entidades (menções, hashtags e URLs).

## Índice

- [Configuração](#configuração)
- [Conceitos Básicos](#conceitos-básicos)
- [Métodos Principais](#métodos-principais)
- [Formatos de Saída](#formatos-de-saída)
- [Casos de Uso](#casos-de-uso)

## Configuração

### Inicialização

```typescript
import { TextLibrary } from "circle-text-library"

const textLib = new TextLibrary({
    validationRules: {
        /* ... */
    },
    richTextConfig: {
        mentionPrefix: "@", // Prefixo de menções
        hashtagPrefix: "#" // Prefixo de hashtags
    }
})
```

## Conceitos Básicos

### Texto Normal vs Enriquecido

**Texto Normal:**

```
Olá @alice veja #tech em https://example.com
```

**Texto Enriquecido:**

```
Olá [txt:alice, ent:mention, id:user_123] veja [txt:tech, ent:hashtag, id:tag_456] em [txt:https://example.com, ent:url]
```

### Mapeamento de Entidades

Para associar IDs às entidades, forneça um mapeamento:

```typescript
const entityMapping = {
    mentions: {
        alice: "user_123",
        bob: "user_456"
    },
    hashtags: {
        tech: "tag_789"
    }
}
```

## Métodos Principais

### setText()

Define o texto e mapeamento de IDs.

```typescript
const richText = textLib.rich

richText.setText("Olá @alice veja #tech", {
    mentions: { alice: "user_123" },
    hashtags: { tech: "tag_456" }
})
```

### getEnrichedText()

Retorna texto em formato enriquecido.

```typescript
const enriched = richText.getEnrichedText()
// "Olá [txt:alice, ent:mention, id:user_123] veja [txt:tech, ent:hashtag, id:tag_456]"
```

### formatToNormal()

Converte texto enriquecido de volta para normal.

```typescript
const normal = richText.formatToNormal()
// "Olá @alice veja #tech"
```

### formatToUI()

Formata para renderização em interface.

```typescript
const uiFormat = richText.formatToUI()
// {
//   text: "Olá @alice veja #tech",
//   entities: [
//     { type: "text", text: "Olá ", start: 0, end: 4 },
//     { type: "mention", text: "alice", id: "user_123", start: 4, end: 10 },
//     { type: "text", text: " veja ", start: 10, end: 16 },
//     { type: "hashtag", text: "tech", id: "tag_456", start: 16, end: 21 }
//   ]
// }
```

### extractEntities()

Extrai entidades do texto enriquecido.

```typescript
const entities = richText.extractEntities()
// {
//   mentions: [{ text: "alice", id: "user_123" }],
//   hashtags: [{ text: "tech", id: "tag_456" }],
//   urls: []
// }
```

## Formatos de Saída

### 1. Formato Enriquecido (Interno)

Usado para armazenamento no banco de dados.

```
[txt:alice, ent:mention, id:user_123]
```

Estrutura:

- `txt`: Texto da entidade (sem prefixo)
- `ent`: Tipo da entidade (mention, hashtag, url)
- `id`: ID opcional da entidade

### 2. Formato Normal

Texto original com prefixos das entidades.

```
@alice #tech https://example.com
```

### 3. Formato UI

Estrutura otimizada para renderização em componentes.

```typescript
{
    text: string,              // Texto completo
    entities: Array<{
        type: string,          // "text" | "mention" | "hashtag" | "url"
        text: string,          // Conteúdo da entidade
        id?: string,           // ID da entidade (se disponível)
        start: number,         // Posição inicial
        end: number            // Posição final
    }>
}
```

## Casos de Uso

### 1. Editor de Posts com Menções

```typescript
function createPost(content, mentions) {
    const richText = textLib.rich

    // Mapear IDs dos usuários mencionados
    const mentionMapping = {}
    mentions.forEach((mention) => {
        mentionMapping[mention.username] = mention.userId
    })

    richText.setText(content, { mentions: mentionMapping })

    // Salvar no banco
    return {
        contentRich: richText.getEnrichedText(),
        contentNormal: content
    }
}

const post = createPost("Olá @alice e @bob, confiram isso!", [
    { username: "alice", userId: "user_123" },
    { username: "bob", userId: "user_456" }
])
```

### 2. Renderização de Posts

```typescript
function renderPost(enrichedContent) {
    const richText = textLib.rich
    richText.setText(enrichedContent)

    const uiFormat = richText.formatToUI()

    return uiFormat.entities.map((entity, index) => {
        if (entity.type === "mention") {
            return {
                type: "link",
                text: `@${entity.text}`,
                href: `/user/${entity.id}`,
                key: index
            }
        }

        if (entity.type === "hashtag") {
            return {
                type: "link",
                text: `#${entity.text}`,
                href: `/tag/${entity.id}`,
                key: index
            }
        }

        if (entity.type === "url") {
            return {
                type: "link",
                text: entity.text,
                href: entity.text,
                key: index
            }
        }

        return {
            type: "text",
            text: entity.text,
            key: index
        }
    })
}
```

### 3. Notificações de Menções

```typescript
function createMentionNotifications(postContent, authorId) {
    const richText = textLib.rich
    richText.setText(postContent)

    const entities = richText.extractEntities()

    return entities.mentions?.map((mention) => ({
        userId: mention.id,
        type: "mention",
        message: `${authorId} mentioned you in a post`,
        postPreview: textLib.conversor.sliceWithDots({
            text: postContent,
            size: 100
        })
    }))
}
```

### 4. Busca e Indexação

```typescript
function indexPost(post) {
    const richText = textLib.rich
    richText.setText(post.content)

    const entities = richText.extractEntities()

    // Extrair IDs para indexação
    const mentionIds = entities.mentions?.map((m) => m.id).filter(Boolean) || []
    const hashtagIds = entities.hashtags?.map((h) => h.id).filter(Boolean) || []

    return {
        postId: post.id,
        content: richText.formatToNormal(),
        contentRich: richText.getEnrichedText(),
        indexedMentions: mentionIds,
        indexedHashtags: hashtagIds,
        hasUrls: (entities.urls?.length || 0) > 0
    }
}
```

### 5. Edição de Posts

```typescript
function editPost(originalRichText, newContent, entityMappings) {
    const richText = textLib.rich

    // Aplicar novo conteúdo com mapeamentos
    richText.setText(newContent, entityMappings)

    // Obter versão enriquecida atualizada
    const updatedRich = richText.getEnrichedText()

    return {
        contentRich: updatedRich,
        contentNormal: richText.formatToNormal(),
        entities: richText.extractEntities()
    }
}
```

### 6. Conversão de Formato Legacy

```typescript
function convertLegacyFormat(oldFormat) {
    // Texto normal sem IDs
    const richText = textLib.rich
    richText.setText(oldFormat)

    // Extrair entidades
    const entities = richText.extractEntities()

    // Buscar IDs no banco de dados
    const mentions = await fetchUserIds(entities.mentions?.map((m) => m.text))
    const hashtags = await fetchHashtagIds(entities.hashtags?.map((h) => h.text))

    // Reconstruir com IDs
    const mappings = {
        mentions: {},
        hashtags: {}
    }

    mentions.forEach((m) => {
        mappings.mentions[m.username] = m.id
    })

    hashtags.forEach((h) => {
        mappings.hashtags[h.name] = h.id
    })

    richText.setText(oldFormat, mappings)

    return richText.getEnrichedText()
}
```

## Recursos Avançados

### IDs Opcionais

O Rich Text funciona com ou sem IDs:

```typescript
// Com IDs
richText.setText("@alice #tech", {
    mentions: { alice: "user_123" },
    hashtags: { tech: "tag_456" }
})

// Sem IDs (apenas detecção)
richText.setText("@alice #tech")
```

### Detecção Automática

URLs são detectadas automaticamente sem necessidade de mapeamento:

```typescript
richText.setText("Visite https://example.com")
const entities = richText.extractEntities()
// { mentions: [], hashtags: [], urls: [{ text: "https://example.com" }] }
```

### Posições Precisas

O formato UI fornece posições exatas para renderização:

```typescript
const ui = richText.formatToUI()

ui.entities.forEach((entity) => {
    console.log(`${entity.type}: "${entity.text}" at ${entity.start}-${entity.end}`)
})
```

## Performance

- Processamento síncrono
- Regex otimizados para detecção
- Sem dependências externas
- Suporte a textos grandes

## Próximos Passos

- [Guia de Configuração](./CONFIGURATION.md)
- [Sistema de Extração](./EXTRACTION.md)
- [Referência Completa da API](./API_REFERENCE.md)
