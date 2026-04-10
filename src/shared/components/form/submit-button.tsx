import { Button } from '@/shared/components/ui/button'
import { useFormContext } from '@/shared/form/form.context'
import { cn } from '@/shared/lib/utils'

type SubmitButtonProps = React.ComponentProps<typeof Button> & {
  label?: string
  showLoadingSpinner?: boolean
}

function SubmitButton({
  className,
  label = 'Submit',
  showLoadingSpinner = true,
  ...props
}: SubmitButtonProps) {
  const form = useFormContext()

  return (
    <form.Subscribe
      selector={(state) => ({
        canSubmit: state.canSubmit,
        isSubmitting: state.isSubmitting,
      })}
    >
      {({ canSubmit, isSubmitting }) => {
        const disabled = !canSubmit || isSubmitting
        return (
          <Button
            {...props}
            type="submit"
            className={cn('w-fit min-w-24', className)}
            disabled={disabled}
            loading={isSubmitting && showLoadingSpinner}
          >
            {isSubmitting ? `${label}...` : label}
          </Button>
        )
      }}
    </form.Subscribe>
  )
}

export default SubmitButton
