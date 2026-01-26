import { createServerFn } from '@tanstack/react-start'
import { and, eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { category } from '@/lib/db/schema'
import { logger } from '@/lib/logger'
import { functionAuthMiddleware } from '@/middleware/auth'
import type { ServerFnResult } from '@/types/types'
import {
  CreateCategorySchema,
  DeleteCategorySchema,
  ImportCategorySchema,
  UpdateCategorySchema,
} from './schemas'

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

export const importCategoriesAction = createServerFn({ method: 'POST' })
  .middleware([functionAuthMiddleware])
  .inputValidator(ImportCategorySchema)
  .handler(async ({ data, context }) => {
    const userId = context.session?.user.id
    try {
      if (!userId) throw new Error('Unauthorized')

      const lines = data.csv.split('\n').filter((line: string) => line.trim())
      if (lines.length < 2) {
        return {
          ok: false,
          error: 'CSV file is empty or has no data rows',
        } satisfies ServerFnResult<null>
      }

      const headerLine = lines[0].toLowerCase().replace(/"/g, '').replace(/\s/g, '')
      const expectedHeaders = ['id', 'user_id', 'name', 'type', 'color', 'parent_id']
      const headers = headerLine.split(',')
      const hasAllHeaders = expectedHeaders.every((h: string) => headers.includes(h))

      if (!hasAllHeaders) {
        return {
          ok: false,
          error: 'Invalid CSV headers. Required: id, user_id, name, type, color, parent_id',
        } satisfies ServerFnResult<null>
      }

      const headerMap: Record<string, number> = {}
      headers.forEach((h: string, i: number) => {
        headerMap[h.trim()] = i
      })

      const results = { success: 0, skipped: 0, errors: [] as string[] }

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i]
        if (!line.trim()) continue

        const values = line.split(',').map((v: string) => v.trim().replace(/^"|"$/g, ''))
        if (values.length < 5) {
          results.errors.push(`Row ${i + 1}: Invalid number of columns`)
          continue
        }

        const id = values[headerMap.id]
        const name = values[headerMap.name]
        const type = values[headerMap.type]
        const color = values[headerMap.color]
        const parentId = values[headerMap.parent_id] || null

        if (type !== 'inflow' && type !== 'outflow') {
          results.errors.push(
            `Row ${i + 1}: Invalid type "${type}" (must be 'inflow' or 'outflow')`
          )
          continue
        }

        try {
          const [newCategory] = await db
            .insert(category)
            .values({
              id,
              userId,
              name,
              type,
              color,
              parentId: parentId || null,
            })
            .onConflictDoNothing()
            .returning({ id: category.id })

          if (newCategory) {
            results.success++
          } else {
            results.skipped++
          }
        } catch (err) {
          results.errors.push(
            `Row ${i + 1}: Database error - ${err instanceof Error ? err.message : 'Unknown error'}`
          )
        }
      }

      return { ok: true, data: results } satisfies ServerFnResult<typeof results>
    } catch (err) {
      logger.error({ err, operation: 'import_categories' }, 'Failed to import categories')
      return { ok: false, error: 'Failed to import categories' } satisfies ServerFnResult<null>
    }
  })
