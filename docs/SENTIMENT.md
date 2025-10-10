# Análise de Sentimento

O módulo de análise de sentimento fornece classificação contextual de textos em português e inglês, com suporte a emojis, ironia e contexto linguístico.

## Índice

- [Configuração](#configuração)
- [Análise Básica](#análise-básica)
- [Características Avançadas](#características-avançadas)
- [Retorno da Análise](#retorno-da-análise)
- [Performance e Cache](#performance-e-cache)
- [Casos de Uso](#casos-de-uso)

## Configuração

### Inicialização

```typescript
import { TextLibrary } from "circle-text-library"

const textLib = new TextLibrary({
    validationRules: { /* ... */ },
    sentimentConfig: {
        language: "pt-BR",  // Idioma da análise
        enableCache: true   // Cache de resultados
    }
})
```

### Configuração Padrão

Se não especificada, a configuração padrão é:

```typescript
{
    language: "pt-BR",
    enableCache: true
}
```

## Análise Básica

### Método: analyze()

```typescript
const text = "Estou muito feliz com os resultados!"
const result = textLib.sentiment.analyze(text)

console.log(result)
// {
//   sentiment: "positive",
//   intensity: 0.85
// }
```

### Classificações

O analisador retorna uma das três classificações:

- **positive**: Sentimento positivo
- **negative**: Sentimento negativo
- **neutral**: Sentimento neutro ou misto

### Intensidade

A intensidade varia de 0.0 a 1.0:

- **0.0 - 0.3**: Sentimento fraco
- **0.3 - 0.7**: Sentimento moderado
- **0.7 - 1.0**: Sentimento forte

## Características Avançadas

### 1. Análise Contextual

O analisador considera o contexto das palavras:

```typescript
// Palavra positiva em contexto negativo
textLib.sentiment.analyze("Não estou feliz")
// { sentiment: "negative", intensity: 0.6 }

// Negação dupla
textLib.sentiment.analyze("Não posso dizer que não gostei")
// { sentiment: "positive", intensity: 0.5 }
```

### 2. Suporte a Emojis

Emojis são considerados na análise:

```typescript
textLib.sentiment.analyze("Ótimo trabalho! 🎉")
// { sentiment: "positive", intensity: 0.9 }

textLib.sentiment.analyze("Péssimo serviço 😡")
// { sentiment: "negative", intensity: 0.8 }

textLib.sentiment.analyze("Tudo bem 😊")
// { sentiment: "positive", intensity: 0.7 }
```

### 3. Intensificadores

Palavras que intensificam o sentimento:

```typescript
textLib.sentiment.analyze("Muito bom")
// Intensidade maior que apenas "bom"

textLib.sentiment.analyze("Extremamente satisfeito")
// Intensidade muito alta
```

### 4. Pontuação

A pontuação afeta a intensidade:

```typescript
textLib.sentiment.analyze("Legal!!!")
// Intensidade maior devido às exclamações

textLib.sentiment.analyze("Legal.")
// Intensidade normal
```

### 5. Repetição de Letras

Repetições expressam ênfase:

```typescript
textLib.sentiment.analyze("Muuuuito bom!")
// Intensidade aumentada pela repetição
```

### 6. Gírias e Expressões Coloquiais

Suporte a linguagem informal do português brasileiro:

```typescript
textLib.sentiment.analyze("Que massa!")
// { sentiment: "positive", intensity: 0.7 }

textLib.sentiment.analyze("Tá tenso isso")
// { sentiment: "negative", intensity: 0.6 }
```

## Retorno da Análise

### Estrutura do Retorno

```typescript
interface SentimentReturnProps {
    sentiment: "positive" | "negative" | "neutral"
    intensity: number  // 0.0 a 1.0
}
```

### Exemplos de Retorno

```typescript
// Texto positivo
textLib.sentiment.analyze("Adorei o produto!")
// { sentiment: "positive", intensity: 0.85 }

// Texto negativo
textLib.sentiment.analyze("Péssima experiência")
// { sentiment: "negative", intensity: 0.8 }

// Texto neutro
textLib.sentiment.analyze("O produto chegou ontem")
// { sentiment: "neutral", intensity: 0.1 }

// Texto misto
textLib.sentiment.analyze("Gostei mas poderia ser melhor")
// { sentiment: "neutral", intensity: 0.4 }
```

## Performance e Cache

### Cache Automático

O módulo mantém cache de análises para melhorar performance:

```typescript
// Primeira análise: processa o texto
const result1 = textLib.sentiment.analyze("Texto de exemplo")

// Segunda análise do mesmo texto: retorna do cache
const result2 = textLib.sentiment.analyze("Texto de exemplo")

// result1 === result2 (mesmo resultado, cache usado)
```

### Desabilitar Cache

```typescript
const textLib = new TextLibrary({
    validationRules: { /* ... */ },
    sentimentConfig: {
        enableCache: false
    }
})
```

### Performance

- Análise em tempo real (< 5ms por texto curto)
- Cache inteligente para textos repetidos
- Otimizado para processamento em lote

## Casos de Uso

### 1. Moderação de Conteúdo

```typescript
function moderateComment(comment) {
    const sentiment = textLib.sentiment.analyze(comment)
    
    if (sentiment.sentiment === "negative" && sentiment.intensity > 0.7) {
        return {
            approved: false,
            reason: "Conteúdo potencialmente ofensivo"
        }
    }
    
    return { approved: true }
}
```

### 2. Análise de Feedback

```typescript
function analyzeCustomerFeedback(feedbacks) {
    const results = feedbacks.map(feedback => ({
        text: feedback,
        sentiment: textLib.sentiment.analyze(feedback)
    }))
    
    const positive = results.filter(r => r.sentiment.sentiment === "positive")
    const negative = results.filter(r => r.sentiment.sentiment === "negative")
    const neutral = results.filter(r => r.sentiment.sentiment === "neutral")
    
    return {
        total: feedbacks.length,
        positive: positive.length,
        negative: negative.length,
        neutral: neutral.length,
        avgIntensity: results.reduce((sum, r) => sum + r.sentiment.intensity, 0) / results.length
    }
}
```

### 3. Classificação de Posts

```typescript
function classifyPost(postText) {
    const sentiment = textLib.sentiment.analyze(postText)
    
    let category
    if (sentiment.sentiment === "positive" && sentiment.intensity > 0.6) {
        category = "inspiring"
    } else if (sentiment.sentiment === "negative" && sentiment.intensity > 0.6) {
        category = "complaint"
    } else {
        category = "informational"
    }
    
    return {
        category,
        sentiment: sentiment.sentiment,
        intensity: sentiment.intensity
    }
}
```

### 4. Análise de Tendências

```typescript
function analyzeTrends(posts, timeWindow) {
    const recentPosts = posts.filter(post => 
        post.createdAt > Date.now() - timeWindow
    )
    
    const sentiments = recentPosts.map(post => 
        textLib.sentiment.analyze(post.content)
    )
    
    const avgIntensity = sentiments.reduce((sum, s) => 
        sum + s.intensity, 0
    ) / sentiments.length
    
    const positiveRate = sentiments.filter(s => 
        s.sentiment === "positive"
    ).length / sentiments.length
    
    return {
        totalPosts: recentPosts.length,
        averageIntensity: avgIntensity,
        positiveRate: positiveRate,
        trend: positiveRate > 0.6 ? "positive" : positiveRate < 0.4 ? "negative" : "neutral"
    }
}
```

## Limitações

### Idioma

A análise de sentimento está otimizada para português brasileiro. Para outros idiomas, a precisão pode ser menor.

### Contexto Limitado

A análise é baseada em palavras e padrões. Contextos muito complexos ou sarcasmo sutil podem não ser detectados corretamente.

### Textos Muito Curtos

Textos com menos de 3 palavras podem ter análise menos precisa.

## Próximos Passos

- [Guia de Configuração](./CONFIGURATION.md)
- [Sistema de Extração](./EXTRACTION.md)
- [Referência Completa da API](./API_REFERENCE.md)

