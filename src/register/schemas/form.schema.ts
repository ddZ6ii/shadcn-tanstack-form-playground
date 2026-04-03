import z from 'zod'

const ageValidator = z
  .number({ error: 'Age is required.' })
  .min(18, 'You must be at least 18 years old.')
  .max(120, 'Please enter a valid age.')

const schema = z.object({
  name: z
    .string()
    .trim()
    .min(5, 'Name must be at least 5 characters long.')
    .max(100, 'Name must be at most 100 characters long.'),
  email: z.email('Invalid email address.'),
  age: z.union([ageValidator, z.literal('')]).pipe(ageValidator),
})

type FormInput = z.input<typeof schema>
type FormData = z.output<typeof schema>

export { schema, type FormData, type FormInput }
