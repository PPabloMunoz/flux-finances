import { db } from '@flux/db'
import { category } from '@flux/db/schema'
import { createServerFn } from '@tanstack/react-start'
import { eq } from 'drizzle-orm'
import { functionAuthMiddleware } from '@/middleware/auth'
import type { ServerFnResult } from '@/types/types'

export const getCategoriesAction = createServerFn({ method: 'GET' })
  .middleware([functionAuthMiddleware])
  .handler(async ({ context }) => {
    const activeOrgId = context.session?.session.activeOrganizationId
    try {
      if (!activeOrgId) throw new Error('Unauthorized')

      const categories = await db
        .select()
        .from(category)
        .where(eq(category.organizationId, activeOrgId))
        .orderBy(category.name)

      return { ok: true, data: categories } satisfies ServerFnResult<typeof categories>
    } catch (err) {
      console.error('Error fetching categories:', err)
      return { ok: false, error: 'Failed to fetch categories' } satisfies ServerFnResult<never>
    }
  })
