// Copyright 2025 Circle Company, Inc.
// Licensed under the Circle License, Version 1.0

import { HASHTAG_REGEX, EXTRACT_HASHTAG_REGEX } from "../regexp/regex"

export const isValidHashtag = (hashtag: string): boolean => {
    if (!hashtag) return false
    if (!hashtag.startsWith("#")) return false
    // Remove # se existir
    const tag = hashtag.slice(1)
    return HASHTAG_REGEX.test(tag)
}

export const extractHashtags = (text: string): string[] => {
    const matches = text.match(EXTRACT_HASHTAG_REGEX) || []
    return matches.filter((tag) => isValidHashtag(tag))
}
