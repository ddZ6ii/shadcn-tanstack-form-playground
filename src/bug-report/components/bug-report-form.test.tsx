import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { assert, beforeEach, describe, expect, it, vi } from 'vitest'

import { BugReportForm } from '@/bug-report/components'
import { setupFormSubmission } from '@/shared/tests/utils'

type FormData = Parameters<
  NonNullable<React.ComponentProps<typeof BugReportForm>['onSubmit']>
>[0]

const validFormData: FormData = {
  title: 'Valid bug title',
  description:
    'This is a valid description that is long enough to pass validation.',
}

describe('BugReportForm', () => {
  function getFormElements() {
    return {
      titleInput: screen.getByLabelText(/bug title/i),
      descriptionInput: screen.getByLabelText(/description/i),
      submitButton: screen.getByRole('button', { name: /submit/i }),
      resetButton: screen.getByRole('button', { name: /reset/i }),
    }
  }

  // Non-submission related tests
  describe('form display', () => {
    let user: ReturnType<typeof userEvent.setup>

    beforeEach(() => {
      user = userEvent.setup()
      render(<BugReportForm />)
    })

    it('renders form with title field, description field, and action buttons', () => {
      const { titleInput, descriptionInput, submitButton, resetButton } =
        getFormElements()

      expect(titleInput).toBeInTheDocument()
      expect(descriptionInput).toBeInTheDocument()
      expect(submitButton).toBeInTheDocument()
      expect(resetButton).toBeInTheDocument()
    })

    it('updates character counter as user types in description', async () => {
      const { descriptionInput } = getFormElements()

      expect(screen.getByText('0/100 characters')).toBeInTheDocument()

      await user.type(descriptionInput, 'Hello')

      expect(screen.getByText('5/100 characters')).toBeInTheDocument()
    })

    it('disables Reset button when form is pristine', () => {
      const { resetButton } = getFormElements()

      expect(resetButton).toBeDisabled()
    })

    it('clears fields when Reset button is clicked', async () => {
      const { titleInput, descriptionInput, resetButton } = getFormElements()

      await user.type(titleInput, 'My bug title')
      await user.type(descriptionInput, 'Some description text here')
      await user.click(resetButton)

      expect(titleInput).toHaveValue('')
      expect(descriptionInput).toHaveValue('')
    })
  })

  // Validation related tests (requires form submission to trigger validation)
  describe('form validation', () => {
    let user: ReturnType<typeof userEvent.setup>

    beforeEach(async () => {
      user = userEvent.setup()
      render(<BugReportForm />)
      const { submitButton } = getFormElements()
      await user.click(submitButton)
    })

    it('shows errors and disables buttons when submitting empty form', () => {
      const { resetButton, submitButton } = getFormElements()

      expect(
        screen.getByText(/title must be at least 5 characters/i),
      ).toBeInTheDocument()
      expect(
        screen.getByText(/description must be at least 20 characters/i),
      ).toBeInTheDocument()
      expect(submitButton).toBeDisabled()
      expect(resetButton).toBeDisabled()
    })

    it('removes validation error when title is valid', async () => {
      const { titleInput } = getFormElements()

      await user.type(titleInput, validFormData.title)

      await waitFor(() => {
        const errorId = titleInput.getAttribute('aria-describedby')
        assert(
          errorId,
          'Title input should have aria-describedby attribute when there is a validation error',
        )
        const titleError = document.getElementById(errorId)

        expect(titleError).not.toBeInTheDocument()
      })
    })

    it('removes validation error when description is valid', async () => {
      const { descriptionInput } = getFormElements()

      await user.type(descriptionInput, validFormData.description)

      await waitFor(() => {
        const errorId = descriptionInput.getAttribute('aria-describedby')
        assert(
          errorId,
          'Description input should have aria-describedby attribute when there is a validation error',
        )
        const descriptionError = document.getElementById(errorId)

        expect(descriptionError).not.toBeInTheDocument()
      })
    })
  })

  // Happy path submission related tests (need fake timers + onSubmit)
  describe('form submission', () => {
    // Registers beforeEach/afterEach hooks and returns a ctx object mutated before each test.
    const ctx = setupFormSubmission<FormData>(BugReportForm)

    async function submitValidForm(u: ReturnType<typeof userEvent.setup>) {
      const { titleInput, descriptionInput, submitButton } = getFormElements()

      await u.type(titleInput, validFormData.title)
      await u.type(descriptionInput, validFormData.description)
      await u.click(submitButton)
    }

    async function getSuccessScreenElements() {
      const [heading, reportAnotherButton] = await Promise.all([
        screen.findByRole('heading', {
          name: /thank you for your contribution!/i,
        }),
        screen.findByRole('button', {
          name: /report another bug/i,
        }),
      ])
      return { heading, reportAnotherButton }
    }

    it('shows spinner and disables fieldset while submitting', async () => {
      const { titleInput, descriptionInput, submitButton } = getFormElements()

      await ctx.user.type(titleInput, validFormData.title)
      await ctx.user.type(descriptionInput, validFormData.description)

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

      const { heading, reportAnotherButton } = await getSuccessScreenElements()
      expect(heading).toBeInTheDocument()
      expect(reportAnotherButton).toBeInTheDocument()
    })

    it('returns to form when Report Another Bug is clicked', async () => {
      await submitValidForm(ctx.user)
      await vi.advanceTimersByTimeAsync(ctx.ms)

      const { reportAnotherButton } = await getSuccessScreenElements()
      await ctx.user.click(reportAnotherButton)

      const { titleInput, descriptionInput } = getFormElements()
      expect(titleInput).toHaveValue('')
      expect(descriptionInput).toHaveValue('')
    })
  })
})
