# 🏛️ Arquitetura — Hierarquia de Classes, Injeção de Dependência e Tipagens (proposta de redesign)

> Documento-síntese: amarra os redesenhos de [timezone](./timezone-flow.md),
> [validadores](./validators-flow.md), [config de regras](./rules-config-flow.md),
> [rich text](./rich-text-flow.md) + [storage](./rich-text-storage-flow.md),
> [conversores](./formatter-flow.md) e [sentimento](./sentiment-flow.md) numa **única estrutura
> de hierarquia** baseada em **injeção de dependência**.
>
> **A tese central:** existe **um jeito só de configurar uma engine — por injeção no
> construtor.** A "classe mãe" (`TextLibrary`) é apenas **um injetor**: ela é dona das regras,
> instancia as classes menores e injeta a config de cada uma. As classes menores não sabem (nem
> precisam saber) quem as configurou — o injetor pode ser a classe mãe **ou** o seu código.

---

## 🔴 A arquitetura atual

Hoje a `TextLibrary` (`src/index.ts`) faz composição manual e inconsistente:

### a) Ciclo de vida das instâncias é inconsistente — e quebra features

```typescript
this.validator = new Validator(config.validationRules)        // 1× no construtor
this.conversor = new Conversor()                              // 1× no construtor
this.extract = {
    content:   (t, o) => new Extractor(t).extract(o),         // ⚠️ nova instância POR CHAMADA
    keywords:  (t)    => new KeywordExtractor(config.keywordConfig).extract(t),   // ⚠️ idem (reconstrói o Set de stopwords)
    sentiment: (t)    => new SentimentExtractor(config.sentimentConfig).analyze(t) // ⚠️ idem
}
```

O `SentimentExtractor` tem **cache interno** (`enableCache`) — mas como uma **instância nova é
criada a cada chamada**, o cache **nunca é reaproveitado**. A feature é anulada pela arquitetura.
O `KeywordExtractor` reconstrói o `Set` de 538 stopwords a cada análise.

### b) `validationRules` é obrigatório

`CircleTextProps.validationRules` não é opcional — quem só quer `sentiment`/`timezone` é forçado
a passar regras de validação. As engines ficam acopladas ao facade.

### c) Construtores heterogêneos (cada classe inventa o seu)

| Classe              | Construtor              | Problema                                   |
| ------------------- | ----------------------- | ------------------------------------------ |
| `Validator`         | `(rules)`               | rules obrigatórias                         |
| `Extractor`         | `(text)`                | recebe **dado** (texto), não config        |
| `Timezone`          | `(code)`                | recebe um escalar, não um objeto de config |
| `RichText`          | `()` + `setText()`      | config/dado em dois passos                 |
| `KeywordExtractor`  | `(config?)`             | ok                                         |
| `SentimentExtractor`| `(config?)`             | ok                                         |

Não há contrato comum. Uns recebem config, outros recebem dado, outros nada.

### d) O facade vira uma sacola de funções

`validate`/`extract`/`transform` são objetos de funções *bound* — você perde acesso às
**instâncias** (não dá pra chamar `validator.with(...)`, `sentiment.clearCache()`, etc.).

### e) Tipagens quase não são exportadas

`src/index.ts` reexporta só `EntityMapping`, `RichTextEntity`, `RichTextUIFormat`. **Não dá** pra
`import type { ValidationResult, ValidationConfig, SentimentReturnProps, TimezoneConfig } from
"circle-text-library"` — tipos essenciais ficam trancados dentro dos módulos.

### f) Acoplamento de construção (sem DI)

O facade dá `new` em tudo internamente. Você **não pode** injetar uma instância pré-configurada,
compartilhar uma engine entre dois facades, trocar por um mock em teste, nem por uma implementação
própria.

---

## 💡 O princípio: configuração só por injeção

```
            o que muda                          o que NÃO muda
   ┌────────────────────────────┐      ┌──────────────────────────────────┐
   │ QUEM injeta a config:       │      │ COMO a engine é configurada:      │
   │  • a classe mãe (composto)  │ ───► │  sempre pelo construtor (injeção) │
   │  • o seu código (standalone)│      │  a engine não conhece o injetor   │
   └────────────────────────────┘      └──────────────────────────────────┘
```

Isso resolve os quatro requisitos de uma vez:

- **rules injetadas nas classes** → config entra pelo construtor;
- **a classe mãe controla/edita rules e instancia as menores** → a mãe é o *composition root*;
- **classes menores instanciáveis sozinhas com rules** → o seu código é só outro injetor;
- **tudo via DI** → nada de `new` escondido e não-substituível.

---

## 🧱 A hierarquia

Um **composition root plano** sobre **folhas independentes**. Nenhuma folha depende de outra
folha — o que seria lógica comum vive em **utils puros internos** (sem acoplamento entre engines).

