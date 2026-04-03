import { Navbar } from '@/shared/components'

interface LayoutProps
  extends React.PropsWithChildren, React.ComponentProps<'main'> {}

function PageLayout({ children, className, ...props }: LayoutProps) {
  return (
    <div className="container mx-auto grid min-h-screen grid-rows-[auto_1fr] gap-8 p-3">
      <Navbar className="flex justify-between gap-4" />
      <main className={className} {...props}>
        {children}
      </main>
    </div>
  )
}

export default PageLayout
