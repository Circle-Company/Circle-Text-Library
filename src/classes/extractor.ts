// Copyright 2025 Circle Company, Inc.
// Licensed under the Circle License, Version 1.0

import { ExtractOptions, PartialExtractResult } from "../types"

// Regexes para extração
const EXTRACT_MENTION_REGEX = /@\w+/g
const EXTRACT_HASHTAG_REGEX = /#\w+/g
const EXTRACT_URL_REGEX = /https?:\/\/[^\s,]+/g

export class Extractor {
    private readonly text: string

    constructor(text: string) {
        this.text = text
    }

    public extract(options: ExtractOptions = {}): PartialExtractResult {
        const result: PartialExtractResult = {}

        // Se nenhuma opção específica solicitada, não extrair nada
        const shouldExtractMentions = options.mentions === true
        const shouldExtractHashtags = options.hashtags === true
        const shouldExtractUrls = options.urls === true

        // Extração de menções
        if (shouldExtractMentions) {
            const mentionMatches = this.text.match(EXTRACT_MENTION_REGEX) || []
            result.mentions = mentionMatches
        }

        // Extração de hashtags
        if (shouldExtractHashtags) {
            const hashtagMatches = this.text.match(EXTRACT_HASHTAG_REGEX) || []
            result.hashtags = hashtagMatches
        }

        // Extração de URLs
        if (shouldExtractUrls) {
            const urlMatches = this.text.match(EXTRACT_URL_REGEX) || []
            result.urls = urlMatches
        }

        return result
    }
}