```
                      ┌──────────────────────────────────────────────┐
                      │            TextLibrary  (classe mãe)          │
                      │  • dona da config canônica (rules)            │
                      │  • instancia as folhas e injeta a config      │
                      │  • configure() / with() editam as rules       │
                      │  • expõe as INSTÂNCIAS (API completa)         │
                      └───────────────┬──────────────────────────────┘
       injeta config (DI)             │
   ┌───────────┬───────────┬──────────┴───┬───────────┬──────────────┐
   ▼           ▼           ▼              ▼           ▼              ▼
Validator  Sentiment   Keyword        RichText    Timezone       Formatter
           Extractor   Extractor      (+extract)                  ├ NumberFormatter
                                                                  └ TextFormatter

cada folha:                                  utils puros internos (NÃO são engines):
 • importável sozinha (subpath)               • tokenize           • entityPatterns
 • instanciável standalone com rules          • mergeConfig        • lexicon loaders
 • construtor recebe CONFIG, métodos recebem DADO
 • implementa Configurable<C> (withConfig)
```

> **Por que não um container de IoC** (decorators, `reflect-metadata`): manteria a lib pesada e
> não-tree-shakeable. DI aqui é **injeção por construtor + composition root explícito** — zero
> dependências, ESM puro, cada folha some do bundle se você não a importar.

---

## 📐 O contrato uniforme: `Configurable<C>`

Toda engine segue **o mesmo contrato**, o que deixa a mãe gerenciá-las de forma genérica:

```typescript
export type DeepPartial<T> = { [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K] }

export interface Configurable<C> {
    readonly config: Readonly<C>            // config resolvida (defaults + injeção, normalizada)
    withConfig(patch: DeepPartial<C>): this // deriva uma cópia imutável com merge
}
```

Duas regras de ouro que padronizam os construtores de hoje:

1. **Construtor recebe configuração** (a dependência). `new Validator(rules)`, `new Timezone({zone})`.
2. **Métodos recebem dado.** `validator.username(texto)`, `timezone.format(data)`,
   `richText.parse(texto)`. (Corrige `new Extractor(text)` e `new RichText()+setText`.)

```typescript
export class Validator implements Configurable<ValidatorConfig> {
    readonly config: Readonly<ValidatorConfig>
    constructor(config: DeepPartial<ValidatorConfig> = {}) {
        this.config = defineRules(mergeConfig(DEFAULTS.validator, config))   // injeção + merge + normalização
    }
    withConfig(patch: DeepPartial<ValidatorConfig>) {
        return new Validator(mergeConfig(this.config, patch))
    }
    username(value: string, override?: DeepPartial<UsernameRules>): ValidationResult { /* ... */ }
    // hashtag, url, name, description, password ...
}
```

(`mergeConfig`/`defineRules` são os mesmos do doc de [config de regras](./rules-config-flow.md):
merge profundo + açúcar `charset`/`chars`. `withConfig` é o `.with()` do doc de
[validadores](./validators-flow.md), agora padronizado para **todas** as engines.)

---

## 🌱 Classes folha: standalone com rules injetadas (R3)

Cada folha é importável por **subpath** (como o Timezone hoje) e instanciável **sozinha**,
recebendo suas rules:

```typescript
import { Validator }          from "circle-text-library/validator"
import { SentimentExtractor } from "circle-text-library/sentiment"
import { RichText }           from "circle-text-library/rich-text"
import { Timezone }           from "circle-text-library/timezone"
import { Formatter }          from "circle-text-library/conversor"

const v = new Validator({ username: { minLength: 4 } })   // rules injetadas
v.username("joao")                                         // dado no método

const s = new SentimentExtractor({ lexicon: { top: 0.6 } })
s.analyze("isso é top")

const rt = new RichText("Oi @alice", { mentions: { alice: "u1" } })
```

A folha funciona idêntica dentro ou fora do facade — porque, dos dois jeitos, **recebe a config
por injeção no construtor**. Não há caminho "privilegiado".

---

## 🎛️ A classe mãe como *composition root* (R1 + R2)

A mãe é dona da config canônica, **instancia e injeta** nas folhas, **expõe as instâncias** (não
mais sacolas de função) e oferece **edição de rules**.

