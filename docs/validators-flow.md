# ✅ Validadores — Ciclo de Vida Ideal (proposta de redesign)

> Objetivo: **definir a política de validação uma única vez** (no boot da app) e, para
> exceções pontuais, passar apenas as regras que mudam — mescladas sobre a base, sem
> reconfigurar tudo e sem reinstanciar a lib.

---

## 🔴 O problema atual

Hoje (`src/classes/validator/index.ts`) cada método público faz `rules || this.config.X`:

```typescript
public username(username: string, rules?: UsernameValidationRules): ValidationResult {
    const rulesToUse = rules || this.config.username   // ⚠️ OU um, OU outro
    ...
}
```

Isso gera quatro atritos no ciclo de vida:

1. **Override por chamada *substitui* a base inteira — não mescla.** Se você definiu
   `username` com 5 regras no construtor e quer só apertar o `minLength` numa tela
   específica, passar `{ minLength: { value: 8 } }` **descarta** as outras 4 regras
   (`maxLength`, `allowedCharacters`, `cannotStartWith`, `cannotContainConsecutive`).
   Para mudar 1 regra você é obrigado a repetir as 5. É o oposto de "config pontual".

2. **`validationRules` é obrigatório no construtor.** `CircleTextProps.validationRules` não
   é opcional — quem só usa `sentiment` ou `timezone` ainda precisa passar regras de
   validação. Os validadores ficam acoplados ao resto da lib.

3. **Comportamento inconsistente quando não há regra.** `username`/`hashtag` lançam erro;
   `url`/`description`/`name`/`password` caem num fallback mínimo silencioso. O mesmo
   "não configurado" se comporta de duas formas diferentes.

4. **`url` tem parâmetro posicional solto.** A assinatura é
   `url(url, requireProtocol?, rules?)` — `requireProtocol` já é expressável como regra
   (`requireProtocol: { enabled, value }`), então ele quebra o padrão `(valor, override?)`
   dos outros cinco.

---

## 💡 O princípio: definir 1×, sobrescrever pontualmente (merge)

A base é a **política**; o override de chamada é uma **exceção local** que é mesclada por
cima — campo a campo — sem mutar a base e sem precisar repetir o que não muda.

```
Base (definida 1× no boot)        Override pontual (1 chamada)      Regra efetiva
──────────────────────────        ──────────────────────────       ──────────────
minLength:  { enabled, value:4 }   minLength: { value: 8 }     ►    { enabled, value:8 }
maxLength:  { enabled, value:20 }  (não mencionado)            ►    { enabled, value:20 }
allowedCharacters: {...}           (não mencionado)            ►    {...}  (preservado)
```

O override só toca no que cita. Tudo o mais vem da base.

---

## 🔄 O ciclo de vida ideal (4 estados)

```
1. CONFIGURAÇÃO (1×)        new TextLibrary({ validationRules: {...} })
        │                   define a política completa, no boot
        ▼
2. REUSO (N×)               circleText.validate.username(value)
        │                   zero config — usa a base
        ▼
3. EXCEÇÃO PONTUAL          circleText.validate.username(value, { minLength: { value: 8 } })
        │                   merge sobre a base, só para esta chamada (base intacta)
        ▼
4. ESCOPO DERIVADO          const onboarding = circleText.validate.with({ username: {...} })
                            uma seção inteira da app com base mesclada, sem reinstanciar a lib
```

---

## ✅ O fluxo

### 1. Definir tudo uma vez (no boot)

```typescript
const circleText = new TextLibrary({
    validationRules: {
        username: {
            minLength: { enabled: true, value: 4 },
            maxLength: { enabled: true, value: 20 },
            allowedCharacters: { enabled: true, value: "[a-z0-9_]." },
            cannotStartWith: { enabled: true, value: "_." }
        },
        password: {
            minLength: { enabled: true, value: 8 },
            requireUppercase: { enabled: true, value: true },
            requireNumbers: { enabled: true, value: true }
        }
    }
})
```

### 2. Reuso — sem repetir config

```typescript
circleText.validate.username("joao_silva")
// ✅ { isValid: true, errors: [] }   (usa a base, zero config)

circleText.validate.password("MyStr0ng")
// ✅ usa a base
```

### 3. Exceção pontual — merge sobre a base

```typescript
// Só nesta tela o username precisa ter no mínimo 8 caracteres.
// As outras regras (maxLength, allowedCharacters, cannotStartWith) continuam valendo.
circleText.validate.username("joao", { minLength: { value: 8 } })
// ✅ { isValid: false, errors: ["Username deve ter pelo menos 8 caracteres"] }
//    maxLength=20, allowedCharacters e cannotStartWith vieram da base, intactos

// A base NÃO foi alterada:
circleText.validate.username("joao")
// ✅ { isValid: true }   (volta ao minLength=4 da base)
```

### 4. Escopo derivado — uma seção inteira, sem reinstanciar

```typescript
// Fluxo de onboarding tem regras mais rígidas de senha, reaproveitando o resto da base.
const onboarding = circleText.validate.with({
    password: { minLength: { value: 12 }, requireSpecialChars: { enabled: true, value: true } }
})

onboarding.password("Short1")        // ✅ valida com minLength=12 + especiais
onboarding.username("joao_silva")    // ✅ herda a base de username sem mudanças
```

> `.with()` devolve um namespace de validação com a base mesclada, **reaproveitando a mesma
> instância** — não reinicializa sentiment/keyword/timezone.

---

## 🛠️ Como atingimos isso

### a) Merge profundo de regras (campo a campo)

