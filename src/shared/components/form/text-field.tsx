import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from '@/shared/components/ui/field'
import { Input } from '@/shared/components/ui/input'
import { useFieldContext } from '@/shared/form/form.context'
import { cn } from '@/shared/lib/utils'

type TextFieldProps = React.ComponentProps<typeof Input> & {
  label: string
  description?: string
}

function TextField({
  className,
  label,
  description,
  ...props
}: TextFieldProps) {
  const field = useFieldContext<string | number | undefined>()

  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid

  return (
    <Field data-invalid={isInvalid}>
      <FieldLabel htmlFor={field.name}>
        {label} {props.required && <span className="text-destructive">*</span>}
      </FieldLabel>
      {description && <FieldDescription>{description}</FieldDescription>}
      <Input
        type="text"
        {...props}
        id={field.name}
        value={field.state.value}
        onBlur={field.handleBlur}
        onChange={(e) => {
          // Handle both input type="text" and type="number" cases.
          // Value adapter allowing empty string for controlled input (while still keeping number undefined internally if initial value is undefined).
          field.handleChange(
            props.type === 'number' && e.target.value !== ''
              ? e.target.valueAsNumber
              : e.target.value,
          )
        }}
        aria-invalid={isInvalid}
        aria-describedby={[props['aria-describedby'], `${field.name}-error`]
          .filter(Boolean)
          .join(' ')}
        className={cn('rounded-sm text-sm', className)}
      />
      {isInvalid && (
        <FieldError
          id={`${field.name}-error`}
          errors={field.state.meta.errors}
        />
      )}
    </Field>
  )
}

export default TextField
