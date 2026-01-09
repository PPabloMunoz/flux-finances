import { redirect } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { getRequest, getRequestHeaders } from '@tanstack/react-start/server'
import { auth } from '@/lib/auth/server'
import { IS_CLOUD } from '@/lib/constants'
import { db } from '@/lib/db'
import { functionAuthMiddleware } from '@/middleware/auth'
import type { ServerFnResult } from '@/types/types'
import { getUserSubscriptionStatus } from '../subscription/queries'
import { createUserPreferencesAction } from './actions'
import { UserPreferencesSchema } from './schema'

export const authStateFn = createServerFn({ method: 'GET' }).handler(async () => {
  const req = getRequest()
  const headers = getRequestHeaders()
  const session = await auth.api.getSession({ headers })
  if (!session) throw redirect({ to: '/auth/login' })

  const pathname = new URL(req.url).pathname

  if ((pathname === '/sub' || pathname === '/success') && !IS_CLOUD) {
    throw redirect({ to: '/' })
  }

  const hasSubscription = await getUserSubscriptionStatus()
  if (IS_CLOUD && !hasSubscription && pathname !== '/sub' && pathname !== '/success')
    throw redirect({ to: '/sub' })
  if (IS_CLOUD && hasSubscription && pathname === '/sub') throw redirect({ to: '/' })

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

        const parsed = UserPreferencesSchema.parse(query)

        return { ok: true, data: parsed } satisfies ServerFnResult<typeof parsed>
      }

      const parsed = UserPreferencesSchema.parse(preferences)
      return { ok: true, data: parsed } satisfies ServerFnResult<typeof parsed>
    } catch (err) {
      console.error('Error fetching user preferences:', err)
      return {
        ok: false,
        error: 'Failed to fetch user preferences',
      } satisfies ServerFnResult<never>
    }
  })
