# 🫀 Sentiment Extractor — Refatoração para Mais Efetivo e Fácil (proposta de redesign)

> Objetivo: deixar a análise de sentimento **mais precisa** em texto social pt-BR e **mais
> fácil de usar**, **sem LLM** — só **léxico + regras determinísticas** (estilo VADER) sobre
> **JSONs pequenos e estáticos**. Inferência rápida, explicável e tunável.

---

## 🔴 O problema atual

A classe funciona, mas mistura conceitos e tem heurísticas que atrapalham a precisão.

### a) Config morta (a API engana)

```typescript
// constructor seta estes flags... que nunca são lidos:
enableConnectorsAnalysis   // calculateSentimentScore aplica conectores SEMPRE, ignora o flag
enablePositionWeight       // não existe nenhuma implementação de "position weight"
```

### b) Ironia **zera** o sentimento (×0), em vez de modular

```typescript
detectIrony() → multiplier 0 se achar ["rs","kkk","haha","hehe",":)",";)","ironia","sarcasmo","..."]
finalScore *= ironyMultiplier   // qualquer "kkk" ou "..." anula TUDO

analyze("kkk amei demais!!")   // → neutral  ⚠️ (é claramente positivo)
analyze("isso é bom...")       // → neutral  ⚠️ (o "..." nuca o score)
```

`kkk/haha/rs` são **riso** (sinal levemente positivo), não ironia. E ironia real deveria
**amortecer/inverter**, nunca anular.

### c) Negadores e intensificadores no mesmo balaio

`intensityWords.json` junta coisas diferentes e o código só olha o sinal:

```typescript
"muito": 2.5,   "super": 2.0,    // intensificadores (multiplicam)
"não": -0.5,    "nunca": -0.8,   // negadores (o código só faz negationCount++; o -0.5/-0.8 é IGNORADO)
"hoje": 1.2,    "sempre": 1.8,   // ⚠️ tempo/frequência tratados como intensificador de sentimento
"diariamente": 1.5
```

Resultado: "não" e "nunca" agem idênticos (a magnitude se perde), e palavras de tempo
multiplicam o sentimento da próxima palavra sem sentido.

### d) Intensificadores compõem sem teto

```typescript
intensityMultiplier *= value   // "muito super extremamente bom" → 2.5×2.0×2.5 = 12,5×
```

### e) "mas" com valor mágico, sem ponderar cláusula

`connectors.json` tem `"mas": 0.05`, `"também": 2.5`. O adversativo deveria **deslocar o peso
para a cláusula depois do "mas"** ("é bom, mas péssimo" → negativo). Hoje vira só um
multiplicador minúsculo na próxima palavra.

### f) Reforço de estrutura ignora o sinal

```typescript
structureScore += Math.abs(currentScore + nextScore) * 0.1   // ⚠️ abs()
analyze("péssimo horrível")   // duas negativas adjacentes ADICIONAM score positivo
```

### g) Outros

- **Cache sem limite** (`Map` cresce indefinidamente → vazamento de memória).
- **`sentimentWords_cleaned.json` é órfão** (1016 entradas que ninguém importa).
- **Repetição** usa regex hardcoded de palavras específicas (`terrivel`, `bom`…) duplicando o léxico.
- **Emoji** cria `new RegExp(emoji, "g")` por emoji — frágil com multi-codepoint (`❤️`).
- **Contrato ambíguo:** `intensity` às vezes é assinado (negativo p/ negativo), mas o README
  promete 0..1. "Intensidade" deveria ser magnitude; o sinal já está em `sentiment`.

---

## 💡 O princípio: léxico + regras, estilo VADER (sem ML)

O **VADER** (Valence Aware Dictionary and sEntiment Reasoner) é o padrão-ouro de análise de
sentimento **rápida, determinística e sem ML**: um léxico + ~5 regras (pontuação, CAPS,
intensificadores, contraste "mas", negação). É exatamente "algoritmo rápido sobre base
pequena". A proposta é adaptar essas regras ao pt-BR, com **JSONs pequenos e separados por
papel** — fáceis de auditar e tunar.

---

## 🗂️ Bases de dados reorganizadas (pequenas, por papel)

Separar o que hoje está misturado. Cada arquivo faz **uma coisa**:

| Arquivo                | Papel                                   | Vem de                              |
| ---------------------- | --------------------------------------- | ----------------------------------- |
| `sentimentWords.json`  | palavra → polaridade (-1..1)            | mantém (descartar o `_cleaned` órfão) |
| `intensifiers.json`    | palavra → multiplicador (>1 reforça, <1 ameniza) | extraído do `intensityWords` |
| `negators.json`        | conjunto de negadores (escopo)          | extraído do `intensityWords`        |
| `connectors.json`      | só adversativos/aditivos, com semântica de cláusula | limpo                  |
| `ironyMarkers.json`    | marcadores que **amortecem/sinalizam** (não zeram) | reclassificado           |
| `emojiScore.json`      | emoji → valência                        | mantém                              |

