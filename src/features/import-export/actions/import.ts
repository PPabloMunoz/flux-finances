import { createServerFn } from '@tanstack/react-start'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { account, category, transaction } from '@/lib/db/schema'
import { functionAuthMiddleware } from '@/middleware/auth'
import type { ServerFnResult } from '@/types/types'
import { parseCategoryCsv, parseAccountCsv, parseTransactionCsv } from '../lib/csv'
import {
  validateCategoryRow,
  validateAccountRow,
  validateTransactionRow,
  parseDate,
  formatDateForDb,
} from '../lib/validators'
import type { ValidatedRow } from '../types'
import { PreviewImportSchema, ProcessImportSchema } from '../schemas'

interface PreviewResponse {
  totalRows: number
  validRows: number
  invalidRows: number
  errors: Array<{ row: number; message: string }>
  canImport: boolean
  accountsFound?: Map<string, string>
  categoriesFound?: Map<string, string>
}

export const previewImportAction = createServerFn({ method: 'POST' })
  .middleware([functionAuthMiddleware])
  .inputValidator(PreviewImportSchema)
  .handler(async ({ context, data }) => {
    try {
      const userId = context.session?.user.id
      if (!userId) throw new Error('Unauthorized')

      const { type, csvContent } = data

      let rows: ValidatedRow[] = []
      const accountsFound = new Map<string, string>()
      let categoriesFound = new Map<string, string>()

      if (type === 'categories') {
        const rawRows = parseCategoryCsv(csvContent)
        rows = rawRows.map((row, index) => validateCategoryRow(row, index))
      } else if (type === 'accounts') {
        const rawRows = parseAccountCsv(csvContent)
        rows = rawRows.map((row, index) => validateAccountRow(row, index))
      } else if (type === 'transactions') {
        const accounts = await db
          .select({ id: account.id, name: account.name })
          .from(account)
          .where(eq(account.userId, userId))

        for (const acc of accounts) {
          accountsFound.set(acc.name.toLowerCase(), acc.id)
        }

        const accountNames = new Set(accountsFound.keys())
        const categoryNames = new Map(categoriesFound)

        const rawRows = parseTransactionCsv(csvContent)
        rows = rawRows.map((row, index) =>
          validateTransactionRow(row, index, accountNames, categoryNames)
        )
      }

      const invalidCount = rows.filter((r) => !r.isValid).length

      const errors: Array<{ row: number; message: string }> = []
      for (const row of rows) {
        if (!row.isValid) {
          for (const error of row.errors) {
            errors.push({ row: row.rowIndex + 1, message: error })
          }
        }
      }

      console.log('Preview import results:', {
        totalRows: rows.length,
        validRows: rows.length - invalidCount,
        invalidRows: invalidCount,
        errors,
        canImport: invalidCount === 0,
      })

      return {
        ok: true,
        data: {
          totalRows: rows.length,
          validRows: rows.length - invalidCount,
          invalidRows: invalidCount,
          errors,
          canImport: invalidCount === 0,
          accountsFound: type === 'transactions' ? accountsFound : undefined,
          categoriesFound: type === 'transactions' ? categoriesFound : undefined,
        },
      } satisfies ServerFnResult<PreviewResponse>
    } catch (err) {
      console.error('Error previewing import:', err)
      return { ok: false, error: 'Failed to preview import' } satisfies ServerFnResult<never>
    }
  })

export const processImportAction = createServerFn({ method: 'POST' })
  .middleware([functionAuthMiddleware])
  .inputValidator(ProcessImportSchema)
  .handler(async ({ context, data }) => {
    try {
      const userId = context.session?.user.id
      if (!userId) throw new Error('Unauthorized')

      const { type, rows: validRows } = data

      const filteredRows = validRows.filter((r) => r.isValid)

      if (filteredRows.length === 0) {
        return {
          ok: true,
          data: { imported: 0 },
        } satisfies ServerFnResult<{ imported: number }>
      }

      let imported = 0

      await db.transaction(async (tx) => {
        if (type === 'categories') {
          for (const row of filteredRows) {
            const rowData = row.data as { name: string; type: string; color?: string }
            const existing = await tx
              .select({ id: category.id })
              .from(category)
              .where(eq(category.name, rowData.name))
              .limit(1)

            if (existing.length === 0) {
              await tx.insert(category).values({
                name: rowData.name,
                type: rowData.type as 'inflow' | 'outflow',
                color: rowData.color ?? null,
                userId,
              })
              imported++
            }
          }
        } else if (type === 'accounts') {
          for (const row of filteredRows) {
            const rowData = row.data as {
              name: string
              type: string
              subtype?: string
              isActive?: boolean
            }
            const existing = await tx
              .select({ id: account.id })
              .from(account)
              .where(eq(account.name, rowData.name))
              .limit(1)

            if (existing.length === 0) {
              await tx.insert(account).values({
                name: rowData.name,
                type: rowData.type as 'cash' | 'investment' | 'liability' | 'other_asset',
                subtype: rowData.subtype ?? null,
                isActive: rowData.isActive ?? true,
                userId,
              })
              imported++
            }
          }
        } else if (type === 'transactions') {
          const accounts = await tx
            .select({ id: account.id, name: account.name })
            .from(account)
            .where(eq(account.userId, userId))

          const accountMap = new Map(accounts.map((a) => [a.name.toLowerCase(), a.id]))

          const categories = await tx
            .select({ id: category.id, name: category.name })
            .from(category)
            .where(eq(category.userId, userId))

          const categoryMap = new Map(categories.map((c) => [c.name.toLowerCase(), c.id]))

          for (const row of filteredRows) {
            const rowData = row.data as {
              date: string
              title: string
              amount: string
              type: string
              category?: string
              account?: string
              description?: string
              isPending?: boolean
            }

            const accountName = rowData.account ?? ''
            const categoryName = rowData.category ?? ''

            const accountId = accountMap.get(accountName.toLowerCase())
            const categoryId = categoryName
              ? (categoryMap.get(categoryName.toLowerCase()) ?? null)
              : null

            if (!accountId) {
              throw new Error(`Account '${accountName}' not found`)
            }

            const parsedDate = parseDate(rowData.date)
            if (!parsedDate) {
              throw new Error(`Invalid date '${rowData.date}'`)
            }

            await tx.insert(transaction).values({
              accountId,
              categoryId,
              date: formatDateForDb(parsedDate),
              amount: rowData.amount.toString(),
              type: rowData.type as 'inflow' | 'outflow',
              title: rowData.title,
              description: rowData.description ?? '',
              isPending: rowData.isPending ?? false,
              isInvestmentContribution: false,
            })
            imported++
          }
        }
      })

      return {
        ok: true,
        data: { imported },
      } satisfies ServerFnResult<{ imported: number }>
    } catch (err) {
      console.error('Error processing import:', err)
      return {
        ok: false,
        error: err instanceof Error ? err.message : 'Failed to process import',
      } satisfies ServerFnResult<never>
    }
  })
