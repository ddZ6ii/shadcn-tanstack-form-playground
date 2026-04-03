import { TanStackDevtools } from '@tanstack/react-devtools'
import { formDevtoolsPlugin } from '@tanstack/react-form-devtools'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { App } from './app'
import './index.css'

const rootEl = document.getElementById('root')

if (rootEl) {
  createRoot(rootEl).render(
    <StrictMode>
      <App />
      <TanStackDevtools plugins={[formDevtoolsPlugin()]} />
    </StrictMode>,
  )
}
