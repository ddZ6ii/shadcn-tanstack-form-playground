import { describe, expect, it } from 'vitest'

import {
  PASSWORD_RULES,
  passwordFieldsSchema,
} from '@/shared/schemas/password-fields.schema'

const VALID_PASSWORD = 'ValidPass1!xxx'

const BASE = {
  password: VALID_PASSWORD,
  confirmPassword: VALID_PASSWORD,
} as const

describe('passwordFieldsSchema', () => {
  describe('happy paths', () => {
    it('accepts a fully filled valid form', () => {
      const result = passwordFieldsSchema.safeParse(BASE)

      expect(result.success).toBe(true)
    })
  })

  describe('password', () => {
    it('rejects password missing an uppercase letter', () => {
      const result = passwordFieldsSchema.safeParse({
        ...BASE,
        password: 'validpass1!xxx',
        confirmPassword: 'validpass1!xxx',
      })

      expect(result.success).toBe(false)
      if (result.success) return
      const messages = result.error.issues.map((i) => i.message)
      expect(messages).toContain(PASSWORD_RULES.patterns[0].message)
    })

    it('rejects password missing a lowercase letter', () => {
      const result = passwordFieldsSchema.safeParse({
        ...BASE,
        password: 'VALIDPASS1!XXX',
        confirmPassword: 'VALIDPASS1!XXX',
      })

      expect(result.success).toBe(false)
      if (result.success) return
      const messages = result.error.issues.map((i) => i.message)
      expect(messages).toContain(PASSWORD_RULES.patterns[1].message)
    })

    it('rejects password missing a digit', () => {
      const result = passwordFieldsSchema.safeParse({
        ...BASE,
        password: 'ValidPass!!xxx',
        confirmPassword: 'ValidPass!!xxx',
      })

      expect(result.success).toBe(false)
      if (result.success) return
      const messages = result.error.issues.map((i) => i.message)
      expect(messages).toContain(PASSWORD_RULES.patterns[2].message)
    })

    it('rejects password missing a special character', () => {
      const result = passwordFieldsSchema.safeParse({
        ...BASE,
        password: 'ValidPass1xxxxx',
        confirmPassword: 'ValidPass1xxxxx',
      })

      expect(result.success).toBe(false)
      if (result.success) return
      const messages = result.error.issues.map((i) => i.message)
      expect(messages).toContain(PASSWORD_RULES.patterns[3].message)
    })

    it('rejects password shorter than 12 characters', () => {
      const result = passwordFieldsSchema.safeParse({
        ...BASE,
        password: 'Valid1!',
        confirmPassword: 'Valid1!',
      })

      expect(result.success).toBe(false)
    })
  })

  describe('confirmPassword', () => {
    it('errors on confirmPassword path when passwords do not match', () => {
      const result = passwordFieldsSchema.safeParse({
        ...BASE,
        confirmPassword: 'DifferentPass1!',
      })

      expect(result.success).toBe(false)
      if (result.success) return
      const paths = result.error.issues.map((i) => i.path.join('.'))
      expect(paths).toContain('confirmPassword')
    })
  })
})
