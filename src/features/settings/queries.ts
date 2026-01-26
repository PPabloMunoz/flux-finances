import { createServerFn } from '@tanstack/react-start'
import { and, asc, eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { category } from '@/lib/db/schema'
import { logger } from '@/lib/logger'
import { functionAuthMiddleware } from '@/middleware/auth'
import type { ServerFnResult } from '@/types/types'
import { GetCategoriesSchema } from './schemas'

export const getCategoriesAction = createServerFn({ method: 'GET' })
  .middleware([functionAuthMiddleware])
  .inputValidator(GetCategoriesSchema)
  .handler(async ({ context, data }) => {
    const userId = context.session?.user.id
    try {
      if (!userId) throw new Error('Unauthorized')

      const typeFilter = data.type ? eq(category.type, data.type) : undefined

      const categories = await db
        .select()
        .from(category)
        .where(
          typeFilter ? and(typeFilter, eq(category.userId, userId)) : eq(category.userId, userId)
        )
        .orderBy(asc(category.type), asc(category.name))

      return { ok: true, data: categories } satisfies ServerFnResult<typeof categories>
    } catch (err) {
      logger.error({ err, operation: 'get_categories' }, 'Failed to fetch categories')
      return { ok: false, error: 'Failed to fetch categories' } satisfies ServerFnResult<never>
    }
  })
