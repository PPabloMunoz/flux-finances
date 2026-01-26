import { createServerFn } from '@tanstack/react-start'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { userPreferences } from '@/lib/db/schema'
import { logger } from '@/lib/logger'
import { functionAuthMiddleware } from '@/middleware/auth'
import type { ServerFnResult } from '@/types/types'
import { UpdateNotificationPreferencesSchema, UpdateUserPreferencesSchema } from './schema'

export const createUserPreferencesAction = createServerFn({ method: 'POST' })
  .middleware([functionAuthMiddleware])
  .handler(async ({ context }) => {
    const userId = context.session?.user.id
    try {
      if (!userId) throw new Error('Unauthorized')

      const [preferences] = await db
        .insert(userPreferences)
        .values({ userId })
        .returning({ id: userPreferences.id })

      if (!preferences) {
        throw new Error('Failed to create preferences')
      }

      return { ok: true, data: null } satisfies ServerFnResult<null>
    } catch (err) {
      logger.error(
        { err, operation: 'create_user_preferences' },
        'Failed to create user preferences'
      )
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
      logger.error(
        { err, operation: 'update_user_preferences' },
        'Failed to update user preferences'
      )
      return {
        ok: false,
        error: 'Failed to update user preferences',
      } satisfies ServerFnResult<never>
    }
  })

export const updateNotificationPreferencesAction = createServerFn({ method: 'POST' })
  .middleware([functionAuthMiddleware])
  .inputValidator(UpdateNotificationPreferencesSchema)
  .handler(async ({ context, data }) => {
    const userId = context.session?.user.id
    try {
      if (!userId) throw new Error('Unauthorized')

      const [updatedPreferences] = await db
        .update(userPreferences)
        .set({
          emailSummaries: data.emailSummaries,
          budgetAlerts: data.budgetAlerts,
          transactionReminders: data.transactionReminders,
        })
        .where(eq(userPreferences.userId, userId))
        .returning()

      if (!updatedPreferences) {
        throw new Error('Failed to update notification preferences')
      }

      return { ok: true, data: null } satisfies ServerFnResult<null>
    } catch (err) {
      logger.error(
        { err, operation: 'update_notification_preferences' },
        'Failed to update notification preferences'
      )
      return {
        ok: false,
        error: 'Failed to update notification preferences',
      } satisfies ServerFnResult<never>
    }
  })

export const exportUserDataAction = createServerFn({ method: 'GET' })
  .middleware([functionAuthMiddleware])
  .handler(async ({ context }) => {
    const userId = context.session?.user.id
    try {
      if (!userId) throw new Error('Unauthorized')

      const accounts = await db.query.account.findMany({
        where: (account, { eq }) => eq(account.userId, userId),
      })

      const categories = await db.query.category.findMany({
        where: (category, { eq }) => eq(category.userId, userId),
      })

      const transactions = await db.query.transaction.findMany({
        where: (transaction, { eq }) => eq(transaction.accountId, accounts[0]?.id ?? ''),
      })

      const budgets = await db.query.budget.findMany({
        where: (budget, { eq }) => eq(budget.categoryId, categories[0]?.id ?? ''),
      })

      const preferences = await db.query.userPreferences.findFirst({
        where: (userPreferences, { eq }) => eq(userPreferences.userId, userId),
      })

      const exportData = {
        exportDate: new Date().toISOString().split('T')[0],
        version: '1.0',
        user: {
          id: userId,
          email: context.session?.user.email,
          name: context.session?.user.name,
        },
        preferences,
        accounts,
        categories,
        transactions,
        budgets,
      }

      return { ok: true, data: exportData } satisfies ServerFnResult<typeof exportData>
    } catch (err) {
      logger.error({ err, operation: 'export_user_data' }, 'Failed to export user data')
      return { ok: false, error: 'Failed to export user data' } satisfies ServerFnResult<never>
    }
  })
