import { db } from '@flux/db'
import { accountBalance, transaction } from '@flux/db/schema'
import { createServerFn } from '@tanstack/react-start'
import { desc, eq } from 'drizzle-orm'
import { functionAuthMiddleware } from '@/middleware/auth'
import type { ServerFnResult } from '@/types/types'
import { DeleteTransactionSchema, NewTransactionSchema, UpdateTransactionSchema } from './schema'

export const newTransactionAction = createServerFn({ method: 'POST' })
  .middleware([functionAuthMiddleware])
  .inputValidator(NewTransactionSchema)
  .handler(async ({ context, data }) => {
    const activeOrgId = context.session?.session.activeOrganizationId
    try {
      if (!activeOrgId) throw new Error('Unauthorized')

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
            description: data.description || null,
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
        const newTotalBalance = previousBalance + data.amount

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

      // Here you would typically insert the new transaction into your database
      return { ok: true, data: null } satisfies ServerFnResult<null>
    } catch (err) {
      console.error('Error creating transaction:', err)
      return { ok: false, error: 'Failed to create transaction' } satisfies ServerFnResult<null>
    }
  })

export const updateTransactionAction = createServerFn({ method: 'POST' })
  .middleware([functionAuthMiddleware])
  .inputValidator(UpdateTransactionSchema)
  .handler(async ({ context, data }) => {
    const activeOrgId = context.session?.session.activeOrganizationId
    try {
      if (!activeOrgId) throw new Error('Unauthorized')

      await db.transaction(async (tx) => {
        const [oldTransaction] = await tx
          .select()
          .from(transaction)
          .where(eq(transaction.id, data.transactionId))
          .limit(1)

        if (!oldTransaction) tx.rollback()

        const [updatedTransaction] = await tx
          .update(transaction)
          .set({
            title: data.title,
            accountId: data.accountId,
            categoryId: data.categoryId || null,
            amount: data.amount.toString(),
            type: data.type,
            date: new Date(data.date).toISOString(),
            description: data.description || null,
          })
          .where(eq(transaction.id, data.transactionId))
          .returning()

        if (!updatedTransaction) tx.rollback()

        const [lastEntry] = await tx
          .select()
          .from(accountBalance)
          .where(eq(accountBalance.accountId, updatedTransaction.accountId))
          .orderBy(desc(accountBalance.date))
          .limit(1)

        if (!lastEntry) tx.rollback()

        const previousBalance = Number.parseFloat(lastEntry.balance)
        const amountDifference =
          (updatedTransaction.type === 'inflow' ? 1 : -1) *
            Number.parseFloat(updatedTransaction.amount) -
          (oldTransaction.type === 'inflow' ? 1 : -1) * Number.parseFloat(oldTransaction.amount)
        const newTotalBalance = previousBalance + amountDifference

        const [balance] = await tx
          .insert(accountBalance)
          .values({
            accountId: updatedTransaction.accountId,
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
      console.error('Error updating transaction:', err)
      return { ok: false, error: 'Failed to update transaction' } satisfies ServerFnResult<null>
    }
  })

export const deleteTransactionAction = createServerFn({ method: 'POST' })
  .middleware([functionAuthMiddleware])
  .inputValidator(DeleteTransactionSchema)
  .handler(async ({ context, data }) => {
    const activeOrgId = context.session?.session.activeOrganizationId
    try {
      if (!activeOrgId) throw new Error('Unauthorized')

      await db.transaction(async (tx) => {
        const [deletedTransaction] = await tx
          .delete(transaction)
          .where(eq(transaction.id, data.transactionId))
          .returning()

        if (!deletedTransaction) tx.rollback()

        const [lastEntry] = await tx
          .select()
          .from(accountBalance)
          .where(eq(accountBalance.accountId, deletedTransaction.accountId))
          .orderBy(desc(accountBalance.date))
          .limit(1)

        if (!lastEntry) tx.rollback()

        const previousBalance = Number.parseFloat(lastEntry.balance)
        const newTotalBalance =
          deletedTransaction.type === 'inflow'
            ? previousBalance - Number.parseFloat(deletedTransaction.amount)
            : previousBalance + Number.parseFloat(deletedTransaction.amount)

        const [balance] = await tx
          .insert(accountBalance)
          .values({
            accountId: deletedTransaction.accountId,
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
