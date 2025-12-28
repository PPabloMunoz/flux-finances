import { auth } from '@flux/auth/server'
import { db } from '@flux/db'
import { redirect } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { getRequestHeaders } from '@tanstack/react-start/server'
import { functionAuthMiddleware } from '@/middleware/auth'
import type { ServerFnResult } from '@/types/types'
import { createUserPreferencesAction } from './actions'

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

export const getUserPreferencesAction = createServerFn({ method: 'GET' })
  .middleware([functionAuthMiddleware])
  .handler(async ({ context }) => {
    const userId = context.session?.user.id
    try {
      if (!userId) throw new Error('Unauthorized')

      const prepared = db.query.userPreferences
        .findFirst({
          where(userPreferences, { eq }) {
            return eq(userPreferences.userId, userId)
          },
        })
        .prepare('getUserPreferencesAction')

      const preferences = await prepared.execute()

      if (!preferences) {
        const res = await createUserPreferencesAction()
        if (!res.ok) throw new Error('Preferences could not be created')

        const query = await prepared.execute()
        if (!query) throw new Error('Preferences not found after creation')

        return { ok: true, data: query } satisfies ServerFnResult<typeof query>
      }

      return { ok: true, data: preferences } satisfies ServerFnResult<typeof preferences>
    } catch (err) {
      console.error('Error fetching user preferences:', err)
      return {
        ok: false,
        error: 'Failed to fetch user preferences',
      } satisfies ServerFnResult<never>
    }
  })
