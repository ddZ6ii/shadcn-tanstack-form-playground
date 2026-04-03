import { revalidateLogic, useForm, useStore } from '@tanstack/react-form'
import { XIcon } from 'lucide-react'

import {
  CATEGORIES,
  schema,
  type Category,
  type FormData,
  type FormInput,
} from '@/expense-tracker/schemas'
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
import { Skeleton } from '@/shared/components/ui/skeleton'
import { useFormRefs } from '@/shared/hooks'
import { cn } from '@/shared/lib/utils'
import { focusFirstErrorField } from '@/shared/utilities'

const NO_SELECTION = '__NONE__'

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
    <Card className={cn('mx-auto w-full max-w-lg', className)}>
      <CardHeader>
        <CardTitle>Expense Tracker</CardTitle>
        <CardDescription>
          Fill out the form below to add an expense <br />
          All fields are required.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form noValidate aria-label="Expense Tracker" onSubmit={handleSubmit}>
          <FieldSet disabled={isSubmitting}>
            <FieldGroup>
              <form.Field name="description">
                {(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>
                        Description <span className="text-destructive">*</span>
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
                        placeholder="Describe the expense..."
                        aria-describedby={`${field.name}-error`}
                        aria-invalid={isInvalid}
                        className="text-sm"
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

              <form.Field name="amount">
                {(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>
                        Amount <span className="text-destructive">*</span>
                      </FieldLabel>
                      <Input
                        type="number"
                        required
                        id={field.name}
                        ref={setRef(field.name)}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => {
                          field.handleChange(
                            e.target.value === '' ? '' : e.target.valueAsNumber,
                          )
                        }}
                        placeholder="Enter the amount..."
                        aria-describedby={`${field.name}-error`}
                        aria-invalid={isInvalid}
                        className="text-sm"
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

              <form.Field name="category">
                {(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>
                        Category <span className="text-destructive">*</span>
                      </FieldLabel>
                      <Select
                        name={field.name}
                        // Value adapter to ensure React always treats the component
                        // as controlled (undefined is uncontrolled) while still keep
                        // undefined internally if no option is selected
                        value={field.state.value ?? ''}
                        onValueChange={(value) => {
                          field.handleChange(
                            value === '' || value === NO_SELECTION
                              ? undefined
                              : (value as Category),
                          )
                        }}
                      >
                        <SelectTrigger
                          id={field.name}
                          ref={setRef(field.name)}
                          onBlur={field.handleBlur}
                          data-testid={`select-trigger-${field.name}`}
                          aria-required
                          aria-invalid={isInvalid}
                          aria-describedby={`${field.name}-error`}
                        >
                          <SelectValue placeholder="Select a category..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>Categories</SelectLabel>
                            {CATEGORIES.map((category) => (
                              <SelectItem key={category} value={category}>
                                {category}
                              </SelectItem>
                            ))}
                            {field.state.value && (
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

function ExpenseTrackerSkeleton() {
  return (
    <Card className="mx-auto w-full max-w-lg">
      <CardHeader>
        <Skeleton id="card-title" className="h-5 w-5/12" />
        <div className="space-y-1.5">
          <Skeleton id="card-description" className="h-3.5 w-3/5" />

          <Skeleton id="card-description" className="h-3.5 w-2/5" />
        </div>
      </CardHeader>
      <CardContent>
        <FieldSet>
          <FieldGroup>
            <Field>
              <Skeleton id="description-label" className="h-5 w-1/5!" />
              <Skeleton id="description-input" className="h-9 w-full" />
            </Field>

            <Field>
              <Skeleton id="amount-label" className="h-5 w-1/5!" />
              <Skeleton id="amount-input" className="h-9 w-full" />
            </Field>

            <Field>
              <Skeleton id="category-label" className="h-5 w-1/5!" />
              <Skeleton id="category-input" className="h-9 w-full" />
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

export default ExpenseTrackerForm
export { ExpenseTrackerSkeleton }
