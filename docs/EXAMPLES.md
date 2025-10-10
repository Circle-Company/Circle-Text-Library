# Exemplos Práticos

Este documento apresenta exemplos completos e práticos de uso da Circle Text Library em cenários reais.

## Índice

- [Setup Inicial](#setup-inicial)
- [Aplicação de Rede Social](#aplicação-de-rede-social)
- [Sistema de Comentários](#sistema-de-comentários)
- [Notificações](#notificações)
- [Moderação de Conteúdo](#moderação-de-conteúdo)
- [Sistema de Busca](#sistema-de-busca)

## Setup Inicial

### Configuração Completa

```typescript
import { TextLibrary } from "circle-text-library"

const textLib = new TextLibrary({
    validationRules: {
        username: {
            minLength: { enabled: true, value: 3, description: "Mínimo 3 caracteres" },
            maxLength: { enabled: true, value: 20, description: "Máximo 20 caracteres" },
            allowedCharacters: { 
                enabled: true, 
                value: "[a-z0-9_]", 
                description: "Apenas minúsculas, números e underscore" 
            },
            cannotStartWith: { enabled: true, value: "_" },
            allowAtPrefix: { enabled: true, value: "@" }
        },
        password: {
            minLength: { enabled: true, value: 8 },
            requireUppercase: { enabled: true, value: true },
            requireLowercase: { enabled: true, value: true },
            requireNumbers: { enabled: true, value: true },
            requireSpecialChars: { enabled: true, value: true },
            cannotBeRepeatedChars: { enabled: true, value: true },
            cannotBeSequentialChars: { enabled: true, value: true }
        },
        hashtag: {
            requiredPrefix: { enabled: true, value: "#" },
            minLength: { enabled: true, value: 3 },
            maxLength: { enabled: true, value: 50 }
        },
        url: {
            requireProtocol: { enabled: true, value: true },
            allowedProtocols: { enabled: true, value: ["http", "https"] }
        }
    },
    extractorConfig: {
        mentionPrefix: "@",
        hashtagPrefix: "#"
    },
    sentimentConfig: {
        language: "pt-BR",
        enableCache: true
    },
    conversorConfig: {
        thousandsSeparator: ".",
        defaultSliceLength: 100,
        sliceSuffix: "..."
    },
    dateFormatterConfig: {
        style: "full",
        locale: "pt",
        recentTimeThreshold: 60,
        recentTimeLabel: "agora mesmo"
    }
})
```

## Aplicação de Rede Social

### Criação de Post

```typescript
interface CreatePostDTO {
    content: string
    authorId: string
    userTimezoneOffset: number
}

function createPost(data: CreatePostDTO) {
    // 1. Extrair entidades do conteúdo
    textLib.extractor.setText(data.content)
    const entities = textLib.extractor.entities({
        mentions: true,
        hashtags: true,
        urls: true
    })
    
    // 2. Validar URLs
    const invalidUrls = (entities.urls || []).filter(url => {
        return !textLib.validator.url(url).isValid
    })
    
    if (invalidUrls.length > 0) {
        throw new Error(`URLs inválidas: ${invalidUrls.join(", ")}`)
    }
    
    // 3. Analisar sentimento
    const sentiment = textLib.sentiment.analyze(data.content)
    
    // 4. Extrair keywords
    const keywords = textLib.extractor.keywords()
    
    // 5. Converter timezone
    const timezoneCode = textLib.timezone.getCodeFromOffset(data.userTimezoneOffset)
    const timezone = new Timezone(timezoneCode)
    const now = new Date()
    const utcTime = timezone.localToUTC(now)
    
    // 6. Criar preview
    const preview = textLib.conversor.sliceWithDots({
        text: data.content,
        size: 100
    })
    
    return {
        content: data.content,
        preview,
        authorId: data.authorId,
        mentions: entities.mentions || [],
        hashtags: entities.hashtags || [],
        urls: entities.urls || [],
        keywords,
        sentiment: sentiment.sentiment,
        sentimentIntensity: sentiment.intensity,
        createdAt: utcTime,
        timezone: timezoneCode
    }
}
```

### Exibição de Post

```typescript
interface DisplayPostDTO {
    post: any
    viewerTimezoneOffset: number
    viewerLocale: "pt" | "en"
}

function displayPost(data: DisplayPostDTO) {
    // 1. Converter horário
    const timezone = new Timezone()
    const timezoneCode = timezone.getCodeFromOffset(data.viewerTimezoneOffset)
    timezone.setLocalTimezone(timezoneCode)
    const localTime = timezone.UTCToLocal(data.post.createdAt)
    
    // 2. Formatar data
    const dateFormatter = textLib.date
    dateFormatter.setLocale(data.viewerLocale)
    dateFormatter.setStyle("short")
    dateFormatter.setRecentTimeThreshold(60)
    dateFormatter.setRecentTimeLabel(
        data.viewerLocale === "en" ? "just now" : "agora mesmo"
    )
    
    const relativeTime = dateFormatter.toRelativeTime(data.post.createdAt)
    
    // 3. Formatar estatísticas
    const stats = {
        views: textLib.conversor.convertNumToShort(data.post.viewCount),
        likes: textLib.conversor.convertNumToShort(data.post.likeCount),
        comments: textLib.conversor.convertNumToShort(data.post.commentCount)
    }
    
    return {
        content: data.post.content,
        author: data.post.authorId,
        createdAt: relativeTime,
        createdAtFull: dateFormatter.toFullDateTime(localTime),
        stats,
        sentiment: data.post.sentiment
    }
}
```

## Sistema de Comentários

### Validação de Comentário

```typescript
function validateComment(comment: string) {
    const errors = []
    
    // 1. Validar comprimento
    if (comment.length < 1) {
        errors.push("Comentário não pode ser vazio")
    }
    
    if (comment.length > 500) {
        errors.push("Comentário muito longo (máximo 500 caracteres)")
    }
    
    // 2. Extrair e validar entidades
    textLib.extractor.setText(comment)
    const entities = textLib.extractor.entities({
        mentions: true,
        hashtags: true,
        urls: true
    })
    
    // 3. Validar menções
    const invalidMentions = (entities.mentions || []).filter(mention => {
        return !textLib.validator.username(mention).isValid
    })
    
    if (invalidMentions.length > 0) {
        errors.push(`Menções inválidas: ${invalidMentions.join(", ")}`)
    }
    
    // 4. Analisar sentimento
    const sentiment = textLib.sentiment.analyze(comment)
    
    if (sentiment.sentiment === "negative" && sentiment.intensity > 0.8) {
        errors.push("Conteúdo potencialmente ofensivo")
    }
    
    return {
        isValid: errors.length === 0,
        errors,
        sentiment,
        entities
    }
}
```

### Criação de Comentário

```typescript
function createComment(data) {
    // 1. Validar
    const validation = validateComment(data.content)
    
    if (!validation.isValid) {
        throw new Error(validation.errors.join(", "))
    }
    
    // 2. Criar notificações para menções
    const notifications = validation.entities.mentions?.map(mention => ({
        type: "mention",
        userId: mention.replace("@", ""),
        commentId: data.commentId,
        postId: data.postId
    }))
    
    // 3. Extrair keywords
    const keywords = textLib.extractor.keywords()
    
    return {
        content: data.content,
        sentiment: validation.sentiment,
        keywords,
        notifications: notifications || [],
        createdAt: new Date()
    }
}
```

## Notificações

### Sistema de Notificações

```typescript
function createNotification(type, data, recipientLocale = "pt") {
    const formatter = textLib.date
    formatter.setLocale(recipientLocale)
    formatter.setStyle("full")
    formatter.setCapitalize(true)
    formatter.setRecentTimeThreshold(300)
    formatter.setRecentTimeLabel(
        recipientLocale === "en" ? "Just now" : "Agora mesmo"
    )
    
    const time = formatter.toRelativeTime(data.createdAt)
    
    const messages = {
        mention: {
            pt: `${data.authorName} mencionou você em um post`,
            en: `${data.authorName} mentioned you in a post`
        },
        like: {
            pt: `${data.authorName} curtiu seu post`,
            en: `${data.authorName} liked your post`
        },
        comment: {
            pt: `${data.authorName} comentou em seu post`,
            en: `${data.authorName} commented on your post`
        }
    }
    
    return {
        message: messages[type][recipientLocale],
        time,
        preview: textLib.conversor.sliceWithDots({
            text: data.content,
            size: 50
        })
    }
}
```

## Moderação de Conteúdo

### Sistema de Moderação Automática

```typescript
interface ModerationResult {
    approved: boolean
    reasons: string[]
    sentiment: any
    flagged: string[]
}

function moderateContent(content: string): ModerationResult {
    const reasons = []
    const flagged = []
    
    // 1. Análise de sentimento
    const sentiment = textLib.sentiment.analyze(content)
    
    if (sentiment.sentiment === "negative" && sentiment.intensity > 0.85) {
        reasons.push("Sentimento muito negativo")
        flagged.push("high_negativity")
    }
    
    // 2. Extrair entidades
    textLib.extractor.setText(content)
    const entities = textLib.extractor.entities({
        mentions: true,
        hashtags: true,
        urls: true
    })
    
    // 3. Validar URLs
    const invalidUrls = (entities.urls || []).filter(url => {
        return !textLib.validator.url(url).isValid
    })
    
    if (invalidUrls.length > 0) {
        reasons.push("URLs inválidas ou suspeitas")
        flagged.push("invalid_urls")
    }
    
    // 4. Limite de menções
    if ((entities.mentions || []).length > 5) {
        reasons.push("Muitas menções (possível spam)")
        flagged.push("spam_mentions")
    }
    
    // 5. Limite de hashtags
    if ((entities.hashtags || []).length > 10) {
        reasons.push("Muitas hashtags (possível spam)")
        flagged.push("spam_hashtags")
    }
    
    return {
        approved: reasons.length === 0,
        reasons,
        sentiment,
        flagged
    }
}
```

## Sistema de Busca

### Busca por Keywords

```typescript
function searchPosts(query: string, posts: any[]) {
    // 1. Extrair keywords da query
    textLib.extractor.setText(query)
    const queryKeywords = textLib.extractor.keywords()
    
    // 2. Calcular relevância de cada post
    const results = posts.map(post => {
        textLib.extractor.setText(post.content)
        const postKeywords = textLib.extractor.keywords()
        
        // Matches exatos
        const exactMatches = postKeywords.filter(kw => 
            queryKeywords.includes(kw)
        )
        
        // Calcular score
        const score = exactMatches.length / queryKeywords.length
        
        return {
            post,
            score,
            matchedKeywords: exactMatches
        }
    })
    
    // 3. Filtrar e ordenar
    return results
        .filter(r => r.score > 0)
        .sort((a, b) => b.score - a.score)
        .map(r => ({
            ...r.post,
            relevance: r.score,
            matches: r.matchedKeywords
        }))
}
```

### Busca por Hashtag

```typescript
function searchByHashtag(hashtag: string, posts: any[]) {
    // Validar hashtag
    const validation = textLib.validator.hashtag(hashtag)
    
    if (!validation.isValid) {
        throw new Error(`Hashtag inválida: ${validation.errors.join(", ")}`)
    }
    
    // Buscar posts
    return posts.filter(post => {
        textLib.extractor.setText(post.content)
        const entities = textLib.extractor.entities({ hashtags: true })
        return entities.hashtags?.includes(hashtag) || false
    })
}
```

## Workflow Completo

### Publicação de Post

```typescript
async function publishPost(data) {
    // 1. Validar conteúdo
    if (data.content.length > 5000) {
        throw new Error("Post muito longo")
    }
    
    // 2. Extrair e validar entidades
    textLib.extractor.setText(data.content)
    const entities = textLib.extractor.entities({
        mentions: true,
        hashtags: true,
        urls: true
    })
    
    // Validar URLs
    const urlValidations = (entities.urls || []).map(url => ({
        url,
        validation: textLib.validator.url(url)
    }))
    
    const hasInvalidUrls = urlValidations.some(v => !v.validation.isValid)
    if (hasInvalidUrls) {
        throw new Error("Post contém URLs inválidas")
    }
    
    // 3. Analisar sentimento
    const sentiment = textLib.sentiment.analyze(data.content)
    
    // 4. Moderar
    const moderation = moderateContent(data.content)
    if (!moderation.approved) {
        throw new Error(`Conteúdo rejeitado: ${moderation.reasons.join(", ")}`)
    }
    
    // 5. Extrair keywords
    const keywords = textLib.extractor.keywords()
    
    // 6. Formatar rich text
    const richText = textLib.rich
    const mentionMappings = await fetchUserIds(entities.mentions || [])
    const hashtagMappings = await fetchHashtagIds(entities.hashtags || [])
    
    richText.setText(data.content, {
        mentions: mentionMappings,
        hashtags: hashtagMappings
    })
    
    // 7. Salvar no banco
    const post = {
        id: generateId(),
        authorId: data.authorId,
        content: data.content,
        contentRich: richText.getEnrichedText(),
        preview: textLib.conversor.sliceWithDots({ text: data.content, size: 150 }),
        sentiment: sentiment.sentiment,
        sentimentIntensity: sentiment.intensity,
        keywords,
        mentions: entities.mentions || [],
        hashtags: entities.hashtags || [],
        urls: entities.urls || [],
        createdAt: new Date(),
        stats: {
            viewCount: 0,
            likeCount: 0,
            commentCount: 0,
            shareCount: 0
        }
    }
    
    // 8. Criar notificações para menções
    const notifications = (entities.mentions || []).map(mention => ({
        type: "mention",
        recipientId: mentionMappings[mention.replace("@", "")],
        postId: post.id,
        authorId: data.authorId
    }))
    
    return { post, notifications }
}
```

### Exibição de Feed

```typescript
function buildFeed(posts, userId, userTimezoneOffset, userLocale) {
    const timezone = new Timezone()
    const timezoneCode = timezone.getCodeFromOffset(userTimezoneOffset)
    timezone.setLocalTimezone(timezoneCode)
    
    const dateFormatter = textLib.date
    dateFormatter.setLocale(userLocale)
    dateFormatter.setStyle("short")
    dateFormatter.setRecentTimeThreshold(60)
    dateFormatter.setRecentTimeLabel(userLocale === "en" ? "now" : "agora")
    
    return posts.map(post => {
        const localTime = timezone.UTCToLocal(post.createdAt)
        
        return {
            id: post.id,
            author: post.authorId,
            content: post.content,
            preview: post.preview,
            sentiment: post.sentiment,
            stats: {
                views: textLib.conversor.convertNumToShort(post.stats.viewCount),
                likes: textLib.conversor.convertNumToShort(post.stats.likeCount),
                comments: textLib.conversor.convertNumToShort(post.stats.commentCount)
            },
            timeAgo: dateFormatter.toRelativeTime(post.createdAt),
            timestamp: localTime.toISOString()
        }
    })
}
```

## Dashboard de Análise

### Análise de Engajamento

```typescript
function analyzeEngagement(posts, timeRange) {
    const recentPosts = posts.filter(post => 
        post.createdAt > Date.now() - timeRange
    )
    
    // Análise de sentimento agregada
    const sentiments = recentPosts.map(post => 
        textLib.sentiment.analyze(post.content)
    )
    
    const positiveCount = sentiments.filter(s => s.sentiment === "positive").length
    const negativeCount = sentiments.filter(s => s.sentiment === "negative").length
    const neutralCount = sentiments.filter(s => s.sentiment === "neutral").length
    
    // Keywords mais comuns
    const allKeywords = recentPosts.flatMap(post => {
        textLib.extractor.setText(post.content)
        return textLib.extractor.keywords()
    })
    
    const keywordFreq = allKeywords.reduce((acc, kw) => {
        acc[kw] = (acc[kw] || 0) + 1
        return acc
    }, {})
    
    const topKeywords = Object.entries(keywordFreq)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
    
    // Hashtags trending
    const allHashtags = recentPosts.flatMap(post => post.hashtags)
    const hashtagFreq = allHashtags.reduce((acc, tag) => {
        acc[tag] = (acc[tag] || 0) + 1
        return acc
    }, {})
    
    const trending = Object.entries(hashtagFreq)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
    
    // Estatísticas agregadas
    const totalViews = recentPosts.reduce((sum, p) => sum + p.stats.viewCount, 0)
    const totalLikes = recentPosts.reduce((sum, p) => sum + p.stats.likeCount, 0)
    const avgEngagement = totalLikes / totalViews
    
    return {
        period: {
            start: new Date(Date.now() - timeRange),
            end: new Date()
        },
        posts: {
            total: recentPosts.length,
            positive: positiveCount,
            negative: negativeCount,
            neutral: neutralCount
        },
        sentiment: {
            positiveRate: positiveCount / recentPosts.length,
            negativeRate: negativeCount / recentPosts.length,
            neutralRate: neutralCount / recentPosts.length,
            avgIntensity: sentiments.reduce((sum, s) => sum + s.intensity, 0) / sentiments.length
        },
        topKeywords: topKeywords.map(([kw, count]) => ({ keyword: kw, count })),
        trending: trending.map(([tag, count]) => ({ hashtag: tag, count })),
        engagement: {
            totalViews: textLib.conversor.convertNumToShort(totalViews),
            totalLikes: textLib.conversor.convertNumToShort(totalLikes),
            avgRate: (avgEngagement * 100).toFixed(2) + "%"
        }
    }
}
```

## Sistema de Registro

### Validação de Registro Completo

```typescript
interface RegistrationData {
    username: string
    password: string
    name: string
    email: string
    timezone: number
}

function validateRegistration(data: RegistrationData) {
    const errors = {}
    
    // Validar username
    const usernameValidation = textLib.validator.username(data.username)
    if (!usernameValidation.isValid) {
        errors.username = usernameValidation.errors
    }
    
    // Validar password
    const passwordValidation = textLib.validator.password(data.password)
    if (!passwordValidation.isValid) {
        errors.password = passwordValidation.errors
    }
    
    // Validar nome
    const nameValidation = textLib.validator.name(data.name)
    if (!nameValidation.isValid) {
        errors.name = nameValidation.errors
    }
    
    // Validar timezone
    const timezoneCode = textLib.timezone.getCodeFromOffset(data.timezone)
    if (!timezoneCode) {
        errors.timezone = ["Timezone inválido"]
    }
    
    return {
        isValid: Object.keys(errors).length === 0,
        errors
    }
}

function registerUser(data: RegistrationData) {
    // Validar
    const validation = validateRegistration(data)
    
    if (!validation.isValid) {
        throw new Error("Dados de registro inválidos")
    }
    
    // Obter timezone code
    const timezoneCode = textLib.timezone.getCodeFromOffset(data.timezone)
    
    // Criar usuário
    return {
        username: data.username.toLowerCase().replace("@", ""),
        name: textLib.conversor.capitalizeFirstLetter(data.name),
        passwordHash: hashPassword(data.password),
        timezone: timezoneCode,
        timezoneOffset: data.timezone,
        createdAt: new Date()
    }
}
```

## Próximos Passos

- [Guia de Configuração](./CONFIGURATION.md)
- [Sistema de Validação](./VALIDATION.md)
- [Análise de Sentimento](./SENTIMENT.md)
- [Referência Completa da API](./API_REFERENCE.md)

