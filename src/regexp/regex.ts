// Copyright 2025 Circle Company, Inc.
// Licensed under the Circle License, Version 1.0

export const URL_PROTOCOL = "(?:(?:https?)://)"
export const URL_AUTH = "(?:\\S+(?::\\S*)?@)?"
export const URL_HOST =
    "(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|(?:[0-9]{1,3}\\.){3}[0-9]{1,3}|localhost)"
export const URL_PORT = "(?::\\d{2,5})?"
export const URL_PATH = '(?:[/?#][^\\s"]*)?'
export const URL_REGEX = new RegExp(
    `^${URL_PROTOCOL}${URL_AUTH}${URL_HOST}${URL_PORT}${URL_PATH}$`,
    "i"
)

// Regex para validação de usernames
// Máximo 20 caracteres, lowercase, letras, números, "." ou "_"
// Não pode ter mais de 1 "." seguidos e nem começar/terminar com "."
export const USERNAME_REGEX = /^@?(?!\.)(?!.*\.\.)(?!.*\.$)[a-z0-9_.]{1,20}$/

// Regex para validação de hashtags
export const HASHTAG_REGEX = /^#?(\w+)$/

// Regex para extração
export const EXTRACT_HASHTAG_REGEX = /#(\w+)/g
export const EXTRACT_MENTION_REGEX = /@(\w+)/g
export const EXTRACT_URL_REGEX = /(https?:\/\/[^\s]+)/g
