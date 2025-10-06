export type setTextToSizeProps = {
    text: string
    size: number
}

export class Conversor {
    /**
     * Formata um texto cortando-o no tamanho especificado e adicionando "..."
     * @param {setTextToSizeProps} props - Objeto com text e size
     * @returns {string} - Texto formatado com "..." se necessário
     */
    public formatSliceNumWithDots({ text, size }: setTextToSizeProps): string {
        if (text?.length > size) {
            return text.slice(0, size) + "..."
        } else return text
    }

    /**
     * Capitaliza a primeira letra de um texto
     * @param {string} text - Texto a ser capitalizado
     * @returns {string} - Texto com primeira letra maiúscula
     */
    public capitalizeFirstLetter(text: string): string {
        if (!text) return ""
        return text.charAt(0).toUpperCase() + text.slice(1)
    }

    /**
     * Inverte uma string
     * @param {string} str - String a ser invertida
     * @returns {string} - String invertida
     */
    public invertStr(str: string): string {
        if (!str) return ""
        return str.split("").reverse().join("")
    }

    /**
     * Formata um número adicionando pontos como separadores de milhares
     * @param {number} num - Número a ser formatado
     * @returns {string} - String formatada com pontos como separadores
     */
    public formatNumWithDots(num: number): string {
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
     * Converte um número grande em uma string formatada com unidade (K, M, B)
     * @param {number} number - Número a ser convertido
     * @returns {string} - String formatada com unidade
     */
    public convertNumToShortUnitText(number: number): string {
        if (number == null || number == 0) return "0"

        // Convert the number to a string
        const numberStr: string = number.toString()

        // Invert the string for easier manipulation
        const invertNumber: string = this.invertStr(numberStr)

        // Check the length of the number string and format accordingly
        if (numberStr.length < 4) {
            // Numbers less than 1000 remain unchanged
            return number.toString()
        } else if (numberStr.length > 3 && numberStr.length < 7) {
            // Format for thousands (K)
            if (numberStr.length === 4) {
                return (
                    this.invertStr(invertNumber.substring(3, 6)) +
                    "." +
                    this.invertStr(invertNumber.substring(2, 3)) +
                    " K"
                )
            } else {
                return this.invertStr(invertNumber.substring(3, 6)) + " K"
            }
        } else if (numberStr.length > 6 && numberStr.length < 10) {
            // Format for millions (M)
            if (numberStr.length === 7) {
                return (
                    this.invertStr(invertNumber.substring(6, 9)) +
                    "." +
                    this.invertStr(invertNumber.substring(5, 6)) +
                    " M"
                )
            } else {
                return this.invertStr(invertNumber.substring(6, 9)) + " M"
            }
        } else if (numberStr.length > 9 && numberStr.length < 13) {
            // Format for billions (B)
            if (numberStr.length === 10) {
                return (
                    this.invertStr(invertNumber.substring(9, 12)) +
                    "." +
                    this.invertStr(invertNumber.substring(8, 9)) +
                    " B"
                )
            } else {
                return this.invertStr(invertNumber.substring(9, 12)) + " B"
            }
        } else {
            // For numbers with more than 12 digits, return the rounded value
            return Math.floor(Number(numberStr)).toString()
        }
    }

    public formatToEnrichedString(text: string): string {
        return text.replace(/<br\s*\/?>/g, "\n")
    }
}
