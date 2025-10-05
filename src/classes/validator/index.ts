// Copyright 2025 Circle Company, Inc.
// Licensed under the Circle License, Version 1.0
import {
    DescriptionValidationRules,
    HashtagValidationRules,
    NameValidationRules,
    PasswordValidationRules,
    UrlValidationRules,
    UsernameValidationRules,
    ValidationConfig,
    ValidationResult
} from "../../types"

export class Validator {
    private config: ValidationConfig

    constructor(rules: ValidationConfig) {
        this.config = rules
    }

    // === FUNÇÕES DE APLICAÇÃO DE REGRAS ===
    private applyUsernameRules(username: string, rules: UsernameValidationRules): ValidationResult {
        const errors: string[] = []

        if (!username) {
            errors.push("Username não pode ser vazio")
            return { isValid: false, errors }
        }

        // Validação de comprimento mínimo
        if (rules.minLength?.enabled && rules.minLength.value) {
            if (username.length < (rules.minLength.value as number)) {
                errors.push(
                    `${rules.minLength.description || `Username deve ter pelo menos ${rules.minLength.value} caracteres`}`
                )
            }
        }

        // Validação de comprimento máximo
        if (rules.maxLength?.enabled && rules.maxLength.value) {
            if (username.length > (rules.maxLength.value as number)) {
                errors.push(
                    `${rules.maxLength.description || `Username deve ter no máximo ${rules.maxLength.value} caracteres`}`
                )
            }
        }

        // Validação de caracteres permitidos
        if (rules.allowedCharacters?.enabled && rules.allowedCharacters.value) {
            const regex = new RegExp(`^${rules.allowedCharacters.value}+$`)
            if (!regex.test(username)) {
                errors.push(
                    rules.allowedCharacters.description || "Caracteres inválidos encontrados"
                )
            }
        }

        // Validação de não começar com
        if (rules.cannotStartWith?.enabled && rules.cannotStartWith.value) {
            const regex = new RegExp(`^${rules.cannotStartWith.value}`)
            if (regex.test(username)) {
                errors.push(
                    rules.cannotStartWith.description ||
                        "Username não pode começar com esse caractere"
                )
            }
        }

        // Validação de não terminar com
        if (rules.cannotEndWith?.enabled && rules.cannotEndWith.value) {
            const regex = new RegExp(`${rules.cannotEndWith.value}$`)
            if (regex.test(username)) {
                errors.push(
                    rules.cannotEndWith.description ||
                        "Username não pode terminar com esse caractere"
                )
            }
        }

        // Validação de caracteres consecutivos
        if (rules.cannotContainConsecutive?.enabled && rules.cannotContainConsecutive.value) {
            const value = rules.cannotContainConsecutive.value

            // Suporte para múltiplos tipos de entrada:
            // 1. String com múltiplos caracteres: "_." (que serão expandidos)
            // 2. Array de caracteres: ["_", ".", "!"]

            let characters: string[] = []

            if (typeof value === "string") {
                // Se é uma string, dividir em caracteres individuais
                characters = value.split("")
            } else if (Array.isArray(value)) {
                // Se é um array de strings, usar diretamente
                characters = [...value]
            } else {
                // Try to cast to string as fallback
                const stringValue = value as unknown as string
                characters = stringValue.split("")
            }

            // Verificar caracteres consecutivos com escape adequado
            const foundConsecutive = characters.some((char) => {
                // Escapar caracteres especiais de regex
                const escapedChar = char.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
                // Procurar por 2 ou mais ocorrências consecutivas
                const regex = new RegExp(`${escapedChar}{2,}`)
                return regex.test(username)
            })

            if (foundConsecutive) {
                errors.push(
                    rules.cannotContainConsecutive.description ||
                        `Username não pode conter caracteres consecutivos: ${characters.join(", ")}`
                )
            }
        }

        // Validação de caracteres especiais permitidos
        if (rules.allowedSpecialCharacters?.enabled && rules.allowedSpecialCharacters.value) {
            const value = rules.allowedSpecialCharacters.value
            let allowedSpecials: string = ""

            if (typeof value === "string") {
                allowedSpecials = value
            } else if (Array.isArray(value)) {
                allowedSpecials = value.join("")
            } else {
                allowedSpecials = (value as unknown as string) || ""
            }

            // Criar regex que permite apenas letras, números e caracteres especiais permitidos
            // Escapar todos os caracteres especiais e mover hífen para o final
            const escapedChars = allowedSpecials.split("").map((char) => {
                if (char === "-") return "-"
                if ("[-.*+?^${}()|[\\]]".includes(char)) return "\\" + char
                return char
            })

            // Colocar hífen no final ou início para evitar range
            const withoutHyphen = escapedChars.filter((char) => char !== "-")
            const hyphenEscaped = allowedSpecials.includes("-") ? "-" : ""

            const regexChars = [...withoutHyphen, hyphenEscaped].join("")
            const regex = new RegExp(`^[a-zA-Z0-9${regexChars}]+$`)

            if (!regex.test(username)) {
                errors.push(
                    rules.allowedSpecialCharacters.description ||
                        `Username contém caracteres especiais não permitidos. Permitidos: ${allowedSpecials}`
                )
            }
        }

        // Validação de caracteres especiais proibidos
        if (rules.forbiddenSpecialCharacters?.enabled && rules.forbiddenSpecialCharacters.value) {
            const value = rules.forbiddenSpecialCharacters.value
            let forbiddenSpecials: string = ""

            if (typeof value === "string") {
                forbiddenSpecials = value
            } else if (Array.isArray(value)) {
                forbiddenSpecials = value.join("")
            } else {
                forbiddenSpecials = (value as unknown as string) || ""
            }

            // Escapar caracteres especiais para regex
            const escapedForbidden = forbiddenSpecials.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
            const regex = new RegExp(`[${escapedForbidden}]`)

            if (regex.test(username)) {
                errors.push(
                    rules.forbiddenSpecialCharacters.description ||
                        `Username contém caracteres especiais proibidos: ${forbiddenSpecials.split("").join(", ")}`
                )
            }
        }

        // Validação apenas alfanumérico
        if (rules.onlyAlphaNumeric?.enabled && rules.onlyAlphaNumeric.value) {
            const regex = /^[a-zA-Z0-9]+$/
            if (!regex.test(username)) {
                errors.push(
                    rules.onlyAlphaNumeric.description ||
                        "Username deve conter apenas letras e números"
                )
            }
        }

        // Validação requerer caracteres especiais
        if (rules.requireSpecialCharacters?.enabled && rules.requireSpecialCharacters.value) {
            const value = rules.requireSpecialCharacters.value
            let searchPattern = /[^a-zA-Z0-9]/

            // Se foi especificado quais caracteres especiais são obrigatórios
            if (typeof value === "string" && value.length > 0) {
                const escapedValue = value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
                searchPattern = new RegExp(`[${escapedValue}]`)
            } else if (Array.isArray(value) && value.length > 0) {
                const escapedValues = value
                    .map((v) => v.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
                    .join("")
                searchPattern = new RegExp(`[${escapedValues}]`)
            }

            if (!searchPattern.test(username)) {
                const requiredChars =
                    typeof value === "string"
                        ? value
                        : Array.isArray(value)
                          ? value.join(", ")
                          : "caracteres especiais"

                errors.push(
                    rules.requireSpecialCharacters.description ||
                        `Username deve conter pelo menos um caractere especial: ${requiredChars}`
                )
            }
        }

        return {
            isValid: errors.length === 0,
            errors
        }
    }

    private applyHashtagRules(hashtag: string, rules: HashtagValidationRules): ValidationResult {
        const errors: string[] = []

        if (!hashtag) {
            errors.push("Hashtag não pode ser vazia")
            return { isValid: false, errors }
        }

        // Verifica prefixo obrigatório (#)
        if (rules.requiredPrefix?.enabled && rules.requiredPrefix.value) {
            if (!hashtag.startsWith("#")) {
                errors.push(rules.requiredPrefix.description || "Hashtag deve começar com #")
                return { isValid: false, errors }
            }
        }

        // Remove # para validação do conteúdo
        const cleanHashtag = hashtag.startsWith("#") ? hashtag.slice(1) : hashtag

        if (!cleanHashtag) {
            errors.push("Hashtag deve ter conteúdo além do #")
            return { isValid: false, errors }
        }

        // Validação de comprimento mínimo
        if (rules.minLength?.enabled && rules.minLength.value) {
            const minLength = (rules.minLength.value as number) - (hashtag.startsWith("#") ? 1 : 0)
            if (cleanHashtag.length < minLength) {
                errors.push(
                    `${rules.minLength.description || `Hashtag deve ter pelo menos ${rules.minLength.value} caracteres`}`
                )
            }
        }

        // Validação de comprimento máximo
        if (rules.maxLength?.enabled && rules.maxLength.value) {
            const maxLength = (rules.maxLength.value as number) - (hashtag.startsWith("#") ? 1 : 0)
            if (cleanHashtag.length > maxLength) {
                errors.push(
                    `${rules.maxLength.description || `Hashtag deve ter no máximo ${rules.maxLength.value} caracteres`}`
                )
            }
        }

        // Validação de caracteres permitidos
        if (rules.allowedCharacters?.enabled && rules.allowedCharacters.value) {
            const regex = new RegExp(`^${rules.allowedCharacters.value}+$`)
            if (!regex.test(cleanHashtag)) {
                errors.push(
                    rules.allowedCharacters.description ||
                        "Caracteres inválidos encontrados na hashtag"
                )
            }
        }

        // Validação de não começar com
        if (rules.cannotStartWith?.enabled && rules.cannotStartWith.value) {
            const regex = new RegExp(`^${rules.cannotStartWith.value}`)
            if (regex.test(cleanHashtag)) {
                errors.push(
                    rules.cannotStartWith.description ||
                        "Hashtag não pode começar com esse caractere"
                )
            }
        }

        // Validação de não terminar com
        if (rules.cannotEndWith?.enabled && rules.cannotEndWith.value) {
            const regex = new RegExp(`${rules.cannotEndWith.value}$`)
            if (regex.test(cleanHashtag)) {
                errors.push(
                    rules.cannotEndWith.description ||
                        "Hashtag não pode terminar com esse caractere"
                )
            }
        }

        return {
            isValid: errors.length === 0,
            errors
        }
    }

    private applyUrlRules(
        url: string,
        requireProtocol: boolean = false,
        rules: UrlValidationRules
    ): ValidationResult {
        const errors: string[] = []

        if (!url) {
            errors.push("URL não pode ser vazia")
            return { isValid: false, errors }
        }

        // Validação de comprimento mínimo
        if (rules.minLength?.enabled && rules.minLength.value) {
            if (url.length < (rules.minLength.value as number)) {
                errors.push(
                    `${rules.minLength.description || `URL deve ter pelo menos ${rules.minLength.value} caracteres`}`
                )
            }
        }

        // Validação de comprimento máximo
        if (rules.maxLength?.enabled && rules.maxLength.value) {
            if (url.length > (rules.maxLength.value as number)) {
                errors.push(
                    `${rules.maxLength.description || `URL deve ter no máximo ${rules.maxLength.value} caracteres`}`
                )
            }
        }

        // Validação de protocolo requerido
        if ((rules.requireProtocol?.enabled && rules.requireProtocol.value) || requireProtocol) {
            if (!url.match(/^https?:\/\//)) {
                errors.push(
                    rules.requireProtocol?.description ||
                        "URL deve incluir protocolo (http:// ou https://)"
                )
            }
        }

        // Validação de protocolos permitidos
        if (rules.allowedProtocols?.enabled && rules.allowedProtocols.value) {
            const protocols = rules.allowedProtocols.value as unknown as string[]
            const urlProtocol = url.match(/^([a-zA-Z]+):/)

            if (urlProtocol) {
                const protocol = urlProtocol[1]?.toLowerCase()
                if (protocol && !protocols.includes(protocol)) {
                    errors.push(
                        `Protocolo '${protocol}' não é permitido. Protocolos aceitos: ${protocols.join(", ")}`
                    )
                }
            }
        }

        return {
            isValid: errors.length === 0,
            errors
        }
    }

    private applyDescriptionRules(
        description: string,
        rules: DescriptionValidationRules
    ): ValidationResult {
        const errors: string[] = []

        if (!description) {
            errors.push("Descrição não pode ser vazia")
            return { isValid: false, errors }
        }

        // Validação de comprimento mínimo
        if (rules.minLength?.enabled && rules.minLength.value) {
            if (description.length < (rules.minLength.value as number)) {
                errors.push(
                    `${rules.minLength.description || `Descrição deve ter pelo menos ${rules.minLength.value} caracteres`}`
                )
            }
        }

        // Validação de comprimento máximo
        if (rules.maxLength?.enabled && rules.maxLength.value) {
            if (description.length > (rules.maxLength.value as number)) {
                errors.push(
                    `${rules.maxLength.description || `Descrição deve ter no máximo ${rules.maxLength.value} caracteres`}`
                )
            }
        }

        // Validação de caracteres permitidos
        if (rules.allowedCharacters?.enabled && rules.allowedCharacters.value) {
            const regex = new RegExp(`^${rules.allowedCharacters.value}+$`)
            if (!regex.test(description)) {
                errors.push(
                    rules.allowedCharacters.description ||
                        "Caracteres inválidos encontrados na descrição"
                )
            }
        }

        // Validação de palavras proibidas
        if (rules.forbiddenWords?.enabled && rules.forbiddenWords.value) {
            const forbiddenWords = rules.forbiddenWords.value as unknown as string[]
            const descriptionLower = description.toLowerCase()

            for (const word of forbiddenWords) {
                if (descriptionLower.includes(word.toLowerCase())) {
                    errors.push(
                        rules.forbiddenWords.description ||
                            `Descrição contém palavras não permitidas: ${word}`
                    )
                    break // Evita múltiplos erros para a mesma palavra
                }
            }
        }

        // Validação de requerer caracteres alfanuméricos
        if (rules.requireAlphanumeric?.enabled && rules.requireAlphanumeric.value) {
            if (!/[a-zA-Z0-9]/.test(description)) {
                errors.push(
                    rules.requireAlphanumeric.description ||
                        "Descrição deve conter pelo menos um caractere alfanumérico"
                )
            }
        }

        // Validação de não começar com
        if (rules.cannotStartWith?.enabled && rules.cannotStartWith.value) {
            const regex = new RegExp(`^${rules.cannotStartWith.value}`)
            if (regex.test(description)) {
                errors.push(
                    rules.cannotStartWith.description ||
                        "Descrição não pode começar com esse caractere"
                )
            }
        }

        // Validação de não terminar com
        if (rules.cannotEndWith?.enabled && rules.cannotEndWith.value) {
            const regex = new RegExp(`${rules.cannotEndWith.value}$`)
            if (regex.test(description)) {
                errors.push(
                    rules.cannotEndWith.description ||
                        "Descrição não pode terminar com esse caractere"
                )
            }
        }

        // Validação de URLs não permitidas
        if (rules.allowUrls?.enabled && !rules.allowUrls.value) {
            const urlRegex = /https?:\/\/[^\s]+/g
            if (urlRegex.test(description)) {
                errors.push(rules.allowUrls.description || "URLs não são permitidas na descrição")
            }
        }

        // Validação de menções não permitidas
        if (rules.allowMentions?.enabled && !rules.allowMentions.value) {
            const mentionRegex = /@\w+/g
            if (mentionRegex.test(description)) {
                errors.push(
                    rules.allowMentions.description || "Menções (@) não são permitidas na descrição"
                )
            }
        }

        // Validação de hashtags não permitidas
        if (rules.allowHashtags?.enabled && !rules.allowHashtags.value) {
            const hashtagRegex = /#\w+/g
            if (hashtagRegex.test(description)) {
                errors.push(
                    rules.allowHashtags.description ||
                        "Hashtags (#) não são permitidas na descrição"
                )
            }
        }

        return {
            isValid: errors.length === 0,
            errors
        }
    }

    private applyNameRules(name: string, rules: NameValidationRules): ValidationResult {
        const errors: string[] = []

        if (!name) {
            errors.push("Nome não pode ser vazio")
            return { isValid: false, errors }
        }

        // Validação de comprimento mínimo
        if (rules.minLength?.enabled && rules.minLength.value) {
            if (name.length < (rules.minLength.value as number)) {
                errors.push(
                    `${rules.minLength.description || `Nome deve ter pelo menos ${rules.minLength.value} caracteres`}`
                )
            }
        }

        // Validação de comprimento máximo
        if (rules.maxLength?.enabled && rules.maxLength.value) {
            if (name.length > (rules.maxLength.value as number)) {
                errors.push(
                    `${rules.maxLength.description || `Nome deve ter no máximo ${rules.maxLength.value} caracteres`}`
                )
            }
        }

        // Validação de caracteres permitidos
        if (rules.allowedCharacters?.enabled && rules.allowedCharacters.value) {
            const regex = new RegExp(`^${rules.allowedCharacters.value}+$`)
            if (!regex.test(name)) {
                errors.push(
                    rules.allowedCharacters.description ||
                        "Caracteres inválidos encontrados no nome"
                )
            }
        }

        // Validação apenas letras
        if (rules.requireOnlyLetters?.enabled && rules.requireOnlyLetters.value) {
            const regex = /^[a-zA-ZÀ-ÿ\u00c0-\u017f\s]+$/
            if (!regex.test(name)) {
                errors.push(
                    rules.requireOnlyLetters.description ||
                        "Nome deve conter apenas letras (incluindo acentos)"
                )
            }
        }

        // Validação de nome completo (primeiro e último nome)
        if (rules.requireFullName?.enabled && rules.requireFullName.value) {
            const trimmedName = name.trim()
            const nameParts = trimmedName.split(/\s+/).filter((part) => part.length > 0)

            if (nameParts.length < 2) {
                errors.push(
                    rules.requireFullName.description ||
                        "Nome deve conter pelo menos primeiro e último nome"
                )
            }
        }

        // Validação de nomes proibidos
        if (rules.forbiddenNames?.enabled && rules.forbiddenNames.value) {
            const forbiddenNames = rules.forbiddenNames.value as unknown as string[]
            const nameLower = name.toLowerCase()

            for (const forbiddenName of forbiddenNames) {
                if (nameLower.includes(forbiddenName.toLowerCase())) {
                    errors.push(
                        rules.forbiddenNames.description ||
                            `Nome contém palavras/nomes não permitidos: ${forbiddenName}`
                    )
                    break // Evita múltiplos erros para a mesma palavra
                }
            }
        }

        // Validação sem números
        if (rules.cannotContainNumbers?.enabled && rules.cannotContainNumbers.value) {
            if (/\d/.test(name)) {
                errors.push(
                    rules.cannotContainNumbers.description || "Nome não pode conter números"
                )
            }
        }

        // EspecialChars proibidos
        if (rules.cannotContainSpecialChars?.enabled && rules.cannotContainSpecialChars.value) {
            const specialCharsRegex = /[^\w\sÀ-ÿ]/g
            if (specialCharsRegex.test(name)) {
                errors.push(
                    rules.cannotContainSpecialChars.description ||
                        "Nome não pode conter caracteres especiais"
                )
            }
        }

        // Validação de capitalização (primeira letra maiúscula)
        if (rules.requireCapitalization?.enabled && rules.requireCapitalization.value) {
            const words = name.trim().split(/\s+/)
            const allWordsCapitalized = words.every(
                (word) => word.length > 0 && word[0] === word[0]?.toUpperCase()
            )

            if (!allWordsCapitalized) {
                errors.push(
                    rules.requireCapitalization.description ||
                        "Nome deve ter a primeira letra de cada palavra maiúscula"
                )
            }
        }

        // Validação de não começar com
        if (rules.cannotStartWith?.enabled && rules.cannotStartWith.value) {
            const regex = new RegExp(`^${rules.cannotStartWith.value}`)
            if (regex.test(name)) {
                errors.push(
                    rules.cannotStartWith.description || "Nome não pode começar com esse caractere"
                )
            }
        }

        // Validação de não terminar com
        if (rules.cannotEndWith?.enabled && rules.cannotEndWith.value) {
            const regex = new RegExp(`${rules.cannotEndWith.value}$`)
            if (regex.test(name)) {
                errors.push(
                    rules.cannotEndWith.description || "Nome não pode terminar com esse caractere"
                )
            }
        }

        return {
            isValid: errors.length === 0,
            errors
        }
    }

    private applyPasswordRules(password: string, rules: PasswordValidationRules): ValidationResult {
        const errors: string[] = []

        if (!password) {
            errors.push("Senha não pode ser vazia")
            return { isValid: false, errors }
        }

        // Validação de comprimento mínimo
        if (rules.minLength?.enabled && rules.minLength.value) {
            if (password.length < (rules.minLength.value as number)) {
                errors.push(
                    `${rules.minLength.description || `Senha deve ter pelo menos ${rules.minLength.value} caracteres`}`
                )
            }
        }

        // Validação de comprimento máximo
        if (rules.maxLength?.enabled && rules.maxLength.value) {
            if (password.length > (rules.maxLength.value as number)) {
                errors.push(
                    `${rules.maxLength.description || `Senha deve ter no máximo ${rules.maxLength.value} caracteres`}`
                )
            }
        }

        // Validação de letra maiúscula obrigatória
        if (rules.requireUppercase?.enabled && rules.requireUppercase.value) {
            if (!/[A-Z]/.test(password)) {
                errors.push(
                    rules.requireUppercase.description ||
                        "Senha deve conter pelo menos uma letra maiúscula"
                )
            }
        }

        // Validação de letra minúscula obrigatória
        if (rules.requireLowercase?.enabled && rules.requireLowercase.value) {
            if (!/[a-z]/.test(password)) {
                errors.push(
                    rules.requireLowercase.description ||
                        "Senha deve conter pelo menos uma letra minúscula"
                )
            }
        }

        // Validação de números obrigatórios
        if (rules.requireNumbers?.enabled && rules.requireNumbers.value) {
            if (!/\d/.test(password)) {
                errors.push(
                    rules.requireNumbers.description || "Senha deve conter pelo menos um número"
                )
            }
        }

        // Validação de caracteres especiais obrigatórios
        if (rules.requireSpecialChars?.enabled && rules.requireSpecialChars.value) {
            if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(password)) {
                errors.push(
                    rules.requireSpecialChars.description ||
                        "Senha deve conter pelo menos um caractere especial"
                )
            }
        }

        // Validação de caracteres especiais permitidos
        if (rules.allowedSpecialChars?.enabled && rules.allowedSpecialChars.value) {
            const value = rules.allowedSpecialChars.value
            let allowedSpecials: string = ""

            if (typeof value === "string") {
                allowedSpecials = value
            } else if (Array.isArray(value)) {
                allowedSpecials = value.join("")
            } else {
                allowedSpecials = (value as unknown as string) || ""
            }

            // Escapar caracteres especiais para regex
            const escapedChars = allowedSpecials.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
            const regex = new RegExp(`^[a-zA-Z0-9${escapedChars}]+$`)

            if (!regex.test(password)) {
                errors.push(
                    rules.allowedSpecialChars.description ||
                        `Senha contém caracteres especiais não permitidos. Permitidos: ${allowedSpecials}`
                )
            }
        }

        // Validação de caracteres especiais proibidos
        if (rules.forbiddenSpecialChars?.enabled && rules.forbiddenSpecialChars.value) {
            const value = rules.forbiddenSpecialChars.value
            let forbiddenSpecials: string = ""

            if (typeof value === "string") {
                forbiddenSpecials = value
            } else if (Array.isArray(value)) {
                forbiddenSpecials = value.join("")
            } else {
                forbiddenSpecials = (value as unknown as string) || ""
            }

            // Escapar caracteres especiais para regex
            const escapedForbidden = forbiddenSpecials.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
            const regex = new RegExp(`[${escapedForbidden}]`)

            if (regex.test(password)) {
                errors.push(
                    rules.forbiddenSpecialChars.description ||
                        `Senha contém caracteres especiais proibidos: ${forbiddenSpecials.split("").join(", ")}`
                )
            }
        }

        // Validação de senhas comuns proibidas
        if (rules.requireCommonPasswords?.enabled && rules.requireCommonPasswords.value) {
            const commonPasswords = [
                "password",
                "123456",
                "123456789",
                "qwerty",
                "abc123",
                "password123",
                "admin",
                "letmein",
                "welcome",
                "monkey",
                "1234567890",
                "password1",
                "qwerty123",
                "dragon",
                "123123",
                "senha",
                "123321",
                "654321"
            ]

            const passwordLower = password.toLowerCase()
            for (const commonPassword of commonPasswords) {
                if (passwordLower === commonPassword) {
                    errors.push(
                        rules.requireCommonPasswords.description ||
                            `Senha muito comum encontrada: ${commonPassword}`
                    )
                    break
                }
            }
        }

        // Validação de palavras proibidas
        if (rules.forbiddenWords?.enabled && rules.forbiddenWords.value) {
            const forbiddenWords = rules.forbiddenWords.value as unknown as string[]
            const passwordLower = password.toLowerCase()

            for (const word of forbiddenWords) {
                if (passwordLower.includes(word.toLowerCase())) {
                    errors.push(
                        rules.forbiddenWords.description || `Senha contém palavra proibida: ${word}`
                    )
                    break // Evita múltiplos erros para a mesma palavra
                }
            }
        }

        // Validação de não conter nome de usuário
        if (rules.cannotContainUsername?.enabled && rules.cannotContainUsername.value) {
            const username = rules.cannotContainUsername.value as unknown as string
            const passwordLower = password.toLowerCase()

            if (passwordLower.includes(username.toLowerCase())) {
                errors.push(
                    rules.cannotContainUsername.description ||
                        "Senha não pode conter nome de usuário"
                )
            }
        }

        // Validação de não conter email
        if (rules.cannotContainEmail?.enabled && rules.cannotContainEmail.value) {
            const email = rules.cannotContainEmail.value as unknown as string
            const passwordLower = password.toLowerCase()

            if (passwordLower.includes(email.toLowerCase())) {
                errors.push(rules.cannotContainEmail.description || "Senha não pode conter email")
            }
        }

        // Validação de não começar com
        if (rules.cannotStartWith?.enabled && rules.cannotStartWith.value) {
            const regex = new RegExp(`^${rules.cannotStartWith.value}`)
            if (regex.test(password)) {
                errors.push(
                    rules.cannotStartWith.description || "Senha não pode começar com esse caractere"
                )
            }
        }

        // Validação de não terminar com
        if (rules.cannotEndWith?.enabled && rules.cannotEndWith.value) {
            const regex = new RegExp(`${rules.cannotEndWith.value}$`)
            if (regex.test(password)) {
                errors.push(
                    rules.cannotEndWith.description || "Senha não pode terminar com esse caractere"
                )
            }
        }

        // Validação sem caracteres repetidos consecutivos (3 ou mais)
        if (rules.cannotBeRepeatedChars?.enabled && rules.cannotBeRepeatedChars.value) {
            if (/(.)\1{2,}/.test(password)) {
                errors.push(
                    rules.cannotBeRepeatedChars.description ||
                        "Senha não pode conter caracteres repetidos consecutivos (3 ou mais)"
                )
            }
        }

        // Validação sem sequências sequenciais (abc, 123, etc.)
        if (rules.cannotBeSequentialChars?.enabled && rules.cannotBeSequentialChars.value) {
            const upperCaseSequence =
                /(?:ABC|BCD|CDE|DEF|EFG|FGH|GHI|HIJ|IJK|JKL|KLM|LMN|MNO|NOP|OPQ|PQR|QRS|RST|STU|TUV|UVW|VWX|WXY|XYZ)/i.test(
                    password
                )
            const lowerCaseSequence =
                /(?:abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz)/i.test(
                    password
                )
            const numberSequence = /(?:012|123|234|345|456|567|678|789|890)/.test(password)

            if (upperCaseSequence || lowerCaseSequence || numberSequence) {
                errors.push(
                    rules.cannotBeSequentialChars.description ||
                        "Senha não pode conter sequências sequenciais como abc, 123, etc."
                )
            }
        }

        // Validação de dígito em posição específica
        if (rules.requireDigitAtPosition?.enabled && rules.requireDigitAtPosition.value) {
            const position = rules.requireDigitAtPosition.value as unknown as number
            if (isNaN(position) || position < 0 || position >= password.length) {
                errors.push(
                    rules.requireDigitAtPosition.description ||
                        "Posição especificada para dígito é inválida"
                )
            } else if (password[position] && !/\d/.test(password[position])) {
                errors.push(
                    rules.requireDigitAtPosition.description ||
                        `Senha deve conter um dígito na posição ${position}`
                )
            }
        }

        return {
            isValid: errors.length === 0,
            errors
        }
    }

    // === FUNÇÕES DE VALIDAÇÃO ===
    private validateUsername(username: string, rules: UsernameValidationRules): ValidationResult {
        const cleanUsername = username.startsWith("@") ? username.slice(1) : username
        return this.applyUsernameRules(cleanUsername, rules)
    }

    private validateHashtag(hashtag: string, rules: HashtagValidationRules): ValidationResult {
        return this.applyHashtagRules(hashtag, rules)
    }

    private validateUrl(
        url: string,
        requireProtocol?: boolean,
        rules?: UrlValidationRules
    ): ValidationResult {
        const errors: string[] = []

        if (!url) {
            errors.push("URL não pode ser vazia")
            return { isValid: false, errors }
        }

        // Usar regras customizadas se fornecidas, senão usar configuração padrão
        const rulesToUse = rules || this.config.url

        if (rulesToUse) {
            // Validação específica de URL com regras
            return this.applyUrlRules(url, requireProtocol || false, rulesToUse)
        }

        // Se não há regras configuradas, aplicar validação mínima (não regex fixo)
        errors.push("URL inválida")
        return {
            isValid: false,
            errors
        }
    }

    private validateDescription(
        description: string,
        rules?: DescriptionValidationRules
    ): ValidationResult {
        const errors: string[] = []

        if (!description) {
            errors.push("Descrição não pode ser vazia")
            return { isValid: false, errors }
        }

        // Usar regras customizadas se fornecidas, senão usar configuração padrão
        const rulesToUse = rules || this.config.description

        if (rulesToUse) {
            // Validação específica de descrição com regras
            return this.applyDescriptionRules(description, rulesToUse)
        }

        // Se não há regras configuradas, aplicar validação mínima
        if (description.length === 0) {
            errors.push("Descrição não pode ser vazia")
        }

        return {
            isValid: errors.length === 0,
            errors
        }
    }

    private validateName(name: string, rules?: NameValidationRules): ValidationResult {
        const errors: string[] = []

        if (!name) {
            errors.push("Nome não pode ser vazio")
            return { isValid: false, errors }
        }

        // Usar regras customizadas se fornecidas, senão usar configuração padrão
        const rulesToUse = rules || this.config.name

        if (rulesToUse) {
            // Validação específica de nome com regras
            return this.applyNameRules(name, rulesToUse)
        }

        // Se não há regras configuradas, aplicar validação mínima
        if (name.length === 0) {
            errors.push("Nome não pode ser vazio")
        }

        return {
            isValid: errors.length === 0,
            errors
        }
    }

    private validatePassword(password: string, rules?: PasswordValidationRules): ValidationResult {
        const errors: string[] = []

        if (!password) {
            errors.push("Senha não pode ser vazia")
            return { isValid: false, errors }
        }

        // Usar regras customizadas se fornecidas, senão usar configuração padrão
        const rulesToUse = rules || this.config.password

        if (rulesToUse) {
            // Validação específica de senha com regras
            return this.applyPasswordRules(password, rulesToUse)
        }

        // Se não há regras configuradas, aplicar validação mínima
        if (password.length === 0) {
            errors.push("Senha não pode ser vazia")
        }

        return {
            isValid: errors.length === 0,
            errors
        }
    }

    // === MÉTODOS PÚBLICOS ===
    public username(username: string, rules?: UsernameValidationRules): ValidationResult {
        const rulesToUse = rules || this.config.username
        if (!rulesToUse) {
            throw new Error(
                "Username validation rules must be provided either in constructor or as parameter"
            )
        }
        return this.validateUsername(username, rulesToUse)
    }

    public hashtag(hashtag: string, rules?: HashtagValidationRules): ValidationResult {
        const rulesToUse = rules || this.config.hashtag
        if (!rulesToUse) {
            throw new Error(
                "Hashtag validation rules must be provided either in constructor or as parameter"
            )
        }
        return this.validateHashtag(hashtag, rulesToUse)
    }

    public url(
        url: string,
        requireProtocol?: boolean,
        rules?: UrlValidationRules
    ): ValidationResult {
        return this.validateUrl(url, requireProtocol, rules)
    }

    public description(description: string, rules?: DescriptionValidationRules): ValidationResult {
        return this.validateDescription(description, rules)
    }

    public name(name: string, rules?: NameValidationRules): ValidationResult {
        return this.validateName(name, rules)
    }

    public password(password: string, rules?: PasswordValidationRules): ValidationResult {
        return this.validatePassword(password, rules)
    }

    public getConfig(): ValidationConfig {
        return { ...this.config }
    }

    public updateRules(newRules: Partial<ValidationConfig>): void {
        this.config = { ...this.config, ...newRules }
    }

    // Métodos para compatibilidade com CircleText
    public getUsernameValidator(): (username: string) => boolean {
        return (username: string) => this.isValidUsername(username)
    }

    public getHashtagValidator(): (hashtag: string) => boolean {
        return (hashtag: string) => this.isValidHashtag(hashtag)
    }

    public getUrlValidator(): (url: string) => boolean {
        return (url: string) => this.isValidUrl(url)
    }

    public getDescriptionValidator(): (description: string) => boolean {
        return (description: string) => this.isValidDescription(description)
    }

    // Funções de conveniência para compatibilidade com código existente
    public isValidUsername(username: string, rules?: UsernameValidationRules): boolean {
        const result = this.validateUsername(username, rules!)
        return result.isValid
    }

    public isValidHashtag(hashtag: string, rules?: HashtagValidationRules): boolean {
        const result = this.validateHashtag(hashtag, rules!)
        return result.isValid
    }

    public isValidUrl(url: string, requireProtocol?: boolean, rules?: UrlValidationRules): boolean {
        const result = this.validateUrl(url, requireProtocol, rules)
        return result.isValid
    }

    public isValidDescription(description: string, rules?: DescriptionValidationRules): boolean {
        const result = this.validateDescription(description, rules)
        return result.isValid
    }

    public isValidName(name: string, rules?: NameValidationRules): boolean {
        const result = this.validateName(name, rules)
        return result.isValid
    }

    public isValidPassword(password: string, rules?: PasswordValidationRules): boolean {
        const result = this.validatePassword(password, rules)
        return result.isValid
    }
}
