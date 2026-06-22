# 📅 DateFormatter

Engine independente para **tempo relativo customizável** ("to relative time") — "agora mesmo", "há 3 horas", "ontem", "em 5 minutos" — em **pt-BR**, **en-US** ou qualquer locale BCP-47. É **separada do `Timezone`**: o tempo relativo não depende de nenhum fuso, mas a classe **conversa com o `Timezone`** quando você precisa de formatação **absoluta** (DST automático). O relógio é **injetável**, o que torna os testes determinísticos.

```typescript
import { DateFormatter } from "circle-text-library/date"
```

---

## API

```typescript
// Estático (locale default pt-BR, relógio do sistema)
DateFormatter.fromNow(input): string
DateFormatter.toRelativeTime(input): string

// Instância
const df = new DateFormatter(config?)
df.fromNow(input): string                       // tempo relativo customizável
df.toRelativeTime(input): string                // alias de fromNow
df.format(input, options?): string              // absoluto, via Timezone
df.fromNowOrDate(input, withinSeconds?, dateOptions?): string  // híbrido "feed"
df.withConfig(patch): DateFormatter             // imutável
df.withTimezone(tz): DateFormatter              // amarra a um Timezone (DI)
df.config                                        // readonly
```

`input: DateInput` aceita **string ISO**, **epoch em ms** (`number`) ou **`Date`**. Entradas inválidas lançam `"Data inválida fornecida"`.

---

## Configuração

```typescript
interface DateFormatterConfig {
    locale?: string                       // BCP-47; default "pt-BR" (use "en-US" p/ inglês)
    now?: () => Date                      // relógio injetável; default () => new Date()
    style?: "long" | "short" | "narrow"   // estilo das frases; default "long"
    numeric?: "always" | "auto"           // "auto" → "ontem"; "always" → "há 1 dia"; default "auto"
    maxUnit?: RelativeTimeUnit            // teto de unidade; default "year"
    justNowThreshold?: number             // segundos abaixo dos quais vira "agora"; default 30
    justNowLabel?: string                 // texto do "agora"; default pt "agora mesmo" / en "just now"
    zone?: string                         // IANA p/ formatação absoluta; default fuso do sistema
    timezone?: Timezone                   // instância de Timezone injetada (DI)
}
```

`RelativeTimeUnit` é `"second" | "minute" | "hour" | "day" | "week" | "month" | "quarter" | "year"`.

---

## Tempo relativo (`fromNow` / `toRelativeTime`)

```typescript
const df = new DateFormatter({
    locale: "pt-BR",
    now: () => new Date("2024-01-15T15:30:00Z")   // relógio fixo p/ exemplo/teste
})

df.fromNow("2024-01-15T15:29:50Z")   // "agora mesmo"   (< 30s)
df.fromNow("2024-01-15T12:30:00Z")   // "há 3 horas"
df.fromNow("2024-01-14T15:30:00Z")   // "ontem"
df.fromNow("2024-01-15T15:35:00Z")   // "em 5 minutos"  (futuro)
```

O mesmo em **inglês americano** — basta trocar o `locale`:

```typescript
const en = df.withConfig({ locale: "en-US" })

en.fromNow("2024-01-15T12:30:00Z")   // "3 hours ago"
en.fromNow("2024-01-14T15:30:00Z")   // "yesterday"
en.fromNow("2024-01-15T15:29:55Z")   // "just now"
```

---

## Customização

### `style` — comprimento da frase

```typescript
new DateFormatter({ style: "long" }).fromNow(d)    // "há 3 horas"
new DateFormatter({ style: "short" }).fromNow(d)   // "há 3 h"
new DateFormatter({ style: "narrow" }).fromNow(d)  // "há 3 h" / "3h atrás"
```

### `numeric` — "ontem" vs "há 1 dia"

```typescript
new DateFormatter({ numeric: "auto" }).fromNow(ontem)     // "ontem"
new DateFormatter({ numeric: "always" }).fromNow(ontem)   // "há 1 dia"
```

### `justNowThreshold` / `justNowLabel` — o "agora"

