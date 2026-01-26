import { monthEnd, monthStart } from '@formkit/tempo'
import { createServerFn } from '@tanstack/react-start'
import { and, asc, desc, eq, gte, lte, sql } from 'drizzle-orm'
import { db } from '@/lib/db'
import { budget, category, transaction } from '@/lib/db/schema'
import { logger } from '@/lib/logger'
import { functionAuthMiddleware } from '@/middleware/auth'
import type { ServerFnResult } from '@/types/types'
import type { TBudgetWithSpending } from './schema'

export const getBudgets = createServerFn({ method: 'GET' })
  .middleware([functionAuthMiddleware])
  .handler(async ({ context }) => {
    const userId = context.session?.user.id
    try {
      if (!userId) throw new Error('Unauthorized')

      const now = new Date()
      const startOfMonth = monthStart(now)
      const endOfMonth = monthEnd(now)

      const budgetsWithSpending = await db
        .select({
          id: budget.id,
          amount: budget.amount,
          createdAt: budget.createdAt,
          updatedAt: budget.updatedAt,
          categoryId: budget.categoryId,
          categoryName: category.name,
          categoryColor: category.color,
          spent: sql<number>`COALESCE(SUM(${transaction.amount}), 0)`.mapWith(Number),
        })
        .from(budget)
        .innerJoin(category, eq(budget.categoryId, category.id))
        .leftJoin(
          transaction,
          and(
            eq(transaction.categoryId, budget.categoryId),
            gte(transaction.date, startOfMonth.toISOString().split('T')[0]),
            lte(transaction.date, endOfMonth.toISOString().split('T')[0])
          )
        )
        .where(eq(category.userId, userId))
        .groupBy(budget.id, category.id)
        .orderBy(asc(category.name), desc(budget.createdAt))

      const budgetsWithCalculations: TBudgetWithSpending[] = budgetsWithSpending.map((b) => {
        const remaining = b.amount - b.spent
        const percentageUsed = b.amount > 0 ? (b.spent / b.amount) * 100 : 0

        return {
          id: b.id,
          amount: b.amount / 100,
          createdAt: b.createdAt,
          updatedAt: b.updatedAt,
          categoryId: b.categoryId,
          categoryName: b.categoryName,
          categoryColor: b.categoryColor,
          spent: b.spent / 100,
          remaining: remaining / 100,
          percentageUsed,
        }
      })

      return { ok: true, data: budgetsWithCalculations } satisfies ServerFnResult<
        TBudgetWithSpending[]
      >
    } catch (err) {
      logger.error({ err, operation: 'get_budgets' }, 'Failed to fetch budgets')
      return { ok: false, error: 'Failed to fetch budgets' } satisfies ServerFnResult<never>
    }
  })
