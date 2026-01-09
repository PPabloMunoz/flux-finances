import { createServerFn } from '@tanstack/react-start'
import { eq, sql } from 'drizzle-orm'
import { db } from '@/lib/db'
import { account, category, transaction } from '@/lib/db/schema'
import { functionAuthMiddleware } from '@/middleware/auth'
import type { ServerFnResult } from '@/types/types'
import { generateCsv } from '../lib/csv'
import type { ImportType } from '../types'

function getFileName(type: ImportType): string {
  const date = new Date().toISOString().split('T')[0]
  return `flux-${type}-${date}.csv`
}

export const exportCategoriesAction = createServerFn({ method: 'POST' })
  .middleware([functionAuthMiddleware])
  .handler(async ({ context }) => {
    try {
      const userId = context.session?.user.id
      if (!userId) throw new Error('Unauthorized')

      const categories = await db
        .select({
          name: category.name,
          type: sql<string>`${category.type}::text`,
          color: category.color,
        })
        .from(category)
        .where(eq(category.userId, userId))

      const csv = generateCsv(categories, ['name', 'type', 'color'])

      return {
        ok: true,
        data: { csv, fileName: getFileName('categories') },
      } satisfies ServerFnResult<{ csv: string; fileName: string }>
    } catch (err) {
      console.error('Error exporting categories:', err)
      return { ok: false, error: 'Failed to export categories' } satisfies ServerFnResult<never>
    }
  })

export const exportAccountsAction = createServerFn({ method: 'POST' })
  .middleware([functionAuthMiddleware])
  .handler(async ({ context }) => {
    try {
      const userId = context.session?.user.id
      if (!userId) throw new Error('Unauthorized')

      const accounts = await db
        .select({
          name: account.name,
          type: sql<string>`${account.type}::text`,
          subtype: account.subtype,
          currency: account.currency,
          isActive: account.isActive,
        })
        .from(account)
        .where(eq(account.userId, userId))

      const csv = generateCsv(accounts, ['name', 'type', 'subtype', 'currency', 'isActive'])

      return {
        ok: true,
        data: { csv, fileName: getFileName('accounts') },
      } satisfies ServerFnResult<{ csv: string; fileName: string }>
    } catch (err) {
      console.error('Error exporting accounts:', err)
      return { ok: false, error: 'Failed to export accounts' } satisfies ServerFnResult<never>
    }
  })

export const exportTransactionsAction = createServerFn({ method: 'POST' })
  .middleware([functionAuthMiddleware])
  .handler(async ({ context }) => {
    try {
      const userId = context.session?.user.id
      if (!userId) throw new Error('Unauthorized')

      const transactionsData = await db
        .select({
          date: transaction.date,
          title: transaction.title,
          amount: transaction.amount,
          type: transaction.type,
          description: transaction.description,
          isPending: transaction.isPending,
          accountName: account.name,
          categoryName: category.name,
        })
        .from(transaction)
        .innerJoin(account, eq(transaction.accountId, account.id))
        .leftJoin(category, eq(transaction.categoryId, category.id))
        .where(eq(account.userId, userId))
        .orderBy(transaction.date)

      const transactions = transactionsData.map((tx) => ({
        date: String(tx.date),
        title: tx.title,
        amount: tx.amount.toString(),
        type: tx.type,
        category: tx.categoryName ?? '',
        account: tx.accountName,
        description: tx.description,
        isPending: tx.isPending.toString(),
      }))

      const csv = generateCsv(transactions, [
        'date',
        'title',
        'amount',
        'type',
        'category',
        'account',
        'description',
        'isPending',
      ])

      return {
        ok: true,
        data: { csv, fileName: getFileName('transactions') },
      } satisfies ServerFnResult<{ csv: string; fileName: string }>
    } catch (err) {
      console.error('Error exporting transactions:', err)
      return { ok: false, error: 'Failed to export transactions' } satisfies ServerFnResult<never>
    }
  })
