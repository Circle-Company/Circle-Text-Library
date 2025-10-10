# Sistema de Extração

O módulo de extração identifica e extrai entidades de texto como menções, hashtags, URLs e keywords.

## Índice

- [Configuração](#configuração)
- [Extração de Entidades](#extração-de-entidades)
- [Extração de Keywords](#extração-de-keywords)
- [Métodos Avançados](#métodos-avançados)

## Configuração

```typescript
const textLib = new TextLibrary({
    validationRules: {
        /* ... */
    },
    extractorConfig: {
        mentionPrefix: "@", // Prefixo de menções (padrão: '@')
        hashtagPrefix: "#" // Prefixo de hashtags (padrão: '#')
    }
})
```

## Extração de Entidades

### Método: entities()

Extrai menções, hashtags e URLs de um texto.

```typescript
const text = "Olá @user visite https://example.com e confira #tech #coding"

textLib.extractor.setText(text)

// Extrair todas as entidades
const all = textLib.extractor.entities({
    mentions: true,
    hashtags: true,
    urls: true
})

// Resultado:
// {
//   mentions: ["@user"],
//   hashtags: ["#tech", "#coding"],
//   urls: ["https://example.com"]
// }
```

### Extração Seletiva

Extraia apenas os tipos necessários:

```typescript
// Apenas menções
const mentions = textLib.extractor.entities({ mentions: true })
// { mentions: ["@user"] }

// Apenas hashtags
const hashtags = textLib.extractor.entities({ hashtags: true })
// { hashtags: ["#tech", "#coding"] }

// Apenas URLs
const urls = textLib.extractor.entities({ urls: true })
// { urls: ["https://example.com"] }

// Combinações
const mentionsAndHashtags = textLib.extractor.entities({
    mentions: true,
    hashtags: true
})
// { mentions: ["@user"], hashtags: ["#tech", "#coding"] }
```

### Padrões Suportados

#### Menções

```typescript
// Formato: @username
// Válido: @user, @john_doe, @user123
// Inválido: @ (vazio), @123 (só números no início)

const text = "Olá @alice e @bob_smith veja @user123"
textLib.extractor.setText(text)
const result = textLib.extractor.entities({ mentions: true })
// { mentions: ["@alice", "@bob_smith", "@user123"] }
```

#### Hashtags

```typescript
// Formato: #tag
// Válido: #tech, #technology, #tech2024
// Inválido: # (vazio), #123 (só números)

const text = "Confira #technology e #coding #webdev"
textLib.extractor.setText(text)
const result = textLib.extractor.entities({ hashtags: true })
// { hashtags: ["#technology", "#coding", "#webdev"] }
```

#### URLs

```typescript
// Formatos: http://, https://
// Válido: https://example.com, http://test.com/path
// Inválido: www.example.com (sem protocolo), example.com

const text = "Visite https://example.com e http://test.com/page"
textLib.extractor.setText(text)
const result = textLib.extractor.entities({ urls: true })
// { urls: ["https://example.com", "http://test.com/page"] }
```

## Extração de Keywords

### Método: keywords()

Extrai palavras-chave relevantes do texto, removendo stopwords e aplicando stemming.

```typescript
const text = "A inteligência artificial está revolucionando a programação moderna"

textLib.extractor.setText(text)
const keywords = textLib.extractor.keywords()

// Resultado:
// ["inteligência", "artificial", "revolucionando", "programação", "moderna"]
```

### Características

- Remove stopwords (artigos, preposições, etc.)
- Aplica stemming para reduzir palavras ao radical
- Ordena por frequência e relevância
- Suporte completo ao português brasileiro

### Stopwords Removidas

Exemplos de stopwords automaticamente removidas:

```
a, o, de, da, do, e, é, em, para, com, por, que, os, as, dos, das, um, uma,
se, no, na, ao, aos, à, às, pelo, pela, pelos, pelas, etc.
```

### Stemming

Redução de palavras ao radical:

```
programação → program
desenvolvedor → desenvolv
tecnológico → tecnolog
```

## Métodos Avançados

### setText()

Define o texto a ser analisado:

```typescript
textLib.extractor.setText("Novo texto para análise")
```

### Extração em Batch

Processe múltiplos textos:

```typescript
const texts = [
    "Post 1 com @user1 e #tech",
    "Post 2 com @user2 e https://example.com",
    "Post 3 com #coding e #webdev"
]

const results = texts.map((text) => {
    textLib.extractor.setText(text)
    return {
        text,
        entities: textLib.extractor.entities({
            mentions: true,
            hashtags: true,
            urls: true
        }),
        keywords: textLib.extractor.keywords()
    }
})
```

## Exemplos Práticos

### Análise de Post de Rede Social

```typescript
function analyzePost(postText) {
    textLib.extractor.setText(postText)

    const entities = textLib.extractor.entities({
        mentions: true,
        hashtags: true,
        urls: true
    })

    const keywords = textLib.extractor.keywords()

    return {
        mentions: entities.mentions || [],
        hashtags: entities.hashtags || [],
        urls: entities.urls || [],
        keywords,
        mentionCount: (entities.mentions || []).length,
        hashtagCount: (entities.hashtags || []).length,
        urlCount: (entities.urls || []).length,
        keywordCount: keywords.length
    }
}

const post =
    "Olá @alice confira #technology em https://example.com sobre programação e desenvolvimento"
const analysis = analyzePost(post)

console.log(analysis)
// {
//   mentions: ["@alice"],
//   hashtags: ["#technology"],
//   urls: ["https://example.com"],
//   keywords: ["programação", "desenvolvimento"],
//   mentionCount: 1,
//   hashtagCount: 1,
//   urlCount: 1,
//   keywordCount: 2
// }
```

### Validação de Conteúdo

```typescript
function validateContent(text) {
    textLib.extractor.setText(text)

    const entities = textLib.extractor.entities({
        mentions: true,
        hashtags: true,
        urls: true
    })

    // Validar entidades extraídas
    const invalidMentions = (entities.mentions || []).filter((mention) => {
        return !textLib.validator.username(mention).isValid
    })

    const invalidHashtags = (entities.hashtags || []).filter((hashtag) => {
        return !textLib.validator.hashtag(hashtag).isValid
    })

    const invalidUrls = (entities.urls || []).filter((url) => {
        return !textLib.validator.url(url).isValid
    })

    return {
        isValid:
            invalidMentions.length === 0 &&
            invalidHashtags.length === 0 &&
            invalidUrls.length === 0,
        invalidMentions,
        invalidHashtags,
        invalidUrls
    }
}
```

### Sistema de Busca por Keywords

```typescript
function searchByKeywords(query, posts) {
    textLib.extractor.setText(query)
    const queryKeywords = textLib.extractor.keywords()

    return posts
        .map((post) => {
            textLib.extractor.setText(post.content)
            const postKeywords = textLib.extractor.keywords()

            // Calcular relevância
            const matches = postKeywords.filter((keyword) => queryKeywords.includes(keyword))

            return {
                post,
                relevance: matches.length,
                matchedKeywords: matches
            }
        })
        .filter((result) => result.relevance > 0)
        .sort((a, b) => b.relevance - a.relevance)
}

const query = "inteligência artificial programação"
const posts = [
    { id: 1, content: "A inteligência artificial revoluciona a programação" },
    { id: 2, content: "Desenvolvimento web moderno" },
    { id: 3, content: "Programação com IA e machine learning" }
]

const results = searchByKeywords(query, posts)
// Retorna posts ordenados por relevância
```

### Extração de Trending Topics

```typescript
function extractTrendingHashtags(posts) {
    const hashtagCount = new Map()

    posts.forEach((post) => {
        textLib.extractor.setText(post.content)
        const entities = textLib.extractor.entities({ hashtags: true })

        entities.hashtags?.forEach((hashtag) => {
            const count = hashtagCount.get(hashtag) || 0
            hashtagCount.set(hashtag, count + 1)
        })
    })

    return Array.from(hashtagCount.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([hashtag, count]) => ({ hashtag, count }))
}
```

## Performance

- Extração otimizada com regex compilados
- Processamento em O(n) onde n é o tamanho do texto
- Cache de stopwords para melhor performance
- Suporte a textos grandes (>10000 caracteres)

## Próximos Passos

- [Guia de Configuração](./CONFIGURATION.md)
- [Sistema de Validação](./VALIDATION.md)
- [Análise de Sentimento](./SENTIMENT.md)
- [Referência Completa da API](./API_REFERENCE.md)
