import { authClient } from '@flux/auth/client'
import { Spinner } from '@flux/ui/components/ui/spinner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@flux/ui/components/ui/tabs'
import { cn } from '@flux/ui/lib/utils'
import { createFileRoute } from '@tanstack/react-router'
import { useQueryState } from 'nuqs'
import AppHeader from '@/components/header'
import CategoriesSettings from '@/features/settings/components/categories'
import PreferencesSettings from '@/features/settings/components/preferences'
import ProfileSettings from '@/features/settings/components/profile'
import SecuritySettings from '@/features/settings/components/security'
import TagsSettings from '@/features/settings/components/tags'

export const Route = createFileRoute('/settings/')({
  component: RouteComponent,
})

const tabsTriggerClassName = cn(
  'flex h-8 items-center justify-center border-0 px-2 text-sm font-medium break-keep whitespace-nowrap text-gray-600 outline-none select-none hover:text-gray-900'
)

function RouteComponent() {
  const { data, error } = authClient.useSession()
  const [tab, setTab] = useQueryState('tab')

  return (
    <>
      <AppHeader />

      <main className='container mx-auto px-5 py-10'>
        <div className='mb-8'>
          <h1 className='mb-1 font-bold text-3xl'>Settings</h1>
          <h4 className='text-neutral-600'>Manage your account settings and preferences.</h4>
        </div>

        <Tabs onValueChange={(value) => setTab(value)} value={tab || 'profile'}>
          <TabsList className='mb-5 space-x-1.5'>
            <TabsTrigger className={tabsTriggerClassName} value='profile'>
              Profile
            </TabsTrigger>
            <TabsTrigger className={tabsTriggerClassName} value='preferences'>
              Preferences
            </TabsTrigger>
            <TabsTrigger className={tabsTriggerClassName} value='security'>
              Security
            </TabsTrigger>
            <TabsTrigger className={tabsTriggerClassName} value='tags'>
              Tags
            </TabsTrigger>
            <TabsTrigger className={tabsTriggerClassName} value='category'>
              Category
            </TabsTrigger>
          </TabsList>
          <TabsContent value='profile'>
            {!error && data && (
              <ProfileSettings
                household={{ id: 'home', householdName: 'Mi casa' }}
                personalInfo={{ email: data.user.email, fullName: data.user.name }}
              />
            )}
            {error && (
              <div className='h-full w-full text-lg text-red-500'>
                Error loading profile information.
              </div>
            )}
            {!data && !error && (
              <div className='flex h-full min-h-40 w-full items-center justify-center'>
                <Spinner />
              </div>
            )}
          </TabsContent>
          <TabsContent value='preferences'>
            <PreferencesSettings />
          </TabsContent>
          <TabsContent value='security'>
            <SecuritySettings />
          </TabsContent>
          <TabsContent value='tags'>
            <TagsSettings />
          </TabsContent>
          <TabsContent value='category'>
            <CategoriesSettings />
          </TabsContent>
        </Tabs>
      </main>
    </>
  )
}
