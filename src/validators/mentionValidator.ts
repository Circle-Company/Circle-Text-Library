// Copyright 2025 Circle Company, Inc.
// Licensed under the Circle License, Version 1.0

import { USERNAME_REGEX, EXTRACT_MENTION_REGEX } from "../regexp/regex.js"

export const isValidUsername = (username: string): boolean => {
    if (!username) return false

    const user = username.startsWith("@") ? username.slice(1) : username
    return USERNAME_REGEX.test(user)
}

export const extractMentions = (text: string): string[] => {
    const matches = text.match(EXTRACT_MENTION_REGEX) || []
    return matches.filter((mention) => isValidUsername(mention))
}
