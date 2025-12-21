import { createFileRoute } from '@tanstack/react-router'
import { authClient } from '@flux/auth/client'
import { authStateFn } from '@/features/auth/queries'

export const Route = createFileRoute('/app/')({
  component: RouteComponent,
  beforeLoad: async () => authStateFn(),
})

function RouteComponent() {
  const session = authClient.useSession()
  console.log(session)

  return <div>Hello "/app/"!</div>
}
