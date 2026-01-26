import { createServerFn } from '@tanstack/react-start'
import { and, eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { budget, category } from '@/lib/db/schema'
import { logger } from '@/lib/logger'
import { functionAuthMiddleware } from '@/middleware/auth'
import type { ServerFnResult } from '@/types/types'
import { DeleteBudgetSchema, EditBudgetSchema, NewBudgetSchema } from './schema'

export const newBudgetAction = createServerFn({ method: 'POST' })
  .middleware([functionAuthMiddleware])
  .inputValidator(NewBudgetSchema)
  .handler(async ({ data, context }) => {
    const userId = context.session?.user.id
    try {
      if (!userId) throw new Error('Unauthorized')

      const categoryExists = await db
        .select({ id: category.id })
        .from(category)
        .where(and(eq(category.id, data.categoryId), eq(category.userId, userId)))
        .limit(1)

      if (categoryExists.length === 0) {
        throw new Error('Category not found or does not belong to you')
      }

      const newBudget = await db
        .insert(budget)
        .values({
          categoryId: data.categoryId,
          amount: data.amount * 100,
        })
        .returning()
        .then((budgets) => budgets[0])

      if (!newBudget) {
        throw new Error('Failed to create budget')
      }

      return { ok: true, data: newBudget } satisfies ServerFnResult<typeof newBudget>
    } catch (err) {
      logger.error({ err, operation: 'create_budget' }, 'Failed to create budget')
      return {
        ok: false,
        error: 'Failed to create budget. Check if the category has already a budget.',
      } satisfies ServerFnResult<never>
    }
  })

export const updateBudgetAction = createServerFn({ method: 'POST' })
  .middleware([functionAuthMiddleware])
  .inputValidator(EditBudgetSchema)
  .handler(async ({ data, context }) => {
    const userId = context.session?.user.id
    try {
      if (!userId) throw new Error('Unauthorized')

      const categoryExists = await db
        .select({ id: category.id })
        .from(category)
        .where(and(eq(category.id, data.categoryId), eq(category.userId, userId)))
        .limit(1)

      if (categoryExists.length === 0) {
        throw new Error('Category not found or does not belong to you')
      }

      const budgetExists = await db
        .select({ id: budget.id })
        .from(budget)
        .innerJoin(category, eq(budget.categoryId, category.id))
        .where(and(eq(budget.id, data.id), eq(category.userId, userId)))
        .limit(1)

      if (budgetExists.length === 0) {
        throw new Error('Budget not found or does not belong to you')
      }

      const updatedBudget = await db
        .update(budget)
        .set({
          categoryId: data.categoryId,
          amount: data.amount * 100,
        })
        .where(eq(budget.id, data.id))
        .returning()
        .then((budgets) => budgets[0])

      if (!updatedBudget) {
        throw new Error('Failed to update budget')
      }

      return { ok: true, data: updatedBudget } satisfies ServerFnResult<typeof updatedBudget>
    } catch (err) {
      logger.error({ err, operation: 'update_budget' }, 'Failed to update budget')
      return { ok: false, error: 'Failed to update budget' } satisfies ServerFnResult<never>
    }
  })

export const deleteBudgetAction = createServerFn({ method: 'POST' })
  .middleware([functionAuthMiddleware])
  .inputValidator(DeleteBudgetSchema)
  .handler(async ({ data, context }) => {
    const userId = context.session?.user.id
    try {
      if (!userId) throw new Error('Unauthorized')

      const budgetExists = await db
        .select({ id: budget.id })
        .from(budget)
        .innerJoin(category, eq(budget.categoryId, category.id))
        .where(and(eq(budget.id, data.id), eq(category.userId, userId)))
        .limit(1)

      if (budgetExists.length === 0) {
        throw new Error('Budget not found or does not belong to you')
      }

      await db.delete(budget).where(eq(budget.id, data.id))

      return { ok: true, data: null } satisfies ServerFnResult<null>
    } catch (err) {
      logger.error({ err, operation: 'delete_budget' }, 'Failed to delete budget')
      return { ok: false, error: 'Failed to delete budget' } satisfies ServerFnResult<never>
    }
  })
