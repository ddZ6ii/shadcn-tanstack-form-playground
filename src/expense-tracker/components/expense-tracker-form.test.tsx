import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'

import { ExpenseTrackerForm } from '@/expense-tracker/components'
import { CATEGORIES } from '@/expense-tracker/schemas'
import { setupFormSubmission } from '@/shared/tests/utils'

type FormData = Parameters<
  NonNullable<React.ComponentProps<typeof ExpenseTrackerForm>['onSubmit']>
>[0]

const validFormData = {
  description: 'Valid description',
  amount: 10.99,
  category: 'groceries',
} satisfies FormData

describe('ExpenseTrackerForm', () => {
  // Radix Select's FocusScope schedules a 0ms setTimeout for focus-restore on unmount.
  // React 19 commits useSyncExternalStore subscriber updates (Field, LocalSubscribe,
  // SelectItem) via the concurrent scheduler (MessageChannel, not faked), so they land
  // after RTL's asyncWrapper restores IS_REACT_ACT_ENVIRONMENT=true — outside any act()
  // scope. This is a known library-compatibility limitation; suppress these specific
  // warnings so they don't obscure real failures.
  beforeAll(() => {
    const original = console.error.bind(console)
    // React logs act() warnings in two forms:
    //   1. console.error(formatStr, componentName) — "An update to %s inside a test..."
    //      args[0] contains the format string ("%s"), args[1] is the component name.
    //   2. console.error(fullStr) — "A component suspended inside an `act` scope..."
    //      args[0] is the full message string.
    vi.spyOn(console, 'error').mockImplementation((...args: unknown[]) => {
      const fmt = typeof args[0] === 'string' ? args[0] : ''
      if (
        (fmt.includes('not wrapped in act') &&
          /^(Field|LocalSubscribe|SelectItem)$/.test(
            typeof args[1] === 'string' ? args[1] : '',
          )) ||
        fmt.includes('the `act` call was not awaited')
      )
        return
      original(...args)
    })
  })
  afterAll(() => {
    vi.mocked(console.error).mockRestore()
  })

  function getFormElements() {
    return {
      descriptionInput: screen.getByLabelText(/description/i),
      amountInput: screen.getByLabelText(/amount/i),
      categorySelect: screen.getByLabelText(/category/i),
      selectTrigger: screen.getByTestId('select-trigger-category'),
      resetButton: screen.getByRole('button', { name: /reset/i }),
      submitButton: screen.getByRole('button', { name: /submit/i }),
    }
  }

  // Non-submission related tests
  describe('form display', () => {
    let user: ReturnType<typeof userEvent.setup>

    beforeEach(() => {
      user = userEvent.setup()
      render(<ExpenseTrackerForm />)
    })

    it('renders form with description field, amount field, category select and submit button', () => {
      const {
        descriptionInput,
        amountInput,
        categorySelect,
        resetButton,
        submitButton,
      } = getFormElements()

      expect(descriptionInput).toBeInTheDocument()
      expect(amountInput).toBeInTheDocument()
      expect(categorySelect).toBeInTheDocument()
      expect(submitButton).toBeInTheDocument()
      expect(resetButton).toBeInTheDocument()
    })

    it('submit button is enabled on fresh load', () => {
      const { submitButton } = getFormElements()

      expect(submitButton).toBeEnabled()
    })

    it('disables Reset button when form is pristine', () => {
      const { resetButton } = getFormElements()

      expect(resetButton).toBeDisabled()
    })

    it('does not show Clear Selection before a category is selected', async () => {
      const { selectTrigger } = getFormElements()

      await user.click(selectTrigger)

      expect(
        screen.queryByRole('option', { name: /clear selection/i }),
      ).not.toBeInTheDocument()
    })

    it('clears category selection when Clear Selection is clicked', async () => {
      const { selectTrigger } = getFormElements()
      const categoryName = new RegExp(validFormData.category, 'i')

      await user.click(selectTrigger)
      await user.click(
        await screen.findByRole('option', { name: categoryName }),
      )

      // Placeholder should be gone once a category is selected
      expect(screen.queryByText(/select a category/i)).not.toBeInTheDocument()

      await user.click(selectTrigger)
      await user.click(
        await screen.findByRole('option', { name: /clear selection/i }),
      )

      // Placeholder should reappear after clearing
      expect(screen.getByText(/select a category/i)).toBeInTheDocument()
    })

    it('displays the list of categories', async () => {
      const { selectTrigger } = getFormElements()

      // Open select dropdown
      await user.click(selectTrigger)

      for (const category of CATEGORIES) {
        // Radix renders both a hidden native <option> (for form submission) and a visible <span> in the portal. findByText matches both.
        // Use findByRole('option') instead — it targets only the Radix dropdown items.
        const name = new RegExp(category, 'i')
        const option = screen.getByRole('option', {
          name,
        })
        expect(option).toBeInTheDocument()
      }
    })

    it('clears fields when Reset button is clicked', async () => {
      const categoryName = new RegExp(validFormData.category, 'i')
      const { amountInput, descriptionInput, resetButton, selectTrigger } =
        getFormElements()

      await user.type(amountInput, '100')
      await user.type(descriptionInput, 'Some description text here')
      await user.click(selectTrigger)
      await user.click(
        await screen.findByRole('option', { name: categoryName }),
      )
      await waitFor(() =>
        expect(screen.queryByRole('listbox')).not.toBeInTheDocument(),
      )

      await user.click(resetButton)

      await waitFor(() => {
        expect(descriptionInput).toHaveValue('')
        expect(amountInput).toHaveValue(null)
        expect(screen.getByText(/select a category/i)).toBeInTheDocument()
      })
    })
  })

  // Validation related tests (requires form submission to trigger validation)
  describe('form validation', () => {
    let user: ReturnType<typeof userEvent.setup>

    beforeEach(async () => {
      user = userEvent.setup()
      render(<ExpenseTrackerForm />)
      const { submitButton } = getFormElements()
      await user.click(submitButton)
    })

    it('shows errors and disables submit button when submitting empty form', () => {
      const { submitButton } = getFormElements()
      expect(
        screen.getByText(/description must be at least 3 characters/i),
      ).toBeInTheDocument()
      expect(screen.getByText(/amount is required/i)).toBeInTheDocument()
      expect(submitButton).toBeDisabled()
    })

    it('removes validation error when description is valid', async () => {
      const { descriptionInput } = getFormElements()

      await user.type(descriptionInput, validFormData.description)

      await waitFor(() =>
        expect(
          screen.queryByText(/description must be/i),
        ).not.toBeInTheDocument(),
      )
    })

    it('removes validation error when amount is valid', async () => {
      const { amountInput } = getFormElements()

      await user.type(amountInput, validFormData.amount.toString())

      await waitFor(() =>
        expect(
          screen.queryByText(/amount is required/i),
        ).not.toBeInTheDocument(),
      )
    })
  })

  // Happy path submission related tests (need fake timers + onSubmit)
  describe('form submission', () => {
    const name = new RegExp(validFormData.category, 'i')

    // Registers beforeEach/afterEach hooks and returns a ctx object mutated before each test.
    const ctx = setupFormSubmission<FormData>(ExpenseTrackerForm)

    async function submitValidForm(u: ReturnType<typeof userEvent.setup>) {
      const { descriptionInput, amountInput, selectTrigger, submitButton } =
        getFormElements()

      await u.type(descriptionInput, validFormData.description)
      await u.type(amountInput, validFormData.amount.toString())

      // Open select dropdown
      await u.click(selectTrigger)
      //Pick item
      await u.click(
        await screen.findByRole('option', {
          name,
        }),
      )
      // Wait for Radix to finish closing, then flush its timer-based focus effects
      await waitFor(() =>
        expect(screen.queryByRole('listbox')).not.toBeInTheDocument(),
      )

      await u.click(submitButton)
    }

    async function getSuccessScreenElements() {
      const [heading, addNewExpenseButton] = await Promise.all([
        screen.findByRole('heading', {
          name: /your new expense has been added successfully!/i,
        }),
        screen.findByRole('button', {
          name: /add a new expense/i,
        }),
      ])
      return { heading, addNewExpenseButton }
    }

    it('shows spinner and disables fieldset while submitting', async () => {
      const name = new RegExp(validFormData.category, 'i')
      const {
        descriptionInput,
        amountInput,
        selectTrigger,
        resetButton,
        submitButton,
      } = getFormElements()

      await ctx.user.type(descriptionInput, validFormData.description)
      await ctx.user.type(amountInput, validFormData.amount.toString())
      await ctx.user.click(selectTrigger)
      await ctx.user.click(
        await screen.findByRole('option', {
          name,
        }),
      )
      // Wait for Radix to finish closing, then flush its timer-based focus effects
      await waitFor(() =>
        expect(screen.queryByRole('listbox')).not.toBeInTheDocument(),
      )

      // Starts submission without awaiting to observe the loading state (fire-and-forget).
      // submitValidForm() cannot be used since it awaits the click, which waits for the whole submission to complete before returning.
      void ctx.user.click(submitButton)

      await screen.findByRole('button', { name: /submit\.\.\./i })

      expect(descriptionInput).toBeDisabled()
      expect(amountInput).toBeDisabled()
      expect(submitButton).toBeDisabled()
      expect(resetButton).toBeDisabled()

      // Drain the in-flight submission so no state updates leak outside act() at cleanup
      await act(async () => {
        await vi.advanceTimersByTimeAsync(ctx.ms)
        // flush 0ms timeouts (e.g. Radix focus cleanup) scheduled during unmount
        await vi.advanceTimersByTimeAsync(1)
      })
    })

    it('calls onSubmit with correct form data', async () => {
      await submitValidForm(ctx.user)
      await act(async () => {
        await vi.advanceTimersByTimeAsync(ctx.ms)
        // flush 0ms timeouts (e.g. Radix focus cleanup) scheduled during unmount
        await vi.advanceTimersByTimeAsync(1)
      })

      expect(ctx.mockOnSubmit).toHaveBeenCalledWith(validFormData)
    })

    it('shows success screen after valid form submission', async () => {
      await submitValidForm(ctx.user)
      await act(async () => {
        await vi.advanceTimersByTimeAsync(ctx.ms)
        // flush 0ms timeouts (e.g. Radix focus cleanup) scheduled during unmount
        await vi.advanceTimersByTimeAsync(1)
      })

      const { heading, addNewExpenseButton } = await getSuccessScreenElements()
      expect(heading).toBeInTheDocument()
      expect(addNewExpenseButton).toBeInTheDocument()
    })

    it('calls onSubmit without category when none is selected', async () => {
      const { descriptionInput, amountInput, submitButton } = getFormElements()

      await ctx.user.type(descriptionInput, validFormData.description)
      await ctx.user.type(amountInput, validFormData.amount.toString())
      await ctx.user.click(submitButton)
      await act(async () => {
        await vi.advanceTimersByTimeAsync(ctx.ms)
        // flush 0ms timeouts (e.g. Radix focus cleanup) scheduled during unmount
        await vi.advanceTimersByTimeAsync(1)
      })

      expect(ctx.mockOnSubmit).toHaveBeenCalledWith({
        description: validFormData.description,
        amount: validFormData.amount,
      })
    })

    it('returns to form when Add New Expense is clicked', async () => {
      await submitValidForm(ctx.user)
      await act(async () => {
        await vi.advanceTimersByTimeAsync(ctx.ms)
        // flush 0ms timeouts (e.g. Radix focus cleanup) scheduled during unmount
        await vi.advanceTimersByTimeAsync(1)
      })

      const { addNewExpenseButton } = await getSuccessScreenElements()
      await ctx.user.click(addNewExpenseButton)

      const { descriptionInput, amountInput, categorySelect } =
        getFormElements()
      expect(descriptionInput).toBeInTheDocument()
      expect(amountInput).toBeInTheDocument()
      expect(categorySelect).toBeInTheDocument()
    })
  })
})
