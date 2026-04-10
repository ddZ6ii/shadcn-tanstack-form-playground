import { describe, expect, it } from 'vitest'

import { schema } from './form.schema'

const BASE = {
  title: 'Login button broken',
  description: 'Clicking login does nothing on Safari.',
} as const

describe('schema', () => {
  describe('happy paths', () => {
    it('accepts a valid form', () => {
      const result = schema.safeParse(BASE)

      expect(result.success).toBe(true)
    })

    it('accepts title and description at their minimum lengths', () => {
      const result = schema.safeParse({
        title: 'Bug!!',
        description: '12345678901234567890',
      })

      expect(result.success).toBe(true)
    })

    it('accepts title and description at their maximum lengths', () => {
      const result = schema.safeParse({
        title: '12345678901234567890123456789012',
        description:
          '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890',
      })

      expect(result.success).toBe(true)
    })
  })

  describe('title', () => {
    it('rejects a title shorter than 5 characters', () => {
      const result = schema.safeParse({ ...BASE, title: 'Bug!' })

      expect(result.success).toBe(false)
      if (result.success) return
      const messages = result.error.issues.map((i) => i.message)
      expect(messages).toContain('Title must be at least 5 characters.')
    })

    it('rejects a title longer than 32 characters', () => {
      const result = schema.safeParse({
        ...BASE,
        title: '123456789012345678901234567890123',
      })

      expect(result.success).toBe(false)
      if (result.success) return
      const messages = result.error.issues.map((i) => i.message)
      expect(messages).toContain('Title must be at most 32 characters.')
    })
  })

  describe('description', () => {
    it('rejects a description shorter than 20 characters', () => {
      const result = schema.safeParse({ ...BASE, description: 'Too short.' })

      expect(result.success).toBe(false)
      if (result.success) return
      const messages = result.error.issues.map((i) => i.message)
      expect(messages).toContain('Description must be at least 20 characters.')
    })

    it('rejects a description longer than 100 characters', () => {
      const result = schema.safeParse({
        ...BASE,
        description:
          '12345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901',
      })

      expect(result.success).toBe(false)
      if (result.success) return
      const messages = result.error.issues.map((i) => i.message)
      expect(messages).toContain('Description must be at most 100 characters.')
    })
  })
})
