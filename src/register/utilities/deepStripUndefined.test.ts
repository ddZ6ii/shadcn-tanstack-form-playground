import { describe, expect, it } from 'vitest'

import deepStripUndefined from './deepStripUndefined'

describe('deepStripUndefined', () => {
  it('returns primitives as-is', () => {
    expect(deepStripUndefined('hello')).toBe('hello')
    expect(deepStripUndefined(42)).toBe(42)
    expect(deepStripUndefined(true)).toBe(true)
    expect(deepStripUndefined(null)).toBe(null)
    const result = deepStripUndefined<unknown>(undefined)
    expect(result).toBeUndefined()
  })

  it('removes undefined keys from a flat object', () => {
    expect(deepStripUndefined({ a: 1, b: undefined, c: 'x' })).toEqual({
      a: 1,
      c: 'x',
    })
  })

  it('keeps null values — null is not undefined', () => {
    expect(deepStripUndefined({ a: null, b: undefined })).toEqual({ a: null })
  })

  it('returns empty object when all keys are undefined', () => {
    expect(deepStripUndefined({ a: undefined, b: undefined })).toEqual({})
  })

  it('returns empty object unchanged', () => {
    expect(deepStripUndefined({})).toEqual({})
  })

  it('strips undefined keys from nested objects', () => {
    expect(deepStripUndefined({ a: 1, b: { c: undefined, d: 2 } })).toEqual({
      a: 1,
      b: { d: 2 },
    })
  })

  it('strips undefined keys at 3+ levels of nesting', () => {
    expect(
      deepStripUndefined({ a: { b: { c: undefined, d: 'keep' } } }),
    ).toEqual({ a: { b: { d: 'keep' } } })
  })

  it('strips undefined keys from each object in an array', () => {
    expect(
      deepStripUndefined([
        { id: 1, name: 'Alice', role: undefined },
        { id: 2, name: 'Bob', role: 'admin' },
      ]),
    ).toEqual([
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Bob', role: 'admin' },
    ])
  })

  it('leaves array of primitives unchanged', () => {
    expect(deepStripUndefined([1, 'two', true, null])).toEqual([
      1,
      'two',
      true,
      null,
    ])
  })

  it('returns empty array unchanged', () => {
    expect(deepStripUndefined([])).toEqual([])
  })

  it('handles mixed deep nesting: object → array of objects → nested object', () => {
    expect(
      deepStripUndefined({
        user: {
          name: 'Alice',
          age: undefined,
          skills: [
            { name: 'ts', level: 'expert', note: undefined },
            { name: 'css', level: undefined },
          ],
        },
      }),
    ).toEqual({
      user: {
        name: 'Alice',
        skills: [{ name: 'ts', level: 'expert' }, { name: 'css' }],
      },
    })
  })

  it('does NOT strip undefined array slots — only object keys are stripped', () => {
    expect(deepStripUndefined([1, undefined, 2])).toEqual([1, undefined, 2])
  })
})
