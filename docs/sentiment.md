# 🫀 SentimentExtractor

Análise de sentimento **léxico + regras** (intensificadores, negação, conectores, emojis, pontuação, repetição, ironia). **Sem LLM** — rápido, determinístico e explicável. Suporta **português (pt-BR, padrão)** e **inglês (en)**.

```typescript
import { SentimentExtractor } from "circle-text-library/sentiment"
```

---

## API

```typescript
// Atalhos estáticos (instância default, pt-BR)
SentimentExtractor.analyze(text, opts?)          // → SentimentReturnProps
SentimentExtractor.analyzeMany(texts, opts?)     // → SentimentReturnProps[]

// Instância (config própria)
const sa = new SentimentExtractor(config?)
sa.analyze(text, { explain?: boolean })
sa.analyzeMany(texts, opts?)
sa.withConfig(patch)                              // → nova instância (imutável)
sa.clearCache()
sa.language                                       // "pt-br" | "en"
```

Resultado:

```typescript
interface SentimentReturnProps {
    sentiment: "positive" | "negative" | "neutral"
    intensity: number        // ~ -0.9..0.9 (sinal acompanha o sentimento)
    drivers?: SentimentDriver[]   // só com { explain: true }
}
```

---

## Uso básico (pt-BR)

```typescript
SentimentExtractor.analyze("Estou muito satisfeito com os resultados!")
// { sentiment: "positive", intensity: 0.652 }

SentimentExtractor.analyze("Produto péssimo, chegou quebrado")
// { sentiment: "negative", intensity: -0.385 }

SentimentExtractor.analyzeMany(["amei", "odiei", "tanto faz"])
// [ {…positive}, {…negative}, {…neutral} ]
```

---

## Inglês (`language: "en"`)

```typescript
const en = new SentimentExtractor({ language: "en" })

en.analyze("This product is absolutely amazing!")
// { sentiment: "positive", intensity: 0.677 }

en.analyze("not good at all")
// { sentiment: "negative", intensity: -0.7 }

en.analyze("I don't like it")   // contrações tratadas: don't → dont (negação)
// { sentiment: "negative", intensity: -0.65 }
```

Os léxicos por idioma vivem em `src/data/pt-br/` e `src/data/en/`. Os léxicos são **isolados por instância** — uma palavra só de inglês é neutra no pt-BR e vice-versa. Emojis são universais (compartilhados entre idiomas).

Via facade:

```typescript
import { TextLibrary } from "circle-text-library"
const ct = new TextLibrary({ sentiment: { language: "en" } })
ct.sentiment.analyze("excellent service")   // positive
```

---

## Explicabilidade (`explain: true`)

Retorna os `drivers` — quais palavras dirigiram o score e por quê:

```typescript
new SentimentExtractor().analyze("não é ruim", { explain: true })
// {
//   sentiment: "positive",
//   intensity: 0.8,
//   drivers: [ { word: "ruim", base: -0.8, applied: 0.8, reason: "negado" } ]
// }
```

Repare na **negação**: `ruim` (base `-0.8`) é invertido pela negação anterior → `+0.8`.

---

## Configuração

```typescript
interface SentimentExtractorConfig {
    language?: "pt-br" | "en"        // default "pt-br"

    enableCache?: boolean            // default true (cache LRU)
    enableEmojiAnalysis?: boolean    // default true
    enablePunctuationAnalysis?: boolean   // default true
    enableRepetitionAnalysis?: boolean    // default true
    enableContextAnalysis?: boolean       // default true
    enableIronyDetection?: boolean        // default true

    lexicon?: Record<string, number>      // palavra → polaridade (-1..1)
    intensifiers?: Record<string, number> // palavra → multiplicador
    negators?: string[]                   // entram no escopo de negação
    ironyMarkers?: string[]               // marcadores de ironia extras
    cacheMax?: number                     // teto do cache LRU (default 500)
}
```

Todo léxico custom **mescla sobre a base do idioma** (por instância — não vaza para os mapas compartilhados).

### Gírias do app via `lexicon`

```typescript
const sa = new SentimentExtractor({ lexicon: { top: 0.6, cringe: -0.4, mid: -0.2 } })
sa.analyze("isso é top demais")   // positive
```

### Análises auxiliares

| Análise | O que faz |
|---------|-----------|
| Emoji | soma a polaridade de 😍🔥👎😭… (mapa universal) |
| Pontuação | `!!!`, `???` e CAPS LOCK intensificam |
| Repetição | "bommmm", "ruimmm" intensificam a palavra-base |
| Contexto | palavras de sentimento próximas se reforçam; conectores adversativos (`mas`/`but`) redefinem o peso |
| Ironia | marcadores como `rs`, `kkk`, `/s`, `lol` **zeram** o score (texto vira neutro) |

```typescript
// Desligue o que não quiser
new SentimentExtractor({ enableIronyDetection: false, enableEmojiAnalysis: false })
```

---

## Casos de uso

### Triagem de reviews em lote

```typescript
const sa = new SentimentExtractor()
const reviews = ["Produto maravilhoso, recomendo!", "Chegou quebrado e atrasado"]
sa.analyzeMany(reviews).map((r) => r.sentiment)
// ["positive", "negative"]
```

### Moderação multilíngue

```typescript
const pt = new SentimentExtractor()
const en = new SentimentExtractor({ language: "en" })
const score = (text: string, lang: "pt-br" | "en") =>
    (lang === "en" ? en : pt).analyze(text)
```

### Dashboard com explicação

```typescript
const { sentiment, intensity, drivers } = sa.analyze(comment, { explain: true })
// mostre `drivers` para o time entender por que um comentário foi classificado
```
