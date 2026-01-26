import { createServerFn } from '@tanstack/react-start'
import { and, asc, desc, eq, gte, inArray, lte, sql } from 'drizzle-orm'
import { z } from 'zod'
import { db } from '@/lib/db'
import { account, accountBalance, category, transaction } from '@/lib/db/schema'
import { logger } from '@/lib/logger'
import { functionAuthMiddleware } from '@/middleware/auth'
import type { ServerFnResult } from '@/types/types'

const DateRangeSchema = z.enum(['30d', '90d', '6m', '1y']).default('30d')

export const getSpendingByCategoryAction = createServerFn({ method: 'GET' })
  .middleware([functionAuthMiddleware])
  .inputValidator(DateRangeSchema)
  .handler(async ({ context, data }) => {
    const userId = context.session?.user.id
    try {
      if (!userId) throw new Error('Unauthorized')

      const now = new Date()
      let startDate: Date
      switch (data) {
        case '30d':
          startDate = new Date(now.setDate(now.getDate() - 30))
          break
        case '90d':
          startDate = new Date(now.setDate(now.getDate() - 90))
          break
        case '6m':
          startDate = new Date(now.setMonth(now.getMonth() - 6))
          break
        case '1y':
          startDate = new Date(now.setFullYear(now.getFullYear() - 1))
          break
        default:
          startDate = new Date(now.setDate(now.getDate() - 30))
      }

      const spendingByCategory = await db
        .select({
          categoryId: category.id,
          categoryName: category.name,
          categoryColor: category.color,
          total: sql<number>`sum(${transaction.amount})`.mapWith(Number),
        })
        .from(transaction)
        .innerJoin(account, eq(transaction.accountId, account.id))
        .leftJoin(category, eq(transaction.categoryId, category.id))
        .where(
          and(
            eq(account.userId, userId),
            eq(account.isActive, true),
            eq(transaction.type, 'outflow'),
            gte(transaction.date, startDate.toISOString().split('T')[0])
          )
        )
        .groupBy(category.id)
        .orderBy(desc(sql`sum(${transaction.amount})`))
        .then((res) => {
          const total = res.reduce((sum, item) => sum + (item.total ?? 0), 0)
          return res.map((item) => ({
            categoryId: item.categoryId ?? 'uncategorized',
            categoryName: item.categoryName ?? 'Uncategorized',
            categoryColor: item.categoryColor ?? '#6b7280',
            total: (item.total ?? 0) / 100,
            percentage: total > 0 ? ((item.total ?? 0) / total) * 100 : 0,
          }))
        })

      return { ok: true, data: spendingByCategory } satisfies ServerFnResult<
        Array<{
          categoryId: string
          categoryName: string
          categoryColor: string
          total: number
          percentage: number
        }>
      >
    } catch (err) {
      logger.error(
        { err, operation: 'get_spending_by_category' },
        'Failed to fetch spending by category'
      )
      return {
        ok: false,
        error: 'Failed to fetch spending by category',
      } satisfies ServerFnResult<never>
    }
  })

export const getMonthlyTrendsAction = createServerFn({ method: 'GET' })
  .middleware([functionAuthMiddleware])
  .handler(async ({ context }) => {
    const userId = context.session?.user.id
    try {
      if (!userId) throw new Error('Unauthorized')

      const now = new Date()
      const twelveMonthsAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())

      const monthlyData = await db
        .select({
          month: sql<string>`strftime('%Y-%m', ${transaction.date})`.mapWith(String),
          income:
            sql<number>`sum(case when ${transaction.type} = 'inflow' then ${transaction.amount} else 0 end)`.mapWith(
              Number
            ),
          expenses:
            sql<number>`sum(case when ${transaction.type} = 'outflow' then ${transaction.amount} else 0 end)`.mapWith(
              Number
            ),
        })
        .from(transaction)
        .innerJoin(account, eq(transaction.accountId, account.id))
        .where(
          and(
            eq(account.userId, userId),
            eq(account.isActive, true),
            gte(transaction.date, twelveMonthsAgo.toISOString().split('T')[0])
          )
        )
        .groupBy(sql`strftime('%Y-%m', ${transaction.date})`)
        .orderBy(sql`strftime('%Y-%m', ${transaction.date})`)
        .then((res) =>
          res.map((item) => ({
            month: item.month,
            income: item.income / 100,
            expenses: item.expenses / 100,
            net: (item.income - item.expenses) / 100,
          }))
        )

      return { ok: true, data: monthlyData } satisfies ServerFnResult<
        Array<{
          month: string
          income: number
          expenses: number
          net: number
        }>
      >
    } catch (err) {
      logger.error({ err, operation: 'get_monthly_trends' }, 'Failed to fetch monthly trends')
      return { ok: false, error: 'Failed to fetch monthly trends' } satisfies ServerFnResult<never>
    }
  })

export const getNetWorthHistoryAction = createServerFn({ method: 'GET' })
  .middleware([functionAuthMiddleware])
  .handler(async ({ context }) => {
    const userId = context.session?.user.id
    try {
      if (!userId) throw new Error('Unauthorized')

      const now = new Date()
      const months: string[] = []

      for (let i = 0; i < 12; i++) {
        const year = now.getFullYear() - (i > now.getMonth() ? 1 : 0)
        const month = i <= now.getMonth() ? now.getMonth() + 1 - i : 12 - (i - now.getMonth() - 1)
        const lastDay = new Date(year, month, 0).toISOString().split('T')[0]
        months.unshift(lastDay)
      }

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

      const netWorthHistory: Array<{ month: string; netWorth: number }> = []

      for (const monthEndDate of months) {
        const [result] = await db
          .select({
            value: sql<number>`sum(${accountBalance.balance})`.mapWith(Number),
          })
          .from(accountBalance)
          .where(inArray(accountBalance.id, getLatestBalanceIds(monthEndDate)))

        const monthKey = monthEndDate.substring(0, 7)
        netWorthHistory.push({
          month: monthKey,
          netWorth: (result?.value ?? 0) / 100,
        })
      }

      return { ok: true, data: netWorthHistory } satisfies ServerFnResult<
        Array<{
          month: string
          netWorth: number
        }>
      >
    } catch (err) {
      logger.error({ err, operation: 'get_net_worth_history' }, 'Failed to fetch net worth history')
      return {
        ok: false,
        error: 'Failed to fetch net worth history',
      } satisfies ServerFnResult<never>
    }
  })

