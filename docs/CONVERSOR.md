# Conversor Numérico e de Texto

O módulo Conversor fornece métodos para formatação de números e manipulação de texto.

## Índice

- [Configuração](#configuração)
- [Formatação de Números](#formatação-de-números)
- [Manipulação de Texto](#manipulação-de-texto)
- [Casos de Uso](#casos-de-uso)

## Configuração

### Inicialização

```typescript
import { TextLibrary } from "circle-text-library"

const textLib = new TextLibrary({
    validationRules: { /* ... */ },
    conversorConfig: {
        thousandsSeparator: ".",      // Separador de milhares
        defaultSliceLength: 100,      // Tamanho padrão para corte
        sliceSuffix: "..."           // Sufixo para texto cortado
    }
})
```

### Propriedades de Configuração

| Propriedade | Tipo | Padrão | Descrição |
|------------|------|--------|-----------|
| `thousandsSeparator` | `string` | `"."` | Separador de milhares |
| `defaultSliceLength` | `number` | `100` | Tamanho padrão para corte de texto |
| `sliceSuffix` | `string` | `"..."` | Sufixo adicionado ao texto cortado |

## Formatação de Números

### formatNumWithDots()

Formata números com separadores de milhares.

```typescript
textLib.conversor.formatNumWithDots(1000)
// "1.000"

textLib.conversor.formatNumWithDots(1000000)
// "1.000.000"

textLib.conversor.formatNumWithDots(1234567890)
// "1.234.567.890"
```

#### Separadores Customizados

```typescript
// Formato brasileiro (ponto)
const brLib = new TextLibrary({
    validationRules: { /* ... */ },
    conversorConfig: { thousandsSeparator: "." }
})
brLib.conversor.formatNumWithDots(1000000)  // "1.000.000"

// Formato americano (vírgula)
const usLib = new TextLibrary({
    validationRules: { /* ... */ },
    conversorConfig: { thousandsSeparator: "," }
})
usLib.conversor.formatNumWithDots(1000000)  // "1,000,000"

// Formato europeu (espaço)
const euLib = new TextLibrary({
    validationRules: { /* ... */ },
    conversorConfig: { thousandsSeparator: " " }
})
euLib.conversor.formatNumWithDots(1000000)  // "1 000 000"
```

### convertNumToShort()

Converte números para formato abreviado.

```typescript
textLib.conversor.convertNumToShort(999)
// "999"

textLib.conversor.convertNumToShort(1500)
// "1.5 K"

textLib.conversor.convertNumToShort(1500000)
// "1.5 M"

textLib.conversor.convertNumToShort(1500000000)
// "1.5 B"

textLib.conversor.convertNumToShort(0)
// "0"
```

#### Unidades

| Valor | Unidade | Exemplo |
|-------|---------|---------|
| < 1.000 | Nenhuma | "999" |
| 1.000 - 999.999 | K (mil) | "1.5 K" |
| 1.000.000 - 999.999.999 | M (milhão) | "1.5 M" |
| ≥ 1.000.000.000 | B (bilhão) | "1.5 B" |

## Manipulação de Texto

### sliceWithDots()

Corta texto adicionando sufixo quando necessário.

```typescript
textLib.conversor.sliceWithDots({
    text: "Este é um texto muito longo para ser exibido",
    size: 20
})
// "Este é um texto muit..."

// Usando tamanho padrão
textLib.conversor.sliceWithDots({
    text: "a".repeat(150)
})
// Retorna 100 caracteres + "..."
```

#### Comportamento

- Se o texto for menor que `size`, retorna o texto completo
- Se o texto for maior, corta em `size` e adiciona `sliceSuffix`
- Se `size` não for fornecido, usa `defaultSliceLength`

### capitalizeFirstLetter()

Capitaliza a primeira letra de um texto.

```typescript
textLib.conversor.capitalizeFirstLetter("texto exemplo")
// "Texto exemplo"

textLib.conversor.capitalizeFirstLetter("água")
// "Água"

textLib.conversor.capitalizeFirstLetter("")
// ""
```

### invertStr()

Inverte uma string.

```typescript
textLib.conversor.invertStr("hello")
// "olleh"

textLib.conversor.invertStr("hello world")
// "dlrow olleh"

textLib.conversor.invertStr("arara")
// "arara" (palíndromo)
```

## Casos de Uso

### 1. Exibição de Contadores em Redes Sociais

```typescript
function formatSocialStats(stats) {
    return {
        views: textLib.conversor.convertNumToShort(stats.views),
        likes: textLib.conversor.convertNumToShort(stats.likes),
        shares: textLib.conversor.convertNumToShort(stats.shares),
        comments: textLib.conversor.convertNumToShort(stats.comments)
    }
}

const stats = {
    views: 1500000,
    likes: 45000,
    shares: 8500,
    comments: 1200
}

const formatted = formatSocialStats(stats)
// {
//   views: "1.5 M",
//   likes: "45 K",
//   shares: "8.5 K",
//   comments: "1.2 K"
// }
```

### 2. Preview de Posts

```typescript
function createPostPreview(postContent, maxLength = 100) {
    const preview = textLib.conversor.sliceWithDots({
        text: postContent,
        size: maxLength
    })
    
    return {
        preview,
        isTruncated: preview.endsWith("...")
    }
}

const post = "Este é um post muito longo que precisa ser cortado para exibição em preview nas notificações do aplicativo"

createPostPreview(post, 50)
// {
//   preview: "Este é um post muito longo que precisa ser corta...",
//   isTruncated: true
// }
```

### 3. Formatação de Estatísticas

```typescript
function displayUserStats(user) {
    return {
        followers: textLib.conversor.formatNumWithDots(user.followersCount),
        following: textLib.conversor.formatNumWithDots(user.followingCount),
        posts: textLib.conversor.formatNumWithDots(user.postsCount),
        
        // Versão compacta
        followersShort: textLib.conversor.convertNumToShort(user.followersCount),
        followingShort: textLib.conversor.convertNumToShort(user.followingCount)
    }
}

displayUserStats({
    followersCount: 125000,
    followingCount: 850,
    postsCount: 342
})
// {
//   followers: "125.000",
//   following: "850",
//   posts: "342",
//   followersShort: "125 K",
//   followingShort: "850"
// }
```

### 4. Títulos e Descrições

```typescript
function formatTitle(title, maxLength) {
    const capitalized = textLib.conversor.capitalizeFirstLetter(title)
    
    return textLib.conversor.sliceWithDots({
        text: capitalized,
        size: maxLength
    })
}

formatTitle("guia completo de programação", 25)
// "Guia completo de progr..."
```

### 5. Formatação Multi-Regional

```typescript
function formatNumberByRegion(number, region) {
    const configs = {
        BR: { thousandsSeparator: "." },
        US: { thousandsSeparator: "," },
        EU: { thousandsSeparator: " " }
    }
    
    const lib = new TextLibrary({
        validationRules: { /* ... */ },
        conversorConfig: configs[region]
    })
    
    return lib.conversor.formatNumWithDots(number)
}

formatNumberByRegion(1234567, "BR")  // "1.234.567"
formatNumberByRegion(1234567, "US")  // "1,234,567"
formatNumberByRegion(1234567, "EU")  // "1 234 567"
```

## Performance

- Processamento síncrono
- Operações O(n) onde n é o tamanho do número/texto
- Sem dependências externas
- Otimizado para uso em larga escala

## Próximos Passos

- [Guia de Configuração](./CONFIGURATION.md)
- [Sistema de Validação](./VALIDATION.md)
- [Referência Completa da API](./API_REFERENCE.md)

