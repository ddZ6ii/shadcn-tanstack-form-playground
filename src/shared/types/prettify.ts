/**
 * Expands intersections and mapped types into a flat, readable object type.
 * Useful for making complex types legible in IDE tooltips.
 *
 * @example
 * type AB = Prettify<{ a: string } & { b: number }>
 * // { a: string; b: number }
 */
type Prettify<T> = {
  [K in keyof T]: T[K]
} & {}

export type { Prettify }
