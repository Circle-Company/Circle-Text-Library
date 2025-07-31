# 📝 Circle Text - Processamento de texto para Moments

**CircleText** resolve o problema de processamento de textos de forma leve rápida para ser usada na interface e sistema do **_Circle App_**.

# Estrutura

- validate:
    - username
    - hashtags
    - urls
- extract:
    - username
    - hashtags
    - urls
    - keywords
- analize:
  -sentiment

# ✅ Validação

### 👤 Nome de usuário

Valida se o nome de usuário está escrito corretamente conforme as regras:

- Possui o `@` no início.
- Mínimo de 4 e máximo de 20 caractéres (exluindo o `@`).
- Que não começa ou termina com `.`.
- Que não contém múltiplos `_` e `.` seguidos.
- Se todos os caractéres estão minúsculos.

Exemplos:

```js
circleText.validation.username("@test_user") // deve retornar "true"
circleText.validation.username("test_user") // deve retornar "true"
circleText.validation.username("invalid user") // deve retornar "false"
circleText.validation.username("") // deve retornar "false"
```

### #️⃣ Hashtags

- valida se o texto inserido inicia com `#`
- valida que a hashtag não tenha espaçamento no meio do texto

Exemplos:

```js
circleText.validation.hashtag("#example") // deve retornar "true"
circleText.validation.hashtag("example") // deve retornar "false"
circleText.validation.hashtag("#invalid hashtag") // deve retornar "false"
circleText.validation.hashtag("") // deve retornar "false"
```

### 🌐 Urls

- valida se o texto começa com `https://` ou `http://`
- valida formato do protocolo, autenticação, host, porta, e path da url estão corretos

Exemplos:

```js
circleText.validation.url("https://example.com") // deve retornar "true"
circleText.validation.url("http://example.com") // deve retornar "true"
circleText.validation.url("example.com", false) // deve retornar "true"
circleText.validation.url("invalid-url") // deve retornar "false"
circleText.validation.url("") // deve retornar "false"
```

---

# ⬆️ Extração

### 👤 Nome de usuário

Extrai do texto as menções, valida o formato e retorna um array com as menções válidas:

```js
const text = "Check out @test_user and @another_user!"
const mentions = circleText.extract.mentions(text)
// deve retornar: ["@test_user", "@another_user"]
```

### #️⃣ Hashtags

Extrai do texto as hashtags, valida o formato e retorna um array com as tags válidas:

```js
const text = "Check out #example and #test!"
const hashtags = circleText.extract.hashtags(text)
// deve retornar: ["#example", "#test"]
```

### 🌐 Urls

Extrai do texto as urls, valida o formato e retorna um array com as urls válidas:

```js
const text = "Visit https://example.com and http://test.com for more info."
const urls = circleText.extract.urls(text)
// deve retornar: ["https://example.com", "http://test.com"]
```

###### Copyright 2025 Circle Company, Inc. Licensed under the Circle License, Version 1.0