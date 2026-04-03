import { useCallback, useEffect, useMemo, useState } from 'react'
import { ThemeContext } from '@/shared/contexts'

function toggleMode(darkMode: boolean) {
  const htmlEl = document.querySelector('html')
  if (!htmlEl) return
  htmlEl.classList.toggle('dark', darkMode)
}

function initDarkMode() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

function ThemeContextProvider({ children }: React.PropsWithChildren) {
  const [darkMode, setDarkMode] = useState(initDarkMode)

  const toggleDarkMode = useCallback(() => {
    setDarkMode((prev) => !prev)
  }, [])

  useEffect(() => {
    toggleMode(darkMode)
  }, [darkMode])

  const ctx = useMemo(
    () => ({ darkMode, toggleDarkMode }),
    [darkMode, toggleDarkMode],
  )

  return <ThemeContext value={ctx}>{children}</ThemeContext>
}

export default ThemeContextProvider
