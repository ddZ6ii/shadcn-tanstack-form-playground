import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from '@/shared/components/ui/field'
import { Input } from '@/shared/components/ui/input'
import { InputGroup, InputGroupInput } from '@/shared/components/ui/input-group'
import { useFieldContext } from '@/shared/form/form.context'
import { cn } from '@/shared/lib/utils'

type CommonProps = {
  description?: string
  label?: string
  invalid?: boolean
}

type InputProps = React.ComponentProps<typeof Input> & {
  group?: never
  children?: never
}

type InputGroupProps = React.ComponentProps<typeof InputGroupInput> & {
  group: true
  children: React.ReactNode
}

type TextFieldProps = CommonProps & (InputProps | InputGroupProps)

function TextField({
  children,
  className,
  description,
  group,
  invalid,
  label,
  type = 'text',
  onBlur,
  ...props
}: TextFieldProps) {
  const field = useFieldContext<string | number | undefined>()

  const isInvalid =
    invalid ?? (field.state.meta.isTouched && !field.state.meta.isValid)

  const sharedProps = {
    ...props,
    type,
    id: field.name,
    // Allow empty string for controlled input when value is undefined
    value: field.state.value ?? '',
    onBlur: (e: React.FocusEvent<HTMLInputElement>) => {
      field.handleBlur()
      onBlur?.(e)
    },
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
      // Handle both input type="text" and type="number" cases.
      // Value adapter allowing empty string for controlled input (while still keeping number undefined internally if initial value is undefined).
      field.handleChange(
        type === 'number' && e.target.value !== ''
          ? e.target.valueAsNumber
          : e.target.value,
      )
    },
    'aria-invalid': isInvalid,
    'aria-describedby': [props['aria-describedby'], `${field.name}-error`]
      .filter(Boolean)
      .join(' '),
    className: cn('rounded-sm text-sm', className),
  } satisfies React.InputHTMLAttributes<HTMLInputElement>

  return (
    <Field data-invalid={isInvalid}>
      {label && (
        <FieldLabel htmlFor={field.name}>
          {label}{' '}
          {props.required && <span className="text-destructive">*</span>}
        </FieldLabel>
      )}

      {description && <FieldDescription>{description}</FieldDescription>}

      {group ? (
        <InputGroup>
          <InputGroupInput {...sharedProps} />
          {children}
        </InputGroup>
      ) : (
        <Input {...sharedProps} />
      )}

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
