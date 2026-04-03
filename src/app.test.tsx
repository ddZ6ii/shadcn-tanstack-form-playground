import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { App } from '@/app'

describe('App', () => {
  it('renders the Playground heading', () => {
    render(<App />)

    const heading = screen.getByRole('heading', {
      name: /Shadcn \+ React Hook Form Playground/i,
    })

    expect(heading).toBeInTheDocument()
    expect(heading).toHaveTextContent('Shadcn + React Hook Form Playground')
  })
})
