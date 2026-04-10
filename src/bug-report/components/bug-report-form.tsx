import { useStore } from '@tanstack/react-form'

import { schema, type FormData } from '@/bug-report/schemas'
import {
  FieldSetField,
  FormCard,
  FormCardSkeleton,
} from '@/shared/components/form'
import { Button } from '@/shared/components/ui/button'
import { Field, FieldGroup, FieldSet } from '@/shared/components/ui/field'
import { Heading } from '@/shared/components/ui/heading'
import { InputGroupAddon } from '@/shared/components/ui/input-group'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { getFormOpts, useAppForm } from '@/shared/form'
import { useFormRefs } from '@/shared/hooks'
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

  const form = useAppForm({
    ...getFormOpts(schema, defaultValues),
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
    <FormCard
      title="Bug Report"
      className={className}
      description={
        <>
          <p>Help us improve by reporting bugs you encounter.</p>
          <p>
            All fields marked with <span className="text-destructive">*</span>{' '}
            are required.
          </p>
        </>
      }
    >
      <form.AppForm>
        <form
          noValidate
          aria-label="Bug Report"
          onSubmit={(e) => {
            e.preventDefault()
            void form.handleSubmit()
          }}
        >
          <FieldSetField>
            <form.AppField name="title">
              {(field) => (
                <field.TextField
                  required
                  ref={setRef(field.name)}
                  autoComplete="off"
                  label="Bug Title"
                  placeholder="Login button not working on mobile..."
                />
              )}
            </form.AppField>

            <form.AppField name="description">
              {(field) => (
                <field.TextAreaField
                  required
                  ref={setRef(field.name)}
                  autoComplete="off"
                  aria-describedby={`${field.name}-count`}
                  description="Include steps to reproduce, expected behavior, and what actually happened."
                  label="Description"
                  placeholder="I'm having an issue with the login button on mobile..."
                  group
                >
                  <InputGroupAddon
                    id={`${field.name}-count`}
                    align="block-end"
                    aria-live="polite"
                    className="text-muted-foreground text-xs"
                  >
                    {field.state.value.length}/100 characters
                  </InputGroupAddon>
                </field.TextAreaField>
              )}
            </form.AppField>

            <Field orientation="responsive">
              <form.ResetButton label="Reset" />
              <form.SubmitButton label="Submit" />
            </Field>
          </FieldSetField>
        </form>
      </form.AppForm>
    </FormCard>
  )
}

function BugReportFormSkeleton() {
  return (
    <FormCardSkeleton>
      <FieldSet>
        <FieldGroup>
          {/* Title */}
          <Field>
            <Skeleton className="h-5 w-1/5!" />
            <Skeleton className="h-9 w-full" />
          </Field>

          {/* Description */}
          <Field>
            <Skeleton className="h-5 w-1/5!" />
            <Skeleton className="h-41 w-full" />
            <div className="space-y-3">
              <Skeleton className="h-3.5 w-full" />
              <Skeleton className="h-3.5 w-1/5" />
            </div>
          </Field>
        </FieldGroup>

        {/* Form Actions */}
        <FieldGroup>
          <Field orientation="responsive">
            <Skeleton className="h-9 min-w-24" />
            <Skeleton className="h-9 min-w-24" />
          </Field>
        </FieldGroup>
      </FieldSet>
    </FormCardSkeleton>
  )
}

export { BugReportForm as default, BugReportFormSkeleton }
