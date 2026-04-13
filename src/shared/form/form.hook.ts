import { createFormHook } from '@tanstack/react-form'

import { fieldContext, formContext } from './form.context'
import CheckboxField from '@/shared/components/form/checkbox-field'
import FieldSetField from '@/shared/components/form/fieldset-field'
import PasswordField from '@/shared/components/form/password-field'
import ResetButton from '@/shared/components/form/reset-button'
import SelectField from '@/shared/components/form/select-field'
import SubmitButton from '@/shared/components/form/submit-button'
import TextAreaField from '@/shared/components/form/textarea-field'
import TextField from '@/shared/components/form/text-field'

const { useAppForm, withFieldGroup, withForm } = createFormHook({
  fieldComponents: {
    CheckboxField,
    PasswordField,
    SelectField,
    TextField,
    TextAreaField,
  },
  formComponents: {
    FieldSetField,
    ResetButton,
    SubmitButton,
  },
  fieldContext,
  formContext,
})

export { useAppForm, withFieldGroup, withForm }
