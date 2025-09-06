// Copyright 2025 Circle Company, Inc.
// Licensed under the Circle License, Version 1.0

import { URL_REGEX, EXTRACT_URL_REGEX } from "../regexp/regex.js"

export const isValidUrl = (url: string, requireProtocol?: boolean): boolean => {
    // Se não requer protocolo, adiciona https:// para validação
    const urlToTest = requireProtocol ? url : url.startsWith("http") ? url : `https://${url}`

    return URL_REGEX.test(urlToTest)
}

export const extractUrls = (text: string): string[] => {
    const matches = text.match(EXTRACT_URL_REGEX) || []
    return matches.filter((url) => isValidUrl(url, true))
}
