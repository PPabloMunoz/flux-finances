import { db } from '@flux/db'
import { budget, category } from '@flux/db/schema'
import { createServerFn } from '@tanstack/react-start'
import { and, eq } from 'drizzle-orm'
import { functionAuthMiddleware } from '@/middleware/auth'
import type { ServerFnResult } from '@/types/types'
import { DeleteBudgetSchema, EditBudgetSchema, NewBudgetSchema } from './schema'

export const newBudgetAction = createServerFn({ method: 'POST' })
  .middleware([functionAuthMiddleware])
  .inputValidator(NewBudgetSchema)
  .handler(async ({ data, context }) => {
    const activeOrgId = context.session?.session.activeOrganizationId
    try {
      if (!activeOrgId) throw new Error('Unauthorized')

      // Verify the category belongs to the organization
      const categoryExists = await db
        .select({ id: category.id })
        .from(category)
        .where(and(eq(category.id, data.categoryId), eq(category.organizationId, activeOrgId)))
        .limit(1)

      if (categoryExists.length === 0) {
        throw new Error('Category not found or does not belong to your organization')
      }

      const newBudget = await db
        .insert(budget)
        .values({
          categoryId: data.categoryId,
          amount: data.amount.toString(),
        })
        .returning()
        .then((budgets) => budgets[0])

      if (!newBudget) {
        throw new Error('Failed to create budget')
      }

      return { ok: true, data: newBudget } satisfies ServerFnResult<typeof newBudget>
    } catch (err) {
      console.error('Error creating new budget:', err)
      return { ok: false, error: 'Failed to create budget' } satisfies ServerFnResult<never>
    }
  })

export const updateBudgetAction = createServerFn({ method: 'POST' })
  .middleware([functionAuthMiddleware])
  .inputValidator(EditBudgetSchema)
  .handler(async ({ data, context }) => {
    const activeOrgId = context.session?.session.activeOrganizationId
    try {
      if (!activeOrgId) throw new Error('Unauthorized')

      // Verify the category belongs to the organization
      const categoryExists = await db
        .select({ id: category.id })
        .from(category)
        .where(and(eq(category.id, data.categoryId), eq(category.organizationId, activeOrgId)))
        .limit(1)

      if (categoryExists.length === 0) {
        throw new Error('Category not found or does not belong to your organization')
      }

      // Verify the budget exists and belongs to a category in the organization
      const budgetExists = await db
        .select({ id: budget.id })
        .from(budget)
        .innerJoin(category, eq(budget.categoryId, category.id))
        .where(and(eq(budget.id, data.id), eq(category.organizationId, activeOrgId)))
        .limit(1)

      if (budgetExists.length === 0) {
        throw new Error('Budget not found or does not belong to your organization')
      }

      const updatedBudget = await db
        .update(budget)
        .set({
          categoryId: data.categoryId,
          amount: data.amount.toString(),
        })
        .where(eq(budget.id, data.id))
        .returning()
        .then((budgets) => budgets[0])

      if (!updatedBudget) {
        throw new Error('Failed to update budget')
      }

      return { ok: true, data: updatedBudget } satisfies ServerFnResult<typeof updatedBudget>
    } catch (err) {
      console.error('Error updating budget:', err)
      return { ok: false, error: 'Failed to update budget' } satisfies ServerFnResult<never>
    }
  })

export const deleteBudgetAction = createServerFn({ method: 'POST' })
  .middleware([functionAuthMiddleware])
  .inputValidator(DeleteBudgetSchema)
  .handler(async ({ data, context }) => {
    const activeOrgId = context.session?.session.activeOrganizationId
    try {
      if (!activeOrgId) throw new Error('Unauthorized')

      // Verify the budget exists and belongs to a category in the organization
      const budgetExists = await db
        .select({ id: budget.id })
        .from(budget)
        .innerJoin(category, eq(budget.categoryId, category.id))
        .where(and(eq(budget.id, data.id), eq(category.organizationId, activeOrgId)))
        .limit(1)

      if (budgetExists.length === 0) {
        throw new Error('Budget not found or does not belong to your organization')
      }

      await db.delete(budget).where(eq(budget.id, data.id))

      return { ok: true, data: null } satisfies ServerFnResult<null>
    } catch (err) {
      console.error('Error deleting budget:', err)
      return { ok: false, error: 'Failed to delete budget' } satisfies ServerFnResult<never>
    }
  })
