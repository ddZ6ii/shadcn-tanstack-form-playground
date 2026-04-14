import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'

import { App } from '@/app'
import { withProvider } from '@/shared/tests/utils'

const AppWithProvider = withProvider(App)

describe('App', () => {
  it('renders the Playground heading', async () => {
    render(<AppWithProvider />)

    // findByRole (async) lets lazy-loaded Suspense boundaries resolve within act()
    const heading = await screen.findByRole('heading', {
      name: /Shadcn \+ React Hook Form Playground/i,
    })

    expect(heading).toBeInTheDocument()
    expect(heading).toHaveTextContent('Shadcn + React Hook Form Playground')
  })
})
