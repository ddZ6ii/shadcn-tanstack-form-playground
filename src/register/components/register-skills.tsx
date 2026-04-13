import { PlusIcon, SquarePen, Trash } from 'lucide-react'
import { useRef, useState } from 'react'

import { defaultValues } from '@/register/data'
import {
  LEVELS,
  registerFormSchema,
  skillLevelValidator,
  skillNameValidator,
  type RegisterFormInput,
} from '@/register/schemas'
import { isUnique } from '@/register/utilities'
import { WithTooltip } from '@/shared/components'
import { FieldSetField, SelectField, TextField } from '@/shared/components/form'
import { Button } from '@/shared/components/ui/button'
import { Field, FieldLabel } from '@/shared/components/ui/field'
import { getFormOpts, withForm } from '@/shared/form'
import { capitalize } from '@/shared/utilities'

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

const RegisterSkills = withForm({
  ...getFormOpts(registerFormSchema, defaultValues),
  render: function RenderRegisterSkill({ form }) {
    const editingOriginalSkillName = useRef<string>('')
    const [editingId, setEditingId] = useState<string | null>(null)

    const addNewSkill = (): string => {
      const id = crypto.randomUUID()
      const newSkill = {
        id,
        name: '',
        level: '',
      } satisfies RegisterFormInput['skills'][number]
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

    return (
      <FieldSetField
        legend="Skills"
        description="Add your personal skills and proficiency level."
        actions={
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="ml-auto"
            aria-label="Add new skill"
            onClick={() => {
              const id = addNewSkill()
              setEditingId(id)
              editingOriginalSkillName.current = ''
            }}
          >
            <PlusIcon /> New Skill
          </Button>
        }
      >
        <form.Field name="skills" mode="array">
          {(fieldArray) => {
            return fieldArray.state.value.map((skill, index) => (
              <div key={skill.id} className="flex flex-col gap-2">
                <form.AppField
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
                          <TextField
                            required
                            onBlur={async () => {
                              await commitSkillNameEdit(nameField, index)
                            }}
                            onKeyDown={async (e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault()
                                await commitSkillNameEdit(nameField, index)
                              } else if (e.key === 'Escape') {
                                await revertSkillNameEdit(index)
                              }
                            }}
                            autoFocus // eslint-disable-line jsx-a11y/no-autofocus
                            aria-label="Skill name"
                            invalid={isInvalid}
                            placeholder="Skill name"
                          />
                        ) : (
                          <div className="justify-between-between flex items-center gap-3">
                            <FieldLabel htmlFor={skill.name} className="flex-1">
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
                                    await form.removeFieldValue('skills', index)
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
                </form.AppField>

                {/* Skill level */}
                <form.AppField
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
                      <SelectField
                        id={skill.name}
                        invalid={isInvalid}
                        options={LEVELS}
                      />
                    )
                  }}
                </form.AppField>
              </div>
            ))
          }}
        </form.Field>
      </FieldSetField>
    )
  },
})

export default RegisterSkills
