import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'
import { Spinner } from '@/components/ui/spinner'
import { authClient } from '@/lib/auth/client'

export const Route = createFileRoute('/auth/logout')({
  component: RouteComponent,
})

function RouteComponent() {
  const navigate = useNavigate()

  useEffect(() => {
    async function logout() {
      await authClient.signOut(undefined, {
        onSuccess: () => {
          navigate({ to: '/auth/login', replace: true })
        },
      })
    }
    logout()
  }, [navigate])
  return (
    <div className='flex h-full min-h-50 w-full items-center justify-center'>
      <Spinner className='size-8 text-neutral-500' />
    </div>
  )
}