> Tirar tempo/frequência (`hoje`, `sempre`, `diariamente`) dos intensificadores. Mover
> `kkk/haha/rs` da ironia para **riso levemente positivo**. Bases continuam pequenas e estáticas.

---

## ⚙️ O pipeline (uma passada, determinístico)

```
tokeniza (normalização compartilhada com o KeywordExtractor)
   │
   ▼  varredura única com estado:
   ├─ negador     → inverte a polaridade dos próximos N tokens de sentimento DA CLÁUSULA (escopo limitado)
   ├─ intensifier → multiplica o PRÓXIMO token de sentimento, com TETO (clamp 0.5..2.0; não compõe sem limite)
   ├─ adversativa "mas"/"porém" → reduz peso da cláusula anterior (×0.5) e aumenta a posterior (×1.5)
   └─ palavra de sentimento → acumula (base × intensifier × negação × peso de cláusula)
   │
   ▼  sinais de ênfase (baratos, estilo VADER):
   ├─ "!" repetidos  → reforça a magnitude no sinal vigente (com teto)
   ├─ CAPS LOCK      → amplifica palavra de sentimento em maiúsculas
   ├─ alongamento    → "boaaa"/"pessimooo" amplifica a polaridade DAQUELA palavra (genérico, sem regex hardcoded)
   └─ emoji          → soma valência via Intl.Segmenter (grapheme) + emojiScore
   │
   ▼  ironia → AMORTECE (×0.5) / sinaliza; nunca zera
   │
   ▼  normaliza:  compound = soma / √(soma² + α)     (α≈15)  → (-1, 1) suave e monotônico
   │
   ▼  rótulo:  compound > +t → positive | < -t → negative | senão neutral   (t default 0.05)
```

A normalização VADER (`x/√(x²+α)`) substitui o `normalizeIntensity` em pedaços por uma curva
suave, limitada e monotônica.

---

## ✅ A API (mais fácil de usar)

### Estático — sem `new`

```typescript
import { SentimentExtractor } from "circle-text-library/sentiment"

SentimentExtractor.analyze("amei demais!! 😍")
// ✅ { score: 0.82, label: "positive", intensity: 0.82, sentiment: "positive" }
```

### Léxico custom mesclado (slang do app — sem editar o pacote)

```typescript
const sa = new SentimentExtractor({
    lexicon: { cringe: -0.4, based: 0.5, "top": 0.6 },   // mescla SOBRE a base
    intensifiers: { "pra caramba": 1.8 },
    negators: ["nem"]
})
sa.analyze("isso é top pra caramba")   // ✅ positivo forte
```

### Lote e explicabilidade

```typescript
sa.analyzeMany(["amei", "odiei", "tanto faz"])
// ✅ [ {label:"positive",..}, {label:"negative",..}, {label:"neutral",..} ]

sa.analyze("não é ruim", { explain: true })
// ✅ { score: 0.37, label: "positive",
//      drivers: [{ word: "ruim", base: -0.5, applied: +0.37, reason: "negado por 'não'" }] }
```

### Config enxuta (sem flags mortos)

```typescript
interface SentimentConfig {
    lexicon?: Record<string, number>        // merges sobre a base (define 1×, estende pontual)
    intensifiers?: Record<string, number>
    negators?: string[]
    rules?: { emoji?: boolean; emphasis?: boolean; negation?: boolean; contrast?: boolean; irony?: boolean }
    threshold?: number                      // default 0.05
    cache?: { max?: number } | false        // LRU com teto (default 500); false desliga
}
```

> **Back-compat:** `analyze` continua devolvendo `intensity` e `sentiment` (= `score` e `label`),
> então os testes atuais seguem passando. `score`/`label`/`drivers` são adições.

---

## 🎯 Ganhos de efetividade (antes → depois)

| Texto                              | Hoje                      | Depois                          |
| ---------------------------------- | ------------------------- | ------------------------------- |
| `kkk amei demais!!`                | neutral (ironia zera)     | **positivo forte** (riso + ênfase) |
| `isso é bom...`                    | neutral (`...` zera)      | **positivo** levemente amortecido |
| `não é ruim`                       | depende (1 flip)          | **positivo** (litotes via escopo) |
| `o filme é bom, mas a comida é péssima` | mistura confusa      | **negativo** (peso na 2ª cláusula) |
| `MUITO BOM!!!`                     | só o léxico               | **positivo amplificado** (CAPS+!) |
| `boaaa demais` / `pessimooo`       | regex hardcoded           | amplifica a palavra alongada (genérico) |
| `péssimo horrível`                 | `abs()` adiciona positivo | **negativo reforçado** (sinal preservado) |
| `hoje comprei pão`                 | "hoje" multiplica algo    | **neutral** (tempo fora dos intensifiers) |

