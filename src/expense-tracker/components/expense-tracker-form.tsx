import { useStore } from '@tanstack/react-form'

import {
  CATEGORIES,
  schema,
  type FormData,
  type FormInput,
} from '@/expense-tracker/schemas'
import {
  FieldSetField,
  FormCard,
  FormCardSkeleton,
  SelectField,
  TextField,
} from '@/shared/components/form'
import { Button } from '@/shared/components/ui/button'
import { Field, FieldGroup, FieldSet } from '@/shared/components/ui/field'
import { Heading } from '@/shared/components/ui/heading'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { useFormRefs } from '@/shared/hooks'
import { focusFirstErrorField } from '@/shared/utilities'
import { getFormOpts, useAppForm } from '@/shared/form'

const defaultValues: FormInput = {
  description: '',
  amount: '',
  category: undefined,
}

interface ExpenseTrackerFormProps {
  className?: string
  onSubmit?: (data: FormData) => Promise<void>
}

function ExpenseTrackerForm({ className, onSubmit }: ExpenseTrackerFormProps) {
  const { refs, setRef } = useFormRefs<FormInput>()

  const form = useAppForm({
    ...getFormOpts(schema, defaultValues),
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

  if (isSubmitted) {
    return (
      <>
        <Heading as="h2" className="mb-4">
          Your new expense has been added successfully!
        </Heading>
        <Button
          variant="outline"
          onClick={() => {
            form.reset()
          }}
        >
          Add a new expense
        </Button>
      </>
    )
  }

  return (
    <FormCard
      title="Expense Tracker"
      className={className}
      description={
        <>
          <p>Fill out the form below to add an expense.</p>
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
          aria-label="Expense Tracker"
          onSubmit={(e) => {
            e.preventDefault()
            void form.handleSubmit()
          }}
        >
          <FieldSetField>
            <form.AppField name="description">
              {(field) => (
                <TextField
                  required
                  ref={setRef(field.name)}
                  autoComplete="off"
                  label="Description"
                  placeholder="Describe the expense..."
                />
              )}
            </form.AppField>

            <form.AppField name="amount">
              {(field) => (
                <TextField
                  required
                  type="number"
                  ref={setRef(field.name)}
                  autoComplete="off"
                  label="Amount"
                  placeholder="Enter the amount..."
                />
              )}
            </form.AppField>

            <form.AppField name="category">
              {(field) => (
                <SelectField
                  ref={setRef(field.name)}
                  data-testid={`select-trigger-${field.name}`}
                  label="Category"
                  placeholder="Select a category..."
                  optionsGroupLabel="Categories"
                  options={CATEGORIES}
                />
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

function ExpenseTrackerSkeleton() {
  return (
    <FormCardSkeleton>
      <FieldSet>
        <FieldGroup>
          {/* Description */}
          <Field>
            <Skeleton className="h-5 w-1/5!" />
            <Skeleton className="h-9 w-full" />
          </Field>

          {/* Amount */}
          <Field>
            <Skeleton className="h-5 w-1/5!" />
            <Skeleton className="h-9 w-full" />
          </Field>

          {/* Category */}
          <Field>
            <Skeleton className="h-5 w-1/5!" />
            <Skeleton className="h-9 w-full" />
          </Field>
        </FieldGroup>

        {/* Actions */}
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

export default ExpenseTrackerForm
export { ExpenseTrackerSkeleton }
