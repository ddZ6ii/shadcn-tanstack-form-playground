import { revalidateLogic, useForm, useStore } from '@tanstack/react-form'
import {
  CircleUser,
  EyeOffIcon,
  LockIcon,
  MailIcon,
  PlusIcon,
  SquarePen,
  Trash,
} from 'lucide-react'
import { useRef, useState } from 'react'

import {
  LEVELS,
  schema,
  skillLevelValidator,
  skillNameValidator,
  type FormData,
  type FormInput,
  type SkillLevel,
} from '@/register/schemas'
import { isUnique } from '@/register/utilities'
import { WithTooltip } from '@/shared/components'
import { Button } from '@/shared/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card'
import { Checkbox } from '@/shared/components/ui/checkbox'
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
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
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { useFormRefs } from '@/shared/hooks'
import { cn } from '@/shared/lib/utils'
import { capitalize, focusFirstErrorField } from '@/shared/utilities'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/shared/components/ui/input-group'

const defaultValues: FormInput = {
  firstName: '',
  lastName: '',
  age: undefined,
  email: '',
  password: '',
  confirmPassword: '',
  address: {
    street: '',
    city: '',
    zip: '',
    country: '',
  },
  skills: [],
  acceptTerms: false,
}

// Define a structural type for nameField to avoid fighting TanStack Form's deep generics
type SkillNameField = {
  handleBlur(): void
  state: {
    value: string
    meta: {
      errors: ({ message: string } | undefined)[]
    }
  }
}

interface RegisterFormProps {
  className?: string
  onSubmit?: (data: FormData) => Promise<void>
}

