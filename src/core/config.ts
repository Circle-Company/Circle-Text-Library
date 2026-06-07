// Copyright 2025 Circle LLC
// Licensed under the MIT License

// Contratos compartilhados para engines configuráveis por injeção de dependência.

export type DeepPartial<T> = T extends (infer _U)[]
    ? T
    : // eslint-disable-next-line @typescript-eslint/no-explicit-any
      T extends (...args: any[]) => any
      ? T
      : T extends object
        ? { [K in keyof T]?: DeepPartial<T[K]> }
        : T

/**
 * Toda engine configurável implementa este contrato: a configuração entra pelo
 * construtor (injeção) e `withConfig` deriva uma cópia imutável com merge.
 */
export interface Configurable<C> {
    readonly config: Readonly<C>
    withConfig(patch: DeepPartial<C>): this
}

const isPlainObject = (v: unknown): v is Record<string, unknown> =>
    typeof v === "object" &&
    v !== null &&
    (v.constructor === Object || v.constructor === undefined)

/**
 * Merge profundo: o patch vence, a base preenche o resto. Objetos simples são
 * mesclados recursivamente; arrays/RegExp/Date/etc. são substituídos por inteiro.
 * Nunca muta as entradas.
 */
export function mergeConfig<T>(base: T, patch?: DeepPartial<T>): T {
    if (patch === undefined || patch === null) return base
    if (!isPlainObject(base) || !isPlainObject(patch)) return patch as unknown as T
    const out: Record<string, unknown> = { ...base }
    for (const key of Object.keys(patch)) {
        const b = (base as Record<string, unknown>)[key]
        const p = (patch as Record<string, unknown>)[key]
        out[key] =
            isPlainObject(b) && isPlainObject(p) ? mergeConfig(b, p as DeepPartial<typeof b>) : p
    }
    return out as T
}
