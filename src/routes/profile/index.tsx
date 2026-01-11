import { ArrowDown01Icon, Dollar02FreeIcons, Logout05Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { authStateFn } from '@/features/auth/queries'
import ProfileSettings from '@/features/settings/components/profile'
import { authClient } from '@/lib/auth/client'

export const Route = createFileRoute('/profile/')({
  component: RouteComponent,
  beforeLoad: async () => await authStateFn(),
})

export default function RouteComponent() {
  const [isMounted, setIsMounted] = useState(false)
  const session = authClient.useSession()

  useEffect(() => {
    setIsMounted(true)
  }, [])

  return (
    <>
      <nav className='sticky top-0 z-50 border-neutral-900 border-b bg-[#050505]/80 backdrop-blur-md'>
        <div className='mx-auto flex h-14 max-w-500 items-center justify-between px-4 md:px-6'>
          <div className='flex items-center gap-4 md:gap-8'>
            <Link className='flex cursor-pointer items-center gap-2 text-white' to='/'>
              <div className='flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-tr from-teal-500 to-cyan-400'>
                <HugeiconsIcon className='size-4.5' icon={Dollar02FreeIcons} />
              </div>
              <span className='font-medium text-sm tracking-tight'>Flux Finances</span>
            </Link>
          </div>

          <div className='flex items-center gap-3'>
            <Popover>
              <PopoverTrigger className='flex items-center gap-2 rounded-full border border-transparent py-1 pr-2 pl-1 transition-colors hover:border-neutral-800 hover:bg-neutral-800/50'>
                {!isMounted || !session.data?.user.name ? (
                  <span className='size-6 rounded-full bg-neutral-400/20' />
                ) : (
                  <span className='flex size-6 items-center justify-center rounded-full border border-neutral-700 bg-gradient-to-br from-neutral-700 to-neutral-800 font-medium text-[10px] text-white'>
                    <span>{session.data.user.name.charAt(0)}</span>
                  </span>
                )}
                <HugeiconsIcon className='size-3' icon={ArrowDown01Icon} />
              </PopoverTrigger>
              <PopoverContent className='max-w-45 gap-0.5 p-2'>
                <Link
                  className='flex items-center gap-2 p-2 text-red-400 text-xs transition-colors hover:bg-white/5 hover:text-red-500'
                  to='/auth/logout'
                >
                  <HugeiconsIcon className='size-3.5' icon={Logout05Icon} />
                  Logout
                </Link>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </nav>

      <main className='container mx-auto max-w-5xl space-y-8 px-5 py-10'>
        <div className='mb-10'>
          <h1 className='mb-1 font-medium text-2xl text-white tracking-tight'>Profile</h1>
          <p className='text-gray-400 text-sm'>Manage your account settings and preferences.</p>
        </div>

        <ProfileSettings />
      </main>
    </>
  )
}
