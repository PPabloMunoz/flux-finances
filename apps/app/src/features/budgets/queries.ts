import { db } from '@flux/db'
import { budget, category, transaction } from '@flux/db/schema'
import { monthEnd, monthStart } from '@formkit/tempo'
import { createServerFn } from '@tanstack/react-start'
import { and, eq, gte, lte, sql } from 'drizzle-orm'
import { functionAuthMiddleware } from '@/middleware/auth'
import type { ServerFnResult } from '@/types/types'
import type { TBudgetWithSpending } from './schema'

export const getBudgets = createServerFn({ method: 'GET' })
  .middleware([functionAuthMiddleware])
  .handler(async ({ context }) => {
    const activeOrgId = context.session?.session.activeOrganizationId
    try {
      if (!activeOrgId) throw new Error('Unauthorized')

      // Get the current month's start and end dates
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
          // We sum the absolute value of transactions where amount < 0 (expenses)
          spent: sql<string>`COALESCE(SUM(${transaction.amount}), 0)`.mapWith(String),
        })
        .from(budget)
        .innerJoin(category, eq(budget.categoryId, category.id))
        // Left join transactions so budgets with $0 spent still show up
        .leftJoin(
          transaction,
          and(
            eq(transaction.categoryId, budget.categoryId),
            gte(transaction.date, startOfMonth.toISOString().split('T')[0]),
            lte(transaction.date, endOfMonth.toISOString().split('T')[0])
          )
        )
        .where(eq(category.organizationId, activeOrgId))
        .groupBy(budget.id, category.id)

      // Calculate remaining and percentage for each budget
      const budgetsWithCalculations: TBudgetWithSpending[] = budgetsWithSpending.map((b) => {
        const budgetAmount = Number(b.amount)
        const spentAmount = Number(b.spent)
        const remaining = budgetAmount - spentAmount
        const percentageUsed = budgetAmount > 0 ? (spentAmount / budgetAmount) * 100 : 0

        return {
          id: b.id,
          amount: b.amount,
          createdAt: b.createdAt,
          updatedAt: b.updatedAt,
          categoryId: b.categoryId,
          categoryName: b.categoryName,
          categoryColor: b.categoryColor,
          spent: b.spent,
          remaining: remaining.toString(),
          percentageUsed,
        }
      })

      return { ok: true, data: budgetsWithCalculations } satisfies ServerFnResult<
        TBudgetWithSpending[]
      >
    } catch (err) {
      console.error('Error fetching budgets with spending:', err)
      return { ok: false, error: 'Failed to fetch budgets' } satisfies ServerFnResult<never>
    }
  })
