# ✅ Validator

Validação **configurável e orientada a dados** para os campos típicos de uma rede social: `username`, `hashtag`, `url`, `description`, `name`, `password`. Você define a política **uma vez** e sobrescreve **regras pontuais** por chamada — o override **mescla** sobre a base (não substitui).

```typescript
import { Validator, defineRules, charset, chars } from "circle-text-library/validator"
```

---

## Conceito central

Toda regra é um `ValidationRule { enabled: boolean, value?, description? }`. Quando `enabled` é `true`, o `Validator` monta dinamicamente a checagem a partir de `value` e, ao falhar, adiciona `description` (ou uma mensagem padrão em pt-BR) ao array `errors`.

Todos os métodos retornam o mesmo formato:

```typescript
interface ValidationResult {
    isValid: boolean
    errors: string[]   // mensagens em pt-BR; vazio quando válido
}
```

---

## API

| Método | Assinatura | Observação |
|--------|-----------|------------|
| `username` | `username(value: string, rules?: UsernameValidationRules)` | **Lança** se não houver regras na config nem na chamada |
| `hashtag` | `hashtag(value: string, rules?: HashtagValidationRules)` | **Lança** se não houver regras |
| `url` | `url(value: string, requireProtocol?: boolean, rules?: UrlValidationRules)` | `requireProtocol` é o 2º argumento (booleano) |
| `description` | `description(value: string, rules?: DescriptionValidationRules)` | Fallback: checagem mínima de não-vazio |
| `name` | `name(value: string, rules?: NameValidationRules)` | Fallback: checagem mínima |
| `password` | `password(value: string, rules?: PasswordValidationRules)` | Fallback: checagem mínima |

**Derivação de config (imutável):**

```typescript
new Validator(rules?: DeepPartial<ValidationConfig>)   // base
v.withConfig(patch)   // → novo Validator (merge sobre a base)
v.with(patch)         // idem (alias semântico p/ escopos derivados)
v.updateRules(patch)  // muta a instância atual no lugar (void)
v.config              // readonly: config canônica resolvida
```

A precedência é sempre: **argumento da chamada > config do construtor**.

---

## Uso básico

```typescript
const v = new Validator({
    username: {
        minLength: { enabled: true, value: 4 },
        maxLength: { enabled: true, value: 20 }
    },
    password: {
        minLength: { enabled: true, value: 8 },
        requireUppercase: { enabled: true, value: true },
        requireNumbers: { enabled: true, value: true }
    }
})

v.password("MyStr0ngPass")
// { isValid: true, errors: [] }

v.password("weak")
// {
//   isValid: false,
//   errors: [
//     "Senha deve ter pelo menos 8 caracteres",
//     "Senha deve conter pelo menos uma letra maiúscula",
//     "Senha deve conter pelo menos um número"
//   ]
// }
```

---

## Config enxuta + regex seguro (`defineRules` / `charset` / `chars`)

Em vez de escrever `{ enabled: true, value: X }` e fragmentos de regex crus, use a forma curta com os helpers de charset — eles **escapam** os caracteres e embrulham a classe corretamente.

```typescript
const v = new Validator(
    defineRules({
        username: {
            minLength: 4,                                        // → { enabled: true, value: 4 }
            maxLength: 20,
            allowedCharacters: charset.lower.digit.chars("_."),  // → [a-z0-9_.]
            cannotStartWith: chars("_.")                         // → /^[_.]/ (escapado)
        }
    })
)

v.username("joao_silva")
// { isValid: true, errors: [] }

v.username("Jo")
// { isValid: false, errors: ["Username deve ter pelo menos 4 caracteres", "Caracteres inválidos encontrados"] }
```

### Builder de charset

Encadeie classes e termine com `.chars("…")` para caracteres literais:

| Acessor | Adiciona |
|---------|----------|
| `.lower` | `a-z` |
| `.upper` | `A-Z` |
| `.digit` | `0-9` |
| `.alpha` | `a-zA-Z` |
| `.alnum` | `a-zA-Z0-9` |
| `.accented` | `À-ÿ` |
| `.space` | `\s` |
| `.chars("_.")` | literais escapados |

```typescript
charset.lower.digit.chars("_.").toClass()      // "[a-z0-9_.]"
charset.alpha.accented.space.toClassBody()     // "a-zA-ZÀ-ÿ\\s"
chars("!@#").toClass()                          // "[!@#]"
```

---

## Override pontual (merge, não substituição)

```typescript
const v = new Validator({ username: { minLength: { enabled: true, value: 4 } } })

// Nesta chamada o mínimo vira 2; o resto da base continua valendo
v.username("jo", { minLength: { value: 2 } })
// { isValid: true, errors: [] }
```

---

## Escopo derivado (`.with()`)

Útil para fluxos com políticas mais rígidas (ex.: onboarding) reusando o resto da base:

```typescript
const base = new Validator({ password: { minLength: { enabled: true, value: 8 } } })
const onboarding = base.with({ password: { minLength: { value: 12 } } })

onboarding.password("Short1")   // mais rígido
base.password("Short1")          // base intacta
```

---

## Casos de uso

### Cadastro de usuário (username + senha)

```typescript
const signup = new Validator(
    defineRules({
        username: { minLength: 3, maxLength: 20, allowedCharacters: charset.lower.digit.chars("_.") },
        password: { minLength: 8, requireUppercase: true, requireLowercase: true, requireNumbers: true }
    })
)

function validateSignup(user: string, pass: string) {
    const u = signup.username(user)
    const p = signup.password(pass)
    return { ok: u.isValid && p.isValid, errors: [...u.errors, ...p.errors] }
}
```

### Validar URL exigindo protocolo

```typescript
const v = new Validator()
v.url("example.com", true)            // requireProtocol = true → inválido (sem http/https)
v.url("https://example.com", true)    // válido
```

### Bio/descrição sem links nem palavras proibidas

```typescript
const v = new Validator({
    description: {
        maxLength: { enabled: true, value: 200 },
        allowUrls: { enabled: true, value: false },
        forbiddenWords: { enabled: true, value: ["spam", "golpe"] }
    }
})
v.description("Visite golpe.com agora")
// { isValid: false, errors: [...] }
```

> A lista completa de regras por campo vive em `validator.types.ts` (ex.: `requireSpecialCharacters`, `cannotContainConsecutive`, `cannotBeSequentialChars`, `requireFullName`, `requireCapitalization`, etc.).
