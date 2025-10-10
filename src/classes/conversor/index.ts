// ============================================================================
// Tipos e Configurações
// ============================================================================

export type setTextToSizeProps = {
    text: string
    size?: number
}

export interface ConversorConfig {
    /**
     * Tamanho padrão para cortar texto (usado quando size não é especificado)
     * @default 100
     */
    defaultSliceLength?: number

    /**
     * Sufixo a ser adicionado ao cortar texto
     * @default "..."
     */
    sliceSuffix?: string

    /**
     * Separador de milhares para formatação de números
     * @default "."
     */
    thousandsSeparator?: string
}

// ============================================================================
// Classe Conversor
// ============================================================================

/**
 * Classe utilitária para conversão e formatação de texto e números.
 *
 * @example
 * ```ts
 * const conversor = new Conversor({
 *   defaultSliceLength: 50,
 *   sliceSuffix: '...',
 *   thousandsSeparator: '.'
 * })
 * ```
 */
export class Conversor {
    private readonly defaultSliceLength: number
    private readonly sliceSuffix: string
    private readonly thousandsSeparator: string

    constructor(config?: ConversorConfig) {
        this.defaultSliceLength = config?.defaultSliceLength ?? 100
        this.sliceSuffix = config?.sliceSuffix ?? "..."
        this.thousandsSeparator = config?.thousandsSeparator ?? "."
    }

    /**
     * Formata um texto cortando-o no tamanho especificado e adicionando sufixo configurável.
     *
     * @param props - Objeto com text e size opcional
     * @returns Texto formatado com sufixo se necessário
     *
     * @example
     * ```ts
     * conversor.sliceWithDots({ text: "Texto longo", size: 5 })
     * // "Texto..."
     *
     * // Usando tamanho padrão configurado
     * conversor.sliceWithDots({ text: "Texto muito longo" })
     * ```
     */
    public sliceWithDots({ text, size }: setTextToSizeProps): string {
        const useSize = size ?? this.defaultSliceLength
        if (text?.length > useSize) {
            return text.slice(0, useSize) + this.sliceSuffix
        }
        return text
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
     * Formata um número adicionando separador de milhares configurável.
     *
     * @param num - Número a ser formatado
     * @returns String formatada com separadores
     *
     * @example
     * ```ts
     * conversor.formatNumWithDots(1000000)
     * // "1.000.000" (com separador padrão ".")
     *
     * // Com separador customizado
     * const conversor = new Conversor({ thousandsSeparator: ',' })
     * conversor.formatNumWithDots(1000000)
     * // "1,000,000"
     * ```
     */
    public formatNumWithDots(num: number): string {
        const numStr: string = num.toString()
        const numArray: string[] = numStr.split("")

        let position: number = 0
        let formattedStr: string = ""

        // Iterar caracteres em ordem reversa
        for (let i = numArray.length - 1; i >= 0; i--) {
            formattedStr = numArray[i] + formattedStr
            position++

            // Adicionar separador a cada 3 caracteres, exceto no último grupo
            if (position % 3 === 0 && i !== 0) {
                formattedStr = this.thousandsSeparator + formattedStr
            }
        }

        return formattedStr
    }

    /**
     * Converte um número grande em uma string formatada com unidade (K, M, B)
     * @param {number} number - Número a ser convertido
     * @returns {string} - String formatada com unidade
     */
    public convertNumToShort(number: number): string {
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
}
