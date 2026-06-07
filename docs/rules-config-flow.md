# 🧩 Configuração de Regras & Regex — Menos Verboso, Mais Seguro (proposta de redesign)

> Objetivo: escrever regras de validação com **menos texto** e configurar regex por
> **intenção** (não por fragmento cru), mantendo 100% das funcionalidades atuais —
> e, de quebra, eliminando uma classe inteira de bugs de regex.

---

## 🔴 O problema atual

### a) Verbosidade: `{ enabled: true, value: X }` em toda regra

```typescript
username: {
    minLength: { enabled: true, value: 4 },
    maxLength: { enabled: true, value: 20 },
    allowedCharacters: { enabled: true, value: "[a-z0-9_]." },
    cannotStartWith: { enabled: true, value: "_." },
    cannotContainConsecutive: { enabled: true, value: "._" },
    requireCapitalization: { enabled: true, value: true },
    allowAtPrefix: { enabled: true, value: "@" }
}
```

Se a regra está no objeto, ela obviamente está "habilitada" — `enabled: true` é ruído em
~99% dos casos. E `value:` envolve cada número/booleano num objeto só para informar o óbvio.

### b) Regex cru interpolado: produtivo de escrever, fácil de errar

Os valores de `allowedCharacters`, `cannotStartWith`, `cannotEndWith` viram regex por
**interpolação de string** dentro do validador:

```typescript
new RegExp(`^${rules.allowedCharacters.value}+$`)   // allowedCharacters
new RegExp(`^${rules.cannotStartWith.value}`)       // cannotStartWith
new RegExp(`${rules.cannotEndWith.value}$`)         // cannotEndWith
```

O dev precisa adivinhar como o valor será embrulhado — e o próprio exemplo do README tem
**dois bugs** por causa disso:

```typescript
// allowedCharacters: "[a-z0-9_]."  →  new RegExp("^[a-z0-9_].+$")
//   = ^ , 1 char da classe , QUALQUER coisa (.+) , $
//   ⚠️ o "." está FORA da classe → vira coringa: aceita praticamente qualquer string

// cannotStartWith: "_."  →  new RegExp("^_.")  =  /^_./
//   = "_" seguido de um char qualquer
//   ⚠️ NÃO bloqueia username que começa com "." (".joao" passa!)
//   ⚠️ a intenção era "não pode começar com _ OU .", que seria /^[_.]/
```

Ou seja: a configuração de regex cru é compacta, mas vaza a semântica do `RegExp` para
quem escreve a regra e transforma erros de escape em falhas silenciosas de validação.

---

## 💡 O princípio

1. **Valor curto por padrão.** Se você cita a regra, ela está ligada. O valor cru basta;
   a forma longa fica reservada para quando você quer uma mensagem de erro custom.
2. **Intenção, não regex.** Você descreve *quais caracteres* quer permitir/proibir; a lib
   monta o `RegExp` correto, escapado e embrulhado conforme cada regra. Regex cru continua
   disponível como escape hatch explícito para casos avançados.

---

## ✅ O fluxo

### Antes → Depois (mesmo comportamento, sem o ruído)

```typescript
// ── ANTES ──────────────────────────────────────────
username: {
    minLength: { enabled: true, value: 4 },
    maxLength: { enabled: true, value: 20 },
    allowedCharacters: { enabled: true, value: "[a-z0-9_]." },
    cannotStartWith: { enabled: true, value: "_." },
    cannotContainConsecutive: { enabled: true, value: "._" },
    requireCapitalization: { enabled: true, value: true },
    allowAtPrefix: { enabled: true, value: "@" }
}

// ── DEPOIS ─────────────────────────────────────────
import { charset, chars } from "circle-text-library"

username: {
    minLength: 4,
    maxLength: 20,
    allowedCharacters: charset.lower.digit.chars("_."),  // → [a-z0-9_] , escapado e embrulhado
    cannotStartWith: chars("_."),                        // → /^[_.]/  (corrige o bug do "._")
    cannotContainConsecutive: chars("_."),
    requireCapitalization: true,
    allowAtPrefix: true
}
```

### Os valores aceitos por regra (tabela de açúcar)

| Você escreve                          | A lib normaliza para                          |
| ------------------------------------- | --------------------------------------------- |
| `minLength: 4`                        | `{ enabled: true, value: 4 }`                 |
| `requireUppercase: true`              | `{ enabled: true, value: true }`              |
| `allowAtPrefix: "@"`                  | `{ enabled: true, value: "@" }`               |
| `minLength: false`                    | `{ enabled: false }` (desliga sem apagar)     |
| `minLength: { value: 4, message: "Curto demais" }` | forma longa, só p/ mensagem custom |
| `cannotStartWith: chars("_.")`        | conjunto `[_.]`, escapado                      |
| `allowedCharacters: charset.lower.digit` | classe `[a-z0-9]`, escapada e embrulhada    |
| `allowedCharacters: pattern(/^[\p{L}\d]+$/u)` | regex cru, usado como está (escape hatch) |

### Charset declarativo

```typescript
charset.lower      // a-z
charset.upper      // A-Z
charset.digit      // 0-9
charset.alpha      // a-zA-Z
charset.alnum      // a-zA-Z0-9
charset.accented   // À-ÿ  (acentos PT-BR)
charset.space      // \s
charset.lower.digit.chars("._-")   // composição encadeada, literais escapados
```

### Escape hatch para casos avançados

```typescript
import { pattern } from "circle-text-library"

// Quando você REALMENTE quer um regex específico (ex.: unicode property escapes):
allowedCharacters: pattern(/^[\p{L}\p{N}_]+$/u)
```

