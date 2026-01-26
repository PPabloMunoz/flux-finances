import { createFileRoute } from '@tanstack/react-router'
import { parseAsStringLiteral, useQueryState } from 'nuqs'
import AppHeader from '@/components/header'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { authStateFn } from '@/features/auth'
import CategoriesSettings from '@/features/settings/components/categories'
import DataSettings from '@/features/settings/components/data'
import PreferencesSettings from '@/features/settings/components/preferences'

export const Route = createFileRoute('/settings/')({
  component: RouteComponent,
  beforeLoad: async () => await authStateFn(),
})

const tabValues = ['preferences', 'category', 'data'] as const

function RouteComponent() {
  const [tab, setTab] = useQueryState('tab', parseAsStringLiteral(tabValues))

  return (
    <>
      <AppHeader />

      <main className='container mx-auto space-y-8 px-5 py-10'>
        <div className='mb-10'>
          <h1 className='mb-1 font-medium text-2xl tracking-tight'>Settings</h1>
          <p className='text-muted-foreground text-sm'>
            Manage your account settings and preferences.
          </p>
        </div>

        <Tabs
          className='flex flex-col gap-8 lg:flex-row lg:items-start'
          onValueChange={(value) => setTab(value)}
          orientation='vertical'
          value={tab || 'preferences'}
        >
          <TabsList className='w-full justify-start lg:w-64 lg:flex-col' variant='line'>
            <TabsTrigger className='justify-start' value='preferences'>
              Preferences
            </TabsTrigger>
            <TabsTrigger className='justify-start' value='category'>
              Categories
            </TabsTrigger>
            <TabsTrigger className='justify-start' value='data'>
              Data
            </TabsTrigger>
          </TabsList>
          <div className='flex-1'>
            <TabsContent className='mt-0' value='preferences'>
              <PreferencesSettings />
            </TabsContent>
            <TabsContent className='mt-0' value='data'>
              <DataSettings />
            </TabsContent>
            <TabsContent className='mt-0' value='category'>
              <CategoriesSettings />
            </TabsContent>
          </div>
        </Tabs>
      </main>
    </>
  )
}
