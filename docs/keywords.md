# 🔍 KeywordExtractor

Extrai as **palavras-chave mais relevantes** de um texto em português. Tokeniza, normaliza gírias, reduz ao radical (stemming), remove stopwords e ranqueia por frequência com reforço para o início do texto.

```typescript
import { KeywordExtractor } from "circle-text-library/keywords"
```

---

## API

```typescript
// Estático (atalho)
KeywordExtractor.extract(text, config?): string[]

// Instância
const ke = new KeywordExtractor(config?)
ke.extract(text): string[]
ke.withConfig(patch): KeywordExtractor   // imutável
ke.config                                // readonly
```

---

## Configuração

```typescript
interface KeywordExtractorConfig {
    minWordLength?: number        // default 3 — descarta tokens menores
    maxKeywords?: number          // default 5 — teto de resultados
    stopwords?: string[]          // default: stopwords pt-BR embutidas (substitui a lista toda)
    boostFirstSentences?: boolean // default true — palavras nos primeiros 20% pesam 1.5×
}
```

---

## Pipeline (em ordem)

1. **Tokenizar** — minúsculas, remove pontuação, **remove acentos** (NFD), separa por espaço.
2. **Normalizar gírias** — `vc → você`, `mt → muito`, `pq → porque`… (de `slangMap.json`).
3. **Lematizar** — remove plural simples (`-s`) e sufixos comuns (`-ção`, `-mente`, `-ador`…) reduzindo ao **radical**.
4. **Pontuar** — `score = 1 + log(freq)`, com 1.5× para tokens no início (se `boostFirstSentences`).
5. **Ordenar e cortar** — por score decrescente, top `maxKeywords`.

> ⚠️ A saída são **radicais sem acento**, não as palavras originais — ex.: `"inteligência"` → `"intelig"`, `"tecnologia"` → `"tecno"`. A saída é ordenada por relevância e deduplicada.

---

## Uso

```typescript
KeywordExtractor.extract("Inteligência Artificial revoluciona a programação e a tecnologia")
// ["intelig", "artifici", "revoluciona", "programacao", "tecno"]
// (artigos/conectivos "a", "e" caem como stopwords; palavras viram radicais)
```

### Gírias normalizadas

```typescript
KeywordExtractor.extract("vc viu q o projeto tá mt bom?", { maxKeywords: 4 })
// ["projeto", "bom"]
// ("vc", "q", "tá", "mt" são normalizados/curtos/stopwords e saem do ranking)
```

### Config mais restrita

```typescript
new KeywordExtractor({ maxKeywords: 3, minWordLength: 5 })
    .extract("dados, análise, machine learning e automação inteligente")
// ["analise", "machine", "learning"]
```

### Stopwords custom

```typescript
// Substitui a lista padrão inteira pela sua
new KeywordExtractor({ stopwords: ["projeto", "produto"] })
    .extract("o projeto e o produto da equipe")
```

### Derivação imutável

```typescript
const base = new KeywordExtractor({ maxKeywords: 5 })
const strict = base.withConfig({ minWordLength: 5, maxKeywords: 3 })
// `base` permanece intacto
```

---

## Casos de uso

### Tags automáticas para um post

```typescript
function autoTags(post: string): string[] {
    return KeywordExtractor.extract(post, { maxKeywords: 5, minWordLength: 4 })
}
```

### Indexação para busca interna

```typescript
const ke = new KeywordExtractor({ maxKeywords: 10 })
const index = documents.map((doc) => ({ id: doc.id, terms: ke.extract(doc.body) }))
```

> Como os termos são **radicais sem acento**, a busca casa variações (singular/plural, com/sem acento) ao indexar a consulta com o mesmo extractor.
