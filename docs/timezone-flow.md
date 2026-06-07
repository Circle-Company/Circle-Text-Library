# 🌍 Timezone — Fluxo Simplificado (proposta de redesign)

> Objetivo: tornar o uso de timezone **trivial** para uma rede social, usando apenas
> APIs nativas do JavaScript (`Intl`), sem conversores de `Date` manuais e sem o usuário
> precisar saber o que é "offset", "BRT vs BRST" ou horário de verão.

---

## 🔴 O problema atual

A classe `Timezone` de hoje (`src/classes/timezone/index.ts`) trata fuso como um
**offset fixo em horas** e força o consumidor a converter objetos `Date` na mão:

```typescript
import { Timezone, TimezoneCodes } from "circle-text-library/timezone"

const brt = new Timezone(TimezoneCodes.BRT)        // o dev precisa saber que BRT = -3
const utcDate = new Date("2024-01-15T15:30:00Z")
const local = brt.UTCToLocal(utcDate)              // retorna um Date "deslocado"
// ...e ainda falta formatar para exibir na tela
```

Por que isso é complexo e arriscado numa rede social:

1. **Não trata horário de verão.** O dev tem que escolher manualmente entre `BRT` e
   `BRST`, `EST` e `EDT`, etc. Em 15/jan o offset de São Paulo é -3; em 15/jan de um ano
   com horário de verão era -2. A lib não sabe disso — o erro vira responsabilidade do dev.
2. **`UTCToLocal` devolve um `Date` que "mente".** Um `Date` em JS é sempre um instante
   absoluto (UTC por dentro). Somar o offset em `getTime()` faz `getUTCHours()` parecer
   "local", mas `.toISOString()` passa a estar errado. Esse `Date` não pode ser serializado
   nem comparado com segurança.
3. **Ainda falta formatar.** Depois de "converter", o dev precisa montar a string de
   exibição por conta própria (`dd/mm hh:mm`, "há 2 horas", etc.).
4. **Mapa de offsets triplicado e com bugs.** `setTimezone`, `getCurrentTimezone` e
   `getTimezoneFromOffset` repetem o mesmo `if/else`; como `CDT` e `EST` compartilham -5
   (e `MDT`/`CST` compartilham -6, `MST`/`PDT` -7), há ramos inalcançáveis — a conversão
   reversa de offset → código é ambígua por construção.

---

## 💡 A virada de chave

Numa rede social, o ciclo de vida de uma data é sempre o mesmo:

```
Servidor grava em UTC  ──►  Cliente formata na hora de exibir, no fuso de quem lê
   2024-01-15T15:30:00Z          "15/01/2024 12:30"  ou  "há 3 horas"
```

Ou seja: **a gente nunca precisa "converter Date entre fusos".** A gente precisa de duas
operações de leitura:

- **Formatar** um instante UTC para exibição num fuso (absoluto).
- **Tempo relativo** ("há 3 horas", "agora mesmo", "ontem").

E uma de descoberta:

- **Detectar** o fuso de quem está lendo, automaticamente.

O navegador/Node já faz tudo isso de forma nativa e **com horário de verão correto**, via
`Intl`. Não precisamos de offsets nem de uma tabela de fusos mantida à mão.

---

## 🧰 As ferramentas nativas

| Necessidade                         | API nativa                                             | Trata horário de verão? |
| ----------------------------------- | ------------------------------------------------------ | ----------------------- |
| Formatar instante num fuso          | `Intl.DateTimeFormat(locale, { timeZone })`            | ✅ Sim, automático       |
| Tempo relativo ("há 3 horas")       | `Intl.RelativeTimeFormat(locale, { numeric: "auto" })` | —                       |
| Detectar fuso do usuário            | `Intl.DateTimeFormat().resolvedOptions().timeZone`     | ✅                       |
| Identificar fusos (IANA)            | `"America/Sao_Paulo"`, `"America/New_York"`, `"UTC"`   | ✅                       |

O segredo é trocar abreviações ambíguas (`BRT`, `EST`) por **nomes IANA** (`America/Sao_Paulo`,
`America/New_York`). O nome IANA descreve a *região*, e o `Intl` decide sozinho se naquele
instante o offset é -3 ou -2. As 14 abreviações atuais colapsam em ~8 fusos sem ambiguidade.

---

## ✅ O fluxo mais simples possível

A API proposta tem **3 métodos**. Recebe `string | number | Date` (ISO, epoch ms ou `Date`)
e o padrão de locale é `pt-BR`.

```typescript
const tz = circleText.transform.timezone
```

### 1. Detectar o fuso de quem está lendo

```typescript
tz.detect()
// ✅ "America/Sao_Paulo"  (lido do sistema do usuário, automático)
```

### 2. Formatar um timestamp UTC para exibição

```typescript
// O servidor mandou isto; o usuário está em São Paulo:
tz.format("2024-01-15T15:30:00Z")
// ✅ "15/01/2024 12:30"

// Só a data:
tz.format("2024-01-15T15:30:00Z", { dateStyle: "long" })
// ✅ "15 de janeiro de 2024"

// Exibindo no fuso de outra pessoa (ex.: post de um amigo em Nova York):
tz.format("2024-01-15T15:30:00Z", { zone: "America/New_York" })
// ✅ "15/01/2024 10:30"
```

### 3. Tempo relativo (o "há X" do feed)

```typescript
tz.fromNow("2024-01-15T15:30:00Z")
// ✅ "há 3 horas"   (ou "agora mesmo", "ontem", "há 2 dias"...)
```

Pronto. Não há `UTCToLocal`, `localToUTC`, `TimezoneCodes`, nem offsets. O dev grava UTC no
servidor e chama `format` / `fromNow` na hora de pintar a tela.

