import { createServerFn } from '@tanstack/react-start'
import { and, eq, inArray, lte, sql } from 'drizzle-orm'
import { db } from '@/lib/db'
import { account, accountBalance } from '@/lib/db/schema'
import { logger } from '@/lib/logger'
import { functionAuthMiddleware } from '@/middleware/auth'
import type { ServerFnResult } from '@/types/types'

export const getNetWorthAction = createServerFn({ method: 'GET' })
  .middleware([functionAuthMiddleware])
  .handler(async ({ context }) => {
    const userId = context.session?.user.id
    try {
      if (!userId) throw new Error('Unauthorized')

      const now = new Date()
      // Current date for current net worth
      const today = now.toISOString().split('T')[0]
      // Last day of previous month
      const lastDayPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0)
      const prevMonthDate = lastDayPrevMonth.toISOString().split('T')[0]

      const getLatestBalanceIds = (dateLimit: string) =>
        db
          .select({
            id: sql<string>`max(${accountBalance.id})`,
          })
          .from(accountBalance)
          .innerJoin(account, eq(accountBalance.accountId, account.id))
          .where(
            and(
              eq(account.userId, userId),
              eq(account.isActive, true),
              lte(accountBalance.date, dateLimit)
            )
          )
          .groupBy(accountBalance.accountId)

      // Get Current Networth
      const currentBalances = await db
        .select({
          value: sql<number>`sum(${accountBalance.balance})`.mapWith(Number),
        })
        .from(accountBalance)
        .where(inArray(accountBalance.id, getLatestBalanceIds(today)))

      // Get Previous Month Networth
      const previousBalances = await db
        .select({
          value: sql<number>`sum(${accountBalance.balance})`.mapWith(Number),
        })
        .from(accountBalance)
        .where(inArray(accountBalance.id, getLatestBalanceIds(prevMonthDate)))

      const currentNetworth = currentBalances[0]?.value ?? 0
      const previousNetworth = previousBalances[0]?.value ?? 0

      // Return array: [0] current, [1] previous
      return {
        ok: true,
        data: [currentNetworth / 100, previousNetworth / 100],
      } satisfies ServerFnResult<number[]>
    } catch (error) {
      logger.error({ err: error, operation: 'get_net_worth' }, 'Failed to fetch net worth')
      return { ok: false, error: 'Failed to fetch net worth' } satisfies ServerFnResult<never>
    }
  })
