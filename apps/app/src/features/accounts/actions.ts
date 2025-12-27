import { db } from '@flux/db'
import { account } from '@flux/db/schema'
import { createServerFn } from '@tanstack/react-start'
import { functionAuthMiddleware } from '@/middleware/auth'
import type { ServerFnResult } from '@/types/types'
import { NewAccountSchema } from './schema'

export const newAccountAction = createServerFn({ method: 'POST' })
  .middleware([functionAuthMiddleware])
  .inputValidator(NewAccountSchema)
  .handler(async ({ data, context }) => {
    const activeOrgId = context.session?.session.activeOrganizationId
    try {
      if (!activeOrgId) throw new Error('Unauthorized')

      const newAccount = await db
        .insert(account)
        .values({
          name: data.name,
          type: data.type,
          currentBalance: data.initialBalance.toString(),
          organizationId: activeOrgId,
        })
        .returning()
        .then((accounts) => accounts[0])

      if (!newAccount) {
        throw new Error('Failed to create account')
      }

      return { ok: true, data: newAccount } satisfies ServerFnResult<typeof newAccount>
    } catch (err) {
      console.error('Error creating new account:', err)
      return { ok: false, error: 'Failed to create account' } satisfies ServerFnResult<never>
    }
  })
