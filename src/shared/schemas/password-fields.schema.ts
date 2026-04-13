import z from 'zod'

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

const passwordFieldsSchema = z
  .object({
    password: PASSWORD_RULES.patterns.reduce(
      (s, { value, message }) => s.regex(value, message),
      z
        .string()
        .trim()
        .min(...PASSWORD_RULES.min)
        .max(...PASSWORD_RULES.max),
    ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

type PasswordFieldsValues = z.infer<typeof passwordFieldsSchema>

export { passwordFieldsSchema, type PasswordFieldsValues, PASSWORD_RULES }
