import { useState } from 'react'

function initPreference<T>(key: string, initialPreference: T) {
  const saved = sessionStorage.getItem(key)
  return saved ? (JSON.parse(saved) as T) : initialPreference
}

export default function usePreference<T>(key: string, initialPreference: T) {
  const [preference, setPreference] = useState<T>(() =>
    initPreference(key, initialPreference),
  )

  const updatePreference = (newPreference: T) => {
    setPreference(newPreference)
    sessionStorage.setItem(key, JSON.stringify(newPreference))
  }
  return [preference, updatePreference] as const
}
