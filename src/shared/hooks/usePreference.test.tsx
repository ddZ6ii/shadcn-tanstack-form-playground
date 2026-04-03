import { renderHook, act } from '@testing-library/react'
import { assert, beforeEach, describe, expect, it } from 'vitest'

import { usePreference } from '@/shared/hooks'

// ℹ️ Key points:
// renderHook — the right tool for testing hooks in isolation, no need to wrap in a component
// act() — required when calling the updater since it triggers a state update
// beforeEach(() => sessionStorage.clear()) — prevents test pollution between cases
// sessionStorage is available in jsdom (the default test environment) with no mocking needed

describe('usePreference', () => {
  beforeEach(() => {
    sessionStorage.clear()
  })

  it('returns the initial preference when nothing is saved', () => {
    const { result } = renderHook(() => usePreference('theme', 'light'))

    expect(result.current[0]).toBe('light')
  })

  it('restores preference from sessionStorage on mount', () => {
    sessionStorage.setItem('theme', JSON.stringify('dark'))

    const { result } = renderHook(() => usePreference('theme', 'light'))

    expect(result.current[0]).toBe('dark')
  })

  it('updates state and persists to sessionStorage', () => {
    const { result } = renderHook(() => usePreference('theme', 'light'))

    act(() => {
      result.current[1]('dark')
    })

    expect(result.current[0]).toBe('dark')
    expect(sessionStorage.getItem('theme')).toBe('"dark"')
  })

  it('works with non-string types (objects)', () => {
    const { result } = renderHook(() =>
      usePreference('settings', { lang: 'en' }),
    )

    act(() => {
      result.current[1]({ lang: 'fr' })
    })

    expect(result.current[0]).toEqual({ lang: 'fr' })

    const saved = sessionStorage.getItem('settings')
    assert(saved !== null, 'Expected settings to be saved in sessionStorage')
    expect(JSON.parse(saved)).toEqual({ lang: 'fr' })
  })
})
