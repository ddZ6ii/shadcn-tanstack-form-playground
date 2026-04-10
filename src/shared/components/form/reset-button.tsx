import { Button } from '@/shared/components/ui/button'
import { useFormContext } from '@/shared/form/form.context'
import { cn } from '@/shared/lib/utils'

type ResetButtonProps = Omit<
  React.ComponentProps<typeof Button>,
  'loading' | 'dataIcon' | 'children'
> & {
  label?: string
}

function ResetButton({
  label = 'Reset',
  className,
  onClick,
  ...props
}: ResetButtonProps) {
  const form = useFormContext()

  return (
    <form.Subscribe
      selector={(state) => ({
        isDefaultValue: state.isDefaultValue,
        isSubmitting: state.isSubmitting,
      })}
    >
      {({ isDefaultValue, isSubmitting }) => {
        const disabled = isDefaultValue || isSubmitting
        return (
          <Button
            {...props}
            type="button"
            variant="outline"
            className={cn('w-fit min-w-24', className)}
            disabled={disabled}
            onClick={(e) => {
              onClick?.(e)
              form.reset()
            }}
          >
            {label}
          </Button>
        )
      }}
    </form.Subscribe>
  )
}

export default ResetButton
