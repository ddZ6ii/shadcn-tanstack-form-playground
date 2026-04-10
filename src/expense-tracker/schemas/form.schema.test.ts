import { describe, expect, it } from 'vitest'

import { CATEGORIES, schema } from './form.schema'

const BASE = {
  description: 'Lunch at cafe',
  amount: 12.5,
} as const

describe('schema', () => {
  describe('happy paths', () => {
    it('accepts a valid form without category — category absent from output', () => {
      const result = schema.safeParse(BASE)

      expect(result.success).toBe(true)
      if (!result.success) return
      expect(result.data).not.toHaveProperty('category')
    })

    it('accepts a valid form with category', () => {
      const result = schema.safeParse({ ...BASE, category: CATEGORIES[0] })

      expect(result.success).toBe(true)
      if (!result.success) return
      expect(result.data.category).toBe(CATEGORIES[0])
    })
  })

  describe('description', () => {
    it('trims whitespace before validating', () => {
      const result = schema.safeParse({
        ...BASE,
        description: '  Lunch at cafe  ',
      })

      expect(result.success).toBe(true)
      if (!result.success) return
      expect(result.data.description).toBe('Lunch at cafe')
    })

    it('rejects fewer than 3 characters', () => {
      const result = schema.safeParse({ ...BASE, description: 'Hi' })

      expect(result.success).toBe(false)
      if (result.success) return
      const messages = result.error.issues.map((i) => i.message)
      expect(messages).toContain('Description must be at least 3 characters.')
    })

    it('rejects more than 100 characters', () => {
      const result = schema.safeParse({ ...BASE, description: 'a'.repeat(101) })

      expect(result.success).toBe(false)
      if (result.success) return
      const messages = result.error.issues.map((i) => i.message)
      expect(messages).toContain('Description must be at most 100 characters.')
    })
  })

  describe('amount', () => {
    it('empty string → "Amount is required."', () => {
      const result = schema.safeParse({ ...BASE, amount: '' })

      expect(result.success).toBe(false)
      if (result.success) return
      const messages = result.error.issues.map((i) => i.message)
      expect(messages).toContain('Amount is required.')
    })

    it('rejects 0', () => {
      const result = schema.safeParse({ ...BASE, amount: 0 })

      expect(result.success).toBe(false)
      if (result.success) return
      const messages = result.error.issues.map((i) => i.message)
      expect(messages).toContain('Amount must be at least 0.01.')
    })

    it('accepts 0.01 (lower boundary)', () => {
      const result = schema.safeParse({ ...BASE, amount: 0.01 })

      expect(result.success).toBe(true)
    })

    it('accepts 1,000,000 (upper boundary)', () => {
      const result = schema.safeParse({ ...BASE, amount: 1_000_000 })

      expect(result.success).toBe(true)
    })

    it('rejects 1,000,000.01', () => {
      const result = schema.safeParse({ ...BASE, amount: 1_000_000.01 })

      expect(result.success).toBe(false)
      if (result.success) return
      const messages = result.error.issues.map((i) => i.message)
      expect(messages).toContain('Amount must be less than 1,000,000.')
    })

    it('rejects a negative value', () => {
      const result = schema.safeParse({ ...BASE, amount: -1 })

      expect(result.success).toBe(false)
      if (result.success) return
      const messages = result.error.issues.map((i) => i.message)
      expect(messages).toContain('Amount must be at least 0.01.')
    })
  })

  describe('category', () => {
    it('omitting category → key absent from output', () => {
      const result = schema.safeParse(BASE)

      expect(result.success).toBe(true)
      if (!result.success) return
      expect(result.data).not.toHaveProperty('category')
    })

    it('rejects a value not in the allowed list', () => {
      const result = schema.safeParse({ ...BASE, category: 'travel' })

      expect(result.success).toBe(false)
    })
  })
})
