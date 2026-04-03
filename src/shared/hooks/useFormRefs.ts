import { useRef } from 'react'
import { type z, type ZodAny } from 'zod'

import type { DeepPath } from '@/shared/types'

/**
 * Manages a map of DOM element refs keyed by form field names (including dot-notation paths like `"address.street"`).
 *
 * @returns `refs` - the current map of field name → DOM element
 * @returns `setRef` - callback factory to assign a ref by field name; pass the result as a `ref` prop
 */
function useFormRefs<T extends z.infer<ZodAny>>() {
  const refs = useRef<Partial<Record<DeepPath<T>, HTMLElement>>>({})
  const setRef = (name: DeepPath<T>) => (el: HTMLElement | null) => {
    refs.current[name] = el ?? undefined
  }
  return { refs, setRef }
}

export default useFormRefs
