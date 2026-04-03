import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'

import { App } from '@/app'
import { withProvider } from '@/shared/tests/utils'

const AppWithProvider = withProvider(App)

describe('App', () => {
  it('renders the Playground heading', () => {
    render(<AppWithProvider />)

    const heading = screen.getByRole('heading', {
      name: /Shadcn \+ React Hook Form Playground/i,
    })

    expect(heading).toBeInTheDocument()
    expect(heading).toHaveTextContent('Shadcn + React Hook Form Playground')
  })
})
