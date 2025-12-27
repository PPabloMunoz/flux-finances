import { db } from '@flux/db'
import { createServerFn } from '@tanstack/react-start'
import { functionAuthMiddleware } from '@/middleware/auth'
import type { ServerFnResult } from '@/types/types'

export const getCashAccountsAction = createServerFn({ method: 'GET' })
  .middleware([functionAuthMiddleware])
  .handler(async ({ context }) => {
    const activeOrgId = context.session?.session.activeOrganizationId
    try {
      if (!activeOrgId) throw new Error('Unauthorized')

      const cashAccounts = await db.query.account.findMany({
        where(account, { and, eq }) {
          return and(eq(account.organizationId, activeOrgId), eq(account.type, 'cash'))
        },
      })

      return { ok: true, data: cashAccounts } satisfies ServerFnResult<typeof cashAccounts>
    } catch (err) {
      console.error('Error fetching cash accounts:', err)
      return { ok: false, error: 'Failed to create account' } satisfies ServerFnResult<never>
    }
  })
