import {
  FieldDescription,
  FieldGroup,
  FieldLegend,
  FieldSet,
} from '@/shared/components/ui/field'
import { useFormContext } from '@/shared/form/form.context'
import { cn } from '@/shared/lib/utils'

type FieldSetFieldProps = React.ComponentProps<typeof FieldSet> & {
  legend?: React.ReactNode
  description?: React.ReactNode
  actions?: React.ReactElement
}

function FieldSetField({
  actions,
  children,
  disabled,
  legend,
  description,
  ...props
}: FieldSetFieldProps) {
  const form = useFormContext()

  return (
    <form.Subscribe selector={(state) => state.isSubmitting}>
      {(isSubmitting) => (
        <FieldSet
          {...props}
          disabled={isSubmitting || disabled}
          className="@container/fieldset-header-group gap-0 has-data-[slot='field']:gap-6"
        >
          {(!!legend || !!description || !!actions) && (
            <FieldGroup
              className={cn(
                !!actions &&
                  'flex flex-col gap-3 @md/fieldset-header-group:flex-row',
              )}
            >
              <div className="@md/fieldset-header-group:flex-1">
                {!!legend && <FieldLegend>{legend}</FieldLegend>}
                {!!description && (
                  <FieldDescription>{description}</FieldDescription>
                )}
              </div>
              {!!actions && (
                <div className="*:w-full @md/fieldset-header-group:*:w-fit">
                  {actions}
                </div>
              )}
            </FieldGroup>
          )}
          <FieldGroup>{children}</FieldGroup>
        </FieldSet>
      )}
    </form.Subscribe>
  )
}

export default FieldSetField
