import { Checkbox } from '@/shared/components/ui/checkbox'
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
} from '@/shared/components/ui/field'
import { useFieldContext } from '@/shared/form/form.context'
import { cn } from '@/shared/lib/utils'

type CheckboxFieldProps = React.ComponentProps<typeof Checkbox> & {
  label: string
  description?: string
  showLabelFirst?: boolean
  orientation?: React.ComponentProps<typeof Field>['orientation']
}

function CheckboxField({
  className,
  label,
  description,
  orientation = 'vertical',
  showLabelFirst,
  ...props
}: CheckboxFieldProps) {
  const field = useFieldContext<boolean | undefined>()

  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid

  return (
    <Field data-invalid={isInvalid} orientation={orientation}>
      <Checkbox
        {...props}
        id={field.name}
        checked={field.state.value}
        onBlur={field.handleBlur}
        onCheckedChange={(checked) => {
          field.handleChange(checked === true)
        }}
        aria-describedby={
          props['aria-describedby']
            ? `${props['aria-describedby']} ${field.name}-error`
            : `${field.name}-error`
        }
        aria-invalid={isInvalid}
        className={cn('rounded-xs text-sm', className)}
      />
      <FieldContent className={cn(showLabelFirst && '-order-1')}>
        <FieldLabel htmlFor={field.name}>
          {label}
          {props.required && <span className="text-destructive">*</span>}
        </FieldLabel>
        {isInvalid && (
          <FieldError
            id={`${field.name}-error`}
            errors={field.state.meta.errors}
          />
        )}
        {description && <FieldDescription>{description}</FieldDescription>}
      </FieldContent>
    </Field>
  )
}

export default CheckboxField
