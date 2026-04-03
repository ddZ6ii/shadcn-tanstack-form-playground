interface FormApiWithErrors {
  getAllErrors(): { fields: Record<string, { errors: unknown[] } | undefined> }
}

/**
 * Focuses the first form field (in `refs` insertion order) that has a validation error.
 *
 * @param refs - Map of field names to their DOM elements.
 * @param formApi - Provides current field errors via `getAllErrors`.
 */
function focusFirstErrorField(
  refs: Partial<Record<string, HTMLElement>>,
  formApi: FormApiWithErrors,
): void {
  const errors = formApi.getAllErrors()
  const name = Object.keys(refs).find(
    (name) => (errors.fields[name]?.errors.length ?? 0) > 0,
  )
  if (name) refs[name]?.focus()
}

export default focusFirstErrorField