```typescript
export interface TextLibraryConfig {
    validation?: ValidatorConfig    | Validator           // config OU instância injetada
    sentiment?:  SentimentConfig    | SentimentExtractor
    keywords?:   KeywordConfig      | KeywordExtractor
    richText?:   RichTextConfig     | RichText
    timezone?:   TimezoneConfig     | Timezone
    format?:     FormatterConfig    | Formatter
}

export class TextLibrary {
    validator: Validator
    sentiment: SentimentExtractor
    keywords:  KeywordExtractor
    richText:  RichText
    timezone:  Timezone
    format:    Formatter

    constructor(cfg: TextLibraryConfig = {}) {
        // resolve cada slot: usa a instância injetada, OU constrói da config
        this.validator = asEngine(cfg.validation, (c) => new Validator(c))
        this.sentiment = asEngine(cfg.sentiment,  (c) => new SentimentExtractor(c))
        this.keywords  = asEngine(cfg.keywords,   (c) => new KeywordExtractor(c))
        this.richText  = asEngine(cfg.richText,   (c) => new RichText(undefined, c))
        this.timezone  = asEngine(cfg.timezone,   (c) => new Timezone(c))
        this.format    = asEngine(cfg.format,     (c) => new Formatter(c))
    }

    /** edita rules no lugar: troca as instâncias afetadas (referências estáveis nas demais) */
    configure(patch: DeepPartial<TextLibraryConfig>): this {
        if (patch.validation) this.validator = this.validator.withConfig(patch.validation as any)
        if (patch.sentiment)  this.sentiment = this.sentiment.withConfig(patch.sentiment as any)
        /* ...idem demais... */
        return this
    }

    /** deriva um NOVO facade, reusando as engines não-tocadas (imutável) */
    with(patch: DeepPartial<TextLibraryConfig>): TextLibrary {
        return new TextLibrary({
            validation: patch.validation ? this.validator.withConfig(patch.validation as any) : this.validator,
            sentiment:  patch.sentiment  ? this.sentiment.withConfig(patch.sentiment as any)   : this.sentiment,
            /* ...demais reusam a instância atual... */
        })
    }
}

// engine = qualquer coisa que implemente o contrato; config = objeto simples
const isEngine = (x: unknown): x is Configurable<unknown> =>
    !!x && typeof (x as { withConfig?: unknown }).withConfig === "function"

function asEngine<C, T>(slot: C | T | undefined, build: (c?: C) => T): T {
    return isEngine(slot) ? (slot as T) : build(slot as C)
}
```

Agora as instâncias são **criadas uma vez** e expostas — o cache do `SentimentExtractor` volta a
funcionar, o `Set` do `KeywordExtractor` é montado uma vez, e você acessa a API completa de cada
engine (`lib.validator.withConfig(...)`, `lib.sentiment.clearCache()`, `lib.richText.toHTML(...)`).

### Compatibilidade: os namespaces antigos viram adaptadores finos

```typescript
get validate() { return {
    username: (v: string, o?: any) => this.validator.username(v, o),
    /* hashtag, url, name, description, password ... */
}}
get extract() { return {
    content:   (t: string, o?: ExtractOptions) => this.richText.extract(t, o),   // Extractor absorvido
    keywords:  (t: string) => this.keywords.extract(t),
    sentiment: (t: string) => this.sentiment.analyze(t)
}}
get transform() { return {
    number: this.format.number,
    text:   { capitalize: this.format.text.capitalize, richText: this.richText },
    timezone: this.timezone
}}
```

`circleText.validate.username(...)`, `circleText.extract.sentiment(...)` etc. seguem funcionando.

---

## 💉 Injeção de dependência na prática (R5)

### 1. Injetar uma instância pronta (compartilhar / pré-configurar)

```typescript
const sharedSentiment = new SentimentExtractor({ lexicon: appSlang })

const libA = new TextLibrary({ sentiment: sharedSentiment, validation: rulesA })
const libB = new TextLibrary({ sentiment: sharedSentiment, validation: rulesB })
// ✅ libA e libB compartilham o MESMO SentimentExtractor (cache aproveitado entre os dois)
```

### 2. Injetar uma implementação própria (seam de interface)

Cada engine tem uma **interface** que o facade depende; injete qualquer coisa que a cumpra:

```typescript
export interface IValidator extends Configurable<ValidatorConfig> {
    username(v: string, o?: DeepPartial<UsernameRules>): ValidationResult
    /* ... */
}

class MeuValidator implements IValidator { /* sua lógica/mocks */ }

new TextLibrary({ validation: new MeuValidator() })   // ✅ aceito (tem withConfig → é engine)
```

### 3. Injetar sub-dependências dentro da folha (DI até nas pontas)

```typescript
new Timezone({ zone: "America/Sao_Paulo", now: () => dataFixa })  // ⏰ clock injetável → testável
new SentimentExtractor({ lexicon: vocabularioDoApp })             // 📚 léxico injetável
new RichText("", { custom: [{ type: "cashtag", pattern: /\$[A-Z]+/, sigil: "$" }] }) // 🧩 padrões injetáveis
```

DI não para no facade: as próprias folhas recebem suas dependências (relógio, léxico, padrões)
por injeção, o que torna tudo **testável** sem mocks globais.

---

## 🏷️ Tipagens: tudo exportado (R4)

Cada módulo exporta suas tipagens, e o barril principal **reexporta todas**:

