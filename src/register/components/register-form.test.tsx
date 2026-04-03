import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { RegisterForm } from '@/register/components'
import { setupFormSubmission } from '@/shared/tests/utils'

type FormData = Parameters<
  NonNullable<React.ComponentProps<typeof RegisterForm>['onSubmit']>
>[0]

const validFormData: FormData = {
  name: 'Valid name',
  email: 'valid@example.com',
  age: 25,
}

describe('RegisterForm', () => {
  function getFormElements() {
    return {
      nameInput: screen.getByLabelText(/name/i),
      emailInput: screen.getByLabelText(/email/i),
      ageInput: screen.getByLabelText(/age/i),
      submitButton: screen.getByRole('button', { name: /submit/i }),
    }
  }

  // Non-submission related tests
  describe('form display', () => {
    beforeEach(() => {
      render(<RegisterForm />)
    })

    it('renders form with name field, email field, age field, and submit button', () => {
      const { nameInput, emailInput, ageInput, submitButton } =
        getFormElements()

      expect(nameInput).toBeInTheDocument()
      expect(emailInput).toBeInTheDocument()
      expect(ageInput).toBeInTheDocument()
      expect(submitButton).toBeInTheDocument()
    })
  })

  // Validation related tests (requires form submission to trigger validation)
  describe('form validation', () => {
    let user: ReturnType<typeof userEvent.setup>

    beforeEach(async () => {
      user = userEvent.setup()
      render(<RegisterForm />)
      const { submitButton } = getFormElements()
      await user.click(submitButton)
    })

    it('shows errors and disables submit button when submitting empty form', () => {
      const { submitButton } = getFormElements()

      expect(
        screen.getByText(/name must be at least 5 characters/i),
      ).toBeInTheDocument()
      expect(screen.getByText(/invalid email address/i)).toBeInTheDocument()
      expect(screen.getByText(/age is required/i)).toBeInTheDocument()

      expect(submitButton).toBeDisabled()
    })

    it('shows error when name is shorter than 5 characters', async () => {
      const { nameInput } = getFormElements()

      await user.click(nameInput)
      await user.paste('a'.repeat(4))

      expect(
        screen.getByText(/must be at least 5 characters/i),
      ).toBeInTheDocument()
    })

    it('shows error when name exceeds 100 characters', async () => {
      const { nameInput } = getFormElements()

      await user.click(nameInput)
      await user.paste('a'.repeat(101)) // much faster than user.type() since it fires a single event instead of multiple keyboard cycles

      expect(
        screen.getByText(/must be at most 100 characters/i),
      ).toBeInTheDocument()
    })

    it('shows error when email is not valid', async () => {
      const { emailInput } = getFormElements()

      await user.click(emailInput)
      await user.paste('invalid-email')

      expect(screen.getByText(/invalid email address/i)).toBeInTheDocument()
    })

    it('shows error when age is less than 18', async () => {
      const { ageInput } = getFormElements()

      await user.type(ageInput, '17')

      expect(
        screen.getByText(/you must be at least 18 years old/i),
      ).toBeInTheDocument()
    })

    it('shows error when age is greater than 120', async () => {
      const { ageInput } = getFormElements()

      await user.type(ageInput, '121')

      expect(screen.getByText(/please enter a valid age/i)).toBeInTheDocument()
    })
  })

  // Happy path submission related tests (need fake timers + onSubmit)
  describe('form submission', () => {
    // Registers beforeEach/afterEach hooks and returns a ctx object mutated before each test.
    const ctx = setupFormSubmission<FormData>(RegisterForm)

    async function submitValidForm(u: ReturnType<typeof userEvent.setup>) {
      const { nameInput, emailInput, ageInput, submitButton } =
        getFormElements()

      await u.type(nameInput, validFormData.name)
      await u.type(emailInput, validFormData.email)
      await u.type(ageInput, validFormData.age.toString())
      await u.click(submitButton)
    }

    async function getSuccessScreenElements() {
      const [heading, registerAnotherUserButton] = await Promise.all([
        screen.findByRole('heading', {
          name: /thanks for registering!/i,
        }),
        screen.findByRole('button', {
          name: /register another user/i,
        }),
      ])

      return { heading, registerAnotherUserButton }
    }

    it('shows spinner and disables fieldset while submitting', async () => {
      const { nameInput, emailInput, ageInput, submitButton } =
        getFormElements()

      await ctx.user.type(nameInput, validFormData.name)
      await ctx.user.type(emailInput, validFormData.email)
      await ctx.user.type(ageInput, validFormData.age.toString())

      // Starts submission without awaiting to observe the loading state (fire-and-forget).
      // submitValidForm() cannot be used since it awaits the click, which waits for the whole submission to complete before returning.
      void ctx.user.click(submitButton)

      const submittingButton = await screen.findByRole('button', {
        name: /submitting/i,
      })

      expect(submittingButton).toBeInTheDocument()
      expect(submittingButton.closest('fieldset')).toBeDisabled()
    })

    it('calls onSubmit with correct form data', async () => {
      await submitValidForm(ctx.user)
      await vi.advanceTimersByTimeAsync(ctx.ms)
      expect(ctx.mockOnSubmit).toHaveBeenCalledWith(validFormData)
    })

    it('shows success screen after valid form submission', async () => {
      await submitValidForm(ctx.user)
      await vi.advanceTimersByTimeAsync(ctx.ms)

      const { heading, registerAnotherUserButton } =
        await getSuccessScreenElements()

      expect(heading).toBeInTheDocument()
      expect(registerAnotherUserButton).toBeInTheDocument()
    })

    it('returns to form when Register another user is clicked', async () => {
      await submitValidForm(ctx.user)
      await vi.advanceTimersByTimeAsync(ctx.ms)

      const { registerAnotherUserButton } = await getSuccessScreenElements()
      await ctx.user.click(registerAnotherUserButton)

      const { nameInput, emailInput, ageInput, submitButton } =
        getFormElements()
      expect(nameInput).toBeInTheDocument()
      expect(emailInput).toBeInTheDocument()
      expect(ageInput).toBeInTheDocument()
      expect(submitButton).toBeInTheDocument()
    })
  })
})
