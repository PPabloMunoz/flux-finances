import { createServerFn } from '@tanstack/react-start'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { userPreferences } from '@/lib/db/schema'
import { functionAuthMiddleware } from '@/middleware/auth'
import type { ServerFnResult } from '@/types/types'
import { UpdateUserPreferencesSchema } from './schema'

export const createUserPreferencesAction = createServerFn({ method: 'POST' })
  .middleware([functionAuthMiddleware])
  .handler(async ({ context }) => {
    const userId = context.session?.user.id
    try {
      if (!userId) throw new Error('Unauthorized')

      const [preferences] = await db.insert(userPreferences).values({ userId })

      if (!preferences) {
        throw new Error('Failed to create preferences')
      }

      return { ok: true, data: null } satisfies ServerFnResult<null>
    } catch (err) {
      console.error('Error creating user preferences:', err)
      return {
        ok: false,
        error: 'Failed to create user preferences',
      } satisfies ServerFnResult<never>
    }
  })

export const updateUserPreferencesAction = createServerFn({ method: 'POST' })
  .middleware([functionAuthMiddleware])
  .inputValidator(UpdateUserPreferencesSchema)
  .handler(async ({ context, data }) => {
    const userId = context.session?.user.id
    try {
      if (!userId) throw new Error('Unauthorized')

      const [updatedPreferences] = await db
        .update(userPreferences)
        .set({
          currency: data.currency,
          region: data.region,
          dateFormat: data.dateFormat,
          timezone: data.timezone,
        })
        .where(eq(userPreferences.userId, userId))
        .returning()

      if (!updatedPreferences) {
        throw new Error('Failed to update preferences')
      }

      return { ok: true, data: null } satisfies ServerFnResult<null>
    } catch (err) {
      console.error('Error updating user preferences:', err)
      return {
        ok: false,
        error: 'Failed to update user preferences',
      } satisfies ServerFnResult<never>
    }
  })
