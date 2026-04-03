import z from 'zod'

import { deepStripUndefined } from '@/register/utilities'

const LEVELS = ['beginner', 'intermediate', 'expert'] as const

const PASSWORD_RULES = {
  min: [12, 'Password must be at least 12 characters'] as const,
  max: [128, 'Password must be at most 128 characters'] as const,
  patterns: [
    {
      value: /[A-Z]/,
      message: 'Password must contain at least 1 uppercase letter',
    },
    {
      value: /[a-z]/,
      message: 'Password must contain at least 1 lowercase letter',
    },
    { value: /[0-9]/, message: 'Password must contain at least 1 number' },
    {
      value: /[^A-Za-z0-9]/,
      message: 'Password must contain at least 1 special character',
    },
  ],
} as const

const ADDRESS_RULES = {
  street: {
    min: [2, 'Street must be at least 2 characters'],
    max: [100, 'Street cannot exceed 100 characters'],
  },
  city: {
    min: [2, 'City must be at least 2 characters'],
    max: [50, 'City cannot exceed 50 characters'],
  },
  zip: {
    min: [3, 'ZIP must be at least 3 characters'],
    max: [10, 'ZIP cannot exceed 10 characters'],
    patterns: [
      {
        value: /^[A-Z0-9][A-Z0-9\s-]{1,8}[A-Z0-9]$/i, // loose catch (3–10 alphanumeric chars, spaces, hyphens)
        message: 'Invalid ZIP format',
      },
    ],
  },
  country: {
    min: [2, 'Country must be at least 2 characters'],
    max: [50, 'Country cannot exceed 50 characters'],
  },
} as const

const REQUIREMENTS = {
  firstName: {
    min: [1, 'First name must be at least 1 character'],
    max: [50, 'First name must be at most 50 characters'],
  },
  lastName: {
    min: [1, 'Last name must be at least 1 character'],
    max: [100, 'Last name must be at most 100 characters'],
  },
  age: {
    min: [18, 'You must be at least 18 years old'],
    max: [120, 'Please enter a valid age'],
  },
  password: PASSWORD_RULES,
  address: ADDRESS_RULES,
  skill: {
    min: [2, 'Skill name must be at least 2 characters'],
    max: [50, 'Skill name must be at most 50 characters'],
  },
  acceptTerms: {
    message: 'You must accept the terms and conditions',
  },
} as const

const skillNameValidator = z
  .string()
  .trim()
  .min(...REQUIREMENTS.skill.min)
  .max(...REQUIREMENTS.skill.max)
  .toLowerCase()

const skillLevelValidator = z.enum(LEVELS, {
  error: 'Skill level is required.',
})

const schema = z
  .object({
    firstName: z
      .string()
      .trim()
      .min(...REQUIREMENTS.firstName.min)
      .max(...REQUIREMENTS.firstName.max),
    lastName: z
      .string()
      .trim()
      .optional()
      // Ensures to always either have a valid string or undefined (but never a blank string)
      .transform((v) => (v === undefined || v === '' ? undefined : v))
      // Then pipes the result through optional string validation (only runs if value is not undefined)
      .pipe(
        z
          .string()
          .min(...REQUIREMENTS.lastName.min)
          .max(...REQUIREMENTS.lastName.max)
          .optional(),
      ),
    age: z
      .number()
      .min(...REQUIREMENTS.age.min)
      .max(...REQUIREMENTS.age.max)
      .optional(),
    email: z.email('Invalid email address'),
    password: PASSWORD_RULES.patterns.reduce(
      (s, { value, message }) => s.regex(value, message),
      z
        .string()
        .trim()
        .min(...REQUIREMENTS.password.min)
        .max(...REQUIREMENTS.password.max),
    ),
    confirmPassword: z.string(),
    // Address is either fully filled out or left blank.
    // Partial fills will error on the empty fields, but a completely blank address will be treated as undefined (optional).
    address: z.optional(
      z.preprocess(
        // Tranforms input before validation happens.
        // Converts left blank fields (empty strings) to undefined, otherwise validates normally.
        // Partial fill will error on the empty fields.
        (
          val:
            | { street: string; city: string; zip: string; country: string }
            | undefined,
        ) => {
          if (val && typeof val === 'object') {
            const allEmpty = Object.values(val).every(
              (v) => v.trim().length === 0,
            )
            if (allEmpty) return undefined
          }
          return val
        },
        z
          .object({
            street: z
              .string()
              .trim()
              .min(...ADDRESS_RULES.street.min)
              .max(...ADDRESS_RULES.street.max),
            city: z
              .string()
              .trim()
              .min(...ADDRESS_RULES.city.min)
              .max(...ADDRESS_RULES.city.max),
            zip: ADDRESS_RULES.zip.patterns.reduce(
              (schema, { value, message }) => schema.regex(value, message),
              z
                .string()
                .trim()
                .min(...ADDRESS_RULES.zip.min)
                .max(...ADDRESS_RULES.zip.max),
            ),
            country: z
              .string()
              .trim()
              .min(...ADDRESS_RULES.country.min)
              .max(...ADDRESS_RULES.country.max),
          })
          .optional(),
      ),
    ),
    // Skills is optional but defaults to an empty array if left blank.
    // Each skill (if provided) must have a valid name and level (initially an empty string since no choice is selected yet).
    skills: z.array(
      z.object({
        id: z.uuid(),
        name: skillNameValidator,
        level: z
          .union([skillLevelValidator, z.literal('')])
          .pipe(skillLevelValidator),
      }),
    ),
    acceptTerms: z.boolean().refine((val) => val, {
      message: 'You must accept the terms and conditions',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })
  // Recursively strips out undefined values from the final output (e.g. age or address if left blank)
  .transform(deepStripUndefined)

type FormInput = z.input<typeof schema>
type FormData = z.output<typeof schema>
type SkillLevel = z.infer<typeof skillLevelValidator>

export {
  LEVELS,
  REQUIREMENTS,
  schema,
  skillLevelValidator,
  skillNameValidator,
  type SkillLevel,
  type FormData,
  type FormInput,
}
