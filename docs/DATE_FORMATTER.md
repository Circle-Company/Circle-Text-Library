# Formatador de Datas

O módulo DateFormatter converte datas em texto humanizado para uso em redes sociais e aplicações de comunicação.

## Índice

- [Configuração](#configuração)
- [Estilos de Formatação](#estilos-de-formatação)
- [Formatação Relativa](#formatação-relativa)
- [Tempo Aproximado](#tempo-aproximado)
- [Janela de Tempo Recente](#janela-de-tempo-recente)
- [Formatação de Datas Completas](#formatação-de-datas-completas)
- [Métodos Utilitários](#métodos-utilitários)
- [Configuração Dinâmica](#configuração-dinâmica)

## Configuração

### Inicialização

```typescript
import { TextLibrary, TextLibraryProps } from "circle-text-library"

const config: TextLibraryProps["DateFormatterConfig"] = {
    style: "full", // Estilo de formatação
    locale: "pt", // Locale para datas completas
    usePrefix: false, // Usar "há" antes do tempo
    useSuffix: true, // Usar "atrás" após o tempo
    capitalize: false, // Capitalizar primeira letra
    useApproximateTime: false, // Tempo aproximado
    recentTimeThreshold: 0, // Threshold para "agora" (segundos)
    recentTimeLabel: "agora" // Label para tempo recente
}

const textLib = new TextLibrary({
    validationRules: {
        /* ... */
    },
    dateFormatterConfig: config
})
```

### Uso Direto

```typescript
import { DateFormatter } from "circle-text-library"

const formatter = new DateFormatter({
    style: "full",
    locale: "pt"
})
```

## Estilos de Formatação

O DateFormatter suporta três estilos principais:

### 1. Full (Completo)

Texto por extenso, ideal para descrições detalhadas.

```typescript
formatter.setStyle("full")

const result = formatter.toRelativeTime(pastDate)
// "10 minutos atrás"
// "2 horas atrás"
// "3 dias atrás"
// "1 semana atrás"
// "2 meses atrás"
// "1 ano atrás"
```

### 2. Short (Curto)

Formato compacto, ideal para timelines.

```typescript
formatter.setStyle("short")

const result = formatter.toRelativeTime(pastDate)
// "10m"
// "2h"
// "3d"
// "1sem"
// "2mes"
// "1a"
```

### 3. Abbreviated (Abreviado)

Formato intermediário com abreviações.

```typescript
formatter.setStyle("abbreviated")

const result = formatter.toRelativeTime(pastDate)
// "10min"
// "2h"
// "3d"
// "1sem"
// "2mes"
// "1a"
```

## Formatação Relativa

### Método Principal: toRelativeTime()

Converte uma data para texto relativo humanizado.

```typescript
const now = new Date()
const fiveMinutesAgo = new Date(now.getTime() - 5 * 60000)

formatter.toRelativeTime(fiveMinutesAgo)
// Estilo full: "5 minutos atrás"
// Estilo short: "5m"
// Estilo abbreviated: "5min"
```

### Unidades de Tempo

| Tempo       | Full                | Short   | Abbreviated |
| ----------- | ------------------- | ------- | ----------- |
| Agora (0s)  | "agora"             | "agora" | "agora"     |
| 30 segundos | "30 segundos atrás" | "30s"   | "30seg"     |
| 5 minutos   | "5 minutos atrás"   | "5m"    | "5min"      |
| 2 horas     | "2 horas atrás"     | "2h"    | "2h"        |
| 1 dia       | "ontem"             | "1d"    | "1d"        |
| 3 dias      | "3 dias atrás"      | "3d"    | "3d"        |
| 2 semanas   | "2 semanas atrás"   | "2sem"  | "2sem"      |
| 3 meses     | "3 meses atrás"     | "3mes"  | "3mes"      |
| 2 anos      | "2 anos atrás"      | "2a"    | "2a"        |

### Prefixo e Sufixo

Controle o uso de prefixo "há" e sufixo "atrás":

```typescript
// Apenas sufixo (padrão)
formatter.setUsePrefix(false)
formatter.setUseSuffix(true)
// "10 minutos atrás"

// Apenas prefixo
formatter.setUsePrefix(true)
formatter.setUseSuffix(false)
// "há 10 minutos"

// Ambos
formatter.setUsePrefix(true)
formatter.setUseSuffix(true)
// "há 10 minutos atrás"

// Nenhum
formatter.setUsePrefix(false)
formatter.setUseSuffix(false)
// "10 minutos"
```

### Capitalização

```typescript
formatter.setCapitalize(true)

formatter.toRelativeTime(pastDate)
// "10 Minutos atrás"
// "Ontem"
```

## Tempo Aproximado

Para redes sociais, muitas vezes é preferível mostrar tempo aproximado ao invés de valores exatos para períodos longos.

### Ativação

```typescript
formatter.setUseApproximateTime(true)
```

### Comportamento

#### Anos (≥ 1 ano)

Qualquer período de 1 ano ou mais é mostrado como "mais de um ano atrás".

```typescript
formatter.setUseApproximateTime(true)

const oneYearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60000)
formatter.toRelativeTime(oneYearAgo)
// "mais de um ano atrás"

const fiveYearsAgo = new Date(now.getTime() - 5 * 365 * 24 * 60 * 60000)
formatter.toRelativeTime(fiveYearsAgo)
// "mais de um ano atrás"
```

#### Meses → Semanas

Períodos de 4 semanas ou mais são convertidos para semanas ao invés de meses.

```typescript
const twelveWeeksAgo = new Date(now.getTime() - 84 * 24 * 60 * 60000)
formatter.toRelativeTime(twelveWeeksAgo)
// Sem aproximação: "3 meses atrás"
// Com aproximação: "12 semanas atrás"
```

#### Semanas (≥ 1 semana)

Períodos de 1 semana ou mais (mas menos de 4 semanas) são mostrados como "mais de uma semana atrás".

```typescript
const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60000)
formatter.toRelativeTime(twoWeeksAgo)
// Sem aproximação: "2 semanas atrás"
// Com aproximação: "mais de uma semana atrás"
```

### Formato Curto com Tempo Aproximado

```typescript
formatter.setStyle("short")
formatter.setUseApproximateTime(true)

formatter.toRelativeTime(twoYearsAgo)
// ">1a" (mais de 1 ano)

formatter.toRelativeTime(twoWeeksAgo)
// ">1sem" (mais de 1 semana)
```

## Janela de Tempo Recente

Define uma janela de tempo onde qualquer post é considerado "recente" e exibe um label customizado.

### Configuração

```typescript
// Threshold em segundos
formatter.setRecentTimeThreshold(120) // 2 minutos

// Label customizado
formatter.setRecentTimeLabel("agora mesmo")
```

### Comportamento

Qualquer data dentro do threshold será exibida com o label customizado:

```typescript
formatter.setRecentTimeThreshold(120) // 2 minutos
formatter.setRecentTimeLabel("agora mesmo")

const thirtySecondsAgo = new Date(now.getTime() - 30000)
formatter.toRelativeTime(thirtySecondsAgo)
// "agora mesmo"

const ninetySecondsAgo = new Date(now.getTime() - 90000)
formatter.toRelativeTime(ninetySecondsAgo)
// "agora mesmo"

const threeMinutesAgo = new Date(now.getTime() - 180000)
formatter.toRelativeTime(threeMinutesAgo)
// "3 minutos atrás" (fora do threshold)
```

### Casos de Uso

#### Redes Sociais - Posts Recentes

```typescript
formatter.setRecentTimeThreshold(60) // 1 minuto
formatter.setRecentTimeLabel("agora pouco")
// Qualquer post até 1 minuto: "agora pouco"
```

#### Chat em Tempo Real

```typescript
formatter.setRecentTimeThreshold(30) // 30 segundos
formatter.setRecentTimeLabel("agora")
// Mensagens até 30s: "agora"
```

#### Notificações

```typescript
formatter.setRecentTimeThreshold(300) // 5 minutos
formatter.setRecentTimeLabel("há poucos instantes")
// Notificações até 5min: "há poucos instantes"
```

### Desabilitar Threshold

Para desabilitar, defina threshold como 0 (padrão):

```typescript
formatter.setRecentTimeThreshold(0)
// Mostra tempo exato para todos os casos
```

## Formatação de Datas Completas

### Data Completa

```typescript
const date = new Date("2024-01-15T12:00:00Z")

formatter.toFullDate(date)
// pt-BR: "15 de janeiro de 2024"
// en-US: "January 15, 2024"
```

### Data Curta

```typescript
formatter.toShortDate(date)
// pt-BR: "15/01/2024"
// en-US: "01/15/2024"
```

### Hora

```typescript
formatter.toTimeString(date)
// "12:00"
```

### Data e Hora

```typescript
formatter.toFullDateTime(date)
// "15 de janeiro de 2024 às 12:00"
```

## Métodos Utilitários

### isPast()

Verifica se uma data está no passado.

```typescript
const pastDate = new Date("2023-01-01")
formatter.isPast(pastDate) // true

const futureDate = new Date("2025-12-31")
formatter.isPast(futureDate) // false
```

### isFuture()

Verifica se uma data está no futuro.

```typescript
formatter.isFuture(futureDate) // true
```

### isToday()

Verifica se uma data é hoje.

```typescript
const today = new Date()
formatter.isToday(today) // true
```

### isYesterday()

Verifica se uma data foi ontem.

```typescript
const yesterday = new Date(now.getTime() - 24 * 60 * 60000)
formatter.isYesterday(yesterday) // true
```

### daysBetween()

Retorna a diferença em dias entre duas datas.

```typescript
const date1 = new Date("2024-01-15")
const date2 = new Date("2024-01-20")

formatter.daysBetween(date1, date2) // 5
```

## Configuração Dinâmica

Todos os setters podem ser usados após a inicialização:

```typescript
const formatter = textLib.date

// Estilo
formatter.setStyle("short") // 'full' | 'short' | 'abbreviated'

// Locale
formatter.setLocale("en-US") // 'pt-BR' | 'en-US'

// Prefixo e Sufixo
formatter.setUsePrefix(true)
formatter.setUseSuffix(false)

// Capitalização
formatter.setCapitalize(true)

// Tempo Aproximado
formatter.setUseApproximateTime(true)

// Janela de Tempo Recente
formatter.setRecentTimeThreshold(120)
formatter.setRecentTimeLabel("agora mesmo")
```

## Exemplos Práticos

### Timeline de Rede Social

```typescript
const formatter = new DateFormatter({
    style: "short",
    recentTimeThreshold: 60,
    recentTimeLabel: "agora"
})

// Post de 30s atrás: "agora"
// Post de 5min atrás: "5m"
// Post de 2h atrás: "2h"
```

### Notificações

```typescript
const formatter = new DateFormatter({
    style: "full",
    capitalize: true,
    recentTimeThreshold: 300,
    recentTimeLabel: "Agora mesmo"
})

// "Agora mesmo"
// "10 Minutos atrás"
// "2 Horas atrás"
```

### Histórico de Atividades

```typescript
const formatter = new DateFormatter({
    style: "full",
    useApproximateTime: true,
    usePrefix: true,
    useSuffix: false
})

// "há 10 minutos"
// "há 2 horas"
// "há mais de uma semana"
// "há mais de um ano"
```

### Timestamps Compactos

```typescript
const formatter = new DateFormatter({
    style: "abbreviated"
})

// "30seg"
// "10min"
// "2h"
// "3d"
```

## Validação de Erros

O formatador valida automaticamente datas inválidas:

```typescript
try {
    formatter.toRelativeTime(new Date("invalid"))
} catch (error) {
    console.error(error.message) // "Data inválida fornecida"
}

try {
    const futureDate = new Date(Date.now() + 10000)
    formatter.toRelativeTime(futureDate)
} catch (error) {
    console.error(error.message) // "Data fornecida está no futuro"
}
```

## Performance

- Processamento síncrono e instantâneo
- Sem dependências externas
- Otimizado para uso em larga escala
- Cache de configurações para melhor performance

## Suporte a Múltiplos Idiomas

### Português (pt, pt-BR)

```typescript
const formatter = new DateFormatter({ locale: "pt" })

formatter.toRelativeTime(pastDate)
// "10 minutos atrás"
// "2 horas atrás"
// "ontem"
```

### Inglês (en, en-US)

```typescript
const formatter = new DateFormatter({ locale: "en" })

formatter.toRelativeTime(pastDate)
// "10 minutes ago"
// "2 hours ago"
// "yesterday"
```

### Comparação de Idiomas

| Português           | Inglês           | Short | Abbreviated |
| ------------------- | ---------------- | ----- | ----------- |
| "agora"             | "now"            | "now" | "now"       |
| "30 segundos atrás" | "30 seconds ago" | "30s" | "30sec"     |
| "5 minutos atrás"   | "5 minutes ago"  | "5m"  | "5min"      |
| "2 horas atrás"     | "2 hours ago"    | "2h"  | "2h"        |
| "ontem"             | "yesterday"      | "1d"  | "1d"        |
| "3 dias atrás"      | "3 days ago"     | "3d"  | "3d"        |
| "2 semanas atrás"   | "2 weeks ago"    | "2w"  | "2wk"       |
| "3 meses atrás"     | "3 months ago"   | "3mo" | "3mo"       |
| "2 anos atrás"      | "2 years ago"    | "2y"  | "2y"        |

### Tempo Aproximado em Inglês

```typescript
const formatter = new DateFormatter({
    locale: "en",
    useApproximateTime: true
})

formatter.toRelativeTime(twoYearsAgo)
// "over a year ago"

formatter.toRelativeTime(twoWeeksAgo)
// "over a week ago"
```

### Formatação de Datas Completas

```typescript
// Português
const ptFormatter = new DateFormatter({ locale: "pt" })
ptFormatter.toFullDate(new Date("2024-06-15"))
// "15 de junho de 2024"

ptFormatter.toFullDateTime(new Date("2024-06-15T14:30:00Z"))
// "15 de junho de 2024 às 14:30"

// Inglês
const enFormatter = new DateFormatter({ locale: "en" })
enFormatter.toFullDate(new Date("2024-06-15"))
// "June 15, 2024"

enFormatter.toFullDateTime(new Date("2024-06-15T14:30:00Z"))
// "June 15, 2024 at 2:30 PM"
```

## Próximos Passos

- [Guia de Configuração](./CONFIGURATION.md)
- [Sistema de Validação](./VALIDATION.md)
- [Referência Completa da API](./API_REFERENCE.md)
