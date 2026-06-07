// Copyright 2025 Circle LLC
// Licensed under the MIT License

// Os contratos de validação agora vivem colocados com o Validator, em
// `./classes/validator/validator.types.ts`. Este arquivo é mantido como ponto de
// entrada estável (`./types.js`) e apenas reexporta esses tipos — qualquer import
// existente de `../../types` / `./types.js` continua resolvendo sem alteração.

export type * from "./classes/validator/validator.types.js"
