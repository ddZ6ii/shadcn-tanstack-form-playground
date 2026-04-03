import { revalidateLogic, useForm, useStore } from '@tanstack/react-form'

import { schema, type FormData, type FormInput } from '@/register/schemas'
import { Button } from '@/shared/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card'
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from '@/shared/components/ui/field'
import { Heading } from '@/shared/components/ui/heading'
import { Input } from '@/shared/components/ui/input'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { useFormRefs } from '@/shared/hooks'
import { focusFirstErrorField } from '@/shared/utilities'

const defaultValues: FormInput = {
  name: '',
  email: '',
  age: '',
}

interface RegisterFormProps {
  onSubmit?: (data: FormData) => Promise<void>
}

function RegisterForm({ onSubmit }: RegisterFormProps) {
  const { refs, setRef } = useFormRefs<FormData>()

  const form = useForm({
    defaultValues,
    // If this is omitted, `onDynamic` will not be called
    validationLogic: revalidateLogic(),
    validators: {
      onSubmit: schema,
      // Switch to onChange validation (default) after first submission attempt
      onDynamic: schema,
    },
    onSubmit: async ({ value }) => {
      // Tanstack `value` gives the raw form input data (FormInput type) not the zod transformed output!
      // To obtain the transformed output (FormData type), we need to explicitly parse the input data through the schema.
      const parsed = schema.parse(value)
      await onSubmit?.(parsed)
    },
    onSubmitInvalid: ({ formApi }) => {
      // Deferred so React can commit error state to the DOM before we focus
      requestAnimationFrame(() => {
        focusFirstErrorField(refs.current, formApi)
      })
    },
  })

  const isSubmitted = useStore(form.store, (state) => state.isSubmitted)
  const isSubmitting = useStore(form.store, (state) => state.isSubmitting)

  const handleSubmit: React.SubmitEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault()
    void form.handleSubmit()
  }

  if (isSubmitted) {
    return (
      <>
        <Heading as="h2" className="mb-4">
          Thanks for registering!
        </Heading>
        <Button
          variant="outline"
          onClick={() => {
            form.reset()
          }}
        >
          Register Another User
        </Button>
      </>
    )
  }

  return (
    <Card className="mx-auto w-full max-w-lg">
      <CardHeader>
        <CardTitle>Registration</CardTitle>
        <CardDescription>
          Please fill out the form below to register.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form noValidate aria-label="Registration" onSubmit={handleSubmit}>
          <FieldSet disabled={isSubmitting}>
            <FieldGroup>
              <form.Field name="name">
                {(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>
                        Name <span className="text-destructive">*</span>
                      </FieldLabel>
                      <Input
                        type="text"
                        required
                        id={field.name}
                        ref={setRef(field.name)}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => {
                          field.handleChange(e.target.value)
                        }}
                        placeholder="Your name..."
                        autoComplete="off"
                        aria-describedby="name-error"
                        aria-invalid={isInvalid}
                        className="rounded-sm text-sm"
                      />
                      {isInvalid && (
                        <FieldError
                          id="name-error"
                          errors={field.state.meta.errors}
                        />
                      )}
                    </Field>
                  )
                }}
              </form.Field>

              <form.Field name="email">
                {(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>
                        Email <span className="text-destructive">*</span>
                      </FieldLabel>
                      <Input
                        type="email"
                        required
                        id={field.name}
                        ref={setRef(field.name)}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => {
                          field.handleChange(e.target.value)
                        }}
                        placeholder="Your email..."
                        autoComplete="email"
                        aria-describedby="email-error"
                        aria-invalid={isInvalid}
                        className="rounded-sm text-sm"
                      />
                      {isInvalid && (
                        <FieldError
                          id="email-error"
                          errors={field.state.meta.errors}
                        />
                      )}
                    </Field>
                  )
                }}
              </form.Field>

              <form.Field name="age">
                {(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>
                        Age <span className="text-destructive">*</span>
                      </FieldLabel>
                      <Input
                        type="number"
                        required
                        min={0}
                        max={120}
                        id={field.name}
                        ref={setRef(field.name)}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => {
                          field.handleChange(
                            e.target.value === '' ? '' : e.target.valueAsNumber,
                          )
                        }}
                        placeholder="Your age..."
                        autoComplete="off"
                        aria-describedby="age-error"
                        aria-invalid={isInvalid}
                        className="rounded-sm text-sm"
                      />
                      {isInvalid && (
                        <FieldError
                          id="age-error"
                          errors={field.state.meta.errors}
                        />
                      )}
                    </Field>
                  )
                }}
              </form.Field>
            </FieldGroup>

            <FieldGroup>
              <Field orientation="responsive">
                <form.Subscribe selector={(state) => state.canSubmit}>
                  {(canSubmit) => {
                    const disabled = !canSubmit || isSubmitting
                    return (
                      <Button
                        type="submit"
                        className="w-fit min-w-24"
                        disabled={disabled}
                        loading={isSubmitting}
                      >
                        {isSubmitting ? 'Submitting...' : 'Submit'}
                      </Button>
                    )
                  }}
                </form.Subscribe>
              </Field>
            </FieldGroup>
          </FieldSet>
        </form>
      </CardContent>
    </Card>
  )
}

function RegisterFormSkeleton() {
  return (
    <Card className="mx-auto w-full max-w-lg">
      <CardHeader>
        <Skeleton id="card-title" className="h-5 w-full sm:w-3/12" />
        <div className="space-y-2 min-[480px]:space-y-0">
          <Skeleton
            id="card-description"
            className="h-3 w-full min-[480px]:h-3.5 sm:w-4/5"
          />
          <Skeleton
            id="card-description"
            className="h-3.5 w-1/5 min-[480px]:hidden"
          />
        </div>
      </CardHeader>
      <CardContent>
        <FieldSet>
          <FieldGroup>
            <Field>
              <Skeleton id="name-label" className="h-5 w-1/5!" />
              <Skeleton id="name-input" className="h-9 w-full" />
            </Field>

            <Field>
              <Skeleton id="email-label" className="h-5 w-1/5!" />
              <Skeleton id="email-input" className="h-9 w-full" />
            </Field>

            <Field>
              <Skeleton id="age-label" className="h-5 w-1/5!" />
              <Skeleton id="age-input" className="h-9 w-full" />
            </Field>
          </FieldGroup>

          <FieldGroup>
            <Field orientation="responsive">
              <Skeleton id="submit-button" className="h-9 min-w-24" />
            </Field>
          </FieldGroup>
        </FieldSet>
      </CardContent>
    </Card>
  )
}

export default RegisterForm
export { RegisterFormSkeleton }
