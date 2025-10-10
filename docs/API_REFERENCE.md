# Referência Completa da API

Documentação detalhada de todas as classes, métodos e tipos da Circle Text Library.

## Índice

- [TextLibrary](#textlibrary)
- [Validator](#validator)
- [Extractor](#extractor)
- [SentimentExtractor](#sentimentextractor)
- [DateFormatter](#dateformatter)
- [Conversor](#conversor)
- [RichText](#richtext)
- [Timezone](#timezone)
- [Tipos TypeScript](#tipos-typescript)

## TextLibrary

Classe principal que agrupa todos os módulos da biblioteca.

### Constructor

```typescript
new TextLibrary(config: CircleTextProps)
```

#### Parâmetros

| Nome     | Tipo              | Obrigatório | Descrição              |
| -------- | ----------------- | ----------- | ---------------------- |
| `config` | `CircleTextProps` | Sim         | Objeto de configuração |

#### Propriedades

| Nome        | Tipo                 | Descrição                             |
| ----------- | -------------------- | ------------------------------------- |
| `validator` | `Validator`          | Instância do validador                |
| `extractor` | `Extractor`          | Instância do extrator                 |
| `sentiment` | `SentimentExtractor` | Instância do analisador de sentimento |
| `conversor` | `Conversor`          | Instância do conversor                |
| `date`      | `DateFormatter`      | Instância do formatador de datas      |
| `rich`      | `RichText`           | Instância do formatador de rich text  |
| `timezone`  | `Timezone`           | Instância do gerenciador de timezone  |

## Validator

Módulo de validação com regras configuráveis.

### Métodos

#### username()

```typescript
username(value: string, customRules?: UsernameValidationRules): ValidationResult
```

Valida um username.

**Retorno:** `{ isValid: boolean, errors: string[] }`

#### password()

```typescript
password(value: string, customRules?: PasswordValidationRules): ValidationResult
```

Valida uma senha.

**Retorno:** `{ isValid: boolean, errors: string[] }`

#### hashtag()

```typescript
hashtag(value: string, customRules?: HashtagValidationRules): ValidationResult
```

Valida uma hashtag.

**Retorno:** `{ isValid: boolean, errors: string[] }`

#### url()

```typescript
url(value: string, customRules?: UrlValidationRules): ValidationResult
```

Valida uma URL.

**Retorno:** `{ isValid: boolean, errors: string[] }`

#### name()

```typescript
name(value: string, customRules?: NameValidationRules): ValidationResult
```

Valida um nome de pessoa.

**Retorno:** `{ isValid: boolean, errors: string[] }`

#### description()

```typescript
description(value: string, customRules?: DescriptionValidationRules): ValidationResult
```

Valida uma descrição.

**Retorno:** `{ isValid: boolean, errors: string[] }`

## Extractor

Módulo de extração de entidades e keywords.

### Métodos

#### setText()

```typescript
setText(text: string): void
```

Define o texto a ser analisado.

#### entities()

```typescript
entities(options: ExtractOptions): PartialExtractResult
```

Extrai entidades do texto.

**Parâmetros:**

- `options.mentions` (boolean): Extrair menções
- `options.hashtags` (boolean): Extrair hashtags
- `options.urls` (boolean): Extrair URLs

**Retorno:** Objeto com arrays de entidades extraídas.

#### keywords()

```typescript
keywords(): string[]
```

Extrai keywords do texto.

**Retorno:** Array de strings com as keywords.

## SentimentExtractor

Módulo de análise de sentimento.

### Métodos

#### analyze()

```typescript
analyze(text: string): SentimentReturnProps
```

Analisa o sentimento de um texto.

**Retorno:**

```typescript
{
  sentiment: 'positive' | 'negative' | 'neutral',
  intensity: number  // 0.0 a 1.0
}
```

## DateFormatter

Módulo de formatação de datas.

### Constructor

```typescript
new DateFormatter(config?: DateFormatterConfig)
```

### Métodos de Formatação

#### toRelativeTime()

```typescript
toRelativeTime(date: Date): string
```

Converte data para texto relativo.

**Retorno:** String com tempo relativo ("10 minutos atrás", "2h", etc.)

**Lança:** Erro se data for inválida ou futura.

#### toFullDate()

```typescript
toFullDate(date: Date): string
```

Formata data por extenso.

**Retorno:** String com data completa ("15 de janeiro de 2024")

#### toShortDate()

```typescript
toShortDate(date: Date): string
```

Formata data em formato curto.

**Retorno:** String com data curta ("15/01/2024")

#### toTimeString()

```typescript
toTimeString(date: Date): string
```

Formata apenas a hora.

**Retorno:** String com hora ("14:30")

#### toFullDateTime()

```typescript
toFullDateTime(date: Date): string
```

Formata data e hora completa.

**Retorno:** String com data e hora ("15 de janeiro de 2024 às 14:30")

### Métodos Utilitários

#### isPast()

```typescript
isPast(date: Date): boolean
```

Verifica se data está no passado.

#### isFuture()

```typescript
isFuture(date: Date): boolean
```

Verifica se data está no futuro.

#### isToday()

```typescript
isToday(date: Date): boolean
```

Verifica se data é hoje.

#### isYesterday()

```typescript
isYesterday(date: Date): boolean
```

Verifica se data foi ontem.

#### daysBetween()

```typescript
daysBetween(date1: Date, date2?: Date): number
```

Calcula diferença em dias entre datas.

### Métodos de Configuração

#### setStyle()

```typescript
setStyle(style: DateFormatStyle): void
```

Define estilo de formatação ('full', 'short', 'abbreviated').

#### setLocale()

```typescript
setLocale(locale: DateFormatLocale): void
```

Define locale ('pt-BR', 'en-US').

#### setUsePrefix()

```typescript
setUsePrefix(usePrefix: boolean): void
```

Define uso do prefixo "há".

#### setUseSuffix()

```typescript
setUseSuffix(useSuffix: boolean): void
```

Define uso do sufixo "atrás".

#### setCapitalize()

```typescript
setCapitalize(capitalize: boolean): void
```

Define capitalização da primeira letra.

#### setUseApproximateTime()

```typescript
setUseApproximateTime(useApproximateTime: boolean): void
```

Define uso de tempo aproximado.

#### setRecentTimeThreshold()

```typescript
setRecentTimeThreshold(threshold: number): void
```

Define threshold em segundos para tempo recente.

#### setRecentTimeLabel()

```typescript
setRecentTimeLabel(label: string): void
```

Define label customizado para tempo recente.

### Getters

#### getStyle()

```typescript
getStyle(): DateFormatStyle
```

Retorna estilo atual.

#### getLocale()

```typescript
getLocale(): DateFormatLocale
```

Retorna locale atual.

## Conversor

Módulo de conversão e formatação de números e textos.

### Métodos

#### sliceWithDots()

```typescript
sliceWithDots(options: { text: string, size?: number }): string
```

Corta texto adicionando sufixo.

**Retorno:** Texto cortado com sufixo.

#### capitalizeFirstLetter()

```typescript
capitalizeFirstLetter(text: string): string
```

Capitaliza primeira letra.

**Retorno:** Texto com primeira letra maiúscula.

#### invertStr()

```typescript
invertStr(text: string): string
```

Inverte uma string.

**Retorno:** String invertida.

#### formatNumWithDots()

```typescript
formatNumWithDots(num: number): string
```

Formata número com separadores de milhares.

**Retorno:** String com número formatado ("1.000.000").

#### convertNumToShort()

```typescript
convertNumToShort(num: number): string
```

Converte número para formato curto.

**Retorno:** String com número abreviado ("1.5 M", "500 K").

## RichText

Módulo de formatação de texto enriquecido.

### Métodos

#### setText()

```typescript
setText(text: string, entityMappings?: EntityMapping): void
```

Define texto e mapeamento de IDs de entidades.

#### getEnrichedText()

```typescript
getEnrichedText(): string
```

Retorna texto em formato enriquecido.

#### formatToNormal()

```typescript
formatToNormal(): string
```

Converte texto enriquecido para normal.

#### formatToUI()

```typescript
formatToUI(): RichTextUIFormat
```

Formata para renderização em UI.

**Retorno:**

```typescript
{
  text: string,
  entities: Array<{
    type: 'text' | 'mention' | 'hashtag' | 'url',
    text: string,
    id?: string,
    start: number,
    end: number
  }>
}
```

#### extractEntities()

```typescript
extractEntities(): {
  mentions: Array<{ text: string, id?: string }>,
  hashtags: Array<{ text: string, id?: string }>,
  urls: Array<{ text: string }>
}
```

Extrai entidades do texto enriquecido.

## Timezone

Módulo de gerenciamento de fusos horários.

### Constructor

```typescript
new Timezone(timezoneCode?: TimezoneCode)
```

### Métodos

#### UTCToLocal()

```typescript
UTCToLocal(utcDate: Date): Date
```

Converte data UTC para timezone local.

#### localToUTC()

```typescript
localToUTC(localDate: Date): Date
```

Converte data local para UTC.

#### getOffset()

```typescript
getOffset(): number
```

Retorna offset em horas.

#### getCode()

```typescript
getCode(): TimezoneCode
```

Retorna código do timezone.

#### setLocalTimezone()

```typescript
setLocalTimezone(code: TimezoneCode): void
```

Define timezone local.

#### getCodeFromOffset()

```typescript
getCodeFromOffset(offset: number): TimezoneCode
```

Retorna código do timezone a partir do offset.

#### getOffsetFromCode()

```typescript
getOffsetFromCode(code: TimezoneCode): number
```

Retorna offset a partir do código.

## Tipos TypeScript

### CircleTextProps

```typescript
interface CircleTextProps {
    validationRules: ValidationConfig
    extractorConfig?: ExtractorConfig
    sentimentConfig?: SentimentExtractorConfig
    conversorConfig?: ConversorConfig
    dateFormatterConfig?: DateFormatterConfig
    richTextConfig?: RichTextConfig
}
```

### ValidationResult

```typescript
interface ValidationResult {
    isValid: boolean
    errors: string[]
}
```

### ExtractOptions

```typescript
interface ExtractOptions {
    mentions?: boolean
    hashtags?: boolean
    urls?: boolean
}
```

### PartialExtractResult

```typescript
interface PartialExtractResult {
    mentions?: string[]
    hashtags?: string[]
    urls?: string[]
}
```

### SentimentReturnProps

```typescript
interface SentimentReturnProps {
    sentiment: "positive" | "negative" | "neutral"
    intensity: number
}
```

### DateFormatterConfig

```typescript
interface DateFormatterConfig {
    style?: "full" | "short" | "abbreviated"
    locale?: "pt-BR" | "en-US"
    usePrefix?: boolean
    useSuffix?: boolean
    capitalize?: boolean
    useApproximateTime?: boolean
    recentTimeThreshold?: number
    recentTimeLabel?: string
}
```

### TimezoneCode

```typescript
enum TimezoneCode {
    UTC = "UTC",
    BRT = "BRT",
    BRST = "BRST",
    EST = "EST",
    EDT = "EDT",
    CST = "CST",
    CDT = "CDT",
    MST = "MST",
    MDT = "MDT",
    PST = "PST",
    PDT = "PDT",
    AKST = "AKST",
    AKDT = "AKDT",
    HST = "HST"
}
```

## Próximos Passos

- [Guia de Configuração](./CONFIGURATION.md)
- [Sistema de Validação](./VALIDATION.md)
- [Sistema de Extração](./EXTRACTION.md)
- [Formatador de Datas](./DATE_FORMATTER.md)