---

## 🛠️ Esboço de implementação

```typescript
const ALPHA = 15
const normalize = (sum: number) => sum / Math.sqrt(sum * sum + ALPHA)   // (-1,1)

// léxicos como Map no nível do módulo (1× por processo, não por chamada)
const LEX = new Map<string, number>(Object.entries(sentimentWords))
const INT = new Map<string, number>(Object.entries(intensifiers))
const NEG = new Set<string>(negators)

function score(tokens: string[]): { sum: number; drivers: Driver[] } {
    let sum = 0, pending = 1, negate = 0, clauseWeight = 1
    const drivers: Driver[] = []

    tokens.forEach((tok, i) => {
        if (NEG.has(tok)) { negate = 3; return }                    // escopo: próximos 3 tokens
        const mult = INT.get(tok)
        if (mult !== undefined) { pending *= clamp(mult, 0.5, 2.0); return }  // teto, não explode
        if (tok === "mas" || tok === "porem") { sum *= 0.5; clauseWeight = 1.5; return } // contraste
        const base = LEX.get(tok)
        if (base === undefined) return

        let v = base * pending * clauseWeight
        if (negate > 0) { v *= -0.74; negate-- }                    // inverte + amortece (VADER)
        sum += v
        drivers.push({ word: tok, base, applied: v, reason: negate >= 0 ? "negado" : undefined })
        pending = 1                                                  // reset do intensifier
    })
    return { sum, drivers }
}

function analyze(text: string, opts?: { explain?: boolean }) {
    if (!text) return { score: 0, label: "neutral", intensity: 0, sentiment: "neutral" }
    const tokens = tokenize(text)                                   // normalização compartilhada
    let { sum, drivers } = score(tokens)
    sum += emphasis(text) + emoji(text)                             // CAPS, "!", alongamento, emoji
    if (hasIrony(text)) sum *= 0.5                                  // amortece, não zera
    const compound = normalize(sum)
    const label = compound > THRESHOLD ? "positive" : compound < -THRESHOLD ? "negative" : "neutral"
    return { score: compound, label, intensity: compound, sentiment: label, ...(opts?.explain && { drivers }) }
}
```

- **Emoji** via `Intl.Segmenter("pt", { granularity: "grapheme" })` → lookup no `emojiScore`
  (resolve o `❤️` multi-codepoint, sem `new RegExp` por emoji).
- **Cache** LRU com teto (Map + descarte do mais antigo ao passar de `max`) — sem vazamento.
- **`analyzeMany`** = `map(analyze)` reutilizando os Maps já montados.

---

## 🔁 Migração (de → para)

| Hoje                                            | Proposta                                  | Compat?            |
| ----------------------------------------------- | ----------------------------------------- | ------------------ |
| `{ intensity, sentiment }`                      | `{ score, label, intensity, sentiment, drivers? }` | `intensity`/`sentiment` mantidos |
| `enableConnectorsAnalysis`, `enablePositionWeight` | removidos (eram mortos)                | —                  |
| `enableEmoji/Punctuation/Repetition/Irony/Context` | `rules: { emoji, emphasis, negation, contrast, irony }` | mapeável |
| negadores em `intensityWords.json`              | `negators.json`                           | dado movido        |
| ironia zera (×0)                                | ironia amortece (×0.5) + reclassifica riso | comportamento melhora |
| `new SentimentExtractor().analyze(t)`           | `SentimentExtractor.analyze(t)` (estático) | instância ainda funciona |

---

## 📊 Antes vs. Depois

| Critério                       | Antes                                   | Depois                                  |
| ------------------------------ | --------------------------------------- | --------------------------------------- |
| Motor                          | léxico + heurísticas ad-hoc             | léxico + regras estilo VADER            |
| Inferência                     | rápida, mas com bugs                    | rápida, determinística, **sem LLM**     |
| Bases                          | misturadas (1 JSON faz 3 papéis)        | pequenas e **separadas por papel**      |
| Negação                        | só troca sinal de 1 palavra             | escopo de cláusula + amortecimento      |
| Intensificadores               | compõem sem teto + poluídos com tempo   | com teto, só intensificadores reais     |
| Contraste "mas"                | multiplicador mágico 0.05               | ponderação de cláusula                  |
| Ironia                         | **zera** o sentimento                   | **amortece**; riso vira positivo        |
| Normalização                   | `normalizeIntensity` em pedaços         | `x/√(x²+α)` suave e limitada            |
| Cache                          | `Map` sem limite (vaza)                 | LRU com teto                            |
| Como usar                      | `new` + flags confusos                  | estático + config enxuta + léxico custom |
| Explicabilidade / lote         | nenhuma                                 | `explain` (drivers) + `analyzeMany`     |
| Contrato `intensity`           | ambíguo (assinado vs 0..1)              | `score` assinado + `label` claros (compat mantido) |
