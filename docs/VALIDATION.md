# Sistema de Validação

O módulo de validação fornece regras configuráveis para validar usernames, passwords, URLs, hashtags e outros tipos de entrada.

## Índice

- [Configuração](#configuração)
- [Tipos de Validação](#tipos-de-validação)
- [Regras Disponíveis](#regras-disponíveis)
- [Mensagens Customizadas](#mensagens-customizadas)
- [Validação em Runtime](#validação-em-runtime)

## Configuração

### Estrutura de Regras

Cada regra segue o padrão:

```typescript
interface ValidationRule {
    enabled: boolean // Habilitar/desabilitar regra
    value?: any // Valor da regra (string, number, boolean, array)
    description?: string // Mensagem de erro customizada
}
```

### Exemplo Básico

```typescript
const textLib = new TextLibrary({
    validationRules: {
        username: {
            minLength: {
                enabled: true,
                value: 3,
                description: "Username deve ter no mínimo 3 caracteres"
            },
            maxLength: {
                enabled: true,
                value: 20,
                description: "Username deve ter no máximo 20 caracteres"
            }
        }
    }
})
```

## Tipos de Validação

### 1. Username

Validação de nomes de usuário.

```typescript
validationRules: {
  username: {
    minLength: { enabled: true, value: 3 },
    maxLength: { enabled: true, value: 20 },
    allowedCharacters: { enabled: true, value: "[a-z0-9_]" },
    cannotStartWith: { enabled: true, value: "_" },
    cannotEndWith: { enabled: true, value: "_" },
    cannotContainConsecutive: { enabled: true, value: "__" },
    allowAtPrefix: { enabled: true, value: "@" }
  }
}

// Uso
const result = textLib.validator.username("john_doe")
// { isValid: true, errors: [] }

const invalid = textLib.validator.username("_invalid")
// { isValid: false, errors: ["Username não pode começar com _"] }
```

### 2. Password

Validação robusta de senhas com múltiplas regras de segurança.

```typescript
validationRules: {
  password: {
    minLength: { enabled: true, value: 8 },
    maxLength: { enabled: true, value: 32 },
    requireUppercase: { enabled: true, value: true },
    requireLowercase: { enabled: true, value: true },
    requireNumbers: { enabled: true, value: true },
    requireSpecialChars: { enabled: true, value: true },
    allowedSpecialChars: { enabled: true, value: "!@#$%^&*" },
    cannotBeRepeatedChars: { enabled: true, value: true },
    cannotBeSequentialChars: { enabled: true, value: true },
    forbiddenWords: { enabled: true, value: ["password", "admin"] }
  }
}

// Uso
const result = textLib.validator.password("MyStr0ng!Pass")
// { isValid: true, errors: [] }
```

### 3. Hashtag

Validação de hashtags.

```typescript
validationRules: {
  hashtag: {
    requiredPrefix: { enabled: true, value: "#" },
    minLength: { enabled: true, value: 3 },
    maxLength: { enabled: true, value: 50 },
    allowedCharacters: { enabled: true, value: "[a-zA-Z0-9]" },
    cannotStartWith: { enabled: true, value: "[0-9]" },
    cannotEndWith: { enabled: true, value: "_" }
  }
}

// Uso
const result = textLib.validator.hashtag("#technology")
// { isValid: true, errors: [] }
```

### 4. URL

Validação de URLs.

```typescript
validationRules: {
  url: {
    requireProtocol: { enabled: true, value: true },
    allowedProtocols: { enabled: true, value: ["http", "https"] },
    minLength: { enabled: true, value: 10 },
    maxLength: { enabled: true, value: 2048 }
  }
}

// Uso
const result = textLib.validator.url("https://example.com")
// { isValid: true, errors: [] }
```

### 5. Name

Validação de nomes de pessoa.

```typescript
validationRules: {
  name: {
    minLength: { enabled: true, value: 2 },
    maxLength: { enabled: true, value: 100 },
    requireFullName: { enabled: true, value: true },
    requireCapitalization: { enabled: true, value: true },
    cannotContainNumbers: { enabled: true, value: true },
    cannotContainSpecialChars: { enabled: true, value: true },
    forbiddenNames: { enabled: true, value: ["admin", "test"] }
  }
}

// Uso
const result = textLib.validator.name("João Silva")
// { isValid: true, errors: [] }
```

### 6. Description

Validação de descrições de perfil.

```typescript
validationRules: {
  description: {
    minLength: { enabled: true, value: 10 },
    maxLength: { enabled: true, value: 200 },
    requireAlphanumeric: { enabled: true, value: true },
    forbiddenWords: { enabled: true, value: ["spam", "bot"] },
    allowUrls: { enabled: false, value: false },
    allowMentions: { enabled: false, value: false },
    allowHashtags: { enabled: false, value: false }
  }
}

// Uso
const result = textLib.validator.description("Desenvolvedor apaixonado por tecnologia")
// { isValid: true, errors: [] }
```

## Regras Disponíveis

### Regras Gerais

| Regra               | Tipo       | Descrição                      | Exemplo                                |
| ------------------- | ---------- | ------------------------------ | -------------------------------------- |
| `minLength`         | `number`   | Comprimento mínimo             | `{ enabled: true, value: 3 }`          |
| `maxLength`         | `number`   | Comprimento máximo             | `{ enabled: true, value: 20 }`         |
| `allowedCharacters` | `string`   | Regex de caracteres permitidos | `{ enabled: true, value: "[a-z0-9]" }` |
| `forbiddenWords`    | `string[]` | Lista de palavras proibidas    | `{ enabled: true, value: ["spam"] }`   |
| `cannotStartWith`   | `string`   | Regex de início proibido       | `{ enabled: true, value: "[0-9]" }`    |
| `cannotEndWith`     | `string`   | Regex de fim proibido          | `{ enabled: true, value: "_" }`        |

### Regras Específicas de Password

| Regra                     | Tipo      | Descrição                                  |
| ------------------------- | --------- | ------------------------------------------ |
| `requireUppercase`        | `boolean` | Exige letra maiúscula                      |
| `requireLowercase`        | `boolean` | Exige letra minúscula                      |
| `requireNumbers`          | `boolean` | Exige números                              |
| `requireSpecialChars`     | `boolean` | Exige caracteres especiais                 |
| `allowedSpecialChars`     | `string`  | Caracteres especiais permitidos            |
| `cannotBeRepeatedChars`   | `boolean` | Bloqueia caracteres repetidos consecutivos |
| `cannotBeSequentialChars` | `boolean` | Bloqueia sequências (abc, 123)             |
| `requireCommonPasswords`  | `boolean` | Bloqueia senhas comuns                     |

### Regras Específicas de Username

| Regra                      | Tipo     | Descrição                        |
| -------------------------- | -------- | -------------------------------- |
| `cannotContainConsecutive` | `string` | Bloqueia caracteres consecutivos |
| `allowAtPrefix`            | `string` | Permite prefixo @                |

### Regras Específicas de Name

| Regra                       | Tipo      | Descrição                      |
| --------------------------- | --------- | ------------------------------ |
| `requireFullName`           | `boolean` | Exige nome e sobrenome         |
| `requireCapitalization`     | `boolean` | Exige primeira letra maiúscula |
| `cannotContainNumbers`      | `boolean` | Bloqueia números               |
| `cannotContainSpecialChars` | `boolean` | Bloqueia caracteres especiais  |

## Mensagens Customizadas

### Mensagens Padrão

Cada regra tem uma mensagem padrão em português:

```typescript
const result = textLib.validator.username("ab")
// {
//   isValid: false,
//   errors: ["Username deve ter pelo menos 3 caracteres"]
// }
```

### Customização de Mensagens

Customize mensagens através do campo `description`:

```typescript
validationRules: {
  username: {
    minLength: {
      enabled: true,
      value: 3,
      description: "O nome de usuário precisa ter pelo menos 3 letras"
    }
  }
}

const result = textLib.validator.username("ab")
// {
//   isValid: false,
//   errors: ["O nome de usuário precisa ter pelo menos 3 letras"]
// }
```

## Validação em Runtime

### Regras Override

Você pode passar regras customizadas em runtime:

```typescript
const customRules = {
    minLength: { enabled: true, value: 5, description: "Mínimo 5 caracteres" },
    maxLength: { enabled: true, value: 15, description: "Máximo 15 caracteres" }
}

const result = textLib.validator.username("john", customRules)
```

### Múltiplos Erros

O validador acumula todos os erros encontrados:

```typescript
const result = textLib.validator.username("_a")
// {
//   isValid: false,
//   errors: [
//     "Username deve ter pelo menos 3 caracteres",
//     "Username não pode começar com _"
//   ]
// }
```

## Exemplos Práticos

### Validação de Formulário de Registro

```typescript
const textLib = new TextLibrary({
    validationRules: {
        username: {
            minLength: { enabled: true, value: 3, description: "Mínimo 3 caracteres" },
            maxLength: { enabled: true, value: 20, description: "Máximo 20 caracteres" },
            allowedCharacters: {
                enabled: true,
                value: "[a-z0-9_]",
                description: "Apenas letras minúsculas, números e underscore"
            }
        },
        password: {
            minLength: { enabled: true, value: 8, description: "Mínimo 8 caracteres" },
            requireUppercase: { enabled: true, value: true, description: "Deve conter maiúscula" },
            requireNumbers: { enabled: true, value: true, description: "Deve conter números" },
            requireSpecialChars: {
                enabled: true,
                value: true,
                description: "Deve conter caracteres especiais"
            }
        },
        name: {
            minLength: { enabled: true, value: 2, description: "Mínimo 2 caracteres" },
            requireFullName: { enabled: true, value: true, description: "Informe nome completo" },
            requireCapitalization: {
                enabled: true,
                value: true,
                description: "Primeira letra deve ser maiúscula"
            }
        }
    }
})

// Validar dados do formulário
function validateRegistration(data) {
    const usernameValidation = textLib.validator.username(data.username)
    const passwordValidation = textLib.validator.password(data.password)
    const nameValidation = textLib.validator.name(data.name)

    if (!usernameValidation.isValid) {
        return { field: "username", errors: usernameValidation.errors }
    }

    if (!passwordValidation.isValid) {
        return { field: "password", errors: passwordValidation.errors }
    }

    if (!nameValidation.isValid) {
        return { field: "name", errors: nameValidation.errors }
    }

    return { valid: true }
}
```

### Validação de Conteúdo de Post

```typescript
const textLib = new TextLibrary({
    validationRules: {
        hashtag: {
            requiredPrefix: { enabled: true, value: "#" },
            minLength: { enabled: true, value: 3 },
            allowedCharacters: { enabled: true, value: "[a-zA-Z0-9]" }
        },
        url: {
            requireProtocol: { enabled: true, value: true },
            allowedProtocols: { enabled: true, value: ["http", "https"] }
        }
    }
})

function validatePostContent(hashtags, urls) {
    const invalidHashtags = hashtags.filter((tag) => {
        return !textLib.validator.hashtag(tag).isValid
    })

    const invalidUrls = urls.filter((url) => {
        return !textLib.validator.url(url).isValid
    })

    return {
        hasErrors: invalidHashtags.length > 0 || invalidUrls.length > 0,
        invalidHashtags,
        invalidUrls
    }
}
```

## Próximos Passos

- [Guia de Configuração](./CONFIGURATION.md)
- [Sistema de Extração](./EXTRACTION.md)
- [Referência Completa da API](./API_REFERENCE.md)
