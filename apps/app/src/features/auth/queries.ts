import { auth } from '@flux/auth/server'
import { redirect } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { getRequestHeaders } from '@tanstack/react-start/server'

export const authStateFn = createServerFn({ method: 'GET' }).handler(async () => {
  const headers = getRequestHeaders()
  const session = await auth.api.getSession({ headers })
  if (!session) throw redirect({ to: '/auth/login' })
  if (!session.session.activeOrganizationId) throw redirect({ to: '/onboarding' })
  return { session }
})

export const onboardingAuthStateFn = createServerFn({ method: 'GET' }).handler(async () => {
  const headers = getRequestHeaders()
  const session = await auth.api.getSession({ headers })
  if (!session) throw redirect({ to: '/auth/login' })
  if (session.session.activeOrganizationId) throw redirect({ to: '/' })
  return { session }
})