function RegisterForm({ className, onSubmit }: RegisterFormProps) {
  const editingOriginalSkillName = useRef<string>('')
  const { refs, setRef } = useFormRefs<FormInput>()
  const [editingId, setEditingId] = useState<string | null>(null)

  const form = useForm({
    defaultValues,
    // If this is omitted, `onDynamic` will not be called
    validationLogic: revalidateLogic(),
    validators: {
      // Validate on first submission then switch to on change validation (default)
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

  const addNewSkill = (): string => {
    const id = crypto.randomUUID()
    const newSkill = {
      id,
      name: '',
      level: '',
    } satisfies FormInput['skills'][number]
    form.pushFieldValue('skills', newSkill)
    return id
  }

  const commitSkillNameEdit = async (
    nameField: SkillNameField,
    index: number,
  ) => {
    nameField.handleBlur()
    if (nameField.state.meta.errors.length > 0) {
      if (editingOriginalSkillName.current === '') {
        await form.removeFieldValue('skills', index)
      } else {
        form.setFieldValue(
          `skills[${index.toString()}].name` as `skills[${number}].name`,
          editingOriginalSkillName.current,
        )
      }
    }
    setEditingId(null)
  }

  const handleSubmit: React.SubmitEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault()
    void form.handleSubmit()
  }

  const revertSkillNameEdit = async (index: number) => {
    if (editingOriginalSkillName.current === '') {
      await form.removeFieldValue('skills', index)
    } else {
      form.setFieldValue(
        `skills[${index.toString()}].name` as `skills[${number}].name`,
        editingOriginalSkillName.current,
      )
    }
    setEditingId(null)
  }

  // 🚧 TO DO: replace with internal state upon refactor using form composition...
  const showPassword = (inputEl: HTMLElement | undefined) => {
    if (!(inputEl instanceof HTMLInputElement)) return
    if (inputEl.type === 'password') {
      inputEl.type = 'text'
    } else {
      inputEl.type = 'password'
    }
  }

  const validateConfirmPassword = (value: string) => {
    if (value !== form.getFieldValue('password')) {
      return {
        message: "Passwords don't match",
      }
    }
  }

  const validateSkillName = (name: string, currentSkillNames: string[]) => {
    // Basic field validation from schema
    const parsed = skillNameValidator.safeParse(name)
    if (!parsed.success)
      return parsed.error.issues.map((issue) => ({
        message: issue.message,
      }))
    // Uniqueness check
    if (!isUnique(name, currentSkillNames)) {
      return [
        {
          message: 'Skill names must be unique',
        },
      ]
    }
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
    <Card className={cn('mx-auto w-full max-w-lg', className)}>
      <CardHeader>
        <CardTitle>Registration</CardTitle>
        <CardDescription>
          Please fill out the form below to register.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          noValidate
          aria-label="Registration"
          onSubmit={handleSubmit}
          className="h-full"
        >
          <FieldGroup>
            <FieldSet disabled={isSubmitting}>
              <FieldGroup className="grid md:grid-cols-2">
                <form.Field name="firstName">
                  {(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor={field.name}>
                          First name <span className="text-destructive">*</span>
                        </FieldLabel>
                        <InputGroup>
                          <InputGroupInput
                            type="text"
                            required
                            id={field.name}
                            ref={setRef(field.name)}
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => {
                              field.handleChange(e.target.value)
                            }}
                            placeholder="John"
                            autoComplete="given-name"
                            aria-describedby={`${field.name}-error`}
                            aria-invalid={isInvalid}
                            className="rounded-sm text-sm"
                          />
                          <InputGroupAddon>
                            <CircleUser />
                          </InputGroupAddon>
                        </InputGroup>
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

                <form.Field name="lastName">
                  {(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor={field.name}>Last name</FieldLabel>
                        <InputGroup>
                          <InputGroupInput
                            type="text"
                            id={field.name}
                            ref={setRef(field.name)}
                            value={field.state.value ?? ''}
                            onBlur={field.handleBlur}
                            onChange={(e) => {
                              field.handleChange(e.target.value)
                            }}
                            placeholder="Doe"
                            autoComplete="family-name"
                            aria-describedby={`${field.name}-error`}
                            aria-invalid={isInvalid}
                            className="rounded-sm text-sm"
                          />
                          <InputGroupAddon>
                            <CircleUser />
                          </InputGroupAddon>
                        </InputGroup>
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

              <form.Field name="age">
                {(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>Age</FieldLabel>
                      <Input
                        type="number"
                        min={0}
                        max={120}
                        id={field.name}
                        ref={setRef(field.name)}
                        // Display adapter (a controlled input cannot be undefined)
                        value={field.state.value ?? ''}
                        onBlur={field.handleBlur}
                        onChange={(e) => {
                          const value =
                            e.target.value === ''
                              ? undefined
                              : e.target.valueAsNumber
                          field.handleChange(value)
                        }}
                        placeholder="25"
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

              <form.Field name="email">
                {(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>
                        Email <span className="text-destructive">*</span>
                      </FieldLabel>
                      <InputGroup>
                        <InputGroupInput
                          type="email"
                          required
                          id={field.name}
                          ref={setRef(field.name)}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => {
                            field.handleChange(e.target.value)
                          }}
                          placeholder="example@email.com"
                          autoComplete="email"
                          aria-describedby={`${field.name}-error`}
                          aria-invalid={isInvalid}
                          className="rounded-sm text-sm"
                        />
                        <InputGroupAddon>
                          <MailIcon />
                        </InputGroupAddon>
                      </InputGroup>

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

              <form.Field name="password">
                {(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>
                        Password <span className="text-destructive">*</span>
                      </FieldLabel>
                      <InputGroup>
                        <InputGroupInput
                          type="password"
                          required
                          id={field.name}
                          ref={setRef(field.name)}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => {
                            field.handleChange(e.target.value)
                          }}
                          placeholder="••••••••"
                          autoComplete="new-password"
                          aria-describedby={`${field.name}-error`}
                          aria-invalid={isInvalid}
                          className="rounded-sm text-sm"
                        />
                        <InputGroupAddon>
                          <LockIcon />
                        </InputGroupAddon>
                        <InputGroupAddon align="inline-end">
                          <WithTooltip content="Toggle password visibility">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-sm"
                              className="rounded-sm"
                              aria-label="Toggle password visibility"
                              onClick={() => {
                                // 🚧 TO DO: replace with internal state upon refactor using form composition...
                                showPassword(refs.current[field.name])
                              }}
                            >
                              {/* 🚧 TO DO: replace icon based on password visibility state upon refactor using form composition... */}
                              <EyeOffIcon />
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
                      <FieldDescription>
                        Must be at least 12 characters, include an uppercase
                        letter, a number, and a special character.
                      </FieldDescription>
                    </Field>
                  )
                }}
              </form.Field>

              <form.Field
                name="confirmPassword"
                // Optional local field validation for better UX (do not wait for global form validation on first form submission)
                validators={{
                  onChangeListenTo: ['password'],
                  onChange: ({ value }) => validateConfirmPassword(value),
                }}
              >
                {(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>
                        Confirm password
                        <span className="text-destructive">*</span>
                      </FieldLabel>
                      <InputGroup>
                        <InputGroupInput
                          type="password"
                          required
                          id={field.name}
                          ref={setRef(field.name)}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => {
                            field.handleChange(e.target.value)
                          }}
                          placeholder="••••••••"
                          autoComplete="new-password"
                          aria-describedby={`${field.name}-error`}
                          aria-invalid={isInvalid}
                          className="rounded-sm text-sm"
                        />
                        <InputGroupAddon>
                          <LockIcon />
                        </InputGroupAddon>
                        <InputGroupAddon align="inline-end">
                          <WithTooltip content="Toggle confirm password visibility">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-sm"
                              className="rounded-sm"
                              aria-label="Toggle confirm password visibility"
                              onClick={() => {
                                // 🚧 TO DO: replace with internal state upon refactor using form composition...
                                showPassword(refs.current[field.name])
                              }}
                            >
                              {/* 🚧 TO DO: replace icon based on password visibility state upon refactor using form composition... */}
                              <EyeOffIcon />
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
                    </Field>
                  )
                }}
              </form.Field>
            </FieldSet>

            <FieldSeparator />

            <FieldSet disabled={isSubmitting}>
              <form.Field name="address.street">
                {(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>Street</FieldLabel>
                      <Input
                        type="text"
                        id={field.name}
                        ref={setRef(field.name)}
                        value={field.state.value ?? ''}
                        onBlur={field.handleBlur}
                        onChange={(e) => {
                          field.handleChange(e.target.value)
                        }}
                        placeholder="123 Main St"
                        autoComplete="street-address"
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

              <FieldGroup className="grid md:grid-cols-3">
                <form.Field name="address.city">
                  {(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor={field.name}>City</FieldLabel>
                        <Input
                          type="text"
                          id={field.name}
                          ref={setRef(field.name)}
                          value={field.state.value ?? ''}
                          onBlur={field.handleBlur}
                          onChange={(e) => {
                            field.handleChange(e.target.value || '')
                          }}
                          placeholder="London"
                          autoComplete="address-level2"
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
                <form.Field name="address.zip">
                  {(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor={field.name}>ZIP</FieldLabel>
                        <Input
                          type="text"
                          id={field.name}
                          ref={setRef(field.name)}
                          value={field.state.value ?? ''}
                          onBlur={field.handleBlur}
                          onChange={(e) => {
                            field.handleChange(e.target.value)
                          }}
                          placeholder="W1K 3JP"
                          autoComplete="postal-code"
                          aria-describedby="zip-error"
                          aria-invalid={isInvalid}
                          className="rounded-sm text-sm"
                        />
                        {isInvalid && (
                          <FieldError
                            id="zip-error"
                            errors={field.state.meta.errors}
                          />
                        )}
                      </Field>
                    )
                  }}
                </form.Field>
                <form.Field name="address.country">
                  {(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor={field.name}>State</FieldLabel>
                        <Input
                          type="text"
                          id={field.name}
                          ref={setRef(field.name)}
                          value={field.state.value ?? ''}
                          onBlur={field.handleBlur}
                          onChange={(e) => {
                            field.handleChange(e.target.value)
                          }}
                          placeholder="England"
                          autoComplete="address-level1"
                          aria-describedby="country-error"
                          aria-invalid={isInvalid}
                          className="rounded-sm text-sm"
                        />
                        {isInvalid && (
                          <FieldError
                            id="country-error"
                            errors={field.state.meta.errors}
                          />
                        )}
                      </Field>
                    )
                  }}
                </form.Field>
              </FieldGroup>
            </FieldSet>

            <FieldSeparator />

            <FieldSet disabled={isSubmitting}>
              <Field orientation="responsive" className="items-start!">
                <div>
                  <FieldLegend>Skill</FieldLegend>
                  <FieldDescription>
                    Add your personal skills and proficiency level.
                  </FieldDescription>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="ml-auto"
                  disabled={isSubmitting}
                  aria-label="Add new skill"
                  onClick={() => {
                    const id = addNewSkill()
                    setEditingId(id)
                    editingOriginalSkillName.current = ''
                  }}
                >
                  <PlusIcon /> New Skill
                </Button>
              </Field>
              <form.Field name="skills" mode="array">
                {(fieldArray) => {
                  return fieldArray.state.value.map((skill, index) => (
                    <div key={skill.id} className="flex flex-col gap-2">
                      <form.Field
                        name={
                          `skills[${index.toString()}].name` as `skills[${number}].name`
                        }
                        // Validate on mount to immediately show errors for new skills, and on change to validate edits (no duplicate skill names)
                        validators={{
                          onMount: skillNameValidator,
                          onChange: ({ value }) => {
                            const currentSkillNames = form
                              .getFieldValue('skills')
                              .map((skill) => skill.name)
                            return validateSkillName(value, currentSkillNames)
                          },
                        }}
                      >
                        {(nameField) => {
                          const isInvalid = !nameField.state.meta.isValid
                          return (
                            <Field data-invalid={isInvalid}>
                              {skill.id === editingId ? (
                                <>
                                  <Input
                                    type="text"
                                    required
                                    autoFocus // eslint-disable-line jsx-a11y/no-autofocus
                                    id={nameField.name}
                                    value={nameField.state.value}
                                    onBlur={async () => {
                                      await commitSkillNameEdit(
                                        nameField,
                                        index,
                                      )
                                    }}
                                    onChange={(e) => {
                                      nameField.handleChange(e.target.value)
                                    }}
                                    onKeyDown={async (e) => {
                                      if (e.key === 'Enter') {
                                        e.preventDefault()
                                        await commitSkillNameEdit(
                                          nameField,
                                          index,
                                        )
                                      } else if (e.key === 'Escape') {
                                        await revertSkillNameEdit(index)
                                      }
                                    }}
                                    placeholder="Skill name"
                                    aria-describedby={`${nameField.name}-error`}
                                    aria-invalid={isInvalid}
                                    aria-label="Skill name"
                                    className="rounded-sm text-sm"
                                  />
                                  {isInvalid && (
                                    <FieldError
                                      id={`${nameField.name}-error`}
                                      errors={nameField.state.meta.errors}
                                    />
                                  )}
                                </>
                              ) : (
                                <div className="justify-between-between flex items-center gap-3">
                                  <FieldLabel
                                    htmlFor={skill.id}
                                    className="flex-1"
                                  >
                                    {capitalize(skill.name)}
                                  </FieldLabel>

                                  <div className="flex items-center gap-1">
                                    <WithTooltip content="Edit skill name">
                                      <Button
                                        type="button"
                                        variant="outline"
                                        size="icon-xs"
                                        aria-label={`Edit skill ${skill.name}`}
                                        className="text-background! bg-blue-500! hover:bg-blue-500/80! dark:text-white!"
                                        onClick={() => {
                                          editingOriginalSkillName.current =
                                            skill.name
                                          setEditingId(skill.id)
                                        }}
                                      >
                                        <SquarePen />
                                      </Button>
                                    </WithTooltip>

                                    <WithTooltip content="Delete skill">
                                      <Button
                                        type="button"
                                        variant="destructive"
                                        size="icon-xs"
                                        aria-label={`Delete skill ${skill.name}`}
                                        className="dark:hover:bg-destructive/50!"
                                        onClick={async () => {
                                          await form.removeFieldValue(
                                            'skills',
                                            index,
                                          )
                                        }}
                                      >
                                        <Trash />
                                      </Button>
                                    </WithTooltip>
                                  </div>
                                </div>
                              )}
                            </Field>
                          )
                        }}
                      </form.Field>

                      <form.Field
                        name={
                          `skills[${index.toString()}].level` as `skills[${number}].level`
                        }
                        validators={{
                          onMount: skillLevelValidator,
                          onChange: skillLevelValidator,
                        }}
                      >
                        {(levelField) => {
                          const isInvalid = !levelField.state.meta.isValid
                          return (
                            <Field data-invalid={isInvalid}>
                              <Select
                                name={levelField.name}
                                value={levelField.state.value}
                                onValueChange={(value) => {
                                  levelField.handleChange(value as SkillLevel)
                                }}
                              >
                                <SelectTrigger
                                  id={skill.id}
                                  onBlur={levelField.handleBlur}
                                  aria-invalid={isInvalid}
                                  aria-describedby={`${levelField.name}-error`}
                                >
                                  <SelectValue placeholder="Select proficiency level..." />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectGroup>
                                    <SelectLabel>Proficiency</SelectLabel>
                                    {LEVELS.map((level) => (
                                      <SelectItem key={level} value={level}>
                                        {capitalize(level)}
                                      </SelectItem>
                                    ))}
                                  </SelectGroup>
                                </SelectContent>
                              </Select>
                              {!levelField.state.meta.isValid && (
                                <FieldError
                                  id={`${levelField.name}-error`}
                                  errors={levelField.state.meta.errors}
                                />
                              )}
                            </Field>
                          )
                        }}
                      </form.Field>
                    </div>
                  ))
                }}
              </form.Field>
            </FieldSet>

            <FieldSeparator />

            <FieldSet disabled={isSubmitting}>
              <form.Field name="acceptTerms">
                {(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid
                  return (
                    <Field data-invalid={isInvalid} orientation="horizontal">
                      <Checkbox
                        required
                        id={field.name}
                        checked={field.state.value}
                        onBlur={field.handleBlur}
                        onCheckedChange={(checked) => {
                          field.handleChange(checked === true)
                        }}
                        aria-describedby={`${field.name}-error`}
                        aria-invalid={isInvalid}
                        className="rounded-xs text-sm"
                      />
                      <FieldContent>
                        <FieldLabel htmlFor={field.name}>
                          Accept terms and conditions
                          <span className="text-destructive">*</span>
                        </FieldLabel>
                        {isInvalid && (
                          <FieldError
                            id={`${field.name}-error`}
                            errors={field.state.meta.errors}
                          />
                        )}
                        <FieldDescription>
                          By clicking this checkbox, you agree to the terms and
                          conditions.
                        </FieldDescription>
                      </FieldContent>
                    </Field>
                  )
                }}
              </form.Field>
            </FieldSet>

            <FieldSet disabled={isSubmitting}>
              <Field orientation="responsive">
                <form.Subscribe selector={(state) => state.isPristine}>
                  {(isPristine) => {
                    const disabled = isPristine || isSubmitting
                    return (
                      <Button
                        type="button"
                        variant="outline"
                        className="w-fit min-w-24"
                        disabled={disabled}
                        onClick={() => {
                          form.reset()
                        }}
                      >
                        Reset
                      </Button>
                    )
                  }}
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
            </FieldSet>
          </FieldGroup>
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
