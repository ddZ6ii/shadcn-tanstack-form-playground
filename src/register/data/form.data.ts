import type { FormInput } from '@/register/schemas'

// Possible alternative to form initial values
const defaultValues: FormInput = {
  firstName: '',
  email: '',
  password: '',
  confirmPassword: '',
  skills: [],
  acceptTerms: false,
}

// Test values to quickly populate the form during development (can be removed later)
const testValues: FormInput = {
  firstName: 'John',
  // lastName: '',
  age: undefined,
  email: 'johndoe@email.com',
  password: 'ultra$trongP4ssw0rd!',
  confirmPassword: 'ultra$trongP4ssw0rd!',
  // address: undefined,
  address: {
    street: '123 Main St',
    city: 'London',
    country: 'England',
    zip: 'W1K 3JP',
  },
  skills: [
    {
      id: crypto.randomUUID(),
      name: 'typescript',
      level: 'intermediate',
    },
    {
      id: crypto.randomUUID(),
      name: 'react',
      level: 'beginner',
    },
  ],
  acceptTerms: true,
}

export { defaultValues, testValues }
