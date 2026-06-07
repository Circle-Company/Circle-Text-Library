# 🔤 Conversores — Renomeação, Novas Funcionalidades e Classe Independente (proposta de redesign)

> Objetivo: deixar os conversores **fáceis de usar** (nomes que dizem o que fazem, funções
> puras/estáticas, locale com default), **corretos** (usando `Intl` nativo no lugar de
> matemática de string frágil), com **mais funcionalidades** úteis a uma rede social, e
> expostos como **classe independente** em `circle-text-library/conversor` — como o Timezone.

---

## 🔴 O problema atual

A classe `Conversor` (`src/classes/conversor/index.ts`) é um saco de utilidades com nomes
confusos e implementações que reinventam o que o JavaScript já faz nativo.

### a) Nomes que enganam

| Método atual               | O que faz de verdade                        | Problema no nome                  |
| -------------------------- | ------------------------------------------- | --------------------------------- |
| `formatSliceNumWithDots`   | **trunca texto** e põe "..."                | diz "Num", mas é texto            |
| `formatNumWithDots`        | separador de milhar (`1.000`)               | "WithDots" descreve a implementação, não a intenção |
| `convertNumToShortUnitText`| abrevia número (`1.2 K`)                     | verboso e obscuro                 |
| `capitalizeFirstLetter`    | maiúscula na 1ª letra                       | longo demais                      |
| `invertStr`                | inverte string                              | abreviação crua                   |
| `formatToEnrichedString`   | troca `<br>` por `\n`                        | nome não diz nada                 |
| `Conversor` (classe)       | formatação de número **e** texto            | nome em PT no meio de classes EN  |

### b) Reinventa o `Intl` — com bugs

```typescript
// formatNumWithDots: monta o separador de milhar caractere a caractere
formatNumWithDots(-1000)     // ⚠️ negativos e decimais quebram a matemática de índice
formatNumWithDots(1000.5)    // ⚠️ trata "." como dígito

// convertNumToShortUnitText: fatia substrings invertidas para achar K/M/B
convertNumToShortUnitText(999999)   // ⚠️ "999 K" (perde precisão; deveria ser ~1 mi)
convertNumToShortUnitText(-1500)    // ⚠️ cai na faixa errada e produz lixo
```

O `Intl.NumberFormat` faz tudo isso **certo, com locale**, em uma linha.

### c) Ergonomia e detalhes

- `formatSliceNumWithDots({ text, size })` recebe **objeto** — inconsistente com o resto.
- Trunca com `"..."` (3 chars) **fora** do orçamento → o resultado **estoura** `size`.
- `invertStr("a😀b")` → quebra o emoji (split por `""` separa o par surrogate).
- **Nenhum suporte a locale.** Uma rede social costuma ser multi-idioma.
- **Não é independente:** não há subpath `./conversor`; para usar, arrasta a lib inteira.

---

## 💡 O princípio

1. **Nome = intenção.** `truncate`, `compact`, `capitalize` — não a implementação.
2. **Nativo primeiro.** `Intl.NumberFormat` para milhar/compacto/moeda/percentual; `String.normalize`
   para acentos. Menos código, mais correto, com locale de brinde.
3. **Fácil por padrão.** Métodos **estáticos puros** (sem `new`) com locale default `pt-BR`;
   instância só quando você quer fixar outro locale.

---

## 🏷️ Renomeação de classes e métodos

Uma classe "pau-pra-toda-obra" vira **duas classes de responsabilidade única** + um agregado
de conveniência. `Conversor` permanece como **alias depreciado** (não quebra ninguém).

```
Conversor  ──►  NumberFormatter   (números)
           ──►  TextFormatter     (texto)
           ──►  Formatter         (agregado: { number, text }) — espelha transform.*
           ──►  Conversor         (alias depreciado = Formatter)
```

| Antes (`Conversor`)         | Depois                                  |
| --------------------------- | --------------------------------------- |
| `formatNumWithDots(n)`      | `NumberFormatter.thousands(n)`          |
| `convertNumToShortUnitText(n)` | `NumberFormatter.compact(n)`         |
| `formatSliceNumWithDots({text,size})` | `TextFormatter.truncate(text, size)` |
| `capitalizeFirstLetter(t)`  | `TextFormatter.capitalize(t)`           |
| `invertStr(t)`              | `TextFormatter.reverse(t)`              |
| `formatToEnrichedString(t)` | `TextFormatter.brToNewlines(t)`         |

> Os nomes antigos continuam existindo como **aliases** nos respectivos formatters e no
> `Conversor` depreciado, então a migração é opcional e gradual.

---

## ✅ O fluxo (mais fácil de usar)

### Estático — sem `new`, locale default pt-BR

