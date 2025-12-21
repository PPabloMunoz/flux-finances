import { authStateFn } from '@/features/auth/queries'
import { authClient } from '@flux/auth/client'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/app/')({
  component: RouteComponent,
  beforeLoad: async () => authStateFn(),
})

function RouteComponent() {
  const session = authClient.useSession()
  console.log(session)

  return <div>Hello "/app/"!</div>
}
