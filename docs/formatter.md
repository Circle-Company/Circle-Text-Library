# 🔤 Formatadores (Conversor)

Formatação **locale-aware** de números e texto, sobre `Intl` nativo. Três classes:

- **`NumberFormatter`** — milhar, compacto, moeda, porcentagem, decimal, ordinal, tamanho de arquivo.
- **`TextFormatter`** — capitalização, slug, iniciais, truncamento (Unicode-safe), etc.
- **`Formatter`** — agrega `number` + `text` compartilhando o mesmo `locale`.

```typescript
import { NumberFormatter, TextFormatter, Formatter } from "circle-text-library/conversor"
```

O **locale padrão é `pt-BR`**. Os **atalhos estáticos** usam sempre pt-BR; para outro locale, instancie com `{ locale }` ou use `Formatter`.

---

## NumberFormatter

| Método | Assinatura | pt-BR | en-US |
|--------|-----------|-------|-------|
| `thousands` | `(n)` | `1234567 → "1.234.567"` | `"1,234,567"` |
| `compact` | `(n)` | `12500 → "12,5 mil"` | `"12.5K"` |
| `currency` | `(n, code="BRL")` | `1234.5 → "R$ 1.234,50"` | `(…, "USD") → "$1,234.50"` |
| `percent` | `(n, fraction=0)` | `0.875, 1 → "87,5%"` | `"87.5%"` |
| `decimal` | `(n, places=2)` | `3.14159 → "3,14"` | `"3.14"` |
| `ordinal` | `(n)` | `3 → "3º"` | `3 → "3rd"` |
| `fileSize` | `(bytes)` | `2500000 → "2,4 MB"` | `"2.4 MB"` |

```typescript
NumberFormatter.thousands(1234567)   // "1.234.567"
NumberFormatter.compact(12500)       // "12,5 mil"
NumberFormatter.currency(1234.5)     // "R$ 1.234,50"
NumberFormatter.percent(0.875, 1)    // "87,5%"
NumberFormatter.fileSize(2_500_000)  // "2,4 MB"
NumberFormatter.ordinal(3)           // "3º"
```

---

## TextFormatter

| Método | Assinatura | Exemplo |
|--------|-----------|---------|
| `capitalize` | `(t)` | `"olá mundo" → "Olá mundo"` |
| `titleCase` | `(t)` | `"olá mundo" → "Olá Mundo"` |
| `slug` | `(t)` | `"Olá, Mundo!" → "ola-mundo"` |
| `stripAccents` | `(t)` | `"ação" → "acao"` |
| `reverse` | `(t)` | `"a😀b" → "b😀a"` (Unicode-safe) |
| `initials` | `(name, max=2)` | `"João Silva" → "JS"` |
| `truncate` | `(t, size, opts?)` | `"texto bem longo", 8 → "texto b…"` |
| `truncateWords` | `(t, n, ellipsis="…")` | `"a b c d", 2 → "a b…"` |
| `brToNewlines` | `(t)` | `"a<br>b" → "a\nb"` |

```typescript
TextFormatter.capitalize("olá mundo")        // "Olá mundo"
TextFormatter.slug("Olá, Mundo!")            // "ola-mundo"
TextFormatter.initials("João Silva")         // "JS"
TextFormatter.truncate("texto bem longo", 8) // "texto b…"
```

### `truncate` — o "…" conta no orçamento

`truncate(t, size, opts?)` nunca passa de `size` caracteres; o ellipsis **conta** no limite. Opções:

```typescript
interface TruncateOptions {
    ellipsis?: string   // default "…"
    byWord?: boolean    // default false — se true, não corta no meio da palavra
}

TextFormatter.truncate("texto bem longo", 8)                    // "texto b…"
TextFormatter.truncate("texto bem longo", 8, { ellipsis: "..." }) // "texto..."
TextFormatter.truncate("texto bem longo", 8, { byWord: true })  // "texto…"
```

---

## Formatter (agrega number + text)

```typescript
const fmt = new Formatter({ locale: "pt-BR" })
fmt.number.currency(45000.5)        // "R$ 45.000,50"
fmt.text.titleCase("resultado do mês") // "Resultado Do Mês"

// Outro locale (imutável):
new Formatter({ locale: "en-US" }).number.compact(12500)   // "12.5K"
```

`withConfig({ locale })` deriva um novo `Formatter` (recria `number` e `text` com o novo locale).

---

## Casos de uso

### Card de produto

```typescript
const fmt = new Formatter()
const card = {
    price: fmt.number.currency(1999.9),     // "R$ 1.999,90"
    sold: fmt.number.compact(12500),        // "12,5 mil"
    rating: fmt.number.percent(0.92),       // "92%"
    slug: fmt.text.slug("Tênis Esportivo")  // "tenis-esportivo"
}
```

### Avatar com iniciais

```typescript
TextFormatter.initials("Maria Clara Souza")        // "MC"
TextFormatter.initials("Maria Clara Souza", 3)     // "MCS"
```

### Internacionalização de um relatório

```typescript
const report = (locale: string) => new Formatter({ locale })
report("pt-BR").number.currency(1000)   // "R$ 1.000,00"
report("en-US").number.currency(1000, "USD")  // "$1,000.00"
```
