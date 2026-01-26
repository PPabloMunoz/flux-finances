import { createServerFn } from '@tanstack/react-start'
import { and, desc, eq, gte, like, or, sql } from 'drizzle-orm'
import { z } from 'zod'
import { db } from '@/lib/db'
import { account, category, transaction } from '@/lib/db/schema'
import { logger } from '@/lib/logger'
import { functionAuthMiddleware } from '@/middleware/auth'
import type { ServerFnResult } from '@/types/types'

const GetTransactionsInputSchema = z.object({
  search: z.string().optional(),
  categoryId: z.string().optional(),
  accountId: z.string().optional(),
  dateRange: z.enum(['all', 'today', 'week', 'month', 'year']).optional().default('all'),
  page: z.number().min(1).optional().default(1),
  pageSize: z.number().min(1).max(100).optional().default(10),
})

export const getTransactionsAction = createServerFn({ method: 'GET' })
  .middleware([functionAuthMiddleware])
  .inputValidator(GetTransactionsInputSchema)
  .handler(async ({ context, data }) => {
    const userId = context.session?.user.id
    try {
      if (!userId) throw new Error('Unauthorized')

      const { search, categoryId, accountId, dateRange, page, pageSize } = data

      const getDateFilter = () => {
        const now = new Date()
        let startDate: Date | null = null

        switch (dateRange) {
          case 'today':
            startDate = new Date(now.setHours(0, 0, 0, 0))
            break
          case 'week':
            startDate = new Date(now.setDate(now.getDate() - 7))
            break
          case 'month':
            startDate = new Date(now.setMonth(now.getMonth() - 1))
            break
          case 'year':
            startDate = new Date(now.setFullYear(now.getFullYear() - 1))
            break
          default:
            return null
        }

        return startDate ? gte(transaction.date, startDate.toISOString().split('T')[0]) : null
      }

      const filters = [eq(account.userId, userId)]

      if (search) {
        const searchFilter = or(
          like(sql`lower(${transaction.title})`, `%${search.toLowerCase()}%`),
          like(sql`lower(${transaction.description})`, `%${search.toLowerCase()}%`)
        )
        if (searchFilter) {
          filters.push(searchFilter)
        }
      }

      if (categoryId) {
        filters.push(eq(transaction.categoryId, categoryId))
      }

      if (accountId) {
        filters.push(eq(transaction.accountId, accountId))
      }

      const dateFilter = getDateFilter()
      if (dateFilter) {
        filters.push(dateFilter)
      }

      const [countResult] = await db
        .select({ count: sql<number>`count(*)`.mapWith(Number) })
        .from(transaction)
        .innerJoin(account, eq(transaction.accountId, account.id))
        .leftJoin(category, eq(transaction.categoryId, category.id))
        .where(and(...filters))

      const total = countResult?.count || 0

      const offset = (page - 1) * pageSize
      const transactions = await db
        .select({
          id: transaction.id,
          title: transaction.title,
          amount: transaction.amount,
          type: transaction.type,
          date: transaction.date,
          description: transaction.description,
          accountId: account.id,
          accountName: account.name,
          accountType: account.type,
          accountCurrency: account.currency,
          categoryId: category.id,
          categoryName: category.name,
          categoryColor: category.color,
          transferId: transaction.transferId,
        })
        .from(transaction)
        .innerJoin(account, eq(transaction.accountId, account.id))
        .leftJoin(category, eq(transaction.categoryId, category.id))
        .where(and(...filters))
        .orderBy(desc(transaction.date), desc(transaction.createdAt))
        .limit(pageSize)
        .offset(offset)
        .then((res) => res.map((t) => ({ ...t, amount: (t.amount ?? 0) / 100 })))

      return {
        ok: true,
        data: {
          transactions,
          pagination: {
            page,
            pageSize,
            total,
            totalPages: Math.ceil(total / pageSize),
          },
        },
      } satisfies ServerFnResult<{
        transactions: typeof transactions
        pagination: { page: number; pageSize: number; total: number; totalPages: number }
      }>
    } catch (err) {
      logger.error({ err, operation: 'get_transactions' }, 'Failed to fetch transactions')
      return { ok: false, error: 'Failed to fetch transactions' } satisfies ServerFnResult<null>
    }
  })

export const getTransactionSummaryAction = createServerFn({ method: 'GET' })
  .middleware([functionAuthMiddleware])
  .handler(async ({ context }) => {
    const userId = context.session?.user.id
    try {
      if (!userId) throw new Error('Unauthorized')

      const startDate = new Date()
      startDate.setDate(startDate.getDate() - 30)

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
          res.map((t) => ({
            ...t,
            income: (t.income ?? 0) / 100,
            expenses: (t.expenses ?? 0) / 100,
          }))
        )

      return {
        ok: true,
        data: {
          income: summary.income,
          expenses: summary.expenses,
          net: summary.income - summary.expenses,
        },
      } satisfies ServerFnResult<{ income: number; expenses: number; net: number }>
    } catch (err) {
      logger.error(
        { err, operation: 'get_transaction_summary' },
        'Failed to fetch transaction summary'
      )
      return {
        ok: false,
        error: 'Failed to fetch transaction summary',
      } satisfies ServerFnResult<null>
    }
  })