---

## 🛠️ Como atingimos isso

A classe inteira cabe em ~50 linhas e delega tudo para `Intl`:

```typescript
export type DateInput = string | number | Date

export interface TimezoneConfig {
    zone?: string   // nome IANA; default = fuso detectado do sistema
    locale?: string // default = "pt-BR"
}

// Unidades para o tempo relativo, da menor para a maior
const DIVISIONS: { amount: number; unit: Intl.RelativeTimeFormatUnit }[] = [
    { amount: 60, unit: "second" },
    { amount: 60, unit: "minute" },
    { amount: 24, unit: "hour" },
    { amount: 7, unit: "day" },
    { amount: 4.34524, unit: "week" },
    { amount: 12, unit: "month" },
    { amount: Number.POSITIVE_INFINITY, unit: "year" }
]

export class Timezone {
    private readonly zone: string
    private readonly locale: string

    constructor(config: TimezoneConfig = {}) {
        this.zone = config.zone ?? Timezone.detect()
        this.locale = config.locale ?? "pt-BR"
    }

    /** Fuso IANA do ambiente atual, ex.: "America/Sao_Paulo". */
    public static detect(): string {
        return Intl.DateTimeFormat().resolvedOptions().timeZone
    }

    /** Formata um instante UTC para exibição. Horário de verão é tratado pelo Intl. */
    public format(input: DateInput, options: Intl.DateTimeFormatOptions & { zone?: string } = {}): string {
        const { zone, ...rest } = options
        return new Intl.DateTimeFormat(this.locale, {
            timeZone: zone ?? this.zone,
            dateStyle: "short",
            timeStyle: "short",
            ...rest
        }).format(this.toDate(input))
    }

    /** Tempo relativo a agora: "há 3 horas", "agora mesmo", "ontem". */
    public fromNow(input: DateInput): string {
        let delta = (this.toDate(input).getTime() - Date.now()) / 1000 // segundos (negativo = passado)
        const rtf = new Intl.RelativeTimeFormat(this.locale, { numeric: "auto" })

        for (const { amount, unit } of DIVISIONS) {
            if (Math.abs(delta) < amount) return rtf.format(Math.round(delta), unit)
            delta /= amount
        }
        return rtf.format(Math.round(delta), "year")
    }

    /** Normaliza ISO string / epoch ms / Date e valida. */
    private toDate(input: DateInput): Date {
        const date = input instanceof Date ? input : new Date(input)
        if (isNaN(date.getTime())) throw new Error("Data inválida fornecida")
        return date
    }
}
```

Pontos de implementação:

- **Validação preservada:** `toDate` mantém o `throw new Error("Data inválida fornecida")`
  que os testes atuais já esperam.
- **Zero tabela de offsets:** os três `if/else` gigantes (e seus ramos inalcançáveis) somem.
- **Wiring no facade:** em `src/index.ts`, `transform.timezone` passa a ser
  `new Timezone(config.timezoneConfig)` em vez de `new Timezone(code ?? UTC)`.
- **Subpath export:** `circle-text-library/timezone` continua válido — só muda o conteúdo
  exportado (`Timezone`, `TimezoneConfig`, `DateInput`); `TimezoneCodes` é removido.

---

## 🔁 Migração (de → para)

| Hoje                                       | Proposta                                          |
| ------------------------------------------ | ------------------------------------------------- |
| `new Timezone(TimezoneCodes.BRT)`          | `new Timezone({ zone: "America/Sao_Paulo" })`     |
| `tz.UTCToLocal(date)` + formatar à mão     | `tz.format(date)`                                 |
| `tz.localToUTC(date)`                      | (desnecessário — grave UTC direto no servidor)    |
| `Timezone.getCurrentTimezone()`            | `Timezone.detect()`                               |
| `tz.getTimezoneOffset()` / `...Code()`     | (não exposto — o `Intl` resolve internamente)     |

Mapa das abreviações antigas → IANA (note como ST/DT colapsam num único fuso, porque o
horário de verão passa a ser automático):

| Abreviação(ões) antigas | Fuso IANA            |
| ----------------------- | -------------------- |
| `UTC`                   | `UTC`                |
| `BRT`, `BRST`           | `America/Sao_Paulo`  |
| `EST`, `EDT`            | `America/New_York`   |
| `CST`, `CDT`            | `America/Chicago`    |
| `MST`, `MDT`            | `America/Denver`     |
| `PST`, `PDT`            | `America/Los_Angeles`|
| `AKST`, `AKDT`          | `America/Anchorage`  |
| `HST`                   | `Pacific/Honolulu`   |

> Se for preciso uma transição suave, dá para manter um shim opcional que aceita as
> abreviações antigas e as traduz para IANA pela tabela acima — mas a recomendação é
> remover `TimezoneCodes` e padronizar em nomes IANA.

---

## 📊 Antes vs. Depois

| Critério                       | Antes (offset manual)            | Depois (`Intl` nativo)         |
| ------------------------------ | -------------------------------- | ------------------------------ |
| Linhas na classe               | ~120 (com ramos inalcançáveis)   | ~50                            |
| Horário de verão               | ❌ manual (BRT vs BRST)           | ✅ automático                   |
| Formatação de exibição         | ❌ por conta do dev               | ✅ embutida (`format`)          |
| Tempo relativo do feed         | ❌ inexistente                    | ✅ `fromNow`                    |
| Dependências                   | só nativo                        | só nativo (`Intl`)             |
| Risco de `Date` corrompido     | alto (`UTCToLocal` desloca)      | nenhum (nunca muta o instante) |
| Conhecimento exigido do dev    | offsets, fusos, horário de verão | "grave UTC, formate ao exibir" |
