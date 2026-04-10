import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from '@/shared/components/ui/field'
import {
  InputGroup,
  InputGroupTextarea,
} from '@/shared/components/ui/input-group'
import { Textarea } from '@/shared/components/ui/textarea'
import { useFieldContext } from '@/shared/form/form.context'
import { cn } from '@/shared/lib/utils'

type CommonTextAreaFieldProps = {
  label: string
  description?: string
}

type TextAreaProps = React.ComponentProps<typeof Textarea> & {
  group?: never
  children?: never
}

type TextAreaGroupProps = React.ComponentProps<typeof InputGroupTextarea> & {
  group: true
  children: React.ReactNode
}

type TextAreaFieldProps = CommonTextAreaFieldProps &
  (TextAreaProps | TextAreaGroupProps)

function TextAreaField({
  children,
  className,
  description,
  group,
  label,
  ...props
}: TextAreaFieldProps) {
  const field = useFieldContext<string>()

  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid

  const sharedProps = {
    ...props,
    id: field.name,
    value: field.state.value,
    onBlur: field.handleBlur,
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      field.handleChange(e.target.value)
    },
    'aria-invalid': isInvalid,
    'aria-describedby': [props['aria-describedby'], `${field.name}-error`]
      .filter(Boolean)
      .join(' '),
    className: cn(
      '[&::-webkit-scrollbar-thumb]:bg-muted-foreground field-sizing-fixed basis-32 resize-none overflow-y-auto rounded-sm pb-8 text-sm [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded',
      className,
    ),
  } satisfies React.TextareaHTMLAttributes<HTMLTextAreaElement>

  return (
    <Field data-invalid={isInvalid}>
      <FieldLabel htmlFor={field.name}>
        {label} {props.required && <span className="text-destructive">*</span>}
      </FieldLabel>

      {group ? (
        <InputGroup>
          <InputGroupTextarea {...sharedProps} />
          {children}
        </InputGroup>
      ) : (
        <Textarea {...sharedProps} />
      )}

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

export default TextAreaField
