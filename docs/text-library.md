# 🧩 TextLibrary (classe mãe) + Injeção de dependência

`TextLibrary` é o **composition root**: é dona da config canônica, instancia cada engine e injeta a config — ou aceita uma **instância pronta** (DI). Ela expõe as **instâncias** (`ct.validator`, `ct.sentiment`, …), então você tem a API completa de cada engine.

> Arquitetura geral: [`architecture-flow.md`](./architecture-flow.md)

```typescript
import { TextLibrary } from "circle-text-library"
```

---

## Montagem e uso

```typescript
const ct = new TextLibrary({
    validation: { username: { minLength: 4, maxLength: 20 } },
    sentiment: { language: "pt-br" }
})

ct.validator.username("joao_silva")  // { isValid: true, errors: [] }
ct.sentiment.analyze("isso é ótimo demais")  // { sentiment: "positive", intensity: 0.725 }
ct.keywords.extract("inteligência artificial revoluciona a programação")
// ["intelig", "artifici", "revoluciona", "programacao"]
ct.timezone.format("2024-01-15T15:30:00Z")   // data no fuso configurado
ct.format.number.compact(12500)              // "12,5 mil"
ct.format.text.slug("Olá Mundo")             // "ola-mundo"
```

Slots disponíveis no construtor: `validation`, `sentiment`, `keywords`, `richText`, `timezone`, `format`. Cada um aceita **uma config** (a mãe constrói a engine) **ou** uma **instância pronta** (DI).

> **Atenção ao RichText:** os métodos de instância do `RichText` operam sobre o texto do construtor, e o facade cria a engine sem texto. Para analisar textos avulsos, use o import dedicado (`RichText.parse(text)` / `new RichText(text, opts)`) — veja [`rich-text.md`](./rich-text.md). O slot `richText` serve sobretudo para carregar config/DI.

---

## Editar e derivar config

```typescript
// configure(): muta no lugar, trocando a engine afetada (merge sobre a config atual)
ct.configure({ validation: { username: { minLength: 8 } } })

// with(): deriva um NOVO facade, reusando as engines não-tocadas (imutável)
const strict = ct.with({ validation: { password: { minLength: { value: 12 } } } })
```

---

## Injeção de dependência (compartilhar/mockar engines)

Entregue uma **instância** em vez de config para compartilhar estado (ex.: cache de sentimento) entre vários facades, ou para injetar um mock em testes:

```typescript
import { SentimentExtractor } from "circle-text-library/sentiment"

const shared = new SentimentExtractor({ lexicon: appSlang })

const a = new TextLibrary({ sentiment: shared, validation: rulesA })
const b = new TextLibrary({ sentiment: shared, validation: rulesB })
// a e b compartilham o MESMO SentimentExtractor (cache reaproveitado)
```

Toda engine implementa o contrato `Configurable<C>` (de `circle-text-library/core`): `readonly config` + `withConfig(patch)`. É isso que permite tanto "passar config" quanto "passar instância".

---

## Engines avulsas (sem o facade)

Quando você só precisa de uma, importe por subpath — sem instanciar a lib toda:

```typescript
import { Validator } from "circle-text-library/validator"
import { RichText } from "circle-text-library/rich-text"
import { SentimentExtractor } from "circle-text-library/sentiment"
import { KeywordExtractor } from "circle-text-library/keywords"
import { Timezone } from "circle-text-library/timezone"
import { NumberFormatter, TextFormatter } from "circle-text-library/conversor"
```

---

## TypeScript

Todos os tipos são exportados, tanto da raiz quanto de cada subpath:

```typescript
import type {
    TextLibraryConfig, Configurable, DeepPartial,
    ValidationConfig, ValidationResult,
    SentimentExtractorConfig, SentimentReturnProps, SentimentLanguage,
    KeywordExtractorConfig, TimezoneConfig, FormatterConfig
} from "circle-text-library"
```
