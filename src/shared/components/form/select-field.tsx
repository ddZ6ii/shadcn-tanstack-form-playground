import { XIcon } from 'lucide-react'

import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from '@/shared/components/ui/field'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import { useFieldContext } from '@/shared/form/form.context'
import { cn } from '@/shared/lib/utils'
import { capitalize } from '@/shared/utilities'

const NO_SELECTION = '__NONE__'

// 🚧 TO DO: make it more generic so it can accept an array of object with at least a value key of type string
// Options values can be a list of strings with possible undefined value (no selection)
// How to customize the behavior (clear selection, multiple selection, etc.) without coupling the component to a specific use case?
type SelectFieldProps<T extends string> = React.ComponentProps<
  typeof SelectTrigger
> & {
  label: string
  description?: string
  options: readonly T[]
  optionsGroupLabel?: string
  placeholder?: string
  required?: boolean
  showClearSelection?: boolean
}

function SelectField<T extends string>({
  className,
  description,
  label,
  options,
  optionsGroupLabel,
  placeholder = 'Select an option...',
  required = false,
  showClearSelection = true,
  ...props
}: SelectFieldProps<T>) {
  // undefined belongs on the field value type (representing "no selection"), not on the options constraint
  const field = useFieldContext<T | undefined>()

  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid

  return (
    <Field data-invalid={isInvalid}>
      <FieldLabel htmlFor={field.name}>
        {label} {required && <span className="text-destructive">*</span>}
      </FieldLabel>
      {description && <FieldDescription>{description}</FieldDescription>}
      <Select
        name={field.name}
        // Value adapter to ensure React always treats the component
        // as controlled (undefined is uncontrolled) while still keep
        // undefined internally if no option is selected
        value={field.state.value ?? ''}
        onValueChange={(value) => {
          field.handleChange(
            value === '' || value === NO_SELECTION ? undefined : (value as T),
          )
        }}
      >
        <SelectTrigger
          {...props}
          id={field.name}
          onBlur={field.handleBlur}
          aria-invalid={isInvalid}
          aria-describedby={[props['aria-describedby'], `${field.name}-error`]
            .filter(Boolean)
            .join(' ')}
          aria-required={required}
          className={cn('w-full', className)}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {optionsGroupLabel && (
              <SelectLabel>{optionsGroupLabel}</SelectLabel>
            )}

            {options.map((option) => (
              <SelectItem key={option} value={option}>
                {capitalize(option)}
              </SelectItem>
            ))}
            {showClearSelection && field.state.value && (
              <>
                <SelectSeparator />
                <SelectItem value={NO_SELECTION}>
                  <XIcon className="size-3" /> Clear Selection
                </SelectItem>
              </>
            )}
          </SelectGroup>
        </SelectContent>
      </Select>
      {isInvalid && (
        <FieldError
          id={`${field.name}-error`}
          errors={field.state.meta.errors}
        />
      )}
    </Field>
  )
}

export default SelectField
