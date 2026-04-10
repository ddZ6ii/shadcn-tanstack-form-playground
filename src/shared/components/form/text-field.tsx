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
  const field = useFieldContext<string>()

  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid

  return (
    <Field data-invalid={isInvalid}>
      <FieldLabel htmlFor={field.name}>
        {label} {props.required && <span className="text-destructive">*</span>}
      </FieldLabel>
      {description && <FieldDescription>{description}</FieldDescription>}
      <Input
        {...props}
        type="text"
        id={field.name}
        value={field.state.value}
        onBlur={field.handleBlur}
        onChange={(e) => {
          field.handleChange(e.target.value)
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
