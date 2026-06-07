# 🌍 Timezone

Formatação de datas e **tempo relativo** baseada em `Intl` nativo, com **horário de verão (DST) automático**. Use nomes **IANA** (ex.: `America/Sao_Paulo`), nunca offsets fixos. O relógio é **injetável**, o que torna os testes determinísticos.

> Arquitetura e fluxo: [`timezone-flow.md`](./timezone-flow.md)

```typescript
import { Timezone } from "circle-text-library/timezone"
```

---

## API

```typescript
// Estático
Timezone.detect(): string        // fuso IANA do sistema, ex.: "America/Sao_Paulo"

// Instância
const tz = new Timezone(config?)
tz.format(input, options?): string
tz.fromNow(input): string
tz.withConfig(patch): Timezone   // imutável
tz.config                        // readonly
```

`input: DateInput` aceita **string ISO**, **epoch em ms** (`number`) ou **`Date`**. Entradas inválidas lançam `"Data inválida fornecida"`.

---

## Configuração

```typescript
interface TimezoneConfig {
    zone?: string         // IANA; default: fuso detectado do sistema
    locale?: string       // BCP-47; default "pt-BR"
    now?: () => Date      // relógio injetável; default () => new Date()
}
```

---

## Formatar um instante UTC no fuso do leitor

```typescript
const tz = new Timezone({ zone: "America/Sao_Paulo", locale: "pt-BR" })

tz.format("2024-01-15T15:30:00Z")
// "15/01/2024, 12:30"   (15:30 UTC = 12:30 em São Paulo)

tz.format("2024-01-15T15:30:00Z", { dateStyle: "long" })
// "15 de janeiro de 2024"
```

`options` é um `Intl.DateTimeFormatOptions` (`dateStyle`, `timeStyle`, `hour`, `minute`, …) **mais** um `zone?` opcional para sobrescrever o fuso só naquela chamada. Sem opções de estilo, o padrão é `{ dateStyle: "short", timeStyle: "short" }`.

```typescript
tz.format("2024-01-15T15:30:00Z", { zone: "America/New_York" })
// formata o mesmo instante no fuso de Nova York
```

---

## Tempo relativo (`fromNow`)

```typescript
const tz = new Timezone({
    locale: "pt-BR",
    now: () => new Date("2024-01-15T15:30:00Z")   // relógio fixo p/ exemplo/teste
})

tz.fromNow("2024-01-15T12:30:00Z")   // "há 3 horas"
tz.fromNow("2024-01-14T15:30:00Z")   // "ontem"
```

Produz frases naturais em pt-BR (`agora`, `há X minutos`, `ontem`, `anteontem`, `há X dias`, `há X meses`, `há X anos`…) via `Intl.RelativeTimeFormat` com `numeric: "auto"`. Trocar `locale` muda o idioma das frases.

---

## Casos de uso

### Exibir "postado há…" num feed

```typescript
const tz = new Timezone()   // fuso e locale do sistema
function postedAt(iso: string) {
    return tz.fromNow(iso)   // "há 5 minutos", "ontem", …
}
```

### Mesma data, fusos diferentes (UTC no banco)

```typescript
const sp = new Timezone({ zone: "America/Sao_Paulo" })
const ny = new Timezone({ zone: "America/New_York" })
const utc = "2024-07-15T18:00:00Z"
sp.format(utc)   // horário em São Paulo
ny.format(utc)   // horário em Nova York (DST aplicado automaticamente)
```

### Testes determinísticos

```typescript
const tz = new Timezone({ now: () => new Date("2024-01-15T15:30:00Z") })
expect(tz.fromNow("2024-01-15T15:29:00Z")).toBe("há 1 minuto")
```

### Detectar o fuso do cliente

```typescript
const zone = Timezone.detect()          // "America/Sao_Paulo"
const tz = new Timezone({ zone })
```