> Tudo isso compõe com os docs anteriores: você **define a base 1×** (com presets reutilizáveis)
> e faz **override pontual** via `validate.with(...)` — agora sem repetir `{ enabled, value }`.

---

## 🛠️ Como atingimos isso

A estratégia é um **normalizador puro** na entrada do `Validator`: ele transforma a config
enxuta na `ValidationConfig` interna de hoje e **pré-compila** cada regra para um `RegExp`.
O motor de validação (`applyXRules`) fica praticamente igual — só passa a consumir regex já
pronto em vez de interpolar string a cada chamada.

### a) Normalização do valor da regra (mata o `{ enabled, value }`)

```typescript
export type RuleInput<T> =
    | T                                                   // 4, true, "@"  → { enabled:true, value }
    | CharSet | Pattern                                   // charset/chars/pattern
    | false                                               // desliga a regra
    | { value: T | CharSet | Pattern; message?: string; enabled?: boolean }

function normalizeRule<T>(input: RuleInput<T> | undefined): ValidationRule | undefined {
    if (input === undefined) return undefined
    if (input === false) return { enabled: false }
    if (isLongForm(input)) {
        return { enabled: input.enabled ?? true, value: input.value, description: input.message }
    }
    return { enabled: true, value: input as T }           // valor cru
}
```

### b) Charset seguro (mata o regex cru e o bug de escape)

```typescript
const escapeClass = (s: string) => s.replace(/[\]\\^]/g, "\\$&").replace(/-/g, "\\-")

export class CharSet {
    constructor(private readonly body: string = "") {}
    private add(part: string) { return new CharSet(this.body + part) }
    get lower()    { return this.add("a-z") }
    get upper()    { return this.add("A-Z") }
    get digit()    { return this.add("0-9") }
    get alpha()    { return this.add("a-zA-Z") }
    get alnum()    { return this.add("a-zA-Z0-9") }
    get accented() { return this.add("À-ÿ") }
    get space()    { return this.add("\\s") }
    chars(literal: string) { return this.add(escapeClass(literal)) }
    toClassBody()  { return this.body }                   // ex.: "a-z0-9_"
}
export const charset = new CharSet()
export const chars = (literal: string) => new CharSet().chars(literal)

export class Pattern { constructor(readonly re: RegExp) {} }
export const pattern = (re: RegExp) => new Pattern(re)
```

### c) Compilação por regra (centraliza o que estava espalhado em 20 `new RegExp`)

A construção do regex passa a ser **consciente da regra** — é aqui que a embalagem correta
(`^[...]+$` vs `^[...]` vs `[...]$`) acontece uma vez só, em vez de o dev adivinhar:

```typescript
// mode descreve como a regra usa a classe de caracteres
type Mode = "wholeMatch" | "startsWith" | "endsWith"

function compile(value: unknown, mode: Mode): RegExp {
    if (value instanceof Pattern) return value.re                      // cru, como está
    const body = value instanceof CharSet ? value.toClassBody()
               : escapeClass(String(value))                           // string simples → literais
    switch (mode) {
        case "wholeMatch": return new RegExp(`^[${body}]+$`)
        case "startsWith": return new RegExp(`^[${body}]`)            // /^[_.]/  ✔ corrige o bug
        case "endsWith":   return new RegExp(`[${body}]$`)
    }
}
```

`allowedCharacters` usa `wholeMatch`, `cannotStartWith` usa `startsWith`, `cannotEndWith`
usa `endsWith`. `cannotContainConsecutive` **mantém a semântica atual** (checa repetição
caractere a caractere a partir da lista literal `chars("_.")`), então continua igual.

### d) Wiring

```typescript
// Validator normaliza na entrada; o resto do motor não muda.
constructor(base: TerseValidationConfig = {}) {
    this.base = defineRules(base)        // TerseValidationConfig → ValidationConfig + regex pré-compilado
}
```

`defineRules` também é exportado para uso avulso:

```typescript
import { defineRules } from "circle-text-library"
const rules = defineRules({ username: { minLength: 4, allowedCharacters: charset.lower.digit } })
```

---

## 🐛 Bônus: o refactor corrige bugs reais

| Config                          | Hoje compila para        | Resultado hoje                         | Depois (`chars`/`charset`) |
| ------------------------------- | ------------------------ | -------------------------------------- | -------------------------- |
| `cannotStartWith: "_."`         | `/^_./`                  | `.joao` **passa** (deveria bloquear)   | `/^[_.]/` → bloqueia ✔     |
| `allowedCharacters: "[a-z0-9_]."` | `/^[a-z0-9_].+$/`      | `joao!!!@#$` **passa** (`.` virou coringa) | `/^[a-z0-9_]+$/` ✔     |

---

## 📊 Antes vs. Depois

| Critério                          | Antes                                   | Depois                                  |
| --------------------------------- | --------------------------------------- | --------------------------------------- |
| Boilerplate por regra             | `{ enabled: true, value: X }`           | `X` (valor cru)                         |
| Linhas do exemplo `username`      | 7 regras × objeto                       | mesmas 7 regras, ~1 valor cada          |
| Configurar caracteres             | fragmento de regex cru                  | `charset` / `chars` (intenção)          |
| Escape de caracteres especiais    | responsabilidade do dev (erra fácil)    | automático                              |
| Onde o `RegExp` é montado         | 20 `new RegExp` espalhados nos apply    | 1 `compile()` central, pré-compilado    |
| Custo de compilar regex           | a cada chamada de validação             | 1× na configuração                      |
| Bugs de regex do README           | 2 silenciosos                           | corrigidos por construção               |
| Regex avançado ainda possível     | sim (é o único modo)                    | sim, via `pattern()` explícito          |
