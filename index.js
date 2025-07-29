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