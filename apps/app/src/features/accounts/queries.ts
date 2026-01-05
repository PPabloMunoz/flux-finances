import { db } from '@flux/db'
import { account, accountBalance } from '@flux/db/schema'
import { monthStart } from '@formkit/tempo'
import { createServerFn } from '@tanstack/react-start'
import { and, asc, desc, eq, sql } from 'drizzle-orm'
import { z } from 'zod'
import { ACCOUNT_TYPES } from '@/lib/constants'
import { functionAuthMiddleware } from '@/middleware/auth'
import type { ServerFnResult } from '@/types/types'

const GetInputSchema = z.object({
  type: z.enum(ACCOUNT_TYPES),
})

export const getAccountsByTypeAction = createServerFn({ method: 'GET' })
  .middleware([functionAuthMiddleware])
  .inputValidator(GetInputSchema)
  .handler(async ({ context, data }) => {
    const activeOrgId = context.session?.session.activeOrganizationId
    try {
      if (!activeOrgId) throw new Error('Unauthorized')

      const date = monthStart(new Date())
      const dateString = date.toISOString().split('T')[0] // 'YYYY-MM-DD'

      const cashAccounts = await db
        .select({
          id: account.id,
          organizationId: account.organizationId,
          subtype: account.subtype,
          name: account.name,
          type: account.type,
          currency: account.currency,
          isActive: account.isActive,
          createdAt: account.createdAt,
          // Latest balance entry
          currentBalance: sql<string>`(
            SELECT balance FROM ${accountBalance}
            WHERE ${accountBalance.accountId} = ${account.id}
            ORDER BY ${accountBalance.date} DESC
            LIMIT 1
          )`.mapWith(String),
          // Balance from ~30 days ago
          previousBalance: sql<string>`(
            SELECT balance FROM ${accountBalance}
            WHERE ${accountBalance.accountId} = ${account.id}
            AND ${accountBalance.date} <= ${dateString}
            ORDER BY ${accountBalance.date} DESC
            LIMIT 1
          )`.mapWith(String),
        })
        .from(account)
        .where(and(eq(account.organizationId, activeOrgId), eq(account.type, data.type)))
        .leftJoin(accountBalance, eq(account.id, accountBalance.accountId))
        .groupBy(account.id)

      return { ok: true, data: cashAccounts } satisfies ServerFnResult<typeof cashAccounts>
    } catch (err) {
      console.error('Error fetching cash accounts:', err)
      return { ok: false, error: 'Failed to create account' } satisfies ServerFnResult<never>
    }
  })

export const getAllAccountsWithBalancesAction = createServerFn({ method: 'GET' })
  .middleware([functionAuthMiddleware])
  .handler(async ({ context }) => {
    const activeOrgId = context.session?.session.activeOrganizationId
    try {
      if (!activeOrgId) throw new Error('Unauthorized')

      const date = monthStart(new Date())
      const dateString = date.toISOString().split('T')[0] // 'YYYY-MM-DD'

      const cashAccounts = await db
        .select({
          id: account.id,
          organizationId: account.organizationId,
          subtype: account.subtype,
          name: account.name,
          type: account.type,
          currency: account.currency,
          isActive: account.isActive,
          createdAt: account.createdAt,
          // Latest balance entry
          currentBalance: sql<string>`(
            SELECT balance FROM ${accountBalance}
            WHERE ${accountBalance.accountId} = ${account.id}
            ORDER BY ${accountBalance.date} DESC
            LIMIT 1
          )`.mapWith(String),
          // Balance from ~30 days ago
          previousBalance: sql<string>`(
            SELECT balance FROM ${accountBalance}
            WHERE ${accountBalance.accountId} = ${account.id}
            AND ${accountBalance.date} <= ${dateString}
            ORDER BY ${accountBalance.date} DESC
            LIMIT 1
          )`.mapWith(String),
        })
        .from(account)
        .where(eq(account.organizationId, activeOrgId))
        .leftJoin(accountBalance, eq(account.id, accountBalance.accountId))
        .groupBy(account.id)

      return { ok: true, data: cashAccounts } satisfies ServerFnResult<typeof cashAccounts>
    } catch (err) {
      console.error('Error fetching accounts with balances:', err)
      return {
        ok: false,
        error: 'Failed to fetch accounts with balances',
      } satisfies ServerFnResult<never>
    }
  })

export const getAllAccountsAction = createServerFn({ method: 'GET' })
  .middleware([functionAuthMiddleware])
  .handler(async ({ context }) => {
    const activeOrgId = context.session?.session.activeOrganizationId
    try {
      if (!activeOrgId) throw new Error('Unauthorized')

      const accounts = await db
        .select()
        .from(account)
        .where(eq(account.organizationId, activeOrgId))
        .orderBy(asc(account.type), asc(account.name), desc(account.createdAt))

      return { ok: true, data: accounts } satisfies ServerFnResult<typeof accounts>
    } catch (err) {
      console.error('Error fetching all accounts:', err)
      return { ok: false, error: 'Failed to fetch accounts' } satisfies ServerFnResult<never>
    }
  })
