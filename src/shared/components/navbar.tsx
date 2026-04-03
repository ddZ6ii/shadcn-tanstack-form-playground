import { MoonIcon, SunIcon } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Heading } from '@/shared/components/ui/heading'
import { useThemeContext } from '@/shared/hooks'
import { cn } from '@/shared/lib/utils'

export default function Navbar({
  className,
  ...props
}: React.ComponentProps<'nav'>) {
  const { darkMode, toggleDarkMode } = useThemeContext()

  return (
    <nav
      aria-label="Main navigation"
      className={cn('flex justify-between gap-4', className)}
      {...props}
    >
      <Heading as="h1">Shadcn + React Hook Form Playground</Heading>
      <Button
        size="icon-sm"
        variant="outline"
        className="rounded-full"
        aria-label={`Switch to ${darkMode ? 'light' : 'dark'} mode`}
        aria-pressed={darkMode}
        onClick={() => {
          toggleDarkMode()
        }}
      >
        {darkMode ? <SunIcon /> : <MoonIcon />}
      </Button>
    </nav>
  )
}
