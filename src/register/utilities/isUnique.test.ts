import { describe, expect, it } from 'vitest'

import isUnique from './isUnique'

describe('isUnique', () => {
  it('returns true when value appears exactly once', () => {
    expect(isUnique('alice', ['alice', 'bob'])).toBe(true)
  })

  it('returns false when value appears more than once', () => {
    expect(isUnique('alice', ['alice', 'alice', 'bob'])).toBe(false)
  })

  it('throws when value is not in the list', () => {
    expect(() => isUnique('alice', ['bob'])).toThrow(
      'value not found in current values',
    )
  })

  it('case-insensitive: "Alice" and "alice" count as duplicates', () => {
    expect(isUnique('alice', ['Alice', 'alice'])).toBe(false)
  })

  it('trims whitespace on value before matching', () => {
    expect(isUnique(' alice ', ['alice'])).toBe(true)
  })

  it('trims whitespace on list entries — normalized duplicates are caught', () => {
    expect(isUnique('alice', ['alice', ' alice '])).toBe(false)
  })
})
