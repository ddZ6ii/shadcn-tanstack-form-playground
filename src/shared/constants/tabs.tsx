import { lazy, Suspense } from 'react'
import { toast, type ExternalToast } from 'sonner'

import { BugReportFormSkeleton } from '@/bug-report/components'
import { ExpenseTrackerSkeleton } from '@/expense-tracker/components'
import { RegisterFormSkeleton } from '@/register/components'
import type { Tab } from '@/shared/types'
import { delay } from '@/shared/utilities'

// Lazy load the form components (requires a dynamic import that resolves to a module with a default export).
// This works here because Radix TabsContent unmounts inactive tabs by default (no forceMount)
// so each form only loads when its tab is first activated — not on initial page load.
const BugReportForm = lazy(
  () => import('@/bug-report/components/bug-report-form'),
)
const RegisterForm = lazy(() => import('@/register/components/register-form'))
const ExpenseTrackerForm = lazy(
  () => import('@/expense-tracker/components/expense-tracker-form'),
)

const TOAST_OPTIONS: ExternalToast = {
  position: 'top-center',
  richColors: true,
}

const TABS: Tab[] = [
  {
    value: 'bug',
    title: 'Bug Report',
    renderContent: () => (
      <Suspense fallback={<BugReportFormSkeleton />}>
        <BugReportForm
          onSubmit={async (data: unknown): Promise<void> => {
            console.log('Bug report submitted with:', data)
            await delay(3000)
            toast.success('Bug report submitted successfully!', TOAST_OPTIONS)
          }}
        />
      </Suspense>
    ),
  },
  {
    value: 'register',
    title: 'Register',
    renderContent: () => (
      <Suspense fallback={<RegisterFormSkeleton />}>
        <RegisterForm
          onSubmit={async (data: unknown): Promise<void> => {
            console.log('Registration form submitted with:', data)
            await delay(3000)
            toast.success('Registration successful!', TOAST_OPTIONS)
          }}
        />
      </Suspense>
    ),
  },
  {
    value: 'expense-tracker',
    title: 'Expense Tracker',
    renderContent: () => (
      <Suspense fallback={<ExpenseTrackerSkeleton />}>
        <ExpenseTrackerForm
          onSubmit={async (data: unknown): Promise<void> => {
            console.log('Expense tracker form submitted with:', data)
            await delay(3000)
            toast.success(
              'Expense tracker form submitted successfully!',
              TOAST_OPTIONS,
            )
          }}
        />
      </Suspense>
    ),
  },
]

export { TABS }
