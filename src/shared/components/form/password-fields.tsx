import { LockIcon } from 'lucide-react'

import { PasswordField } from '@/shared/components/form'
import { InputGroupAddon } from '@/shared/components/ui/input-group'
import { withFieldGroup } from '@/shared/form/form.hook'
import type { useFormRefs } from '@/shared/hooks'
import type { PasswordFieldsValues } from '@/shared/schemas'

const defaultValues: PasswordFieldsValues = {
  password: '',
  confirmPassword: '',
}

// withFieldGroup HOC allows to create a reusable password fields component in any form
const PasswordFields = withFieldGroup({
  defaultValues,
  props: {
    setRef: {} as ReturnType<
      typeof useFormRefs<PasswordFieldsValues>
    >['setRef'],
  },
  render: function RenderPasswordFields({ group, setRef }) {
    return (
      <>
        <group.AppField name="password">
          {(field) => (
            <PasswordField
              required
              ref={setRef(field.name as keyof PasswordFieldsValues)}
              autoComplete="new-password"
              description="Must be at least 12 characters, include an uppercase letter, a number, and a special character."
              label="Password"
              placeholder="••••••••"
              group
            >
              <InputGroupAddon>
                <LockIcon />
              </InputGroupAddon>
            </PasswordField>
          )}
        </group.AppField>

        <group.AppField name="confirmPassword">
          {(field) => (
            <PasswordField
              required
              ref={setRef(field.name as keyof PasswordFieldsValues)}
              autoComplete="new-password"
              label="Confirm password"
              placeholder="••••••••"
              group
            >
              <InputGroupAddon>
                <LockIcon />
              </InputGroupAddon>
            </PasswordField>
          )}
        </group.AppField>
      </>
    )
  },
})

export default PasswordFields
