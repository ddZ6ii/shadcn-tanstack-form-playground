/**
 * Recursively removes all keys with `undefined` values from an object or array.
 * Preserves the original type — safe to use as a Zod `.transform()` callback.
 *
 * @example
 * deepStripUndefined({ a: 1, b: undefined, c: { d: undefined, e: 2 } })
 * // → { a: 1, c: { e: 2 } }
 */
function deepStripUndefined<T>(val: T): T {
  if (Array.isArray(val)) return val.map(deepStripUndefined) as T
  if (val !== null && typeof val === 'object') {
    return Object.fromEntries(
      Object.entries(val)
        .filter(([, v]) => v !== undefined)
        .map(([k, v]) => [k, deepStripUndefined(v)]),
    ) as T
  }
  return val
}

export default deepStripUndefined
