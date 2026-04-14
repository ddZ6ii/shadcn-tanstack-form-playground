import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { RegisterForm } from '@/register/components'
import type { RegisterFormData } from '@/register/schemas'
import { setupFormSubmission, withProvider } from '@/shared/tests/utils'

const VALID_PASSWORD = 'ValidPass1!xxx'

const validFormData: RegisterFormData = {
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
      resetButton: screen.getByRole('button', { name: /^reset$/i }),
    }
  }

  describe('form display', () => {
    beforeEach(() => {
      render(<RegisterFormWithProvider />)
    })

    it('renders all required fields and action buttons', () => {
      const {
        firstNameInput,
        emailInput,
        passwordInput,
        confirmPasswordInput,
        acceptTermsCheckbox,
        submitButton,
        resetButton,
      } = getFormElements()

      expect(firstNameInput).toBeInTheDocument()
      expect(emailInput).toBeInTheDocument()
      expect(passwordInput).toBeInTheDocument()
      expect(confirmPasswordInput).toBeInTheDocument()
      expect(acceptTermsCheckbox).toBeInTheDocument()
      expect(submitButton).toBeInTheDocument()
      expect(resetButton).toBeInTheDocument()
    })

    it('renders optional personal fields', () => {
      expect(screen.getByLabelText(/^last name/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/^age/i)).toBeInTheDocument()
    })

    it('renders address fields', () => {
      expect(screen.getByLabelText(/^street/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/^city/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/^zip/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/^state/i)).toBeInTheDocument()
    })

    it('disables reset button when form is pristine', () => {
      expect(getFormElements().resetButton).toBeDisabled()
    })

    it('shows "New Skill" button in skills section', () => {
      expect(
        screen.getByRole('button', { name: /add new skill/i }),
      ).toBeInTheDocument()
    })

    it('clicking "New Skill" shows an inline skill name input', async () => {
      const user = userEvent.setup()

      await user.click(screen.getByRole('button', { name: /add new skill/i }))

      expect(screen.getByLabelText(/skill name/i)).toBeInTheDocument()
    })

    it('committing a skill name via Enter adds it to the list', async () => {
      const user = userEvent.setup()

      await user.click(screen.getByRole('button', { name: /add new skill/i }))
      await user.click(screen.getByLabelText(/skill name/i))
      await user.paste('TypeScript')
      await user.keyboard('{Enter}')

      expect(await screen.findByText(/typescript/i)).toBeInTheDocument()
      expect(screen.queryByLabelText(/skill name/i)).not.toBeInTheDocument()
    })

    it('pressing Escape on a new skill removes the entry', async () => {
      const user = userEvent.setup()

      await user.click(screen.getByRole('button', { name: /add new skill/i }))
      await user.keyboard('{Escape}')

      await waitFor(() =>
        expect(screen.queryByLabelText(/skill name/i)).not.toBeInTheDocument(),
      )
    })

    it('clicking delete removes a committed skill from the list', async () => {
      const user = userEvent.setup()

      await user.click(screen.getByRole('button', { name: /add new skill/i }))
      await user.click(screen.getByLabelText(/skill name/i))
      await user.paste('TypeScript')
      await user.keyboard('{Enter}')

      await user.click(
        await screen.findByRole('button', { name: /delete skill typescript/i }),
      )

      await waitFor(() =>
        expect(screen.queryByText(/typescript/i)).not.toBeInTheDocument(),
      )
    })
  })

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

  describe('form submission', () => {
    const ctx = setupFormSubmission<RegisterFormData>(RegisterFormWithProvider)

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

      await u.click(firstNameInput)
      await u.paste(validFormData.firstName)

      await u.click(emailInput)
      await u.paste(validFormData.email)

      await u.click(passwordInput)
      await u.paste(validFormData.password)

      await u.click(confirmPasswordInput)
      await u.paste(validFormData.confirmPassword)

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

      await ctx.user.click(firstNameInput)
      await ctx.user.paste(validFormData.firstName)

      await ctx.user.click(emailInput)
      await ctx.user.paste(validFormData.email)

      await ctx.user.click(passwordInput)
      await ctx.user.paste(validFormData.password)

      await ctx.user.click(confirmPasswordInput)
      await ctx.user.paste(validFormData.confirmPassword)

      await ctx.user.click(acceptTermsCheckbox)

      // Fire-and-forget to observe the loading state before it resolves
      void ctx.user.click(submitButton)

      const submittingButton = await screen.findByRole('button', {
        name: /submit\.\.\./i,
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
