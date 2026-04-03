/**
 * Recursively produces a union of all dot-notation paths in `T`.
 *
 * - Object keys are expanded into dot-notation paths: `"address" | "address.street"`
 * - Arrays are excluded (indices are dynamic, so they resolve to `never`)
 * - Primitives terminate recursion (they resolve to `never`)
 *
 * @example
 * type Form = { email: string; address: { street: string; city: string } }
 * type Paths = DeepPath<Form>
 * // "email" | "address" | "address.street" | "address.city"
 */
type DeepPath<T> = T extends object
  ? T extends unknown[]
    ? never
    : {
        [K in keyof T & string]: K | `${K}.${DeepPath<T[K]>}`
      }[keyof T & string]
  : never

export type { DeepPath }
