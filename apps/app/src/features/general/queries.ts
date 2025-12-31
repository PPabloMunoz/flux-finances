import { db } from '@flux/db'
import { account, accountBalance } from '@flux/db/schema'
import { createServerFn } from '@tanstack/react-start'
import { and, eq, inArray, lte, sql } from 'drizzle-orm'
import { functionAuthMiddleware } from '@/middleware/auth'
import type { ServerFnResult } from '@/types/types'

export const getNetWorthAction = createServerFn({ method: 'GET' })
  .middleware([functionAuthMiddleware])
  .handler(async ({ context }) => {
    const activeOrgId = context.session?.session.activeOrganizationId
    try {
      if (!activeOrgId) throw new Error('Unauthorized')

      const now = new Date()
      const today = now.toISOString().split('T')[0]
      const lastDayPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0)
        .toISOString()
        .split('T')[0]

      // Helper to get a subquery for the latest balance IDs at a specific point in time
      const getLatestBalanceIds = (dateLimit: string) =>
        db
          .select({
            id: sql<string>`max(${accountBalance.id})`, // Assumes IDs (ULID/UUID) or Dates are sortable
          })
          .from(accountBalance)
          .innerJoin(account, eq(accountBalance.accountId, account.id))
          .where(
            and(
              eq(account.organizationId, activeOrgId),
              eq(account.isActive, true),
              lte(accountBalance.date, dateLimit)
            )
          )
          .groupBy(accountBalance.accountId)

      // 1. Fetch Current Net Worth
      const currentBalances = await db
        .select({
          value: sql<number>`sum(${accountBalance.balance})`.mapWith(Number),
        })
        .from(accountBalance)
        .where(inArray(accountBalance.id, getLatestBalanceIds(today)))

      // 2. Fetch Previous Month Net Worth
      const previousBalances = await db
        .select({
          value: sql<number>`sum(${accountBalance.balance})`.mapWith(Number),
        })
        .from(accountBalance)
        .where(inArray(accountBalance.id, getLatestBalanceIds(lastDayPrevMonth)))

      const currentNetWorth = currentBalances[0]?.value ?? 0
      const previousNetWorth = previousBalances[0]?.value ?? 0

      return { ok: true, data: { currentNetWorth, previousNetWorth } } satisfies ServerFnResult<{
        currentNetWorth: number
        previousNetWorth: number
      }>
    } catch (error) {
      console.error('Error fetching net worth:', error)
      return { ok: false, error: 'Failed to fetch net worth' } satisfies ServerFnResult<never>
    }
  })
