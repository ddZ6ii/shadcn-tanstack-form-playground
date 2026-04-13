import { EyeIcon, EyeOffIcon } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/shared/components/ui/button'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from '@/shared/components/ui/field'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/shared/components/ui/input-group'
import WithTooltip from '@/shared/components/with-tooltip'
import { useFieldContext } from '@/shared/form/form.context'
import { cn } from '@/shared/lib/utils'

type CommonProps = {
  label: string
  description?: string
}

type InputProps = React.ComponentProps<typeof InputGroupInput> & {
  group?: never
  children?: never
}

type InputGroupProps = React.ComponentProps<typeof InputGroupInput> & {
  group: true
  children: React.ReactNode
}

type PasswordFieldProps = CommonProps & (InputProps | InputGroupProps)

function PasswordField({
  children,
  className,
  description,
  group,
  label,
  ...props
}: PasswordFieldProps) {
  const field = useFieldContext<string>()
  const [showPassword, setShowPassword] = useState(false)

  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid

  return (
    <Field data-invalid={isInvalid}>
      <FieldLabel htmlFor={field.name}>
        {label} {props.required && <span className="text-destructive">*</span>}
      </FieldLabel>

      <InputGroup>
        <InputGroupInput
          {...props}
          type={showPassword ? 'text' : 'password'}
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
        {group && children}

        <InputGroupAddon align="inline-end">
          <WithTooltip
            content={`${showPassword ? 'Hide' : 'Show'} ${field.name}`}
          >
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="rounded-sm"
              aria-label={`${showPassword ? 'Hide' : 'Show'} ${field.name}`}
              onClick={() => {
                setShowPassword((prev) => !prev)
              }}
            >
              {showPassword ? <EyeIcon /> : <EyeOffIcon />}
            </Button>
          </WithTooltip>
        </InputGroupAddon>
      </InputGroup>

      {isInvalid && (
        <FieldError
          id={`${field.name}-error`}
          errors={field.state.meta.errors}
        />
      )}

      {description && <FieldDescription>{description}</FieldDescription>}
    </Field>
  )
}

export default PasswordField
