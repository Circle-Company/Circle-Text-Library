# 🔧 Circle Text Library - Biblioteca de Validação e Processamento de Texto

CircleText é uma biblioteca JavaScript/TypeScript robusta e profissional para validação, extração e análise de texto, desenvolvida especificamente para o **_Circle App_**, oferecendo uma solução completa e flexível para processamento de conteúdo textual.

## 🚀 Características Principais

- **✅ Regras Personalizáveis**: Sistema de validação totalmente configurável
- **🔧 Flexibilidade Total**: Mensagens de erro customizáveis para cada validação
- **⚡ Performance Otimizada**: Processamento rápido, síncrono e eficiente
- **🛡️ Segurança Avançada**: Regras robustas de segurança para senhas e dados sensíveis
- **🔍 Análise Inteligente**: Análise de sentimento com múltiplas palavras por texto (suporte para português)
- **🌍 Gerenciamento de Timezone**: Conversão precisa entre fusos horários com suporte completo
- **📝 Rich Text**: Formatação enriquecida com identificação automática de menções, hashtags e URLs

## 📋 Funcionalidades

### ✅ Sistema de Validação

#### Regras Personalizáveis

Configure regras específicas para cada tipo de validação:

```typescript
const circleText = new CircleText({
    validationRules: {
        username: {
            minLength: { enabled: true, value: 4 },
            maxLength: { enabled: true, value: 20 },
            allowedCharacters: { enabled: true, value: "[a-z0-9_]." },
            cannotStartWith: {
                enabled: true,
                value: "_.",
                description: "Username não pode começar com underscore ou ponto"
            },
            cannotContainConsecutive: {
                enabled: true,
                value: "._",
                description: "Não pode conter pontos '.' ou underscores consecutivos"
            },
            requireCapitalization: { enabled: true, value: true },
            allowAtPrefix: { enabled: true, value: "@" }
        },
        hashtag: {
            requiredPrefix: { enabled: true, value: "#" },
            minLength: { enabled: true, value: 4 },
            allowedCharacters: { enabled: true, value: "[a-zA-Z0-9#]" },
            cannotStartWith: {
                enabled: true,
                value: "[0-9]",
                description: "Hashtag não pode começar com número"
            }
        }
    }
})
```

#### Tipos de Validação Disponíveis

##### 👤 Username

Validação robusta de nomes de usuário com regras avançadas:

- **Caracteres especiais**: Configuração precisa de caracteres permitidos/proibidos
- **Capitalização**: Controle de maiúsculas/minúsculas obrigatórias
- **Padrões proibidos**: Prevenção de caracteres consecutivos e início/fim inválidos
- **Compatibilidade**: Suporte ao prefixo `@`

```typescript
const result = circleText.validate.username("validUser123")
// ✅ { isValid: true, errors: [] }
```

##### #️⃣ Hashtag

Validação completa de hashtags:

- **Prefixo obrigatório**: Validação do símbolo `#`
- **Comprimento configurável**: Mínimo e máximo personalizáveis
- **Caracteres permitidos**: Controle de alfabéticos/numéricos
- **Restrições especiais**: Início/fim proibidos

```typescript
const result = circleText.validate.hashtag("#validtag")
// ✅ { isValid: true, errors: [] }
```

##### 🌐 URL

Validação completa de URLs:

- **Protocolos**: HTTP/HTTPS obrigatórios ou opcionais
- **Comprimento**: Limites de tamanho configuráveis
- **Protocolos permitidos**: Lista configurável de protocolos aceitos

```typescript
const result = circleText.validate.url("https://example.com")
// ✅ { isValid: true, errors: [] }
```

##### 📝 Description

Validação de descrições de perfil:

- **Comprimento**: Limites min/max configuráveis
- **Caracteres permitidos**: Regex personalizável
- **Conteúdo proibido**: URL, menções, hashtags bloqueáveis
- **Alfanuméricos**: Exigência de caracteres alfanuméricos

```typescript
const result = circleText.validate.description("Descrição válida")
// ✅ { isValid: true, errors: [] }
```

##### 👤 Name

Validação de nomes de pessoa:

- **Capitalização**: Primeira letra maiúscula obrigatória
- **Nome completo**: Requer primeiro e último nome
- **Palavras proibidas**: Lista de nomes bloqueados
- **Caracteres**: Sem números ou caracteres especiais
- **Acentos**: Suporte completo a caracteres acentuados

```typescript
const result = circleText.validate.name("João Silva")
// ✅ { isValid: true, errors: [] }
```

##### 🔐 Password (NOVA!)

Validação de senhas com segurança avançada:

