import { createServerFn } from '@tanstack/react-start'
import { and, eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { category } from '@/lib/db/schema'
import { logger } from '@/lib/logger'
import { functionAuthMiddleware } from '@/middleware/auth'
import type { ServerFnResult } from '@/types/types'
import { CreateCategorySchema, DeleteCategorySchema, UpdateCategorySchema } from './schemas'

export const createCategoryAction = createServerFn({ method: 'POST' })
  .middleware([functionAuthMiddleware])
  .inputValidator(CreateCategorySchema)
  .handler(async ({ data, context }) => {
    const userId = context.session?.user.id
    try {
      if (!userId) throw new Error('Unauthorized')

      const newCategory = await db
        .insert(category)
        .values({
          userId: userId,
          name: data.name,
          color: data.color,
          type: data.type,
        })
        .returning()
        .then((categories) => categories[0])

      if (!newCategory) {
        throw new Error('Failed to create category')
      }

      return { ok: true, data: newCategory } satisfies ServerFnResult<typeof newCategory>
    } catch (err) {
      logger.error({ err, operation: 'create_category' }, 'Failed to create category')
      return { ok: false, error: 'Failed to create category' } satisfies ServerFnResult<never>
    }
  })

export const updateCategoryAction = createServerFn({ method: 'POST' })
  .middleware([functionAuthMiddleware])
  .inputValidator(UpdateCategorySchema)
  .handler(async ({ data, context }) => {
    const userId = context.session?.user.id
    try {
      if (!userId) throw new Error('Unauthorized')

      const [updatedCategory] = await db
        .update(category)
        .set({
          name: data.name,
          color: data.color,
          type: data.type,
        })
        .where(and(eq(category.id, data.id), eq(category.userId, userId)))
        .returning()

      if (!updatedCategory) {
        throw new Error('Failed to update category')
      }

      return { ok: true, data: updatedCategory } satisfies ServerFnResult<typeof updatedCategory>
    } catch (err) {
      logger.error({ err, operation: 'update_category' }, 'Failed to update category')
      return { ok: false, error: 'Failed to update category' } satisfies ServerFnResult<never>
    }
  })

export const deleteCategoryAction = createServerFn({ method: 'POST' })
  .middleware([functionAuthMiddleware])
  .inputValidator(DeleteCategorySchema)
  .handler(async ({ data, context }) => {
    const userId = context.session?.user.id
    try {
      if (!userId) throw new Error('Unauthorized')

      const [deletedCategory] = await db
        .delete(category)
        .where(and(eq(category.id, data.id), eq(category.userId, userId)))
        .returning()

      if (!deletedCategory) {
        throw new Error('Failed to delete category')
      }

      return { ok: true, data: null } satisfies ServerFnResult<null>
    } catch (err) {
      logger.error({ err, operation: 'delete_category' }, 'Failed to delete category')
      return { ok: false, error: 'Failed to delete category' } satisfies ServerFnResult<never>
    }
  })
