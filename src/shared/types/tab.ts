type TabName = 'bug' | 'register' | 'expense-tracker'

type Tab = {
  value: TabName
  title: string
  renderContent: () => React.JSX.Element
}

export type { Tab, TabName }
