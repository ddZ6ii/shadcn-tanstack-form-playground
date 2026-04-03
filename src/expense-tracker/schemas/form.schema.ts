import z from 'zod'

import { deepStripUndefined } from '@/register/utilities'

const CATEGORIES = ['groceries', 'utilities', 'entertainment'] as const

const amountValidator = z
  .number({ error: 'Amount is required.' })
  .min(0.01, 'Amount must be at least 0.01.')
  .max(1000000, 'Amount must be less than 1,000,000.')

// Single schema for both form values and validation.
const schema = z
  .object({
    description: z
      .string()
      .trim()
      .min(3, 'Description must be at least 3 characters.')
      .max(100, 'Description must be at most 100 characters.'),
    // .pipe() allows to chain schemas:
    // -> Input type = before pipe
    // -> Output type = after pipe
    amount: z.union([amountValidator, z.literal('')]).pipe(amountValidator),
    category: z.enum(CATEGORIES).optional(),
  })
  .transform(deepStripUndefined)

type Category = (typeof CATEGORIES)[number]
type FormInput = z.input<typeof schema>
type FormData = z.output<typeof schema>

export { CATEGORIES, schema, type Category, type FormData, type FormInput }
