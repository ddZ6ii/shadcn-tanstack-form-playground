function isUnique(value: string, values: string[]): boolean {
  const normalizedValue = value.trim().toLowerCase()
  let found = false

  for (const v of values) {
    if (v.trim().toLowerCase() !== normalizedValue) continue
    if (found) return false // second match → duplicate
    found = true
  }

  if (!found) throw new Error('value not found in current values')
  return true
}

export default isUnique
