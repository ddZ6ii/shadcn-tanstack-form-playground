/**
 * Makes all keys of `T` required while allowing each value to be `undefined`.
 * Unlike `Partial`, keys must be present — only values are optional.
 *
 * @example
 * type Address = Undefinable<{ street?: string; city?: string }>
 * // { street: string | undefined; city: string | undefined }
 */
type Undefinable<T> = { [K in keyof Required<T>]: T[K] | undefined }

export type { Undefinable }
