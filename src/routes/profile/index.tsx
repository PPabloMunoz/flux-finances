import { createFileRoute } from '@tanstack/react-router'
import AppHeader from '@/components/header'
import { authStateFn } from '@/features/auth'
import ProfileSettings from '@/features/settings/components/profile'

export const Route = createFileRoute('/profile/')({
  component: RouteComponent,
  beforeLoad: async () => await authStateFn(),
})

export default function RouteComponent() {
  return (
    <>
      <AppHeader />

      <main className='container mx-auto max-w-5xl space-y-8 px-5 py-10'>
        <div className='mb-10'>
          <h1 className='mb-1 font-medium text-2xl tracking-tight'>Profile</h1>
          <p className='text-muted-foreground text-sm'>
            Manage your account settings and preferences.
          </p>
        </div>

        <ProfileSettings />
      </main>
    </>
  )
}