```typescript
import { NumberFormatter as num, TextFormatter as text } from "circle-text-library/conversor"

num.thousands(1234567)          // ✅ "1.234.567"
num.compact(1500)               // ✅ "1,5 mil"          (pt-BR)
num.currency(1234.5, "BRL")     // ✅ "R$ 1.234,50"
num.percent(0.25)               // ✅ "25%"

text.capitalize("olá mundo")    // ✅ "Olá mundo"
text.truncate("texto bem longo", 8)  // ✅ "texto b…"   (8 chars contando o "…")
text.slug("Olá, Mundo!")        // ✅ "ola-mundo"
text.initials("João Silva")     // ✅ "JS"
```

### Instância — quando quer fixar outro locale

```typescript
import { Formatter } from "circle-text-library/conversor"

const fmt = new Formatter({ locale: "en-US" })
fmt.number.compact(1500)        // ✅ "1.5K"
fmt.number.currency(1234.5, "USD")  // ✅ "$1,234.50"
fmt.text.capitalize("hello")    // ✅ "Hello"
```

---

## ✨ Novas funcionalidades

### Números (via `Intl`, locale-aware)

| Método                         | Exemplo (pt-BR)                  |
| ------------------------------ | -------------------------------- |
| `compact(n)`                   | `1500 → "1,5 mil"`               |
| `currency(n, code)`            | `1234.5, "BRL" → "R$ 1.234,50"`  |
| `percent(n, fraction?)`        | `0.25 → "25%"`                   |
| `decimal(n, places?)`          | `3.14159, 2 → "3,14"`            |
| `ordinal(n)`                   | `3 → "3º"`                       |
| `fileSize(bytes)`              | `1048576 → "1 MB"`               |

### Texto

| Método                         | Exemplo                                 |
| ------------------------------ | --------------------------------------- |
| `titleCase(t)`                 | `"olá mundo" → "Olá Mundo"`             |
| `stripAccents(t)`              | `"ação" → "acao"`                       |
| `slug(t)`                      | `"Café com Leite!" → "cafe-com-leite"`  |
| `initials(name, max?)`         | `"Maria Clara Souza" → "MC"`            |
| `truncateWords(t, n)`          | corta por nº de **palavras**, não chars |
| `truncate(t, size, { byWord })`| trunca respeitando limite de palavra    |

```typescript
// Úteis numa rede social:
text.slug("Meu Primeiro Post!")     // "meu-primeiro-post"  → vira URL (conecta com o codec de storage)
text.initials("João Silva")         // "JS"                 → avatar placeholder
num.compact(12500)                  // "12,5 mil"           → contador de curtidas/seguidores
num.fileSize(2_500_000)             // "2,4 MB"             → upload de mídia
```

---

## 🛠️ Como atingimos isso

```typescript
export interface FormatterConfig { locale?: string }

export class NumberFormatter {
    constructor(private readonly locale: string = "pt-BR") {}

    thousands(n: number) { return new Intl.NumberFormat(this.locale).format(n) }
    compact(n: number)   { return new Intl.NumberFormat(this.locale, { notation: "compact", maximumFractionDigits: 1 }).format(n) }
    currency(n: number, code = "BRL") { return new Intl.NumberFormat(this.locale, { style: "currency", currency: code }).format(n) }
    percent(n: number, fraction = 0)  { return new Intl.NumberFormat(this.locale, { style: "percent", maximumFractionDigits: fraction }).format(n) }
    fileSize(bytes: number) {
        const u = ["B", "KB", "MB", "GB", "TB"]; let i = 0; let v = bytes
        while (v >= 1024 && i < u.length - 1) { v /= 1024; i++ }
        return `${new Intl.NumberFormat(this.locale, { maximumFractionDigits: 1 }).format(v)} ${u[i]}`
    }

    // estáticos delegam a uma instância default → uso sem `new`
    static thousands = (n: number) => new NumberFormatter().thousands(n)
    static compact   = (n: number) => new NumberFormatter().compact(n)
    // ...e os aliases antigos:
    formatNumWithDots = this.thousands
    convertNumToShortUnitText = this.compact
}

export class TextFormatter {
    constructor(private readonly locale: string = "pt-BR") {}

    capitalize(t: string) { return t ? [...t][0]!.toUpperCase() + [...t].slice(1).join("") : "" }
    reverse(t: string)    { return [...t].reverse().join("") }                 // [...] preserva emoji ✔
    stripAccents(t: string) { return t.normalize("NFD").replace(/\p{Diacritic}/gu, "") }
    slug(t: string) {
        return this.stripAccents(t).toLowerCase().trim()
            .replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-").replace(/^-+|-+$/g, "")
    }
    truncate(t: string, size: number, { ellipsis = "…", byWord = false } = {}) {
        if (!t || [...t].length <= size) return t ?? ""
        let cut = [...t].slice(0, size - [...ellipsis].length).join("")
        if (byWord) cut = cut.replace(/\s+\S*$/, "")                            // não corta no meio da palavra
        return cut + ellipsis                                                   // resultado respeita `size` ✔
    }
    initials(name: string, max = 2) {
        return name.trim().split(/\s+/).slice(0, max).map((w) => [...w][0]?.toUpperCase() ?? "").join("")
    }
    brToNewlines(t: string) { return t.replace(/<br\s*\/?>/gi, "\n") }

    // aliases antigos
    capitalizeFirstLetter = this.capitalize
    invertStr = this.reverse
}

/** Agregado de conveniência — espelha transform.number / transform.text */
export class Formatter {
    public readonly number: NumberFormatter
    public readonly text: TextFormatter
    constructor(config: FormatterConfig = {}) {
        this.number = new NumberFormatter(config.locale)
        this.text = new TextFormatter(config.locale)
    }
}

/** @deprecated use Formatter / NumberFormatter / TextFormatter */
export const Conversor = Formatter
```

