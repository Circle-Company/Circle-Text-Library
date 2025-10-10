# Guia de Configuração

Este documento fornece instruções completas para configurar a Circle Text Library de acordo com as necessidades da sua aplicação.

## Índice

- [Inicialização Básica](#inicialização-básica)
- [Configuração por Módulo](#configuração-por-módulo)
- [Configuração Completa](#configuração-completa)
- [Boas Práticas](#boas-práticas)

## Inicialização Básica

A biblioteca é inicializada através da classe `TextLibrary` que recebe um objeto de configuração:

```typescript
import { TextLibrary } from "circle-text-library"

const textLib = new TextLibrary({
    validationRules: {
        // Configurações de validação (obrigatório)
    }
    // Demais configurações opcionais
})
```

### Propriedades de Configuração

| Propriedade           | Tipo                       | Obrigatório | Descrição                                           |
| --------------------- | -------------------------- | ----------- | --------------------------------------------------- |
| `validationRules`     | `ValidationConfig`         | Sim         | Regras de validação para usernames, passwords, etc. |
| `extractorConfig`     | `ExtractorConfig`          | Não         | Configuração do extrator de entidades               |
| `sentimentConfig`     | `SentimentExtractorConfig` | Não         | Configuração da análise de sentimento               |
| `conversorConfig`     | `ConversorConfig`          | Não         | Configuração do conversor numérico                  |
| `dateFormatterConfig` | `DateFormatterConfig`      | Não         | Configuração do formatador de datas                 |
| `richTextConfig`      | `RichTextConfig`           | Não         | Configuração do formatador de rich text             |

## Configuração por Módulo

### 1. Validação

Configuração das regras de validação para diferentes tipos de entrada.

```typescript
validationRules: {
  username: {
    minLength: { enabled: true, value: 3, description: "Mínimo 3 caracteres" },
    maxLength: { enabled: true, value: 20, description: "Máximo 20 caracteres" },
    allowedCharacters: { enabled: true, value: "[a-z0-9_]", description: "Apenas minúsculas, números e underscore" }
  },
  password: {
    minLength: { enabled: true, value: 8, description: "Mínimo 8 caracteres" },
    requireUppercase: { enabled: true, value: true, description: "Deve conter letra maiúscula" },
    requireNumbers: { enabled: true, value: true, description: "Deve conter números" },
    requireSpecialChars: { enabled: true, value: true, description: "Deve conter caracteres especiais" }
  }
}
```

**Documentação Completa:** [Sistema de Validação](./VALIDATION.md)

### 2. Extração

Configuração dos prefixos para extração de entidades.

```typescript
extractorConfig: {
  mentionPrefix: '@',  // Prefixo para menções (padrão: '@')
  hashtagPrefix: '#',  // Prefixo para hashtags (padrão: '#')
  urlPattern: /https?:\/\/[^\s]+/g  // Pattern para URLs (opcional)
}
```

**Documentação Completa:** [Sistema de Extração](./EXTRACTION.md)

### 3. Análise de Sentimento

Configuração da análise de sentimento.

```typescript
sentimentConfig: {
  language: 'pt-BR',  // Idioma da análise (padrão: 'pt-BR')
  enableCache: true,  // Cache de resultados (padrão: true)
  intensityThreshold: {
    positive: 0.1,    // Limiar para sentimento positivo
    negative: -0.1    // Limiar para sentimento negativo
  }
}
```

**Documentação Completa:** [Análise de Sentimento](./SENTIMENT.md)

### 4. Conversor

Configuração da formatação de números e textos.

```typescript
conversorConfig: {
  thousandsSeparator: '.',      // Separador de milhares (padrão: '.')
  decimalSeparator: ',',        // Separador decimal (padrão: ',')
  defaultSliceLength: 100,      // Tamanho padrão para corte de texto
  sliceSuffix: '...'           // Sufixo para texto cortado (padrão: '...')
}
```

**Documentação Completa:** [Conversor Numérico](./CONVERSOR.md)

### 5. Formatador de Datas

Configuração da formatação de datas para texto humanizado.

```typescript
dateFormatterConfig: {
  style: 'full',                    // Estilo: 'full' | 'short' | 'abbreviated'
  locale: 'pt-BR',                  // Locale para formatação
  usePrefix: false,                 // Usar "há" antes do tempo
  useSuffix: true,                  // Usar "atrás" após o tempo
  capitalize: false,                // Capitalizar primeira letra
  useApproximateTime: false,        // Usar tempo aproximado ("mais de um ano")
  recentTimeThreshold: 0,           // Threshold em segundos para "agora"
  recentTimeLabel: 'agora'          // Label customizado para tempo recente
}
```

**Documentação Completa:** [Formatador de Datas](./DATE_FORMATTER.md)

### 6. Rich Text

Configuração do formatador de texto enriquecido.

```typescript
richTextConfig: {
  mentionPrefix: '@',  // Prefixo para menções (padrão: '@')
  hashtagPrefix: '#',  // Prefixo para hashtags (padrão: '#')
  urlDetection: true   // Detecção automática de URLs (padrão: true)
}
```

**Documentação Completa:** [Rich Text](./RICH_TEXT.md)

## Configuração Completa

Exemplo de configuração completa com todos os módulos:

```typescript
import { TextLibrary } from "circle-text-library"

const textLib = new TextLibrary({
    validationRules: {
        username: {
            minLength: { enabled: true, value: 3, description: "Mínimo 3 caracteres" },
            maxLength: { enabled: true, value: 20, description: "Máximo 20 caracteres" },
            allowedCharacters: {
                enabled: true,
                value: "[a-z0-9_]",
                description: "Apenas minúsculas, números e underscore"
            },
            cannotStartWith: {
                enabled: true,
                value: "_",
                description: "Não pode começar com underscore"
            },
            allowAtPrefix: { enabled: true, value: "@" }
        },
        password: {
            minLength: { enabled: true, value: 8 },
            maxLength: { enabled: true, value: 32 },
            requireUppercase: { enabled: true, value: true },
            requireLowercase: { enabled: true, value: true },
            requireNumbers: { enabled: true, value: true },
            requireSpecialChars: { enabled: true, value: true },
            cannotBeRepeatedChars: { enabled: true, value: true },
            cannotBeSequentialChars: { enabled: true, value: true }
        },
        hashtag: {
            requiredPrefix: { enabled: true, value: "#" },
            minLength: { enabled: true, value: 3 },
            maxLength: { enabled: true, value: 50 }
        },
        url: {
            requireProtocol: { enabled: true, value: true },
            allowedProtocols: { enabled: true, value: ["http", "https"] },
            minLength: { enabled: true, value: 10 },
            maxLength: { enabled: true, value: 2048 }
        }
    },
    extractorConfig: {
        mentionPrefix: "@",
        hashtagPrefix: "#"
    },
    sentimentConfig: {
        language: "pt-BR",
        enableCache: true
    },
    conversorConfig: {
        thousandsSeparator: ".",
        defaultSliceLength: 100,
        sliceSuffix: "..."
    },
    dateFormatterConfig: {
        style: "full",
        locale: "pt-BR",
        useApproximateTime: false,
        recentTimeThreshold: 60,
        recentTimeLabel: "agora mesmo"
    },
    richTextConfig: {
        mentionPrefix: "@",
        hashtagPrefix: "#"
    }
})
```

## Boas Práticas

### 1. Configuração Centralizada

Mantenha toda a configuração em um arquivo centralizado:

```typescript
// config/textLibrary.config.ts
export const textLibraryConfig = {
    validationRules: {
        // ...suas regras
    }
    // ...demais configurações
}

// app.ts
import { textLibraryConfig } from "./config/textLibrary.config"
const textLib = new TextLibrary(textLibraryConfig)
```

### 2. Configuração por Ambiente

Use variáveis de ambiente para configurações específicas:

```typescript
const textLib = new TextLibrary({
    validationRules: {
        username: {
            minLength: {
                enabled: true,
                value: process.env.NODE_ENV === "production" ? 3 : 1
            }
        }
    }
})
```

### 3. Validação de Configuração

Sempre valide sua configuração antes de inicializar:

```typescript
try {
    const textLib = new TextLibrary(config)
} catch (error) {
    console.error("Erro na configuração:", error.message)
}
```

### 4. Reutilização de Instâncias

Crie uma única instância e reutilize em toda a aplicação:

```typescript
// services/textLibrary.service.ts
let instance: TextLibrary | null = null

export function getTextLibrary(): TextLibrary {
    if (!instance) {
        instance = new TextLibrary(config)
    }
    return instance
}
```

## Configurações Dinâmicas

Alguns módulos permitem alteração de configuração após inicialização:

### DateFormatter

```typescript
const formatter = textLib.date
formatter.setStyle("short")
formatter.setUseApproximateTime(true)
formatter.setRecentTimeThreshold(120)
formatter.setRecentTimeLabel("agora pouco")
```

### Extractor

```typescript
const extractor = textLib.extractor
extractor.setText("Novo texto para análise")
```

## Próximos Passos

- [Sistema de Validação](./VALIDATION.md)
- [Sistema de Extração](./EXTRACTION.md)
- [Análise de Sentimento](./SENTIMENT.md)
- [Formatador de Datas](./DATE_FORMATTER.md)
- [Referência Completa da API](./API_REFERENCE.md)
