import { defaultValues } from '@/register/data'
import {
  registerFormSchema,
  REQUIREMENTS,
  type RegisterFormInput,
} from '@/register/schemas'
import { FieldSetField, TextField } from '@/shared/components/form'
import { getFormOpts, withForm } from '@/shared/form'
import type { useFormRefs } from '@/shared/hooks'

const ADDRESS_FIELDS = Object.keys(REQUIREMENTS.address).map(
  (k) => `address.${k}`,
) as `address.${keyof (typeof REQUIREMENTS)['address']}`[]

type AddressFieldName = (typeof ADDRESS_FIELDS)[number]

const RegisterAddress = withForm({
  ...getFormOpts(registerFormSchema, defaultValues),
  props: {
    setRef: {} as ReturnType<typeof useFormRefs<RegisterFormInput>>['setRef'],
  },
  render: function RenderRegisterAddress({ form, setRef }) {
    // Local field validator to clear onSubmit errors on all address fields if all
    // address fields are empty (e.g. submitting the form with a partial address).
    // onChangeListenTo runs siblings' onChange validators but does NOT clear their
    // errorMap.onSubmit — FieldApi.validateSync only clears onSubmit for `this`
    // (the field that triggered the change), not for linked fields.
    // Manually clear onSubmit errors on siblings so stale submit errors don't linger.
    const makeAddressValidators = (fieldName: AddressFieldName) => ({
      onChangeListenTo: ADDRESS_FIELDS.filter((k) => k !== fieldName),
      onChange: () => {
        const allEmpty = ADDRESS_FIELDS.every(
          (k) => !(form.getFieldValue(k) ?? '').trim(),
        )
        if (allEmpty) {
          for (const k of ADDRESS_FIELDS) {
            if (k !== fieldName) {
              form.setFieldMeta(k, (prev) => ({
                ...prev,
                errorMap: { ...prev.errorMap, onSubmit: undefined },
              }))
            }
          }
        }
        return undefined
      },
    })

    return (
      <FieldSetField
        legend="Address Information"
        description="All fields are optional."
      >
        <form.AppField
          name="address.street"
          validators={makeAddressValidators('address.street')}
        >
          {(field) => (
            <TextField
              ref={setRef(field.name)}
              autoComplete="street-address"
              label="Street"
              placeholder="123 Main St"
            />
          )}
        </form.AppField>

        <div className="grid gap-7 md:grid-cols-3">
          <form.AppField
            name="address.city"
            validators={makeAddressValidators('address.city')}
          >
            {(field) => (
              <TextField
                ref={setRef(field.name)}
                autoComplete="address-level2"
                label="City"
                placeholder="London"
              />
            )}
          </form.AppField>

          <form.AppField
            name="address.zip"
            validators={makeAddressValidators('address.zip')}
          >
            {(field) => (
              <TextField
                ref={setRef(field.name)}
                autoComplete="postal-code"
                label="ZIP"
                placeholder="W1K 3JP"
              />
            )}
          </form.AppField>

          <form.AppField
            name="address.country"
            validators={makeAddressValidators('address.country')}
          >
            {(field) => (
              <TextField
                ref={setRef(field.name)}
                autoComplete="address-level1"
                label="State"
                placeholder="England"
              />
            )}
          </form.AppField>
        </div>
      </FieldSetField>
    )
  },
})

export default RegisterAddress
