import { invertStr } from "./processText"

/**
 * Format a number by adding dots as separators.
 * @param {number} num - The input number to be formatted.
 * @returns {string} - The formatted string with dots as separators.
 */
export function formatNumWithDots(num: number): string {
    // Convert the number to a string
    const numStr: string = num.toString()

    // Split the string into an array of characters
    const numArray: string[] = numStr.split("")

    // Initialize variables for tracking the position and adding dots
    let position: number = 0
    let formattedStr: string = ""

    // Iterate through the characters in reverse order
    for (let i = numArray.length - 1; i >= 0; i--) {
        // Add the current character to the formatted string
        formattedStr = numArray[i] + formattedStr

        // Increment the position
        position++

        // Add a dot after every three characters, except for the last group
        if (position % 3 === 0 && i !== 0) {
            formattedStr = "." + formattedStr
        }
    }

    return formattedStr
}

/**
 * Converts a large number into a formatted string with a unit (K, M, B).
 * @param {number} number - The input number to be converted.
 * @returns {string} - The formatted string with unit.
 */
export function convertNumToShortUnitText(number: number): string {
    if (number == null || number == 0) return "0"
    // Convert the number to a string
    const numberStr: string = number.toString()

    // Invert the string for easier manipulation
    const invertNumber: string = invertStr(numberStr)

    // Check the length of the number string and format accordingly
    if (numberStr.length < 4) {
        // Numbers less than 1000 remain unchanged
        return number.toString()
    } else if (numberStr.length > 3 && numberStr.length < 7) {
        // Format for thousands (K)
        if (numberStr.length === 4) {
            return (
                invertStr(invertNumber.substring(3, 6)) +
                "." +
                invertStr(invertNumber.substring(2, 3)) +
                " K"
            )
        } else {
            return invertStr(invertNumber.substring(3, 6)) + " K"
        }
    } else if (numberStr.length > 6 && numberStr.length < 10) {
        // Format for millions (M)
        if (numberStr.length === 7) {
            return (
                invertStr(invertNumber.substring(6, 9)) +
                "." +
                invertStr(invertNumber.substring(5, 6)) +
                " M"
            )
        } else {
            return invertStr(invertNumber.substring(6, 9)) + " M"
        }
    } else if (numberStr.length > 9 && numberStr.length < 13) {
        // Format for billions (B)
        if (numberStr.length === 10) {
            return (
                invertStr(invertNumber.substring(9, 12)) +
                "." +
                invertStr(invertNumber.substring(8, 9)) +
                " B"
            )
        } else {
            return invertStr(invertNumber.substring(9, 12)) + " B"
        }
    } else {
        // For numbers with more than 12 digits, return the rounded value
        return Math.floor(Number(numberStr)).toString()
    }
}
