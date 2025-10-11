# Gerenciamento de Timezone

O módulo Timezone fornece conversão precisa entre fusos horários com suporte a 14 zonas principais.

## Índice

- [Instalação](#instalação)
- [Fusos Horários Suportados](#fusos-horários-suportados)
- [Criação de Instância](#criação-de-instância)
- [Conversões](#conversões)
- [Métodos Auxiliares](#métodos-auxiliares)
- [Casos de Uso](#casos-de-uso)

## Instalação

O módulo Timezone pode ser usado diretamente ou através da TextLibrary:

```typescript
// Uso direto
import { Timezone, TimezoneCode } from "circle-text-library"

const timezone = new Timezone(TimezoneCode.BRT)

// Através da TextLibrary
import { TextLibrary } from "circle-text-library"

const textLib = new TextLibrary({
    validationRules: { /* ... */ }
})

const timezone = textLib.timezone
```

## Fusos Horários Suportados

### Lista Completa

| Código | Nome | Offset (horas) | Região |
|--------|------|----------------|--------|
| UTC | Coordinated Universal Time | 0 | Global |
| BRT | Brasília Time | -3 | Brasil |
| BRST | Brasília Summer Time | -2 | Brasil (Horário de Verão) |
| EST | Eastern Standard Time | -5 | EUA (Leste) |
| EDT | Eastern Daylight Time | -4 | EUA (Leste, Horário de Verão) |
| CST | Central Standard Time | -6 | EUA (Central) |
| CDT | Central Daylight Time | -5 | EUA (Central, Horário de Verão) |
| MST | Mountain Standard Time | -7 | EUA (Montanhas) |
| MDT | Mountain Daylight Time | -6 | EUA (Montanhas, Horário de Verão) |
| PST | Pacific Standard Time | -8 | EUA (Pacífico) |
| PDT | Pacific Daylight Time | -7 | EUA (Pacífico, Horário de Verão) |
| AKST | Alaska Standard Time | -9 | Alaska |
| AKDT | Alaska Daylight Time | -8 | Alaska (Horário de Verão) |
| HST | Hawaii Standard Time | -10 | Havaí |

## Criação de Instância

### Com Timezone Específico

```typescript
import { Timezone, TimezoneCode } from "circle-text-library"

const brtTimezone = new Timezone(TimezoneCode.BRT)
const estTimezone = new Timezone(TimezoneCode.EST)
const utcTimezone = new Timezone(TimezoneCode.UTC)
```

### Com Timezone do Sistema

```typescript
// Usa UTC por padrão
const timezone = new Timezone()
```

### Alterar Timezone

```typescript
const timezone = new Timezone(TimezoneCode.UTC)

// Alterar para BRT
timezone.setLocalTimezone(TimezoneCode.BRT)
```

## Conversões

### UTC para Local

Converte uma data UTC para o timezone local configurado.

```typescript
const timezone = new Timezone(TimezoneCode.BRT)
const utcDate = new Date("2024-01-15T15:30:00Z")

const localDate = timezone.UTCToLocal(utcDate)
// 2024-01-15T12:30:00Z (15:30 UTC - 3h = 12:30 BRT)

console.log(localDate.toISOString())
// "2024-01-15T12:30:00.000Z"
```

### Local para UTC

Converte uma data local para UTC.

```typescript
const timezone = new Timezone(TimezoneCode.BRT)
const localDate = new Date("2024-01-15T12:30:00Z")

const utcDate = timezone.localToUTC(localDate)
// 2024-01-15T15:30:00Z (12:30 BRT + 3h = 15:30 UTC)

console.log(utcDate.toISOString())
// "2024-01-15T15:30:00.000Z"
```

### Exemplos de Conversão

```typescript
// Brasil (BRT) para UTC
const brtTz = new Timezone(TimezoneCode.BRT)
brtTz.localToUTC(new Date("2024-01-15T12:00:00Z"))
// Adiciona 3 horas: 15:00 UTC

// Nova York (EST) para UTC
const estTz = new Timezone(TimezoneCode.EST)
estTz.localToUTC(new Date("2024-01-15T12:00:00Z"))
// Adiciona 5 horas: 17:00 UTC

// Los Angeles (PST) para UTC
const pstTz = new Timezone(TimezoneCode.PST)
pstTz.localToUTC(new Date("2024-01-15T12:00:00Z"))
// Adiciona 8 horas: 20:00 UTC
```

## Métodos Auxiliares

### getOffset()

Retorna o offset em horas do timezone atual.

```typescript
const timezone = new Timezone(TimezoneCode.BRT)
const offset = timezone.getOffset()
// -3
```

### getCode()

Retorna o código do timezone atual.

```typescript
const timezone = new Timezone(TimezoneCode.EST)
const code = timezone.getCode()
// "EST"
```

### getCodeFromOffset()

Converte offset para código de timezone.

```typescript
const timezone = new Timezone()

timezone.getCodeFromOffset(0)    // TimezoneCode.UTC
timezone.getCodeFromOffset(-3)   // TimezoneCode.BRT
timezone.getCodeFromOffset(-5)   // TimezoneCode.EST
timezone.getCodeFromOffset(-8)   // TimezoneCode.PST
```

### getOffsetFromCode()

Converte código de timezone para offset.

```typescript
const timezone = new Timezone()

timezone.getOffsetFromCode(TimezoneCode.UTC)   // 0
timezone.getOffsetFromCode(TimezoneCode.BRT)   // -3
timezone.getOffsetFromCode(TimezoneCode.EST)   // -5
timezone.getOffsetFromCode(TimezoneCode.PST)   // -8
```

## Casos de Uso

### 1. Conversão de Horário de Post

```typescript
function displayPostTime(post, userTimezone) {
    // post.createdAt está em UTC
    const timezone = new Timezone(userTimezone)
    const localTime = timezone.UTCToLocal(post.createdAt)
    
    return {
        utc: post.createdAt.toISOString(),
        local: localTime.toISOString(),
        formatted: textLib.date.toRelativeTime(post.createdAt)
    }
}

const post = { createdAt: new Date("2024-01-15T18:00:00Z") }
displayPostTime(post, TimezoneCode.BRT)
// {
//   utc: "2024-01-15T18:00:00.000Z",
//   local: "2024-01-15T15:00:00.000Z",
//   formatted: "5 minutos atrás"
// }
```

### 2. Agendamento de Posts

```typescript
function schedulePost(localScheduleTime, userTimezoneOffset) {
    // Converter offset do cliente para timezone code
    const timezone = new Timezone()
    const timezoneCode = timezone.getCodeFromOffset(userTimezoneOffset)
    
    // Converter horário local para UTC
    timezone.setLocalTimezone(timezoneCode)
    const utcScheduleTime = timezone.localToUTC(localScheduleTime)
    
    return {
        scheduleAtUTC: utcScheduleTime,
        scheduleAtLocal: localScheduleTime,
        timezone: timezoneCode
    }
}

// Usuário em BRT agenda para 15:00 local
const schedule = schedulePost(
    new Date("2024-01-15T15:00:00Z"),
    -3  // Offset do Brasil
)
// {
//   scheduleAtUTC: "2024-01-15T18:00:00.000Z",
//   scheduleAtLocal: "2024-01-15T15:00:00.000Z",
//   timezone: "BRT"
// }
```

### 3. Timeline Global

```typescript
function buildGlobalTimeline(posts, userTimezoneOffset) {
    const timezone = new Timezone()
    const userCode = timezone.getCodeFromOffset(userTimezoneOffset)
    timezone.setLocalTimezone(userCode)
    
    return posts.map(post => ({
        ...post,
        createdAtUTC: post.createdAt,
        createdAtLocal: timezone.UTCToLocal(post.createdAt),
        relativeTime: textLib.date.toRelativeTime(post.createdAt)
    }))
}
```

### 4. Conversão em Lote

```typescript
function convertBatchToLocal(utcDates, targetTimezone) {
    const timezone = new Timezone(targetTimezone)
    
    return utcDates.map(date => ({
        utc: date,
        local: timezone.UTCToLocal(date)
    }))
}

const dates = [
    new Date("2024-01-15T12:00:00Z"),
    new Date("2024-01-15T18:00:00Z"),
    new Date("2024-01-16T00:00:00Z")
]

const converted = convertBatchToLocal(dates, TimezoneCode.PST)
```

### 5. Sistema Multi-Regional

```typescript
function displayTimeForRegions(utcTime, regions) {
    return regions.map(region => {
        const timezone = new Timezone(region.timezoneCode)
        const localTime = timezone.UTCToLocal(utcTime)
        
        return {
            region: region.name,
            timezone: region.timezoneCode,
            localTime: localTime.toISOString(),
            formatted: textLib.date.toFullDateTime(localTime)
        }
    })
}

const eventTime = new Date("2024-01-15T18:00:00Z")
const regions = [
    { name: "Brasil", timezoneCode: TimezoneCode.BRT },
    { name: "Nova York", timezoneCode: TimezoneCode.EST },
    { name: "Los Angeles", timezoneCode: TimezoneCode.PST }
]

const times = displayTimeForRegions(eventTime, regions)
// [
//   { region: "Brasil", timezone: "BRT", localTime: "...", formatted: "..." },
//   { region: "Nova York", timezone: "EST", localTime: "...", formatted: "..." },
//   { region: "Los Angeles", timezone: "PST", localTime: "...", formatted: "..." }
// ]
```

## Validação

O módulo valida automaticamente datas inválidas:

```typescript
const timezone = new Timezone(TimezoneCode.BRT)

try {
    timezone.UTCToLocal(new Date("invalid"))
} catch (error) {
    console.error(error.message)  // "Data inválida fornecida"
}
```

## Performance

- Conversões em O(1) (tempo constante)
- Sem chamadas de API ou I/O
- Processamento totalmente síncrono
- Otimizado para uso em larga escala

## Próximos Passos

- [Guia de Configuração](./CONFIGURATION.md)
- [Formatador de Datas](./DATE_FORMATTER.md)
- [Referência Completa da API](./API_REFERENCE.md)

