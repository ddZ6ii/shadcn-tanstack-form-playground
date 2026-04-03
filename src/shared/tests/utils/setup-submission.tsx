import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { type Mock, afterEach, beforeEach, vi } from 'vitest'

import { delay } from '@/shared/utilities'

const SUBMIT_DELAY_MS = 3000

function setupFormSubmission<TData>(
  Component: React.ComponentType<{ onSubmit?: (data: TData) => Promise<void> }>,
) {
  const ctx = {} as {
    user: ReturnType<typeof userEvent.setup>
    mockOnSubmit: Mock<(data: TData) => Promise<void>>
    ms: number
  }

  // Setup: replace real timers with fakes so time can be controlled manually.
  beforeEach(() => {
    ctx.ms = SUBMIT_DELAY_MS

    // vi.useFakeTimers() freezes all setTimeout calls: nothing time-related runs unless manually calling vi.advanceTimersByTime(n).
    // If this works for userEvent, it does not for findByText() which internally polls using setTimeout. shouldAdvanceTime: true fixes this by making the fake clock tick automatically in sync with real wall-clock time.
    // This means we have to wait for findByText's polling — that's just a few real milliseconds (50ms intervals), but not for delay(3000) in the submit handler which is still fake and advanced manually with vi.advanceTimersByTime(3000).
    vi.useFakeTimers({ shouldAdvanceTime: true })

    // Configures userEvent to use Vitest's fake timer (vi.advanceTimersByTime) instead of real time.
    // By default, userEvent uses real setTimeout/setInterval internally for simulating delays between interactions (e.g., typing).
    // This binding explicitly tells userEvent: "when you need to advance time, call Vitest's fake timer instead".
    // Without it: tests with fake timers + userEvent can deadlock or time out.
    ctx.user = userEvent.setup({
      advanceTimers: vi.advanceTimersByTime.bind(vi),
    })

    // Creates a fresh mock the onSubmit function on each test with no history to avoid pollution. The mock simulates an async function that resolves after a delay, allowing tests to verify loading states and submission behavior without relying on real time passing.
    ctx.mockOnSubmit = vi.fn().mockImplementation(() => delay(SUBMIT_DELAY_MS))

    render(<Component onSubmit={ctx.mockOnSubmit} />)
  })

  // Teardown: restore real timers to prevent side effects from leaking into other tests.
  afterEach(() => {
    vi.useRealTimers()
  })

  return ctx
}

export { setupFormSubmission }
