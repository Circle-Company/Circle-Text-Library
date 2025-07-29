// Copyright 2025 Circle Company, Inc.
// Licensed under the Circle License, Version 1.0

import {
    isValidUsername,
    extractMentions,
    isValidHashtag,
    extractHashtags,
    isValidUrl,
    extractUrls
} from "./src/validators/index.js";

export const circleText = {
    validation: {
        username: isValidUsername,
        hashtag: isValidHashtag,
        url: isValidUrl
    },
    extract: {
        mentions: extractMentions,
        hashtags: extractHashtags,
        urls: extractUrls
    }   
}

export default circleText;