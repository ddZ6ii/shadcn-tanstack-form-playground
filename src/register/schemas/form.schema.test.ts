import { describe, expect, it } from 'vitest'

import { REQUIREMENTS, schema } from './form.schema'

const VALID_UUID = '550e8400-e29b-41d4-a716-446655440000'
const VALID_PASSWORD = 'ValidPass1!xxx'

const BASE = {
  firstName: 'Alice',
  email: 'alice@example.com',
  password: VALID_PASSWORD,
  confirmPassword: VALID_PASSWORD,
  skills: [],
  acceptTerms: true,
} as const

describe('schema', () => {
  describe('happy paths', () => {
    it('accepts a fully filled valid form', () => {
      const result = schema.safeParse({
        ...BASE,
        lastName: 'Smith',
        age: 25,
        address: {
          street: '123 Main St',
          city: 'Springfield',
          zip: 'SW1A1AA',
          country: 'United States',
        },
        skills: [{ id: VALID_UUID, name: 'TypeScript', level: 'expert' }],
      })

      expect(result.success).toBe(true)
    })

    it('accepts a minimal form (all optional fields absent) and strips them from output', () => {
      const result = schema.safeParse(BASE)

      expect(result.success).toBe(true)
      if (!result.success) return
      expect(result.data).not.toHaveProperty('lastName')
      expect(result.data).not.toHaveProperty('age')
      expect(result.data).not.toHaveProperty('address')
    })
  })

  describe('firstName', () => {
    it('trims whitespace', () => {
      const result = schema.safeParse({ ...BASE, firstName: '  Alice  ' })

      expect(result.success).toBe(true)
      if (!result.success) return
      expect(result.data.firstName).toBe('Alice')
    })
  })

  describe('lastName', () => {
    it('empty string transforms to undefined — no error, key absent from output', () => {
      const result = schema.safeParse({ ...BASE, lastName: '' })

      expect(result.success).toBe(true)
      if (!result.success) return
      expect(result.data).not.toHaveProperty('lastName')
    })

    it('valid string passes through', () => {
      const result = schema.safeParse({ ...BASE, lastName: 'Smith' })

      expect(result.success).toBe(true)
      if (!result.success) return
      expect(result.data.lastName).toBe('Smith')
    })
  })

  describe('password', () => {
    it('rejects password missing an uppercase letter', () => {
      const result = schema.safeParse({
        ...BASE,
        password: 'validpass1!xxx',
        confirmPassword: 'validpass1!xxx',
      })

      expect(result.success).toBe(false)
      if (result.success) return
      const messages = result.error.issues.map((i) => i.message)
      expect(messages).toContain(REQUIREMENTS.password.patterns[0].message)
    })

    it('rejects password missing a lowercase letter', () => {
      const result = schema.safeParse({
        ...BASE,
        password: 'VALIDPASS1!XXX',
        confirmPassword: 'VALIDPASS1!XXX',
      })

      expect(result.success).toBe(false)
      if (result.success) return
      const messages = result.error.issues.map((i) => i.message)
      expect(messages).toContain(REQUIREMENTS.password.patterns[1].message)
    })

    it('rejects password missing a digit', () => {
      const result = schema.safeParse({
        ...BASE,
        password: 'ValidPass!!xxx',
        confirmPassword: 'ValidPass!!xxx',
      })

      expect(result.success).toBe(false)
      if (result.success) return
      const messages = result.error.issues.map((i) => i.message)
      expect(messages).toContain(REQUIREMENTS.password.patterns[2].message)
    })

    it('rejects password missing a special character', () => {
      const result = schema.safeParse({
        ...BASE,
        password: 'ValidPass1xxxxx',
        confirmPassword: 'ValidPass1xxxxx',
      })

      expect(result.success).toBe(false)
      if (result.success) return
      const messages = result.error.issues.map((i) => i.message)
      expect(messages).toContain(REQUIREMENTS.password.patterns[3].message)
    })

    it('rejects password shorter than 12 characters', () => {
      const result = schema.safeParse({
        ...BASE,
        password: 'Valid1!',
        confirmPassword: 'Valid1!',
      })

      expect(result.success).toBe(false)
    })
  })

  describe('confirmPassword', () => {
    it('errors on confirmPassword path when passwords do not match', () => {
      const result = schema.safeParse({
        ...BASE,
        confirmPassword: 'DifferentPass1!',
      })

      expect(result.success).toBe(false)
      if (result.success) return
      const paths = result.error.issues.map((i) => i.path.join('.'))
      expect(paths).toContain('confirmPassword')
    })
  })

  describe('email', () => {
    it('rejects an invalid email address', () => {
      const result = schema.safeParse({ ...BASE, email: 'not-an-email' })

      expect(result.success).toBe(false)
      if (result.success) return
      const paths = result.error.issues.map((i) => i.path.at(-1))
      expect(paths).toContain('email')
    })
  })

  describe('age', () => {
    it('rejects age below 18', () => {
      const result = schema.safeParse({ ...BASE, age: 17 })

      expect(result.success).toBe(false)
      if (result.success) return
      const messages = result.error.issues.map((i) => i.message)
      expect(messages).toContain(REQUIREMENTS.age.min[1])
    })

    it('rejects age above 120', () => {
      const result = schema.safeParse({ ...BASE, age: 121 })

      expect(result.success).toBe(false)
      if (result.success) return
      const messages = result.error.issues.map((i) => i.message)
      expect(messages).toContain(REQUIREMENTS.age.max[1])
    })
  })

  describe('address', () => {
    it('all blank fields → preprocessed to undefined, no error', () => {
      const result = schema.safeParse({
        ...BASE,
        address: { street: '', city: '', zip: '', country: '' },
      })

      expect(result.success).toBe(true)
      if (!result.success) return
      expect(result.data).not.toHaveProperty('address')
    })

    it('partial fill errors on the empty fields', () => {
      const result = schema.safeParse({
        ...BASE,
        address: { street: '123 Main St', city: '', zip: '', country: '' },
      })

      expect(result.success).toBe(false)
      if (result.success) return
      const paths = result.error.issues.map((i) => i.path.at(-1))
      expect(paths).toContain('city')
      expect(paths).toContain('zip')
      expect(paths).toContain('country')
    })

    it('rejects an invalid ZIP format', () => {
      const result = schema.safeParse({
        ...BASE,
        address: {
          street: '123 Main St',
          city: 'Springfield',
          zip: '!!!',
          country: 'US',
        },
      })

      expect(result.success).toBe(false)
      if (result.success) return
      const messages = result.error.issues.map((i) => i.message)
      expect(messages).toContain(REQUIREMENTS.address.zip.patterns[0].message)
    })
  })

  describe('skills', () => {
    it('rejects empty string level — pipes through enum and fails', () => {
      const result = schema.safeParse({
        ...BASE,
        skills: [{ id: VALID_UUID, name: 'typescript', level: '' }],
      })

      expect(result.success).toBe(false)
    })

    it('lowercases skill name in output', () => {
      const result = schema.safeParse({
        ...BASE,
        skills: [{ id: VALID_UUID, name: 'TypeScript', level: 'expert' }],
      })

      expect(result.success).toBe(true)
      if (!result.success) return
      expect(result.data.skills[0].name).toBe('typescript')
    })

    it('rejects a skill with an invalid UUID', () => {
      const result = schema.safeParse({
        ...BASE,
        skills: [{ id: 'not-a-uuid', name: 'typescript', level: 'expert' }],
      })

      expect(result.success).toBe(false)
    })
  })

  describe('acceptTerms', () => {
    it('rejects false with the terms message', () => {
      const result = schema.safeParse({ ...BASE, acceptTerms: false })

      expect(result.success).toBe(false)
      if (result.success) return
      const messages = result.error.issues.map((i) => i.message)
      expect(messages).toContain(REQUIREMENTS.acceptTerms.message)
    })
  })
})
