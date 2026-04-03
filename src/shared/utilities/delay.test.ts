import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import delay from './delay'

describe('delay', () => {
  // Setup: replace real timers with fakes so time can be controlled manually.
  beforeEach(() => {
    vi.useFakeTimers()
  })

  // Teardown: restore real timers to prevent side effects from leaking into other tests.
  afterEach(() => {
    vi.useRealTimers()
  })

  it('resolves after the specified ms', async () => {
    const promise = delay(500)

    // Fast-forward time by 500ms, triggering any timers scheduled within that window.
    vi.advanceTimersByTime(500)

    // Resolves with undefined since the promise settles without a value.
    await expect(promise).resolves.toBeUndefined()
  })

  it('does not resolve before the specified ms', async () => {
    const promise = delay(500)
    vi.advanceTimersByTime(499)
    await expect(
      Promise.race([promise, Promise.resolve('pending')]),
    ).resolves.toBe('pending')
  })

  it('defaults to 1000ms', async () => {
    const promise = delay()
    vi.advanceTimersByTime(1000)
    await expect(promise).resolves.toBeUndefined()
  })
})
