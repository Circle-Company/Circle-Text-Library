# 🔧 Circle Text Library

Biblioteca **JavaScript/TypeScript** para **validação, extração e análise de texto**, feita para redes sociais. Sem dependências pesadas, **sem LLM** — só **algoritmos rápidos, determinísticos e tipados**, com **injeção de dependência** e **engines independentes** que você usa sozinhas ou compostas.

- ✅ **Validação configurável** — defina as regras 1×, sobrescreva pontualmente (merge).
- 📝 **Rich Text** — menções/hashtags/URLs/e-mails em uma varredura; render seguro p/ HTML/tokens; serialização mínima.
- 🫀 **Sentimento** — léxico **pt-BR e inglês** + regras, com explicabilidade.
- 🔍 **Keywords** — extração com stemming/stopwords pt-BR.
- 🌍 **Timezone** — `Intl` nativo, com horário de verão automático.
- 🔤 **Formatadores** — número/texto locale-aware.
- 💉 **DI de verdade** — cada engine recebe config por construtor; a classe mãe só injeta.

---

## 📦 Instalação

```bash
npm install circle-text-library
```

Requer **Node >= 16**. ESM nativo (`"type": "module"`).

---

## 🚀 Exemplo rápido

A classe mãe `TextLibrary` agrega e injeta tudo:

```typescript
import { TextLibrary } from "circle-text-library"

const ct = new TextLibrary({
    validation: { username: { minLength: 4, maxLength: 20 } }
})

ct.validator.username("joao_silva")             // { isValid: true, errors: [] }
ct.sentiment.analyze("isso é ótimo demais")     // { sentiment: "positive", intensity: 0.725 }
ct.keywords.extract("inteligência artificial e programação")  // ["intelig", "artifici", "programacao"]
ct.timezone.format("2024-01-15T15:30:00Z")      // "15/01/2024, 12:30"
ct.format.number.compact(12500)                 // "12,5 mil"
```

Ou importe **só a engine que precisa** (subpath):

```typescript
import { SentimentExtractor } from "circle-text-library/sentiment"
import { RichText } from "circle-text-library/rich-text"

SentimentExtractor.analyze("amei demais!")              // { sentiment: "positive", ... }
new SentimentExtractor({ language: "en" }).analyze("I love it!")   // inglês
RichText.extract("Oi @alice veja #js em https://x.com")
// { mentions: ["@alice"], hashtags: ["#js"], urls: ["https://x.com"], emails: [] }
```

---

## 📚 Documentação por classe

Cada engine tem um guia detalhado com API, configuração e **casos de uso**:

| Engine | Import | Guia |
|--------|--------|------|
| 🧩 **TextLibrary** (facade + DI) | `circle-text-library` | [docs/text-library.md](./docs/text-library.md) |
| ✅ **Validator** | `circle-text-library/validator` | [docs/validator.md](./docs/validator.md) |
| 📝 **RichText** | `circle-text-library/rich-text` | [docs/rich-text.md](./docs/rich-text.md) |
| 🫀 **SentimentExtractor** | `circle-text-library/sentiment` | [docs/sentiment.md](./docs/sentiment.md) |
| 🔍 **KeywordExtractor** | `circle-text-library/keywords` | [docs/keywords.md](./docs/keywords.md) |
| 🌍 **Timezone** | `circle-text-library/timezone` | [docs/timezone.md](./docs/timezone.md) |
| 🔤 **Formatadores** | `circle-text-library/conversor` | [docs/formatter.md](./docs/formatter.md) |

> **Decisões de arquitetura** (um `.md` de fluxo por engine): veja a pasta [`docs/`](./docs) (`*-flow.md`).

---

## 🏷️ TypeScript

Todas as tipagens são exportadas — da raiz e de cada subpath:

```typescript
import type {
    TextLibraryConfig, Configurable, DeepPartial,
    ValidationConfig, ValidationResult,
    SentimentExtractorConfig, SentimentReturnProps, SentimentLanguage,
    KeywordExtractorConfig, TimezoneConfig, FormatterConfig
} from "circle-text-library"
```

---

## 🧪 Desenvolvimento

A lib usa **[Vitest](https://vitest.dev)**. Os testes ficam em `__tests__/` ao lado de cada engine.

```bash
npm test               # toda a suíte (watch por padrão)
npm test -- --run      # roda uma vez e sai (CI)
npm run test:coverage  # cobertura (v8)
npm run build          # compila para dist/ + .d.ts
```

Rodar um arquivo ou um teste por nome:

```bash
npx vitest run src/classes/validator/__tests__/password.spec.ts   # um arquivo
npx vitest run -t "valida senha forte"                            # por nome
npx vitest run src/classes/sentimentExtractor                     # uma engine inteira
```

---

## 🗂️ Estrutura

```
src/
├── index.ts                 # TextLibrary (composition root) + reexports/tipos
├── core/                    # Configurable, DeepPartial, mergeConfig (DI)
├── types.ts                 # tipos de validação compartilhados
├── classes/
│   ├── validator/           # Validator + charset/defineRules
│   ├── rich.text/           # RichText (segmentos, extração, render, storage)
│   ├── sentimentExtractor/  # SentimentExtractor (pt-BR + en)
│   ├── keywordExtractor.ts  # KeywordExtractor
│   ├── timezone/            # Timezone (Intl)
│   └── conversor/           # NumberFormatter / TextFormatter / Formatter
└── data/
    ├── pt-br/               # léxicos e listas pt-BR (JSON estáticos)
    └── en/                  # léxicos de sentimento em inglês
```

---

## 📄 Licença

[MIT](./LICENCE) © Circle LLC
