# Documentação da Circle Text Library

Documentação completa e detalhada de todos os módulos e funcionalidades da biblioteca.

## Guias de Início

### [Guia de Configuração](./CONFIGURATION.md)

Instruções completas para configurar a biblioteca, incluindo:

- Inicialização básica
- Configuração por módulo
- Boas práticas
- Configurações dinâmicas

### [Exemplos Práticos](./EXAMPLES.md)

Exemplos completos de uso em cenários reais:

- Aplicação de rede social
- Sistema de comentários
- Notificações
- Moderação de conteúdo
- Sistema de busca
- Workflows completos

## Documentação por Módulo

### [Sistema de Validação](./VALIDATION.md)

Validação robusta com regras configuráveis:

- Username
- Password
- Hashtag
- URL
- Name
- Description

### [Sistema de Extração](./EXTRACTION.md)

Extração inteligente de entidades:

- Menções (@user)
- Hashtags (#tech)
- URLs (https://)
- Keywords

### [Análise de Sentimento](./SENTIMENT.md)

Análise contextual em português:

- Classificação (positive, negative, neutral)
- Intensidade (0.0 - 1.0)
- Suporte a emojis
- Detecção de ironia
- Cache inteligente

### [Formatador de Datas](./DATE_FORMATTER.md)

Conversão de datas para texto humanizado:

- Estilos (full, short, abbreviated)
- Múltiplos idiomas (português, inglês)
- Tempo aproximado
- Janela de tempo recente
- Formatação completa de datas

### [Conversor Numérico](./CONVERSOR.md)

Formatação de números e textos:

- Formatação com separadores de milhares
- Conversão para formato curto (K, M, B)
- Corte de texto com sufixo
- Capitalização
- Inversão de strings

### [Rich Text](./RICH_TEXT.md)

Formatação enriquecida de texto:

- Identificação automática de entidades
- Mapeamento de IDs
- Múltiplos formatos de saída
- Conversão bidirecional

### [Gerenciamento de Timezone](./TIMEZONE.md)

Conversão entre fusos horários:

- 14 zonas suportadas
- Conversão UTC ↔ Local
- Detecção automática
- Performance otimizada

## Referência Técnica

### [Referência Completa da API](./API_REFERENCE.md)

Documentação técnica detalhada:

- Todas as classes e métodos
- Parâmetros e retornos
- Tipos TypeScript
- Interfaces e enums

## Estrutura da Documentação

```
docs/
├── README.md                 # Este arquivo (índice geral)
├── CONFIGURATION.md         # Guia de configuração
├── EXAMPLES.md              # Exemplos práticos
├── VALIDATION.md            # Sistema de validação
├── EXTRACTION.md            # Sistema de extração
├── SENTIMENT.md             # Análise de sentimento
├── DATE_FORMATTER.md        # Formatador de datas
├── CONVERSOR.md             # Conversor numérico
├── RICH_TEXT.md             # Rich text
├── TIMEZONE.md              # Gerenciamento de timezone
└── API_REFERENCE.md         # Referência da API
```

## Navegação Rápida

### Por Funcionalidade

**Preciso validar dados de entrada?**
→ [Sistema de Validação](./VALIDATION.md)

**Preciso extrair menções, hashtags ou URLs?**
→ [Sistema de Extração](./EXTRACTION.md)

**Preciso analisar o sentimento de um texto?**
→ [Análise de Sentimento](./SENTIMENT.md)

**Preciso formatar datas para exibição?**
→ [Formatador de Datas](./DATE_FORMATTER.md)

**Preciso formatar números?**
→ [Conversor Numérico](./CONVERSOR.md)

**Preciso trabalhar com rich text?**
→ [Rich Text](./RICH_TEXT.md)

**Preciso converter entre fusos horários?**
→ [Gerenciamento de Timezone](./TIMEZONE.md)

**Preciso ver exemplos completos?**
→ [Exemplos Práticos](./EXAMPLES.md)

**Preciso consultar a API?**
→ [Referência da API](./API_REFERENCE.md)

## Versão

Documentação para Circle Text Library v1.1.0

## Suporte

Para questões técnicas ou suporte, consulte a [Referência da API](./API_REFERENCE.md) ou os [Exemplos Práticos](./EXAMPLES.md).

---

[← Voltar ao README Principal](../README.md)
