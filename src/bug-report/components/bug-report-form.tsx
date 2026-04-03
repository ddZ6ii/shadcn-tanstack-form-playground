import { revalidateLogic, useForm, useStore } from '@tanstack/react-form'

import { schema, type FormData } from '@/bug-report/schemas'
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
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from '@/shared/components/ui/field'
import { Heading } from '@/shared/components/ui/heading'
import { Input } from '@/shared/components/ui/input'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupTextarea,
} from '@/shared/components/ui/input-group'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { useFormRefs } from '@/shared/hooks'
import { cn } from '@/shared/lib/utils'
import { focusFirstErrorField } from '@/shared/utilities'

const defaultValues: FormData = {
  title: '',
  description: '',
}

interface BugReportFormProps {
  className?: string
  onSubmit?: (data: FormData) => Promise<void>
}

function BugReportForm({ className, onSubmit }: BugReportFormProps) {
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
      await onSubmit?.(value)
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
          Thank you for your contribution!
        </Heading>
        <Button
          variant="outline"
          onClick={() => {
            form.reset()
          }}
        >
          Report Another Bug
        </Button>
      </>
    )
  }

  return (
    <Card className={cn('mx-auto w-full max-w-lg', className)}>
      <CardHeader>
        <CardTitle>Bug Report</CardTitle>
        <CardDescription>
          Help us improve by reporting bugs you encounter.
          <br />
          All fields marked with <span className="text-destructive">*</span> are
          required.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form noValidate aria-label="Bug Report" onSubmit={handleSubmit}>
          <FieldSet disabled={isSubmitting}>
            <FieldGroup>
              <form.Field name="title">
                {(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>
                        Bug Title <span className="text-destructive">*</span>
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
                        placeholder="Login button not working on mobile..."
                        autoComplete="off"
                        aria-describedby={`${field.name}-error`}
                        aria-invalid={isInvalid}
                        className="rounded-sm text-sm"
                      />
                      {isInvalid && (
                        <FieldError
                          id={`${field.name}-error`}
                          errors={field.state.meta.errors}
                        />
                      )}
                    </Field>
                  )
                }}
              </form.Field>
              <form.Field name="description">
                {(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>
                        Description <span className="text-destructive">*</span>
                      </FieldLabel>
                      <InputGroup>
                        <InputGroupTextarea
                          required
                          id={field.name}
                          ref={setRef(field.name)}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => {
                            field.handleChange(e.target.value)
                          }}
                          placeholder="I'm having an issue with the login button on mobile..."
                          autoComplete="off"
                          aria-describedby={`${field.name}-count ${field.name}-error`}
                          aria-invalid={isInvalid}
                          className="[&::-webkit-scrollbar-thumb]:bg-muted-foreground field-sizing-fixed basis-32 resize-none overflow-y-auto rounded-sm pb-8 text-sm [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded"
                        />
                        <InputGroupAddon
                          id={`${field.name}-count`}
                          align="block-end"
                          aria-live="polite"
                          className="text-muted-foreground text-xs"
                        >
                          {field.state.value.length}/100 characters
                        </InputGroupAddon>
                      </InputGroup>
                      {isInvalid && (
                        <FieldError
                          id={`${field.name}-error`}
                          errors={field.state.meta.errors}
                        />
                      )}
                      <FieldDescription>
                        Include steps to reproduce, expected behavior, and what
                        actually happened.
                      </FieldDescription>
                    </Field>
                  )
                }}
              </form.Field>
            </FieldGroup>

            <FieldGroup>
              <Field orientation="responsive">
                <form.Subscribe selector={(state) => state.isDefaultValue}>
                  {(isDefaultValue) => (
                    <Button
                      type="button"
                      variant="outline"
                      className="w-fit min-w-24"
                      disabled={isDefaultValue || isSubmitting}
                      onClick={() => {
                        form.reset()
                      }}
                    >
                      Reset
                    </Button>
                  )}
                </form.Subscribe>

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

function BugReportFormSkeleton() {
  return (
    <Card className="mx-auto w-full max-w-lg">
      <CardHeader>
        <Skeleton id="card-title" className="h-5 w-3/12" />
        <div className="space-y-2">
          <Skeleton id="card-description" className="h-3.5 w-9/12" />

          <Skeleton id="card-description" className="h-3.5 w-7/12" />
        </div>
      </CardHeader>
      <CardContent>
        <FieldSet>
          <FieldGroup>
            <Field>
              <Skeleton id="title-label" className="h-5 w-1/5!" />
              <Skeleton id="title-input" className="h-9 w-full" />
            </Field>
            <Field>
              <Skeleton id="description-label" className="h-5 w-1/5!" />
              <Skeleton id="description-input" className="h-41 w-full" />
              <div className="space-y-3">
                <Skeleton id="description-1" className="h-3.5 w-full" />
                <Skeleton id="description-2" className="h-3.5 w-1/5" />
              </div>
            </Field>
          </FieldGroup>
          <FieldGroup>
            <Field orientation="responsive">
              <Skeleton id="reset-button" className="h-9 min-w-24" />
              <Skeleton id="submit-button" className="h-9 min-w-24" />
            </Field>
          </FieldGroup>
        </FieldSet>
      </CardContent>
    </Card>
  )
}

export default BugReportForm
export { BugReportFormSkeleton }
