import { auth } from '@flux/auth/server'
import { db } from '@flux/db'
import { category } from '@flux/db/schema'
import { createServerFn } from '@tanstack/react-start'
import { and, eq } from 'drizzle-orm'
import { functionAuthMiddleware } from '@/middleware/auth'
import type { ServerFnResult } from '@/types/types'
import {
  CreateCategorySchema,
  DeleteCategorySchema,
  UpdateCategorySchema,
  UpdateHouseholdInputValidator,
} from './schemas'

export const updateHouseholdAction = createServerFn({ method: 'POST' })
  .inputValidator(UpdateHouseholdInputValidator)
  .handler(async ({ data }) => {
    try {
      const session = await auth.api.getSession()
      if (!session) throw new Error('Unauthorized')

      console.log(session.user)
      console.log('Updating household with data:', data)

      // const newHousehold = await db.update(household).set({}).where(eq(household.id, data.id))

      return { ok: true, data: null } satisfies ServerFnResult<null>
    } catch (err) {
      console.error('Error updating household:', err)
      return { ok: false, error: 'Failed to update household' } satisfies ServerFnResult<never>
    }
  })

export const createCategoryAction = createServerFn({ method: 'POST' })
  .middleware([functionAuthMiddleware])
  .inputValidator(CreateCategorySchema)
  .handler(async ({ data, context }) => {
    const activeOrgId = context.session?.session.activeOrganizationId
    try {
      if (!activeOrgId) throw new Error('Unauthorized')

      const newCategory = await db
        .insert(category)
        .values({
          organizationId: activeOrgId,
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
      console.error('Error creating category:', err)
      return { ok: false, error: 'Failed to create category' } satisfies ServerFnResult<never>
    }
  })

export const updateCategoryAction = createServerFn({ method: 'POST' })
  .middleware([functionAuthMiddleware])
  .inputValidator(UpdateCategorySchema)
  .handler(async ({ data, context }) => {
    const activeOrgId = context.session?.session.activeOrganizationId
    try {
      if (!activeOrgId) throw new Error('Unauthorized')

      const [updatedCategory] = await db
        .update(category)
        .set({
          name: data.name,
          color: data.color,
          type: data.type,
        })
        .where(and(eq(category.id, data.id), eq(category.organizationId, activeOrgId)))
        .returning()

      if (!updatedCategory) {
        throw new Error('Failed to update category')
      }

      return { ok: true, data: updatedCategory } satisfies ServerFnResult<typeof updatedCategory>
    } catch (err) {
      console.error('Error updating category:', err)
      return { ok: false, error: 'Failed to update category' } satisfies ServerFnResult<never>
    }
  })

export const deleteCategoryAction = createServerFn({ method: 'POST' })
  .middleware([functionAuthMiddleware])
  .inputValidator(DeleteCategorySchema)
  .handler(async ({ data, context }) => {
    const activeOrgId = context.session?.session.activeOrganizationId
    try {
      if (!activeOrgId) throw new Error('Unauthorized')

      const [deletedCategory] = await db
        .delete(category)
        .where(and(eq(category.id, data.id), eq(category.organizationId, activeOrgId)))
        .returning()

      if (!deletedCategory) {
        throw new Error('Failed to delete category')
      }

      return { ok: true, data: null } satisfies ServerFnResult<null>
    } catch (err) {
      console.error('Error deleting category:', err)
      return { ok: false, error: 'Failed to delete category' } satisfies ServerFnResult<never>
    }
  })
