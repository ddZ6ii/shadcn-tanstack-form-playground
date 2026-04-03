import { Toaster } from 'sonner'

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/shared/components/ui/tabs'
import { TABS } from '@/shared/constants'
import { usePreference } from '@/shared/hooks'
import { PageLayout } from '@/shared/layouts'
import { ThemeContextProvider } from '@/shared/providers'
import type { TabName } from '@/shared/types'

function App() {
  const [selectedTab, setSelectedTab] = usePreference<TabName>(
    'selectedTab',
    TABS[0].value,
  )

  return (
    <>
      <ThemeContextProvider>
        <PageLayout>
          <Tabs value={selectedTab} className="gap-4">
            <TabsList className="mx-auto">
              {TABS.map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  onClick={() => {
                    setSelectedTab(tab.value)
                  }}
                >
                  {tab.title}
                </TabsTrigger>
              ))}
            </TabsList>
            {TABS.map((tab) => (
              <TabsContent key={tab.value} value={tab.value}>
                {tab.renderContent()}
              </TabsContent>
            ))}
          </Tabs>
        </PageLayout>
      </ThemeContextProvider>

      <Toaster position="bottom-right" />
    </>
  )
}

export { App }
