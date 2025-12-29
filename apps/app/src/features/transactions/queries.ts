import { db } from '@flux/db'
import { account, category, transaction } from '@flux/db/schema'
import { createServerFn } from '@tanstack/react-start'
import { and, desc, eq, gte, sql } from 'drizzle-orm'
import { functionAuthMiddleware } from '@/middleware/auth'
import type { ServerFnResult } from '@/types/types'

export const getTransactionsAction = createServerFn({ method: 'GET' })
  .middleware([functionAuthMiddleware])
  .handler(async ({ context }) => {
    const activeOrgId = context.session?.session.activeOrganizationId
    try {
      if (!activeOrgId) throw new Error('Unauthorized')

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
        })
        .from(transaction)
        .innerJoin(account, eq(transaction.accountId, account.id))
        .leftJoin(category, eq(transaction.categoryId, category.id))
        .where(eq(account.organizationId, activeOrgId))
        .orderBy(desc(transaction.date), desc(transaction.createdAt))

      return { ok: true, data: transactions } satisfies ServerFnResult<typeof transactions>
    } catch (err) {
      console.error('Error fetching transactions:', err)
      return { ok: false, error: 'Failed to fetch transactions' } satisfies ServerFnResult<null>
    }
  })

export const getTransactionSummaryAction = createServerFn({ method: 'GET' })
  .middleware([functionAuthMiddleware])
  .handler(async ({ context }) => {
    const activeOrgId = context.session?.session.activeOrganizationId
    try {
      if (!activeOrgId) throw new Error('Unauthorized')

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
            eq(account.organizationId, activeOrgId),
            gte(transaction.date, startDate.toISOString().split('T')[0])
          )
        )

      const income = summary?.income || 0
      const expenses = summary?.expenses || 0
      const net = income - expenses

      return {
        ok: true,
        data: {
          income,
          expenses,
          net,
        },
      } satisfies ServerFnResult<{ income: number; expenses: number; net: number }>
    } catch (err) {
      console.error('Error fetching transaction summary:', err)
      return {
        ok: false,
        error: 'Failed to fetch transaction summary',
      } satisfies ServerFnResult<null>
    }
  })
