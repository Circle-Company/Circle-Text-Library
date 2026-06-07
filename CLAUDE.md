# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

`circle-text-library` is an ESM-only TypeScript library for text validation, extraction, and analysis (sentiment, keywords, rich text, timezones), built for the Circle App. It ships compiled output from `dist/` and is published to npm. The codebase, code comments, and all user-facing error messages are in **Brazilian Portuguese (pt-BR)** — match that language when editing existing strings.

## Commands

```bash
npm run build          # tsc compile + emit .d.ts to dist/
npm test               # run all tests (vitest, watch mode by default)
npm test -- --run      # run all tests once and exit (use this in CI / for a single pass)
npm run test:coverage  # vitest with v8 coverage
npm run lint           # eslint src/**/*.ts
npm run lint:fix       # eslint with --fix
npm run dev            # tsc --watch
```

Run a single test file or test by name:

```bash
npx vitest run src/classes/validator/__tests__/password.spec.ts   # one file, single pass
npx vitest run -t "valida senha forte"                            # tests matching a name
```

## Architecture

`TextLibrary` (`src/index.ts`) is the **public facade**. Its constructor instantiates the specialized classes and wires them into three namespaces that are the entire public surface:

- `validate` → `Validator` — `username`, `hashtag`, `url`, `description`, `name`, `password`
- `extract` → `Extractor` (`content`), `KeywordExtractor` (`keywords`), `SentimentExtractor` (`sentiment`)
- `transform` → `Conversor` (number/text formatting), `RichText`, `Timezone`

Each specialized class lives under `src/classes/` and is independently usable; `TextLibrary` just composes them. `src/types.ts` holds the shared interface contracts (the `CircleText*` interfaces describe the facade's shape — note the class itself is named `TextLibrary`).

### Config-driven validation (the core pattern)

Every validator is data-driven, not hardcoded. A rule is a `ValidationRule { enabled, value?, description? }`. The `Validator` reads each rule, and when `enabled` is true it builds a dynamic `RegExp` from `value` and pushes `description` (or a default Portuguese message) onto an `errors[]` array. All validators return `ValidationResult { isValid, errors }`.

Rules can be supplied two ways, with the per-call argument taking precedence over the constructor config:
- `new TextLibrary({ validationRules: { username: {...} } })` — defaults
- `circleText.validate.username("x", { minLength: {...} })` — per-call override

`username`/`hashtag` throw if no rules exist in either place; the others fall back to a minimal non-empty check. When adding a new validation rule, extend the matching `*ValidationRules` interface in `types.ts` **and** add the corresponding `if (rules.x?.enabled ...)` block in `Validator`.

### Data-driven NLP

`SentimentExtractor` and `KeywordExtractor` load lexicons from `src/data/<lang>/*.json` (sentiment words, intensity words, connectors, irony indicators, emoji scores, stopwords, suffixes, slang). Tuning analysis behavior usually means editing these JSON files, not the algorithm. `SentimentExtractor` combines a base lexicon score with optional emoji/punctuation/repetition/irony/context analyzers (each toggleable via `SentimentExtractorConfig`) and memoizes results in an in-memory `Map` cache.

**Multi-language sentiment.** `SentimentExtractor` ships built-in lexicons for `pt-br` (default) and `en`, selected per instance via `new SentimentExtractor({ language: "en" })` (or `circleText.with({ sentiment: { language: "en" } })`). The lexicons live in `src/data/pt-br/` and `src/data/en/` and are wired through the `LEXICONS` registry in `src/classes/sentimentExtractor/index.ts` — each entry holds `{ sentiment, intensity, connectors, irony, adversatives }`. Emoji scores are language-neutral, so a single shared `emojiScore.json` (under `src/data/pt-br/`) is used for every language. Custom `lexicon`/`intensifiers`/`negators`/`ironyMarkers` still merge **over the selected language's base**. **To add a language:** create `src/data/<lang>/{sentimentWords,intensityWords,connectors,ironyMarkers}.json`, import them in `index.ts`, add a `SentimentLanguage` member in `sentimentExtractor.types.ts`, and register the entry (including its `adversatives` list) in `LEXICONS`.

### RichText format

`RichText` round-trips between three representations: normal text (`@user #tag https://...`), an **enriched string** (`[txt:user, ent:mention, id:123]`), and a **UI format** (entities with `start`/`end` offsets for rendering). Entity IDs are optional and supplied via `EntityMapping`. All operations are synchronous.

## Conventions that will bite you

- **ESM with explicit `.js` extensions.** `package.json` is `"type": "module"`. Relative *value* imports in `.ts` source must use the `.js` extension (e.g. `import { Extractor } from "./classes/extractor.js"`) so Node resolves the compiled output. Type-only imports omit the extension. Follow the existing pattern in `src/index.ts`.
- **JSON imports use import attributes:** `import X from "./data/...json" with { type: "json" }`.
- **`tsconfig.json` is strict** (`strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `noImplicitOverride`). Array/record accesses are `T | undefined` — guard them.
- **Tests run on TS source via vitest**, but `tsc` build excludes all `*.spec.ts`/`__tests__/` (see `tsconfig.json` `exclude`). Tests live in `__tests__/` dirs beside each class, plus `src/tests/`.
- **`package.json` exposes subpath exports** (`.`, `./timezone`, `./sentiment`) pointing into `dist/src/...`. Changing the source layout of those entrypoints means updating the `exports` map. (The repo's active branch history involves fixing these export paths — be careful here.)
- **README examples are partly stale**: they reference a `CircleText` class and deep `./src/...` import paths. The actual export is `TextLibrary`; trust `src/index.ts` over the README.
