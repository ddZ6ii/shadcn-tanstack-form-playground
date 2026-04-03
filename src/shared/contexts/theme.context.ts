import { createContext } from 'react'

type ThemeContextValue = {
  darkMode: boolean
  toggleDarkMode: () => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

export default ThemeContext