```typescript
// Trata qualquer coisa nos últimos 2 minutos como "agora mesmo".
new DateFormatter({ justNowThreshold: 120 }).fromNow(ha90segundos)   // "agora mesmo"

// Texto próprio.
new DateFormatter({ justNowLabel: "agorinha" }).fromNow(ha5segundos) // "agorinha"
```

### `maxUnit` — teto de unidade

```typescript
// Sem teto: rola para meses/anos.
new DateFormatter().fromNow(ha400dias)                 // "há 1 ano"

// Capado em dias: nunca passa de dias.
new DateFormatter({ maxUnit: "day" }).fromNow(ha400dias)   // "há 400 dias"
```

---

## Formatação absoluta — conversa com o `Timezone`

`format` delega ao `Timezone` (horário de verão tratado automaticamente). Você pode dar o fuso pela config (`zone`), injetar uma instância pronta (`timezone`) ou amarrar depois (`withTimezone`).

```typescript
// 1) fuso pela config
const df = new DateFormatter({ zone: "America/Sao_Paulo", locale: "pt-BR" })
df.format("2024-01-15T15:30:00Z")              // "15/01/2024, 12:30"
df.format("2024-01-15T15:30:00Z", { dateStyle: "long" })  // "15 de janeiro de 2024"

// 2) Timezone injetado (DI) — o locale do fuso é alinhado ao do DateFormatter
import { Timezone } from "circle-text-library/timezone"
const ny = new Timezone({ zone: "America/New_York" })
new DateFormatter({ timezone: ny }).format("2024-01-15T15:30:00Z")  // horário de NY

// 3) amarrar depois
df.withTimezone(ny).format("2024-01-15T15:30:00Z")
```

`options` é um `Intl.DateTimeFormatOptions` mais um `zone?` pontual — a mesma assinatura de `Timezone.format`.

---

## Híbrido estilo "feed" (`fromNowOrDate`)

Tempo relativo enquanto o instante é recente; **data absoluta** quando ultrapassa a janela — o padrão de timeline das redes sociais.

```typescript
const df = new DateFormatter({ zone: "America/Sao_Paulo", now: () => new Date("2024-01-15T15:30:00Z") })

df.fromNowOrDate("2024-01-15T12:30:00Z")   // "há 3 horas"            (dentro de 7 dias)
df.fromNowOrDate("2022-12-11T15:30:00Z")   // "11 de dez. de 2022"    (passou da janela)

// Janela e formato da data são configuráveis por chamada:
df.fromNowOrDate(iso, 24 * 60 * 60, { dateStyle: "short" })  // relativo só nas últimas 24h
```

---

## Casos de uso

### "Postado há…" num feed (pt-BR e en-US)

```typescript
const ptBR = new DateFormatter()                       // pt-BR, fuso do sistema
const enUS = new DateFormatter({ locale: "en-US" })

ptBR.fromNow(post.createdAt)   // "há 5 minutos"
enUS.fromNow(post.createdAt)   // "5 minutes ago"
```

### Timeline estilo Twitter (relativo → data)

```typescript
const df = new DateFormatter({ zone: "America/Sao_Paulo" })
function timestamp(iso: string) {
    return df.fromNowOrDate(iso)   // "agora mesmo" → "há 2 h" → "11 de dez. de 2022"
}
```

### Testes determinísticos

```typescript
const df = new DateFormatter({ now: () => new Date("2024-01-15T15:30:00Z") })
expect(df.fromNow("2024-01-15T15:29:00Z")).toBe("há 1 minuto")
```

### Via fachada `TextLibrary`

O `DateFormatter` é exposto como `date` e, por padrão, **conversa com o mesmo `Timezone`** da fachada:

```typescript
import { TextLibrary } from "circle-text-library"

const ct = new TextLibrary({
    timezone: { zone: "America/Sao_Paulo" },
    date: { locale: "pt-BR", justNowThreshold: 60 }
})

ct.date.fromNow("2024-01-15T12:30:00Z")   // "há 3 horas"
ct.date.format("2024-01-15T15:30:00Z")    // usa o fuso de São Paulo da fachada
```
