import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { RegisterForm } from '@/register/components'
import type { FormData } from '@/register/schemas'
import { setupFormSubmission, withProvider } from '@/shared/tests/utils'

const VALID_PASSWORD = 'ValidPass1!xxx'

const validFormData: FormData = {
  firstName: 'Alice',
  email: 'alice@example.com',
  password: VALID_PASSWORD,
  confirmPassword: VALID_PASSWORD,
  skills: [],
  acceptTerms: true,
}

const RegisterFormWithProvider = withProvider(RegisterForm)

describe('RegisterForm', () => {
  function getFormElements() {
    return {
      firstNameInput: screen.getByLabelText(/^first name/i),
      emailInput: screen.getByLabelText(/^email/i),
      passwordInput: screen.getByLabelText(/^password/i),
      confirmPasswordInput: screen.getByLabelText(/^confirm password/i),
      acceptTermsCheckbox: screen.getByLabelText(/accept terms/i),
      submitButton: screen.getByRole('button', { name: /^submit$/i }),
    }
  }

  // Non-submission related tests
  describe('form display', () => {
    beforeEach(() => {
      render(<RegisterFormWithProvider />)
    })

    it('renders all required fields and submit button', () => {
      const {
        firstNameInput,
        emailInput,
        passwordInput,
        confirmPasswordInput,
        acceptTermsCheckbox,
        submitButton,
      } = getFormElements()

      expect(firstNameInput).toBeInTheDocument()
      expect(emailInput).toBeInTheDocument()
      expect(passwordInput).toBeInTheDocument()
      expect(confirmPasswordInput).toBeInTheDocument()
      expect(acceptTermsCheckbox).toBeInTheDocument()
      expect(submitButton).toBeInTheDocument()
    })
  })

  // Validation related tests (requires form submission to trigger validation)
  describe('form validation', () => {
    let user: ReturnType<typeof userEvent.setup>

    beforeEach(async () => {
      user = userEvent.setup()
      render(<RegisterFormWithProvider />)
      await user.click(getFormElements().submitButton)
    })

    it('shows field errors and disables submit on empty submission', () => {
      expect(
        screen.getByText(/first name must be at least 1 character/i),
      ).toBeInTheDocument()
      expect(screen.getByText(/invalid email address/i)).toBeInTheDocument()
      expect(
        screen.getByText(/password must be at least 12 characters/i),
      ).toBeInTheDocument()
      expect(
        screen.getByText(/you must accept the terms and conditions/i),
      ).toBeInTheDocument()
      expect(getFormElements().submitButton).toBeDisabled()
    })

    it('shows error when email is not a valid address', async () => {
      await user.click(getFormElements().emailInput)
      await user.paste('not-an-email')

      expect(screen.getByText(/invalid email address/i)).toBeInTheDocument()
    })

    it('shows error on confirmPassword when passwords do not match', async () => {
      const { passwordInput, confirmPasswordInput } = getFormElements()

      await user.click(passwordInput)
      await user.paste(VALID_PASSWORD)
      await user.click(confirmPasswordInput)
      await user.paste('DifferentPass1!')

      expect(screen.getByText(/passwords don't match/i)).toBeInTheDocument()
    })
  })

  // Happy path submission related tests (need fake timers + onSubmit)
  describe('form submission', () => {
    const ctx = setupFormSubmission<FormData>(RegisterFormWithProvider)

    async function fillAndSubmitValidForm(
      u: ReturnType<typeof userEvent.setup>,
    ) {
      const {
        firstNameInput,
        emailInput,
        passwordInput,
        confirmPasswordInput,
        acceptTermsCheckbox,
        submitButton,
      } = getFormElements()

      await u.type(firstNameInput, validFormData.firstName)
      await u.type(emailInput, validFormData.email)
      await u.type(passwordInput, validFormData.password)
      await u.type(confirmPasswordInput, validFormData.confirmPassword)
      await u.click(acceptTermsCheckbox)
      await u.click(submitButton)
    }

    it('shows spinner and disables fieldset while submitting', async () => {
      const {
        firstNameInput,
        emailInput,
        passwordInput,
        confirmPasswordInput,
        acceptTermsCheckbox,
        submitButton,
      } = getFormElements()

      await ctx.user.type(firstNameInput, validFormData.firstName)
      await ctx.user.type(emailInput, validFormData.email)
      await ctx.user.type(passwordInput, validFormData.password)
      await ctx.user.type(confirmPasswordInput, validFormData.confirmPassword)
      await ctx.user.click(acceptTermsCheckbox)

      // Fire-and-forget to observe the loading state before it resolves
      void ctx.user.click(submitButton)

      const submittingButton = await screen.findByRole('button', {
        name: /submitting/i,
      })

      expect(submittingButton).toBeInTheDocument()
      expect(submittingButton.closest('fieldset')).toBeDisabled()
    })

    it('calls onSubmit with correct form data', async () => {
      await fillAndSubmitValidForm(ctx.user)
      await vi.advanceTimersByTimeAsync(ctx.ms)

      expect(ctx.mockOnSubmit).toHaveBeenCalledWith(validFormData)
    })

    it('shows success screen after valid form submission', async () => {
      await fillAndSubmitValidForm(ctx.user)
      await vi.advanceTimersByTimeAsync(ctx.ms)

      expect(
        await screen.findByRole('heading', { name: /thanks for registering/i }),
      ).toBeInTheDocument()
      expect(
        await screen.findByRole('button', { name: /register another user/i }),
      ).toBeInTheDocument()
    })

    it('returns to form when "Register another user" is clicked', async () => {
      await fillAndSubmitValidForm(ctx.user)
      await vi.advanceTimersByTimeAsync(ctx.ms)

      const registerAnotherBtn = await screen.findByRole('button', {
        name: /register another user/i,
      })
      await ctx.user.click(registerAnotherBtn)

      expect(getFormElements().firstNameInput).toBeInTheDocument()
    })
  })
})
