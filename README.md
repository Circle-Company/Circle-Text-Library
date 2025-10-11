# Circle Text Library

> Biblioteca JavaScript/TypeScript síncrona para validação, extração e processamento de texto, e análise de sentimento desenvolvida para o Circle App.

## ✨ Principais Funcionalidades

- **🛡️ Sistema de Validação Configurável**: Validação robusta de usernames, hashtags, URLs, senhas e mais
- **🔍 Extração de Entidades**: Extração inteligente de menções, hashtags, URLs e keywords
- **💭 Análise de Sentimento**: Análise contextual em português com suporte a emojis
- **📅 Formatação de Datas**: Conversão de datas para texto humanizado com múltiplas opções
- **✍️ Rich Text**: Formatação enriquecida com identificação automática de entidades
- **🔢 Conversão Numérica**: Formatação de números e textos para exibição
- **🌍 Gerenciamento de Timezone**: Conversão entre fusos horários com 14 zonas suportadas

## 📦 Instalação

```bash
npm install circle-text-library
```

## 🚀 Uso Rápido

```typescript
import { TextLibrary } from "circle-text-library"

const textLib = new TextLibrary({
    validationRules: {
        username: {
            minLength: { enabled: true, value: 3, description: "Mínimo 3 caracteres" },
            maxLength: { enabled: true, value: 20, description: "Máximo 20 caracteres" }
        }
    }
})

// Validação
const validation = textLib.validator.username("john_doe")
// { isValid: true, errors: [] }

// Extração
textLib.extractor.setText("Olá @user veja #tech em https://example.com")
const entities = textLib.extractor.entities({ mentions: true, hashtags: true })
// { mentions: ["@user"], hashtags: ["#tech"] }

// Análise de Sentimento
const sentiment = textLib.sentiment.analyze("Estou muito feliz!")
// { sentiment: "positive", intensity: 0.85 }

// Formatação de Datas
const formatter = textLib.date
formatter.setStyle("full")
const relative = formatter.toRelativeTime(new Date(Date.now() - 300000))
// "5 minutos atrás"
```

---

## 📚 Documentação Completa

**[Ver Índice Completo da Documentação →](./docs/README.md)**

### 🎯 Início Rápido

- [Guia de Configuração](./docs/CONFIGURATION.md) - Setup completo e configuração da biblioteca
- [Exemplos Práticos](./docs/EXAMPLES.md) - Casos de uso reais e workflows completos

### 📖 Módulos Principais

**🛡️ Validação e Segurança**

- [Sistema de Validação](./docs/VALIDATION.md) - Validação de usernames, passwords, URLs e mais

**🔍 Extração e Análise**

- [Sistema de Extração](./docs/EXTRACTION.md) - Extração de entidades e keywords
- [Análise de Sentimento](./docs/SENTIMENT.md) - Análise contextual com suporte a emojis

**✨ Formatação e Conversão**

- [Formatador de Datas](./docs/DATE_FORMATTER.md) - Conversão de datas para texto humanizado
- [Conversor Numérico](./docs/CONVERSOR.md) - Formatação de números e manipulação de texto
- [Rich Text](./docs/RICH_TEXT.md) - Formatação enriquecida com entidades
- [Gerenciamento de Timezone](./docs/TIMEZONE.md) - Conversão entre fusos horários

### 🔧 Referência Técnica

- [Referência Completa da API](./docs/API_REFERENCE.md) - Documentação de todas as classes e métodos

---

## 🌟 Características Principais

### ⚡ Performance

- Processamento síncrono e otimizado
- Cache inteligente para análises repetidas

### 🔒 Segurança

- Validação rigorosa de senhas com detecção de padrões inseguros
- Bloqueio de senhas comuns
- Proteção contra caracteres maliciosos

### 🎨 Flexibilidade

- Regras de validação completamente configuráveis
- Mensagens de erro personalizáveis
- Suporte a português brasileiro e inglês americano

### 🇧🇷 Suporte a Português

- Análise de sentimento otimizada para português brasileiro
- Suporte a gírias e expressões coloquiais
- Detecção de ironia e sarcasmo
- Processamento de acentuação

---

## 💻 Compatibilidade

- **Node.js**: 14.x ou superior
- **TypeScript**: 4.5 ou superior
- **Browsers**: Modernos com suporte a ES2020

## 📄 Licença

Copyright 2025 Circle Company, Inc.  
Licensed under the Circle License, Version 1.0
