import { createFileRoute, redirect } from '@tanstack/react-router'
import { SubscribePaywall } from '@/components/subscribe-paywall'
import { authStateFn } from '@/features/auth/queries'
import { IS_CLOUD } from '@/lib/constants'

export const Route = createFileRoute('/sub/')({
  component: RouteComponent,
  beforeLoad: async () => {
    if (!IS_CLOUD) throw redirect({ to: '/' })
    return await authStateFn()
  },
})

function RouteComponent() {
  return <SubscribePaywall />
}
