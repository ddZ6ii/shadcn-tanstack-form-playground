import { cn } from '@/shared/lib/utils'
import { cva, type VariantProps } from 'class-variance-authority'

type HeadingTag = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'

const headingVariants = cva('scroll-m-20 tracking-tight ', {
  variants: {
    as: {
      h1: 'text-4xl font-extrabold text-balance',
      h2: 'text-3xl font-semibold first:mt-0',
      h3: 'text-2xl font-semibold',
      h4: 'text-xl font-semibold',
      h5: 'text-lg font-bold',
      h6: 'text-base font-bold',
    },
  },
  defaultVariants: {
    as: 'h2',
  },
})

type HeadingProps = React.HTMLAttributes<HTMLHeadingElement> &
  VariantProps<typeof headingVariants> & {
    as?: HeadingTag
  }

function Heading({ className, as = 'h2', ...props }: HeadingProps) {
  const Tag = as
  return <Tag className={cn(headingVariants({ as, className }))} {...props} />
}

export { Heading }
