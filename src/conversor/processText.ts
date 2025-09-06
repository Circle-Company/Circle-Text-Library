type setTextToSizeProps = {
    text: string
    size: number
}

export function formatSliceNumWithDots({ text, size }: setTextToSizeProps): string {
    if (text?.length > size) {
        return text.slice(0, size) + "..."
    } else return text
}

export function capitalizeFirstLetter(text: string): string {
    if (!text) return ""
    return text.charAt(0).toUpperCase() + text.slice(1)
}

export function invertStr(str: string): string {
    return str.split("").reverse().join("")
}
