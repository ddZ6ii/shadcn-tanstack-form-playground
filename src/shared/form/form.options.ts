import { formOptions, revalidateLogic } from '@tanstack/react-form'
import z from 'zod'

const getFormOpts = <TSchema extends z.ZodType>(
  schema: TSchema,
  defaultValues: z.input<TSchema>,
) =>
  formOptions({
    defaultValues,
    // If this is omitted, `onDynamic` will not be called
    validationLogic: revalidateLogic(),
    validators: {
      onSubmit: schema,
      // Switch to onChange validation (default) after first submission attempt
      onDynamic: schema,
    },
  })

export { getFormOpts }
