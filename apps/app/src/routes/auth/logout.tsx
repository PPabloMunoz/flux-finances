import { authClient } from '@flux/auth/client'
import { Spinner } from '@flux/ui/components/ui/spinner'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'

export const Route = createFileRoute('/auth/logout')({
  component: RouteComponent,
})

function RouteComponent() {
  const navigate = useNavigate()

  useEffect(() => {
    const logout = async () => {
      await authClient.signOut()
      navigate({ to: '/auth/login', replace: true })
    }
    logout()
  }, [navigate])
  return (
    <div className='flex h-full min-h-50 w-full items-center justify-center'>
      <Spinner className='size-8 text-neutral-500' />
    </div>
  )
}
