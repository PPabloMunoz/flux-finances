import { createServerFn } from '@tanstack/react-start'
import { desc, eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { accountBalance, transaction } from '@/lib/db/schema'
import { functionAuthMiddleware } from '@/middleware/auth'
import type { ServerFnResult } from '@/types/types'
import {
  DeleteTransactionSchema,
  ImportTransactionSchema,
  NewTransactionSchema,
  TransferSchema,
  UpdateTransactionSchema,
} from './schema'

export const newTransactionAction = createServerFn({ method: 'POST' })
  .middleware([functionAuthMiddleware])
  .inputValidator(NewTransactionSchema)
  .handler(async ({ data }) => {
    try {
      await db.transaction(async (tx) => {
        const [newTransaction] = await tx
          .insert(transaction)
          .values({
            title: data.title,
            accountId: data.accountId,
            categoryId: data.categoryId || null,
            amount: data.amount * 100,
            type: data.type,
            date: new Date(data.date).toISOString().split('T')[0],
            description: data.description,
          })
          .returning()

        const [lastEntry] = await tx
          .select()
          .from(accountBalance)
          .where(eq(accountBalance.accountId, data.accountId))
          .orderBy(desc(accountBalance.date))
          .limit(1)

        if (!newTransaction || !lastEntry) tx.rollback()

        const previousBalance = lastEntry.balance / 100
        const newTotalBalance =
          previousBalance + (data.type === 'inflow' ? data.amount : -data.amount)

        const [balance] = await tx
          .insert(accountBalance)
          .values({
            accountId: data.accountId,
            date: new Date().toISOString().split('T')[0],
            balance: newTotalBalance * 100,
          })
          .onConflictDoUpdate({
            target: [accountBalance.accountId, accountBalance.date],
            set: { balance: newTotalBalance * 100 },
          })
          .returning({ id: accountBalance.id })

        if (!balance) tx.rollback()
      })

      return { ok: true, data: null } satisfies ServerFnResult<null>
    } catch (err) {
      console.error('Error creating transaction:', err)
      return { ok: false, error: 'Failed to create transaction' } satisfies ServerFnResult<null>
    }
  })

export const createTransferAction = createServerFn({ method: 'POST' })
  .middleware([functionAuthMiddleware])
  .inputValidator(TransferSchema)
  .handler(async ({ data }) => {
    try {
      await db.transaction(async (tx) => {
        const [outflow] = await tx
          .insert(transaction)
          .values({
            accountId: data.fromAccountId,
            amount: data.amount * 100,
            type: 'outflow',
            title: 'Transfer',
            description: '',
            date: new Date(data.date).toISOString().split('T')[0],
          })
          .returning({ id: transaction.id })

        const [inflow] = await tx
          .insert(transaction)
          .values({
            accountId: data.toAccountId,
            amount: data.amount * 100,
            type: 'inflow',
            title: 'Transfer',
            description: '',
            date: new Date(data.date).toISOString().split('T')[0],
            transferId: outflow.id,
          })
          .returning({ id: transaction.id })

        if (!outflow || !inflow) tx.rollback()

        await tx
          .update(transaction)
          .set({ transferId: inflow.id })
          .where(eq(transaction.id, outflow.id))

        const [fromLastEntry] = await tx
          .select()
          .from(accountBalance)
          .where(eq(accountBalance.accountId, data.fromAccountId))
          .orderBy(desc(accountBalance.date))
          .limit(1)

        const [toLastEntry] = await tx
          .select()
          .from(accountBalance)
          .where(eq(accountBalance.accountId, data.toAccountId))
          .orderBy(desc(accountBalance.date))
          .limit(1)

        if (!fromLastEntry || !toLastEntry) tx.rollback()

        const fromNewBalance = fromLastEntry.balance / 100 - data.amount
        const toNewBalance = toLastEntry.balance / 100 + data.amount

        await Promise.all([
          tx
            .insert(accountBalance)
            .values({
              accountId: data.fromAccountId,
              date: new Date().toISOString().split('T')[0],
              balance: fromNewBalance * 100,
            })
            .onConflictDoUpdate({
              target: [accountBalance.accountId, accountBalance.date],
              set: { balance: fromNewBalance * 100 },
            }),
          tx
            .insert(accountBalance)
            .values({
              accountId: data.toAccountId,
              date: new Date().toISOString().split('T')[0],
              balance: toNewBalance * 100,
            })
            .onConflictDoUpdate({
              target: [accountBalance.accountId, accountBalance.date],
              set: { balance: toNewBalance * 100 },
            }),
        ])
      })

      return { ok: true, data: null } satisfies ServerFnResult<null>
    } catch (err) {
      console.error('Error creating transfer:', err)
      return { ok: false, error: 'Failed to create transfer' } satisfies ServerFnResult<null>
    }
  })

export const updateTransactionAction = createServerFn({ method: 'POST' })
  .middleware([functionAuthMiddleware])
  .inputValidator(UpdateTransactionSchema)
  .handler(async ({ data }) => {
    try {
      await db.transaction(async (tx) => {
        const [oldTx] = await tx
          .select()
          .from(transaction)
          .where(eq(transaction.id, data.id))
          .limit(1)

        if (!oldTx) tx.rollback()

        const [newTx] = await tx
          .update(transaction)
          .set({
            title: data.title,
            accountId: data.accountId,
            categoryId: data.categoryId || null,
            amount: data.amount * 100,
            date: new Date(data.date).toISOString().split('T')[0],
            description: data.description,
          })
          .where(eq(transaction.id, data.id))
          .returning()

        if (!newTx) tx.rollback()

        const oldAccountId = oldTx.accountId
        const newAccountId = newTx.accountId

        if (oldAccountId !== newAccountId) {
          const [oldAccEntry] = await tx
            .select()
            .from(accountBalance)
            .where(eq(accountBalance.accountId, oldAccountId))
            .orderBy(desc(accountBalance.date))
            .limit(1)

          if (oldAccEntry) {
            const oldAmount = oldTx.amount / 100
            const reversalAdjustment = oldTx.type === 'inflow' ? -oldAmount : oldAmount
            const updatedOldAccBalance = oldAccEntry.balance / 100 + reversalAdjustment

            await tx
              .insert(accountBalance)
              .values({
                accountId: oldAccountId,
                date: new Date().toISOString().split('T')[0],
                balance: updatedOldAccBalance * 100,
              })
              .onConflictDoUpdate({
                target: [accountBalance.accountId, accountBalance.date],
                set: { balance: updatedOldAccBalance * 100 },
              })
          }

          const [newAccEntry] = await tx
            .select()
            .from(accountBalance)
            .where(eq(accountBalance.accountId, newAccountId))
            .orderBy(desc(accountBalance.date))
            .limit(1)

          if (!newAccEntry) tx.rollback()

          const newAmount = newTx.amount / 100
          const applyAdjustment = newTx.type === 'inflow' ? newAmount : -newAmount
          const updatedNewAccBalance = newAccEntry.balance / 100 + applyAdjustment

          await tx
            .insert(accountBalance)
            .values({
              accountId: newAccountId,
              date: new Date().toISOString().split('T')[0],
              balance: updatedNewAccBalance * 100,
            })
            .onConflictDoUpdate({
              target: [accountBalance.accountId, accountBalance.date],
              set: { balance: updatedNewAccBalance * 100 },
            })
        } else {
          const [lastEntry] = await tx
            .select()
            .from(accountBalance)
            .where(eq(accountBalance.accountId, newAccountId))
            .orderBy(desc(accountBalance.date))
            .limit(1)

          if (!lastEntry) tx.rollback()

          const oldAmountParsed = oldTx.amount / 100
          const newAmountParsed = newTx.amount / 100

          const oldImpact = oldTx.type === 'inflow' ? oldAmountParsed : -oldAmountParsed
          const newImpact = newTx.type === 'inflow' ? newAmountParsed : -newAmountParsed
          const diff = newImpact - oldImpact

          const finalBalance = lastEntry.balance / 100 + diff

          await tx
            .insert(accountBalance)
            .values({
              accountId: newAccountId,
              date: new Date().toISOString().split('T')[0],
              balance: finalBalance * 100,
            })
            .onConflictDoUpdate({
              target: [accountBalance.accountId, accountBalance.date],
              set: { balance: finalBalance * 100 },
            })
        }
      })

      return { ok: true, data: null } satisfies ServerFnResult<null>
    } catch (err) {
      console.error('Error updating transaction:', err)
      return { ok: false, error: 'Failed to update transaction' } satisfies ServerFnResult<null>
    }
  })

export const deleteTransactionAction = createServerFn({ method: 'POST' })
  .middleware([functionAuthMiddleware])
  .inputValidator(DeleteTransactionSchema)
  .handler(async ({ data }) => {
    try {
      await db.transaction(async (tx) => {
        const [txToDelete] = await tx
          .select()
          .from(transaction)
          .where(eq(transaction.id, data.id))
          .limit(1)

        if (!txToDelete) tx.rollback()

        let pairedTx = null
        if (txToDelete.transferId) {
          const [result] = await tx
            .select()
            .from(transaction)
            .where(eq(transaction.id, txToDelete.transferId))
            .limit(1)
          pairedTx = result
        } else {
          const [result] = await tx
            .select()
            .from(transaction)
            .where(eq(transaction.transferId, txToDelete.id))
            .limit(1)
          pairedTx = result
        }

        await tx.delete(transaction).where(eq(transaction.id, txToDelete.id))

        if (pairedTx) {
          await tx.delete(transaction).where(eq(transaction.id, pairedTx.id))

          const [pairedLastEntry] = await tx
            .select()
            .from(accountBalance)
            .where(eq(accountBalance.accountId, pairedTx.accountId))
            .orderBy(desc(accountBalance.date))
            .limit(1)

          if (pairedLastEntry) {
            const pairedAmount = pairedTx.amount / 100
            const pairedNewBalance =
              pairedTx.type === 'inflow'
                ? pairedLastEntry.balance / 100 - pairedAmount
                : pairedLastEntry.balance / 100 + pairedAmount

            await tx
              .insert(accountBalance)
              .values({
                accountId: pairedTx.accountId,
                date: new Date().toISOString().split('T')[0],
                balance: pairedNewBalance * 100,
              })
              .onConflictDoUpdate({
                target: [accountBalance.accountId, accountBalance.date],
                set: { balance: pairedNewBalance * 100 },
              })
          }
        }

        const [lastEntry] = await tx
          .select()
          .from(accountBalance)
          .where(eq(accountBalance.accountId, txToDelete.accountId))
          .orderBy(desc(accountBalance.date))
          .limit(1)

        if (!lastEntry) tx.rollback()

        const previousBalance = lastEntry.balance / 100
        const newTotalBalance =
          txToDelete.type === 'inflow'
            ? previousBalance - txToDelete.amount / 100
            : previousBalance + txToDelete.amount / 100

        const [balance] = await tx
          .insert(accountBalance)
          .values({
            accountId: txToDelete.accountId,
            date: new Date().toISOString().split('T')[0],
            balance: newTotalBalance * 100,
          })
          .onConflictDoUpdate({
            target: [accountBalance.accountId, accountBalance.date],
            set: { balance: newTotalBalance * 100 },
          })
          .returning({ id: accountBalance.id })

        if (!balance) tx.rollback()
      })

      return { ok: true, data: null } satisfies ServerFnResult<null>
    } catch (err) {
      console.error('Error deleting transaction:', err)
      return { ok: false, error: 'Failed to delete transaction' } satisfies ServerFnResult<null>
    }
  })

export const importTransactionsAction = createServerFn({ method: 'POST' })
  .middleware([functionAuthMiddleware])
  .inputValidator(ImportTransactionSchema)
  .handler(async ({ data }) => {
    try {
      const lines = data.csv.split('\n').filter((line: string) => line.trim())
      if (lines.length < 2) {
        return {
          ok: false,
          error: 'CSV file is empty or has no data rows',
        } satisfies ServerFnResult<null>
      }

      const headerLine = lines[0].toLowerCase().replace(/"/g, '').replace(/\s/g, '')
      const expectedHeaders = [
        'id',
        'account_id',
        'category_id',
        'date',
        'amount',
        'type',
        'title',
        'description',
        'created_at',
      ]
      const headers = headerLine.split(',')
      const hasAllHeaders = expectedHeaders.every((h: string) => headers.includes(h))

      if (!hasAllHeaders) {
        return {
          ok: false,
          error:
            'Invalid CSV headers. Required: id, account_id, category_id, date, amount, type, title, description, created_at',
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
        if (values.length < 8) {
          results.errors.push(`Row ${i + 1}: Invalid number of columns`)
          continue
        }

        const id = values[headerMap.id]
        const accountId = values[headerMap.account_id]
        const categoryId = values[headerMap.category_id] || null
        const date = values[headerMap.date]
        const amountStr = values[headerMap.amount]
        const type = values[headerMap.type]
        const title = values[headerMap.title]
        const description = values[headerMap.description] || ''
        // const createdAt = values[headerMap['created_at']] || new Date().toISOString()

        const amount = Number.parseFloat(amountStr)
        if (Number.isNaN(amount) || amount <= 0) {
          results.errors.push(`Row ${i + 1}: Invalid amount "${amountStr}"`)
          continue
        }

        if (type !== 'inflow' && type !== 'outflow') {
          results.errors.push(
            `Row ${i + 1}: Invalid type "${type}" (must be 'inflow' or 'outflow')`
          )
          continue
        }

        try {
          const [newTx] = await db
            .insert(transaction)
            .values({
              id,
              accountId,
              categoryId: categoryId || null,
              date: new Date(date).toISOString().split('T')[0],
              amount: Math.round(amount * 100),
              type,
              title,
              description,
              isPending: false,
              isInvestmentContribution: false,
              // createdAt: new Date(createdAt).getMilliseconds(),
            } as never)
            .onConflictDoNothing()
            .returning({ id: transaction.id })

          if (newTx) {
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
      console.error('Error importing transactions:', err)
      return { ok: false, error: 'Failed to import transactions' } satisfies ServerFnResult<null>
    }
  })
