import { TooltipProvider } from '@/shared/components/ui/tooltip'
import { ThemeContextProvider } from '@/shared/providers'

/**
 * HOC that wraps a component with all app providers.
 * Use in tests to avoid "must be used within a Provider" errors.
 *
 * @example
 * const AppWithProvider = withProvider(App)
 * render(<AppWithProvider />)
 */
function withProvider<P extends object>(Component: React.ComponentType<P>) {
  return function WrappedComponent(props: P) {
    return (
      <ThemeContextProvider>
        <TooltipProvider>
          <Component {...props} />
        </TooltipProvider>
      </ThemeContextProvider>
    )
  }
}

export { withProvider }
