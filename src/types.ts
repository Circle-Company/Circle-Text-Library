export type UsernameValidatorFunctionProps = (username: string) => boolean
export type HashtagValidatorFunctionProps = (hashtag: string) => boolean
export type UrlValidatorFunctionProps = (url: string, requireProtocol?: boolean) => boolean

export type MentionsExtractorProps = (text: string) => string[]
export type HashtagsExtractorProps = (text: string) => string[]
export type UrlsExtractorProps = (text: string) => string[]
export type KeywordsExtractorProps = (text: string) => string[]

export type SentimentAnalizeFunctionProps = (text: string) => SentimentAnalizeProps

export interface SentimentAnalizeProps {
    intensity: number
    sentiment: "positive" | "negative" | "neutral"
}
