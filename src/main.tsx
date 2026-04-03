import { TanStackDevtools } from '@tanstack/react-devtools'
import { formDevtoolsPlugin } from '@tanstack/react-form-devtools'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { App } from './app'
import { Toaster } from '@/shared/components/ui/sonner'
import { TooltipProvider } from '@/shared/components/ui/tooltip'
import { ThemeContextProvider } from '@/shared/providers'
import './index.css'

const rootEl = document.getElementById('root')

if (rootEl) {
  createRoot(rootEl).render(
    <StrictMode>
      <TooltipProvider>
        <ThemeContextProvider>
          <App />
        </ThemeContextProvider>
        <Toaster position="bottom-right" />
      </TooltipProvider>
      <TanStackDevtools plugins={[formDevtoolsPlugin()]} />
    </StrictMode>,
  )
}
