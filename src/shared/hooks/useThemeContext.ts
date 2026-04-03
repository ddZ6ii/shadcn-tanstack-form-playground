import { use } from 'react'
import { ThemeContext } from '@/shared/contexts'

function useThemeContext() {
  const ctx = use(ThemeContext)
  if (!ctx) {
    throw new Error('useThemeContext must be used within a ThemeProvider')
  }
  return ctx
}

export default useThemeContext