```typescript
// Override vence; base preenche o que não foi mencionado. Não muta nenhum dos dois.
function mergeRules<R extends Record<string, ValidationRule>>(base: R = {} as R, override?: Partial<R>): R {
    if (!override) return base
    const out: R = { ...base }
    for (const key of Object.keys(override) as (keyof R)[]) {
        const b = base[key]
        const o = override[key]
        // nível do campo da regra: { enabled, value, description }
        out[key] = (b && o ? { ...b, ...o } : (o ?? b)) as R[keyof R]
    }
    return out
}
```

### b) `Validator` com base opcional e fluxo único

```typescript
export class Validator {
    constructor(private readonly base: ValidationConfig = {}) {}   // base agora opcional

    public username(value: string, override?: UsernameValidationRules) {
        return this.run("username", value, override, applyUsernameRules)
    }
    public hashtag(value: string, override?: HashtagValidationRules) {
        return this.run("hashtag", value, override, applyHashtagRules)
    }
    public url(value: string, override?: UrlValidationRules) {            // ⬅️ sem requireProtocol posicional
        return this.run("url", value, override, applyUrlRules)
    }
    public description(value: string, override?: DescriptionValidationRules) {
        return this.run("description", value, override, applyDescriptionRules)
    }
    public name(value: string, override?: NameValidationRules) {
        return this.run("name", value, override, applyNameRules)
    }
    public password(value: string, override?: PasswordValidationRules) {
        return this.run("password", value, override, applyPasswordRules)
    }

    /** Deriva um Validator com a base mesclada, sem reinstanciar a lib. */
    public with(overrides: ValidationConfig): Validator {
        const merged = { ...this.base }
        for (const type of Object.keys(overrides) as (keyof ValidationConfig)[]) {
            merged[type] = mergeRules(this.base[type] as any, overrides[type] as any)
        }
        return new Validator(merged)
    }

    private run<R extends Record<string, ValidationRule>>(
        type: keyof ValidationConfig,
        value: string,
        override: R | undefined,
        apply: (value: string, rules: R) => ValidationResult
    ): ValidationResult {
        const rules = mergeRules(this.base[type] as R, override)   // ⬅️ MERGE, não "OU"
        if (!rules || Object.keys(rules).length === 0) {
            // comportamento ÚNICO para os 6 tipos:
            throw new Error(
                `Nenhuma regra de validação configurada para "${type}". ` +
                `Defina em new TextLibrary({ validationRules: { ${type}: {...} } }) ou passe regras na chamada.`
            )
        }
        return apply(value, rules)
    }
}
```

Os `applyXRules` são **os mesmos de hoje** (a lógica que monta os `RegExp` e empilha
`errors`), só que agora sempre recebem as regras já mescladas — some toda a duplicação de
`rules || this.config.X` espalhada pelos métodos públicos.

### c) Wiring no facade (`src/index.ts`)

```typescript
this.validator = new Validator(config.validationRules)   // config.validationRules agora opcional

const ns = (v: Validator): CircleTextValidation => ({
    username:    (val, o) => v.username(val, o),
    hashtag:     (val, o) => v.hashtag(val, o),
    url:         (val, o) => v.url(val, o),
    description: (val, o) => v.description(val, o),
    name:        (val, o) => v.name(val, o),
    password:    (val, o) => v.password(val, o),
    with:        (overrides) => ns(v.with(overrides))     // escopo derivado
})

this.validate = ns(this.validator)
```

### d) `CircleTextProps` desacoplado

```typescript
export interface CircleTextProps {
    validationRules?: ValidationConfig   // ⬅️ agora opcional
    keywordConfig?: KeywordExtractorConfig
    sentimentConfig?: SentimentExtractorConfig
    timezoneConfig?: TimezoneConfig
}
```

> Bônus: como `Validator` já é uma classe independente, dá para expor um subpath
> `circle-text-library/validator` no `package.json` e usá-lo sozinho, sem subir o resto da lib.

---

## 🔁 Migração (de → para)

| Hoje                                                        | Proposta                                              |
| ----------------------------------------------------------- | ----------------------------------------------------- |
| `validate.username(v, { ...todas as 5 regras de novo })`    | `validate.username(v, { minLength: { value: 8 } })`   |
| Override **substitui** a base                               | Override **mescla** sobre a base                      |
| `validate.url(v, true, rules)` (posicional)                 | `validate.url(v, { requireProtocol: { enabled: true, value: true } })` |
| `validationRules` obrigatório                               | `validationRules` opcional                            |
| `url/description/name/password` caem em fallback silencioso | erro único e descritivo p/ os 6 tipos sem regra       |
| Re-`new TextLibrary(...)` p/ um conjunto de regras diferente | `validate.with({ ... })` (mesma instância)            |

---

## 📊 Antes vs. Depois

| Critério                          | Antes                                  | Depois                                  |
| --------------------------------- | -------------------------------------- | --------------------------------------- |
| Override pontual                  | repete todas as regras do tipo         | só as regras que mudam (merge)          |
| `validationRules`                 | obrigatório (acopla a lib toda)        | opcional (validadores independentes)    |
| "Não configurado"                 | 2 comportamentos (throw vs fallback)   | 1 erro único e descritivo               |
| Assinatura dos 6 validadores      | `url` foge do padrão                   | todos `(valor, override?)`              |
| Conjunto de regras alternativo    | reinstanciar a lib inteira             | `validate.with()` na mesma instância    |
| Mutação acidental da base         | possível via override mal-entendido    | base imutável; override nunca a altera  |
