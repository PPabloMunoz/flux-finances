import { db } from '@flux/db'
import { account, accountBalance, transaction } from '@flux/db/schema'
import { addDay, addMonth, monthEnd, monthStart } from '@formkit/tempo'
import { createServerFn } from '@tanstack/react-start'
import { and, between, eq, inArray, lte, sql } from 'drizzle-orm'
import { functionAuthMiddleware } from '@/middleware/auth'
import type { ServerFnResult } from '@/types/types'

export const getNetWorthAction = createServerFn({ method: 'GET' })
  .middleware([functionAuthMiddleware])
  .handler(async ({ context }) => {
    const activeOrgId = context.session?.session.activeOrganizationId
    try {
      if (!activeOrgId) throw new Error('Unauthorized')

      const now = new Date()

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

      // Fetch net worth for the last 12 months
      const networthHistory: number[] = []

      for (let i = 11; i >= 0; i--) {
        const targetDate = new Date(now.getFullYear(), now.getMonth() - i, 0)
        const dateString = targetDate.toISOString().split('T')[0]

        const balances = await db
          .select({
            value: sql<number>`sum(${accountBalance.balance})`.mapWith(Number),
          })
          .from(accountBalance)
          .where(inArray(accountBalance.id, getLatestBalanceIds(dateString)))

        networthHistory.push(balances[0]?.value ?? 0)
      }

      // Add current month's net worth
      const today = now.toISOString().split('T')[0]
      const currentBalances = await db
        .select({
          value: sql<number>`sum(${accountBalance.balance})`.mapWith(Number),
        })
        .from(accountBalance)
        .where(inArray(accountBalance.id, getLatestBalanceIds(today)))

      networthHistory.push(currentBalances[0]?.value ?? 0)

      return { ok: true, data: networthHistory } satisfies ServerFnResult<number[]>
    } catch (error) {
      console.error('Error fetching net worth:', error)
      return { ok: false, error: 'Failed to fetch net worth' } satisfies ServerFnResult<never>
    }
  })

export const getIncomeExpenseHistoryAction = createServerFn({ method: 'GET' })
  .middleware([functionAuthMiddleware])
  .handler(async ({ context }) => {
    const activeOrgId = context.session?.session.activeOrganizationId
    try {
      if (!activeOrgId) throw new Error('Unauthorized')

      const now = new Date()
      const incomeHistory: number[] = []
      const expenseHistory: number[] = []

      // Loop through the last 12 months (including current month)
      for (let i = 12; i >= 0; i--) {
        const targetMonth = addMonth(now, -i)
        const startOfMonth = addDay(monthStart(targetMonth), 1).toISOString().split('T')[0]
        const endOfMonth = monthEnd(targetMonth).toISOString().split('T')[0]

        // Fetch income (inflow) for the month
        const incomeResult = await db
          .select({
            value: sql<number>`sum(${transaction.amount})`.mapWith(Number),
          })
          .from(transaction)
          .innerJoin(account, eq(transaction.accountId, account.id))
          .where(
            and(
              eq(account.organizationId, activeOrgId),
              eq(account.isActive, true),
              eq(transaction.type, 'inflow'),
              between(transaction.date, startOfMonth, endOfMonth)
            )
          )

        // Fetch expenses (outflow) for the month
        const expenseResult = await db
          .select({
            value: sql<number>`sum(${transaction.amount})`.mapWith(Number),
          })
          .from(transaction)
          .innerJoin(account, eq(transaction.accountId, account.id))
          .where(
            and(
              eq(account.organizationId, activeOrgId),
              eq(account.isActive, true),
              eq(transaction.type, 'outflow'),
              between(transaction.date, startOfMonth, endOfMonth)
            )
          )

        incomeHistory.push(incomeResult[0]?.value ?? 0)
        expenseHistory.push(expenseResult[0]?.value ?? 0)
      }

      return {
        ok: true,
        data: { incomeHistory, expenseHistory },
      } satisfies ServerFnResult<{
        incomeHistory: number[]
        expenseHistory: number[]
      }>
    } catch (error) {
      console.error('Error fetching income/expense history:', error)
      return {
        ok: false,
        error: 'Failed to fetch income/expense history',
      } satisfies ServerFnResult<never>
    }
  })