export const getCategoryBreakdownAction = createServerFn({ method: 'GET' })
  .middleware([functionAuthMiddleware])
  .inputValidator(DateRangeSchema)
  .handler(async ({ context, data }) => {
    const userId = context.session?.user.id
    try {
      if (!userId) throw new Error('Unauthorized')

      const now = new Date()
      let startDate: Date
      switch (data) {
        case '30d':
          startDate = new Date(now.setDate(now.getDate() - 30))
          break
        case '90d':
          startDate = new Date(now.setDate(now.getDate() - 90))
          break
        case '6m':
          startDate = new Date(now.setMonth(now.getMonth() - 6))
          break
        case '1y':
          startDate = new Date(now.setFullYear(now.getFullYear() - 1))
          break
        default:
          startDate = new Date(now.setDate(now.getDate() - 30))
      }

      const categoryBreakdown = await db
        .select({
          categoryId: category.id,
          categoryName: category.name,
          categoryColor: category.color,
          categoryType: category.type,
          income:
            sql<number>`sum(case when ${transaction.type} = 'inflow' then ${transaction.amount} else 0 end)`.mapWith(
              Number
            ),
          expenses:
            sql<number>`sum(case when ${transaction.type} = 'outflow' then ${transaction.amount} else 0 end)`.mapWith(
              Number
            ),
        })
        .from(transaction)
        .innerJoin(account, eq(transaction.accountId, account.id))
        .leftJoin(category, eq(transaction.categoryId, category.id))
        .where(
          and(
            eq(account.userId, userId),
            eq(account.isActive, true),
            gte(transaction.date, startDate.toISOString().split('T')[0])
          )
        )
        .groupBy(category.id)
        .orderBy(asc(category.name))
        .then((res) =>
          res.map((item) => ({
            categoryId: item.categoryId ?? 'uncategorized',
            categoryName: item.categoryName ?? 'Uncategorized',
            categoryColor: item.categoryColor ?? '#6b7280',
            categoryType: item.categoryType ?? 'outflow',
            income: item.income / 100,
            expenses: item.expenses / 100,
          }))
        )

      return { ok: true, data: categoryBreakdown } satisfies ServerFnResult<
        Array<{
          categoryId: string
          categoryName: string
          categoryColor: string
          categoryType: 'inflow' | 'outflow'
          income: number
          expenses: number
        }>
      >
    } catch (err) {
      logger.error(
        { err, operation: 'get_category_breakdown' },
        'Failed to fetch category breakdown'
      )
      return {
        ok: false,
        error: 'Failed to fetch category breakdown',
      } satisfies ServerFnResult<never>
    }
  })

export const getAnalyticsSummaryAction = createServerFn({ method: 'GET' })
  .middleware([functionAuthMiddleware])
  .inputValidator(DateRangeSchema)
  .handler(async ({ context, data }) => {
    const userId = context.session?.user.id
    try {
      if (!userId) throw new Error('Unauthorized')

      const now = new Date()
      let startDate: Date
      switch (data) {
        case '30d':
          startDate = new Date(now.setDate(now.getDate() - 30))
          break
        case '90d':
          startDate = new Date(now.setDate(now.getDate() - 90))
          break
        case '6m':
          startDate = new Date(now.setMonth(now.getMonth() - 6))
          break
        case '1y':
          startDate = new Date(now.setFullYear(now.getFullYear() - 1))
          break
        default:
          startDate = new Date(now.setDate(now.getDate() - 30))
      }

      const [summary] = await db
        .select({
          income:
            sql<number>`sum(case when ${transaction.type} = 'inflow' then ${transaction.amount} else 0 end)`.mapWith(
              Number
            ),
          expenses:
            sql<number>`sum(case when ${transaction.type} = 'outflow' then ${transaction.amount} else 0 end)`.mapWith(
              Number
            ),
        })
        .from(transaction)
        .innerJoin(account, eq(transaction.accountId, account.id))
        .where(
          and(
            eq(account.userId, userId),
            eq(account.isActive, true),
            gte(transaction.date, startDate.toISOString().split('T')[0])
          )
        )
        .then((res) =>
          res.map((item) => ({
            income: item.income / 100,
            expenses: item.expenses / 100,
          }))
        )

      const income = summary?.income ?? 0
      const expenses = summary?.expenses ?? 0
      const net = income - expenses
      const savingsRate = income > 0 ? (net / income) * 100 : 0

      return {
        ok: true,
        data: {
          income,
          expenses,
          net,
          savingsRate,
        },
      } satisfies ServerFnResult<{
        income: number
        expenses: number
        net: number
        savingsRate: number
      }>
    } catch (err) {
      logger.error({ err, operation: 'get_analytics_summary' }, 'Failed to fetch analytics summary')
      return {
        ok: false,
        error: 'Failed to fetch analytics summary',
      } satisfies ServerFnResult<never>
    }
  })
