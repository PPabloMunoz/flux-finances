import { monthStart } from '@formkit/tempo'
import { createServerFn } from '@tanstack/react-start'
import { and, asc, desc, eq, sql } from 'drizzle-orm'
import { z } from 'zod'
import { ACCOUNT_TYPES } from '@/lib/constants'
import { db } from '@/lib/db'
import { account, accountBalance } from '@/lib/db/schema'
import { logger } from '@/lib/logger'
import { functionAuthMiddleware } from '@/middleware/auth'
import type { ServerFnResult } from '@/types/types'

const GetInputSchema = z.object({
  type: z.enum(ACCOUNT_TYPES),
})

export const getAccountsByTypeAction = createServerFn({ method: 'GET' })
  .middleware([functionAuthMiddleware])
  .inputValidator(GetInputSchema)
  .handler(async ({ context, data }) => {
    const userId = context.session?.user.id
    try {
      if (!userId) throw new Error('Unauthorized')

      const date = monthStart(new Date())
      const dateString = date.toISOString().split('T')[0]

      const cashAccounts = await db
        .select({
          id: account.id,
          userId: account.userId,
          subtype: account.subtype,
          name: account.name,
          type: account.type,
          currency: account.currency,
          isActive: account.isActive,
          createdAt: account.createdAt,
          currentBalance: sql<number>`(
            SELECT balance FROM ${accountBalance}
            WHERE ${accountBalance.accountId} = ${account.id}
            ORDER BY ${accountBalance.date} DESC
            LIMIT 1
          )`.mapWith(Number),
          previousBalance: sql<number>`(
            SELECT balance FROM ${accountBalance}
            WHERE ${accountBalance.accountId} = ${account.id}
            AND ${accountBalance.date} <= ${dateString}
            ORDER BY ${accountBalance.date} DESC
            LIMIT 1
          )`.mapWith(Number),
        })
        .from(account)
        .where(and(eq(account.userId, userId), eq(account.type, data.type)))
        .leftJoin(accountBalance, eq(account.id, accountBalance.accountId))
        .groupBy(account.id)
        .orderBy(asc(account.name), desc(account.createdAt))
        .then((res) =>
          res.map((acc) => ({
            ...acc,
            currentBalance: (acc.currentBalance ?? 0) / 100,
            previousBalance: (acc.previousBalance ?? 0) / 100,
          }))
        )

      return { ok: true, data: cashAccounts } satisfies ServerFnResult<typeof cashAccounts>
    } catch (err) {
      logger.error({ err, operation: 'get_cash_accounts' }, 'Failed to fetch cash accounts')
      return { ok: false, error: 'Failed to create account' } satisfies ServerFnResult<never>
    }
  })

export const getAllAccountsAction = createServerFn({ method: 'GET' })
  .middleware([functionAuthMiddleware])
  .handler(async ({ context }) => {
    const userId = context.session?.user.id
    try {
      if (!userId) throw new Error('Unauthorized')

      const accounts = await db
        .select()
        .from(account)
        .where(eq(account.userId, userId))
        .orderBy(asc(account.type), asc(account.name), desc(account.createdAt))

      return { ok: true, data: accounts } satisfies ServerFnResult<typeof accounts>
    } catch (err) {
      logger.error({ err, operation: 'get_all_accounts' }, 'Failed to fetch all accounts')
      return { ok: false, error: 'Failed to fetch accounts' } satisfies ServerFnResult<never>
    }
  })