```typescript
// src/index.ts
export type * from "./types"                                   // ValidationConfig, ValidationResult, *Rules...
export type * from "./classes/validator/index.js"
export type * from "./classes/sentimentExtractor/index.js"     // SentimentConfig, SentimentReturnProps...
export type * from "./classes/keywordExtractor.js"             // KeywordConfig...
export type * from "./classes/rich.text/index.js"              // Segment, EntityData, RichTextConfig...
export type * from "./classes/timezone/index.js"               // TimezoneConfig, DateInput...
export type * from "./classes/conversor/index.js"              // FormatterConfig...
export type { Configurable, DeepPartial, TextLibraryConfig } from "./TextLibrary.js"

// runtime
export { TextLibrary, Validator, SentimentExtractor, KeywordExtractor,
         RichText, Timezone, Formatter, NumberFormatter, TextFormatter } from "..."
```

No seu código:

```typescript
import type {
    ValidatorConfig, ValidationResult, UsernameRules,
    SentimentConfig, SentimentReturnProps,
    Segment, EntityData, RichTextConfig,
    TimezoneConfig, FormatterConfig,
    TextLibraryConfig, Configurable
} from "circle-text-library"

// ou o pacote inteiro de tipos:
import type * as CT from "circle-text-library"
const r: CT.ValidationResult = lib.validator.username("joao")
```

> Os subpaths também exportam seus próprios tipos (`circle-text-library/timezone` exporta
> `TimezoneConfig`, etc.), e dá pra ter um ponto de entrada só-tipos `circle-text-library/types`.

---

## 🧩 Como tudo se encaixa (com os outros docs)

| Folha (engine)        | Subpath                         | Doc de redesign                          |
| --------------------- | ------------------------------- | ---------------------------------------- |
| `Validator`           | `circle-text-library/validator` | [validators](./validators-flow.md) + [rules-config](./rules-config-flow.md) |
| `SentimentExtractor`  | `circle-text-library/sentiment` | [sentiment](./sentiment-flow.md)         |
| `KeywordExtractor`    | `circle-text-library/keywords`  | —                                        |
| `RichText` (+extract) | `circle-text-library/rich-text` | [rich-text](./rich-text-flow.md) + [storage](./rich-text-storage-flow.md) |
| `Timezone`            | `circle-text-library/timezone`  | [timezone](./timezone-flow.md)           |
| `Formatter`           | `circle-text-library/conversor` | [formatter](./formatter-flow.md)         |

A `TextLibrary` é a única que conhece todas — as folhas não se conhecem entre si.

---

## 🔁 Migração (de → para)

| Hoje                                                   | Proposta                                            | Compat?            |
| ------------------------------------------------------ | --------------------------------------------------- | ------------------ |
| `new TextLibrary({ validationRules })` (obrigatório)   | `new TextLibrary({ validation })` (opcional)        | adaptar nome       |
| `circleText.validate.username(v)`                      | igual (adaptador) **ou** `lib.validator.username(v)`| mantido            |
| `circleText.extract.sentiment(t)`                      | igual (adaptador) **ou** `lib.sentiment.analyze(t)` | mantido            |
| instância nova de Sentiment/Keyword por chamada        | uma instância injetada e reutilizada                | melhora (cache volta) |
| `new Extractor(text)` / `new Timezone(code)`           | config no construtor, dado no método                | classes ajustadas  |
| tipos trancados nos módulos                            | `export type *` no barril + subpaths                | aditivo            |
| sem injeção                                            | `Config \| Instância` em cada slot + interfaces     | aditivo            |

---

## 📊 Antes vs. Depois

| Critério                          | Antes                                   | Depois                                   |
| --------------------------------- | --------------------------------------- | ---------------------------------------- |
| Configuração das engines          | mista (construtor, escalar, dois passos)| **só injeção no construtor** (1 contrato)|
| Ciclo de vida                     | algumas por chamada (cache quebrado)    | instanciadas 1×, reutilizadas            |
| Papel do facade                   | sacola de funções *bound*               | composition root que **expõe instâncias**|
| Classes menores sozinhas          | parcial / acopladas                     | importáveis + instanciáveis com rules    |
| Editar rules em runtime           | `updateRules` só no Validator           | `configure()` / `with()` em toda a árvore|
| Injetar instância / implementação | impossível                              | `Config \| Instância` + interfaces       |
| DI nas pontas (clock, léxico…)    | nenhuma                                 | sub-dependências injetáveis (testável)   |
| Acesso às tipagens                | ~3 tipos exportados                     | **todas** (`export type *` + subpaths)   |
| Dependências p/ DI                | —                                       | nenhuma (sem IoC container; tree-shakeable) |
| Acoplamento entre engines         | facade dá `new` em tudo                 | folhas independentes; mãe é o único elo  |
