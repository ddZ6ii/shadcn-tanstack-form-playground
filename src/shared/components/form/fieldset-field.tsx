import {
  FieldDescription,
  FieldGroup,
  FieldLegend,
  FieldSet,
} from '@/shared/components/ui/field'
import { useFormContext } from '@/shared/form/form.context'

type FieldSetFieldProps = React.ComponentProps<typeof FieldSet> & {
  legend?: React.ReactNode
  description?: React.ReactNode
}

function FieldSetField({
  children,
  disabled,
  legend,
  description,
  ...props
}: FieldSetFieldProps) {
  const form = useFormContext()

  return (
    <form.Subscribe selector={(state) => state.isSubmitting}>
      {(isSubmitting) => (
        <FieldSet {...props} disabled={isSubmitting || disabled}>
          {!!legend && <FieldLegend>{legend}</FieldLegend>}
          {!!description && <FieldDescription>{description}</FieldDescription>}
          <FieldGroup>{children}</FieldGroup>
        </FieldSet>
      )}
    </form.Subscribe>
  )
}

export default FieldSetField
