import { db } from '@flux/db'
import { account, category, transaction } from '@flux/db/schema'
import { createServerFn } from '@tanstack/react-start'
import { desc, eq } from 'drizzle-orm'
import { functionAuthMiddleware } from '@/middleware/auth'
import type { ServerFnResult } from '@/types/types'

export const getTransactionsAction = createServerFn({ method: 'GET' })
  .middleware([functionAuthMiddleware])
  .handler(async ({ context }) => {
    const activeOrgId = context.session?.session.activeOrganizationId
    try {
      if (!activeOrgId) throw new Error('Unauthorized')

      const transactions = await db
        .select({
          id: transaction.id,
          title: transaction.title,
          amount: transaction.amount,
          type: transaction.type,
          date: transaction.date,
          description: transaction.description,
          accountId: account.id,
          accountName: account.name,
          accountType: account.type,
          accountCurrency: account.currency,
          categoryId: category.id,
          categoryName: category.name,
          categoryColor: category.color,
        })
        .from(transaction)
        .innerJoin(account, eq(transaction.accountId, account.id))
        .leftJoin(category, eq(transaction.categoryId, category.id))
        .where(eq(account.organizationId, activeOrgId))
        .orderBy(desc(transaction.date), desc(transaction.createdAt))

      return { ok: true, data: transactions } satisfies ServerFnResult<typeof transactions>
    } catch (err) {
      console.error('Error fetching transactions:', err)
      return { ok: false, error: 'Failed to fetch transactions' } satisfies ServerFnResult<null>
    }
  })