O facade (`src/index.ts`) passa a montar `transform.number`/`transform.text` a partir do
`Formatter`, mantendo as **chaves atuais** (`formatWithDots`, `convertToShortUnitText`,
`formatSliceWithDots`, `capitalizeFirstLetter`) como aliases para não quebrar nada.

---

## 🐛 Bugs corrigidos pela revisão

| Caso                              | Hoje                          | Depois                          |
| --------------------------------- | ----------------------------- | ------------------------------- |
| `thousands(-1000)` / decimais     | matemática de índice quebra   | `Intl` correto                  |
| `compact(999999)`                 | `"999 K"` (perde precisão)    | `"1 mi"`                        |
| `reverse("a😀b")`                 | emoji quebrado                | `[...t]` preserva               |
| `truncate(t, 8)`                  | resultado tem 11 chars (`+"..."`) | resultado tem 8 (`…` no orçamento) |
| Locale                            | inexistente                   | default pt-BR, configurável     |

---

## 📦 Classe independente: `circle-text-library/conversor`

Mesmo tratamento do Timezone — subpath próprio (o nome do import continua `/conversor`,
como você pediu, mesmo com as classes renomeadas):

```jsonc
// package.json → exports
"./conversor": {
    "import":  "./dist/src/classes/conversor/index.js",
    "require": "./dist/src/classes/conversor/index.js",
    "types":   "./dist/src/classes/conversor/index.d.ts"
}
```

```typescript
import { NumberFormatter, TextFormatter, Formatter } from "circle-text-library/conversor"
```

**Independência real:** as classes não importam nenhuma outra da lib (já é o caso hoje) e só
usam APIs nativas (`Intl`, `String`). O facade continua reexportando tudo para quem quer junto.

---

## 🔁 Migração (de → para)

| Hoje                                          | Proposta                              | Compat?            |
| --------------------------------------------- | ------------------------------------- | ------------------ |
| `new Conversor()`                             | `new Formatter()` (ou nada — use estáticos) | `Conversor` = alias |
| `c.formatNumWithDots(n)`                      | `num.thousands(n)`                    | alias mantido       |
| `c.convertNumToShortUnitText(n)`              | `num.compact(n)`                      | alias (formato muda: `"1.2 K"` → `"1,5 mil"`) |
| `c.formatSliceNumWithDots({ text, size })`    | `text.truncate(text, size)`           | alias mantido       |
| `c.capitalizeFirstLetter(t)`                  | `text.capitalize(t)`                  | alias mantido       |
| `c.invertStr(t)`                              | `text.reverse(t)`                     | alias mantido       |
| `import { Conversor } from "circle-text-library"` | `import { Formatter } from "circle-text-library/conversor"` | ambos funcionam |

> Atenção: `compact` muda o **formato de saída** (passa a ser locale-aware). Se algum lugar
> depende do literal `"1.2 K"`, mantenha o alias antigo ou fixe `locale: "en"` e ajuste.

---

## 📊 Antes vs. Depois

| Critério                       | Antes (`Conversor`)                  | Depois                                  |
| ------------------------------ | ------------------------------------ | --------------------------------------- |
| Nome da classe                 | `Conversor` (PT, genérico)           | `NumberFormatter` / `TextFormatter`     |
| Nomes de método                | descrevem implementação              | descrevem intenção                      |
| Número                         | matemática de string com bugs        | `Intl` nativo, correto                  |
| Locale                         | nenhum                               | default pt-BR, configurável             |
| Como usar                      | `new Conversor()` + método           | estático (sem `new`) ou instância       |
| Funcionalidades                | 6 utilitários                        | + moeda, %, ordinal, fileSize, slug, initials, titleCase, stripAccents… |
| Emoji / surrogate pairs        | `invertStr` quebra                   | `[...t]` preserva                       |
| `truncate` respeita o tamanho  | não (`+"..."` estoura)               | sim (`…` dentro do orçamento)           |
| Independente (`/conversor`)    | não                                  | sim                                     |