- **Complexidade**: Maiúsculas, minúsculas, números, caracteres especiais
- **Comprimento**: Limites de segurança (8-32 caracteres)
- **Senhas comuns**: Bloqueio automático de senhas vulneráveis
- **Padrões inseguros**: Contadores repetidos consecutivos
- **Sequências**: Bloqueio de padrões sequenciais (abc, 123)
- **Caracteres especiais**: Controle preciso de caracteres permitidos
- **Conteúdo proibido**: Sem username/email na senha

```typescript
const result = circleText.validate.password("MyStr0ng!A")
// ✅ { isValid: true, errors: [] }
```

### 📤 Sistema de Extração

#### Extração Unificada

Extraia múltiplos tipos de conteúdo em uma única operação:

```typescript
const text = "Check out @test_user and visit https://example.com! #tech #coding"
const result = circleText.extract.content(text, {
    mentions: true,
    urls: true,
    hashtags: true,
    keywords: false
})

// Resultado apenas com os tipos solicitados:
// ✅ { mentions: ["@test_user"], urls: ["https://example.com"], hashtags: ["#tech", "#coding"] }
```

#### Extração Individual

##### 👤 Menções

```typescript
const text = "Check out @user1 and @user2!"
const mentions = circleText.extract.content(text, { mentions: true })
// ✅ { mentions: ["@user1", "@user2"] }
```

##### #️⃣ Hashtags

```typescript
const text = "Amor pela #tecnologia e #programacao!"
const hashtags = circleText.extract.content(text, { hashtags: true })
// ✅ { hashtags: ["#tecnologia", "#programacao"] }
```

##### 🌐 URLs

```typescript
const text = "Veja https://example.com e http://test.com!"
const urls = circleText.extract.content(text, { urls: true })
// ✅ { urls: ["https://example.com", "http://test.com"] }
```

##### 🔍 Keywords

```typescript
const text = "Inteligência Artificial revoluciona programação e tecnologia"
const keywords = circleText.extract.keywords(text)
// ✅ ["inteligência", "artificial", "revoluciona", "programação", "tecnologia"]
```

---

### 📝 Sistema de Rich Text

#### Formatação de Texto Enriquecido

Sistema completo para converter texto normal em formato enriquecido com identificação automática de menções, hashtags e URLs:

```typescript
const richText = circleText.transform.text.richText

// Configurar texto com IDs das entidades
richText.setText("Olá @alice veja #tech em https://example.com", {
    mentions: { alice: "user_123" },
    hashtags: { tech: "tag_456" }
})

// Obter texto enriquecido
const enriched = richText.getEnrichedText()
// ✅ "Olá [txt:alice, ent:mention, id:user_123] veja [txt:tech, ent:hashtag, id:tag_456] em [txt:https://example.com, ent:url]"

// Converter de volta para normal
const normal = richText.formatToNormal()
// ✅ "Olá @alice veja #tech em https://example.com"

// Formato para UI com posições
const uiFormat = richText.formatToUI()
// ✅ {
//   text: "Olá @alice veja #tech em https://example.com",
//   entities: [
//     { type: "text", text: "Olá ", start: 0, end: 4 },
//     { type: "mention", text: "alice", id: "user_123", start: 4, end: 10 },
//     { type: "text", text: " veja ", start: 10, end: 16 },
//     { type: "hashtag", text: "tech", id: "tag_456", start: 16, end: 21 },
//     ...
//   ]
// }

// Extrair entidades
const entities = richText.extractEntities()
// ✅ {
//   mentions: [{ text: "alice", id: "user_123" }],
//   hashtags: [{ text: "tech", id: "tag_456" }],
//   urls: [{ text: "https://example.com" }]
// }
```

#### Recursos do Rich Text

- **🔗 Identificação Automática**: Detecta @menções, #hashtags e URLs
- **🆔 Mapeamento de IDs**: Associe IDs customizados às entidades
- **📍 Posições Precisas**: Retorna posições exatas (start/end) para renderização
- **🔄 Conversão Bidirecional**: Normal ↔ Enriquecido
- **⚡ 100% Síncrono**: Sem promises ou async/await
- **🎯 IDs Opcionais**: Funciona com ou sem IDs

---

### 🫀 Análise de Sentimento

#### Análise Básica

```typescript
const text = "Estou muito satisfeito com os resultados!"
const sentiment = circleText.extract.sentiment(text)
// ✅ { sentiment: "positive", intensity: 0.8 }
```

#### Suporte Avançado

