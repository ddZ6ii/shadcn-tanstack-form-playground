import { useStore } from '@tanstack/react-form'
import { CircleUser, MailIcon } from 'lucide-react'

import { RegisterAddress, RegisterSkills } from '@/register/components'
import { defaultValues } from '@/register/data'
import {
  registerFormSchema,
  type RegisterFormData,
  type RegisterFormInput,
} from '@/register/schemas'
import { Button } from '@/shared/components/ui/button'
import {
  Field,
  FieldContent,
  FieldGroup,
  FieldSeparator,
  FieldSet,
} from '@/shared/components/ui/field'
import { Heading } from '@/shared/components/ui/heading'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { useFormRefs } from '@/shared/hooks'
import { focusFirstErrorField } from '@/shared/utilities'
import { InputGroupAddon } from '@/shared/components/ui/input-group'
import { getFormOpts, useAppForm } from '@/shared/form'
import {
  CheckboxField,
  FieldSetField,
  FormCard,
  FormCardSkeleton,
  PasswordFields,
  TextField,
} from '@/shared/components/form'

interface RegisterFormProps {
  className?: string
  onSubmit?: (data: RegisterFormData) => Promise<void>
}

function RegisterForm({ className, onSubmit }: RegisterFormProps) {
  const { refs, setRef } = useFormRefs<RegisterFormInput>()

  const form = useAppForm({
    ...getFormOpts(registerFormSchema, defaultValues),
    onSubmit: async ({ value }) => {
      // Tanstack `value` gives the raw form input data (RegisterFormInput type) not the zod transformed output!
      // To obtain the transformed output (RegisterFormData type), we need to explicitly parse the input data through the schema.
      const parsed = registerFormSchema.parse(value)
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
    <FormCard
      title="Registration"
      className={className}
      description={
        <>
          <p>Fill out the form below to register.</p>
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
          aria-label="Registration"
          className="flex flex-col gap-6"
          onSubmit={(e) => {
            e.preventDefault()
            void form.handleSubmit()
          }}
        >
          <FieldSetField
            legend="Personal Information"
            description="Tell us about yourself."
          >
            <div className="grid gap-7 md:grid-cols-2">
              <form.AppField name="firstName">
                {(field) => (
                  <TextField
                    required
                    ref={setRef(field.name)}
                    autoComplete="given-name"
                    label="First name"
                    placeholder="John"
                    group
                  >
                    <InputGroupAddon>
                      <CircleUser />
                    </InputGroupAddon>
                  </TextField>
                )}
              </form.AppField>

              <form.AppField name="lastName">
                {(field) => (
                  <TextField
                    ref={setRef(field.name)}
                    autoComplete="family-name"
                    label="Last name"
                    placeholder="Doe"
                    group
                  >
                    <InputGroupAddon>
                      <CircleUser />
                    </InputGroupAddon>
                  </TextField>
                )}
              </form.AppField>
            </div>

            <form.AppField name="age">
              {(field) => (
                <TextField
                  type="number"
                  ref={setRef(field.name)}
                  label="Age"
                  placeholder="25"
                  min={0}
                  max={120}
                />
              )}
            </form.AppField>
          </FieldSetField>

          <FieldSeparator />

          <FieldSetField
            legend="Credentials"
            description="How you'll log in to your account."
          >
            <form.AppField name="email">
              {(field) => (
                <TextField
                  required
                  type="email"
                  ref={setRef(field.name)}
                  autoComplete="email"
                  label="Email"
                  placeholder="example@email.com"
                  group
                >
                  <InputGroupAddon>
                    <MailIcon />
                  </InputGroupAddon>
                </TextField>
              )}
            </form.AppField>

            {/* Use withFieldGroup HOC to break the form into smaller pieces tied to that specific RegisterForm */}
            <PasswordFields
              form={form}
              setRef={setRef}
              fields={{
                password: 'password',
                confirmPassword: 'confirmPassword',
              }}
            />
          </FieldSetField>

          <FieldSeparator />

          {/* Use withForm HOC to break the form into smaller pieces tied to that specific RegisterForm */}
          <RegisterAddress form={form} setRef={setRef} />

          <FieldSeparator />

          {/* Use withForm HOC to break the form into smaller pieces tied to that specific RegisterForm */}
          <RegisterSkills form={form} />

          <FieldSeparator />

          <FieldSetField>
            <form.AppField name="acceptTerms">
              {(field) => (
                <CheckboxField
                  ref={setRef(field.name)}
                  required
                  description=" By clicking this checkbox, you agree to the terms and conditions."
                  label="Accept terms and conditions"
                  orientation="horizontal"
                />
              )}
            </form.AppField>
          </FieldSetField>

          <FieldSetField>
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

function RegisterFormSkeleton() {
  return (
    <FormCardSkeleton>
      <div className="flex flex-col gap-6">
        {/* Personal Information */}
        <FieldSet>
          <FieldGroup>
            <div className="@md/fieldset-header-group:flex-1">
              {/* Personal Information - Legend */}
              <Skeleton className="mb-3 h-5 w-4/12!" />
              {/* Personal Information - Description */}
              <Skeleton className="h-3.5 w-3/12!" />
            </div>

            <div className="grid gap-7 md:grid-cols-2">
              {/* Personal Information - First Name */}
              <Field>
                <Skeleton className="h-5 w-2/12! md:w-2/5!" />
                <Skeleton className="h-9 w-full" />
              </Field>

              {/* Personal Information - Last Name */}
              <Field>
                <Skeleton className="h-5 w-2/12! md:w-2/5!" />
                <Skeleton className="h-9 w-full" />
              </Field>
            </div>

            {/* Personal Information - Age */}
            <Field>
              <Skeleton className="h-5 w-1/12!" />
              <Skeleton className="h-9 w-full" />
            </Field>
          </FieldGroup>
        </FieldSet>

        <FieldSeparator />

        {/* Credentials*/}
        <FieldSet>
          <FieldGroup>
            <div className="@md/fieldset-header-group:flex-1">
              {/* Credentials - Legend */}
              <Skeleton className="mb-3 h-5 w-2/12!" />
              {/* Credentials - Description */}
              <Skeleton className="h-3.5 w-5/12!" />
            </div>

            {/* Credentials - Email */}
            <Field>
              <Skeleton className="h-5 w-2/12!" />
              <Skeleton className="h-9 w-full" />
            </Field>

            {/* Credentials - Password */}
            <Field>
              <Skeleton className="h-5 w-2/12!" />
              <Skeleton className="h-9 w-full" />
              <div className="space-y-3">
                <Skeleton id="description-1" className="h-3.5 w-full" />
                <Skeleton id="description-2" className="h-3.5 w-1/5!" />
              </div>
            </Field>

            {/* Credentials - Confirm Password */}
            <Field>
              <Skeleton className="h-5 w-4/12!" />
              <Skeleton className="h-9 w-full" />
            </Field>
          </FieldGroup>
        </FieldSet>

        <FieldSeparator />

        {/* Address Information */}
        <FieldSet className="gap-7">
          <FieldGroup>
            <div className="@md/fieldset-header-group:flex-1">
              {/* Address Information - Legend */}
              <Skeleton className="mb-3 h-5 w-4/12!" />
              {/* Address Information - Description */}
              <Skeleton className="h-3.5 w-3/12!" />
            </div>
          </FieldGroup>

          {/* Address Information - Street */}
          <Field>
            <Skeleton className="h-5 w-2/12! md:w-2/12!" />
            <Skeleton className="h-9 w-full" />
          </Field>

          <div className="grid gap-7 md:grid-cols-3">
            {/* Address Information - City */}
            <Field>
              <Skeleton className="h-5 w-1/12! md:w-2/5!" />
              <Skeleton className="h-9 w-full" />
            </Field>

            {/* Address Information - State */}
            <Field>
              <Skeleton className="h-5 w-1/12! md:w-2/5!" />
              <Skeleton className="h-9 w-full" />
            </Field>

            {/* Address Information - Zip Code */}
            <Field>
              <Skeleton className="h-5 w-1/12! md:w-2/5!" />
              <Skeleton className="h-9 w-full" />
            </Field>
          </div>
        </FieldSet>

        <FieldSeparator />

        {/* Skills */}
        <FieldSet className="@container/fieldset-header-group">
          <div className="flex flex-col gap-3 @md:flex-row">
            <div className="@md:flex-1">
              {/* Skills - Legend */}
              <Skeleton className="mb-3 h-5 w-2/12" />
              {/* Skills - Description */}
              <Skeleton className="h-3.5 w-8/12" />
            </div>
            <div>
              {/* Skills - Add Skill Button */}
              <Skeleton className="h-8 min-w-24" />
            </div>
          </div>
        </FieldSet>

        <FieldSeparator />

        {/* Terms and Conditions */}
        <FieldSet className="flex-row gap-3">
          {/*  Terms and Conditions  - Checkbox */}
          <Skeleton className="h-4 w-4 rounded-xs" />
          <FieldContent className="grid flex-1">
            {/*  Terms and Conditions  - Label */}
            <Skeleton className="mb-1 h-5 w-5/12" />
            {/*  Terms and Conditions - Description */}
            <div className="space-y-1">
              <Skeleton className="h-3.5 w-11/12" />
            </div>
          </FieldContent>
        </FieldSet>

        {/* Form Actions */}
        <FieldGroup>
          <Field orientation="responsive">
            <Skeleton className="h-9 min-w-24" />
            <Skeleton className="h-9 min-w-24" />
          </Field>
        </FieldGroup>
      </div>
    </FormCardSkeleton>
  )
}

export default RegisterForm
export { RegisterFormSkeleton }
