import { createServerFn } from '@tanstack/react-start'
import { desc, eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { accountBalance, transaction } from '@/lib/db/schema'
import { functionAuthMiddleware } from '@/middleware/auth'
import type { ServerFnResult } from '@/types/types'
import {
  DeleteTransactionSchema,
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
            amount: data.amount.toString(),
            type: data.type,
            date: new Date(data.date).toISOString(),
            description: data.description,
          })
          .returning()

        if (!newTransaction) tx.rollback()

        const [lastEntry] = await tx
          .select()
          .from(accountBalance)
          .where(eq(accountBalance.accountId, data.accountId))
          .orderBy(desc(accountBalance.date))
          .limit(1)

        if (!lastEntry) tx.rollback()

        const previousBalance = Number.parseFloat(lastEntry.balance)
        const newTotalBalance =
          previousBalance + (data.type === 'inflow' ? data.amount : -data.amount)

        const [balance] = await tx
          .insert(accountBalance)
          .values({
            accountId: data.accountId,
            date: new Date().toISOString(),
            balance: newTotalBalance.toString(),
          })
          .onConflictDoUpdate({
            target: [accountBalance.accountId, accountBalance.date],
            set: { balance: newTotalBalance.toString() },
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
            amount: data.amount.toString(),
            type: 'outflow',
            title: 'Transfer',
            description: '',
            date: new Date(data.date).toISOString(),
          })
          .returning({ id: transaction.id })

        const [inflow] = await tx
          .insert(transaction)
          .values({
            accountId: data.toAccountId,
            amount: data.amount.toString(),
            type: 'inflow',
            title: 'Transfer',
            description: '',
            date: new Date(data.date).toISOString(),
            transferId: outflow.id,
          })
          .returning({ id: transaction.id })

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

        if (!fromLastEntry) tx.rollback()

        const fromNewBalance = Number.parseFloat(fromLastEntry.balance) - data.amount

        await tx
          .insert(accountBalance)
          .values({
            accountId: data.fromAccountId,
            date: new Date().toISOString(),
            balance: fromNewBalance.toString(),
          })
          .onConflictDoUpdate({
            target: [accountBalance.accountId, accountBalance.date],
            set: { balance: fromNewBalance.toString() },
          })

        const [toLastEntry] = await tx
          .select()
          .from(accountBalance)
          .where(eq(accountBalance.accountId, data.toAccountId))
          .orderBy(desc(accountBalance.date))
          .limit(1)

        if (!toLastEntry) tx.rollback()

        const toNewBalance = Number.parseFloat(toLastEntry.balance) + data.amount

        await tx
          .insert(accountBalance)
          .values({
            accountId: data.toAccountId,
            date: new Date().toISOString(),
            balance: toNewBalance.toString(),
          })
          .onConflictDoUpdate({
            target: [accountBalance.accountId, accountBalance.date],
            set: { balance: toNewBalance.toString() },
          })
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
            amount: data.amount.toString(),
            type: data.type,
            date: new Date(data.date).toISOString(),
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
            const oldAmount = Number.parseFloat(oldTx.amount)
            const reversalAdjustment = oldTx.type === 'inflow' ? -oldAmount : oldAmount
            const updatedOldAccBalance = Number.parseFloat(oldAccEntry.balance) + reversalAdjustment

            await tx
              .insert(accountBalance)
              .values({
                accountId: oldAccountId,
                date: new Date().toISOString(),
                balance: updatedOldAccBalance.toString(),
              })
              .onConflictDoUpdate({
                target: [accountBalance.accountId, accountBalance.date],
                set: { balance: updatedOldAccBalance.toString() },
              })
          }

          const [newAccEntry] = await tx
            .select()
            .from(accountBalance)
            .where(eq(accountBalance.accountId, newAccountId))
            .orderBy(desc(accountBalance.date))
            .limit(1)

          if (!newAccEntry) tx.rollback()

          const newAmount = Number.parseFloat(newTx.amount)
          const applyAdjustment = newTx.type === 'inflow' ? newAmount : -newAmount
          const updatedNewAccBalance = Number.parseFloat(newAccEntry.balance) + applyAdjustment

          await tx
            .insert(accountBalance)
            .values({
              accountId: newAccountId,
              date: new Date().toISOString(),
              balance: updatedNewAccBalance.toString(),
            })
            .onConflictDoUpdate({
              target: [accountBalance.accountId, accountBalance.date],
              set: { balance: updatedNewAccBalance.toString() },
            })
        } else {
          const [lastEntry] = await tx
            .select()
            .from(accountBalance)
            .where(eq(accountBalance.accountId, newAccountId))
            .orderBy(desc(accountBalance.date))
            .limit(1)

          if (!lastEntry) tx.rollback()

          const oldAmountParsed = Number.parseFloat(oldTx.amount)
          const newAmountParsed = Number.parseFloat(newTx.amount)

          const oldImpact = oldTx.type === 'inflow' ? oldAmountParsed : -oldAmountParsed
          const newImpact = newTx.type === 'inflow' ? newAmountParsed : -newAmountParsed
          const diff = newImpact - oldImpact

          const finalBalance = Number.parseFloat(lastEntry.balance) + diff

          await tx
            .insert(accountBalance)
            .values({
              accountId: newAccountId,
              date: new Date().toISOString(),
              balance: finalBalance.toString(),
            })
            .onConflictDoUpdate({
              target: [accountBalance.accountId, accountBalance.date],
              set: { balance: finalBalance.toString() },
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
            const pairedAmount = Number.parseFloat(pairedTx.amount)
            const pairedNewBalance =
              pairedTx.type === 'inflow'
                ? Number.parseFloat(pairedLastEntry.balance) - pairedAmount
                : Number.parseFloat(pairedLastEntry.balance) + pairedAmount

            await tx
              .insert(accountBalance)
              .values({
                accountId: pairedTx.accountId,
                date: new Date().toISOString(),
                balance: pairedNewBalance.toString(),
              })
              .onConflictDoUpdate({
                target: [accountBalance.accountId, accountBalance.date],
                set: { balance: pairedNewBalance.toString() },
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

        const previousBalance = Number.parseFloat(lastEntry.balance)
        const newTotalBalance =
          txToDelete.type === 'inflow'
            ? previousBalance - Number.parseFloat(txToDelete.amount)
            : previousBalance + Number.parseFloat(txToDelete.amount)

        const [balance] = await tx
          .insert(accountBalance)
          .values({
            accountId: txToDelete.accountId,
            date: new Date().toISOString(),
            balance: newTotalBalance.toString(),
          })
          .onConflictDoUpdate({
            target: [accountBalance.accountId, accountBalance.date],
            set: { balance: newTotalBalance.toString() },
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
