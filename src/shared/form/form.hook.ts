import { createFormHook } from '@tanstack/react-form'

import { fieldContext, formContext } from './form.context'
import {
  FieldSetField,
  ResetButton,
  SelectField,
  SubmitButton,
  TextAreaField,
  TextField,
} from '@/shared/components/form'

const { useAppForm } = createFormHook({
  fieldComponents: {
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

export { useAppForm }