- **Múltiplas palavras**: Análise de múltiplas palavras por texto
- **Intensidade numérica**: Pontuação precisa do sentimento (0-1)
- **Linguagem portuguesa**: Otimizado para textos em português
- **Lexicons**: Dados especializados de palavras sentimentais

---

### 🌍 Sistema de Timezone

#### Conversão de Fusos Horários

Sistema completo de gerenciamento de timezone com suporte a 14 fusos horários principais:

```typescript
import { Timezone, TimezoneCodes } from "./src/classes/timezone"

// Criar instância de timezone
const brtTimezone = new Timezone(TimezoneCodes.BRT)
const utcTimezone = new Timezone(TimezoneCodes.UTC)
```

#### Fusos Horários Suportados

| Código | Descrição                  | Offset (horas) |
| ------ | -------------------------- | -------------- |
| `UTC`  | Coordinated Universal Time | 0              |
| `BRT`  | Brasília Time              | -3             |
| `BRST` | Brasília Summer Time       | -2             |
| `EST`  | Eastern Standard Time      | -5             |
| `EDT`  | Eastern Daylight Time      | -4             |
| `CST`  | Central Standard Time      | -6             |
| `CDT`  | Central Daylight Time      | -5             |
| `MST`  | Mountain Standard Time     | -7             |
| `MDT`  | Mountain Daylight Time     | -6             |
| `PST`  | Pacific Standard Time      | -8             |
| `PDT`  | Pacific Daylight Time      | -7             |
| `AKST` | Alaska Standard Time       | -9             |
| `AKDT` | Alaska Daylight Time       | -8             |
| `HST`  | Hawaii Standard Time       | -10            |

#### Conversões Principais

##### UTC para Local

```typescript
const utcDate = new Date("2024-01-15T15:30:00Z")
const brtTimezone = new Timezone(TimezoneCodes.BRT)

const localDate = brtTimezone.UTCToLocal(utcDate)
// ✅ 2024-01-15T12:30:00Z (15:30 UTC - 3h = 12:30 BRT)
```

##### Local para UTC

```typescript
const localDate = new Date("2024-01-15T12:30:00Z") // Simula hora local BRT
const brtTimezone = new Timezone(TimezoneCodes.BRT)

const utcDate = brtTimezone.localToUTC(localDate)
// ✅ 2024-01-15T15:30:00Z (12:30 local + 3h = 15:30 UTC)
```

#### Métodos Auxiliares

```typescript
const timezone = new Timezone(TimezoneCodes.BRT)

// Obter offset e código
const offset = timezone.getTimezoneOffset() // -3 (horas)
const code = timezone.getCurrentTimezoneCode() // "BRT"

// Listar todos os códigos disponíveis
const allCodes = timezone.getTimezoneCodes()
// ✅ ["UTC", "BRT", "BRST", "EST", "EDT", "CST", "CDT", "MST", "MDT", "PST", "PDT", "AKST", "AKDT", "HST"]

// Detecção automática do timezone do sistema
const currentTimezone = Timezone.getCurrentTimezone()
// ✅ Detecta automaticamente o timezone do sistema
```

#### Validação e Performance

```typescript
const timezone = new Timezone(TimezoneCodes.BRT)

// ✅ Aceita datas válidas
const validDate = new Date("2024-01-15T15:30:00Z")
const result = timezone.UTCToLocal(validDate) // ✅ Funciona

// ❌ Rejeita datas inválidas
try {
    timezone.UTCToLocal(new Date("invalid"))
} catch (error) {
    console.log(error.message) // "Data inválida fornecida"
}

// ✅ Performance otimizada: <100ms para 1000 conversões
```

---

## 🔧 Instalação e Configuração

### Instalação

```bash
npm install
```

### Uso Básico

```typescript
import { CircleText } from "./index"
import { Timezone, TimezoneCodes } from "./src/classes/timezone"

// Validação e Extração
const circleText = new CircleText({
    validationRules: {
        // Suas regras personalizadas aqui
    }
})

// Validação
const isValidUser = circleText.validate.username("testuser")

// Extração
const extracted = circleText.extract.content("text with @mentions and #hashtags")

// Análise de Sentimento
const sentiment = circleText.extract.sentiment("texto para análise")

// Gerenciamento de Timezone
const brtTimezone = new Timezone(TimezoneCodes.BRT)
const utcDate = new Date("2024-01-15T15:30:00Z")
const localDate = brtTimezone.UTCToLocal(utcDate)
```

### 📄 Licença

**Copyright 2025 Circle Company, Inc.**  
Licensed under the Circle License, Version 1.0

---

**CircleText** - Sua solução completa para processamento inteligente de texto! 🚀
