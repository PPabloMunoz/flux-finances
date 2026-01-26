import { createServerFn } from '@tanstack/react-start'
import { and, eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { account, accountBalance } from '@/lib/db/schema'
import { logger } from '@/lib/logger'
import { functionAuthMiddleware } from '@/middleware/auth'
import type { ServerFnResult } from '@/types/types'
import { DeleteAccountSchema, EditAccountSchema, NewAccountSchema } from './schema'

export const newAccountAction = createServerFn({ method: 'POST' })
  .middleware([functionAuthMiddleware])
  .inputValidator(NewAccountSchema)
  .handler(async ({ data, context }) => {
    const userId = context.session?.user.id
    try {
      if (!userId) throw new Error('Unauthorized')

      const newAccount = await db
        .insert(account)
        .values({
          name: data.name,
          type: data.type,
          userId: userId,
        })
        .returning()
        .then((accounts) => accounts[0])

      if (!newAccount) {
        throw new Error('Failed to create account')
      }

      const [newBalance] = await db
        .insert(accountBalance)
        .values({
          accountId: newAccount.id,
          date: new Date().toISOString().split('T')[0],
          balance: data.balance * 100,
        })
        .returning({ id: accountBalance.id })

      if (!newBalance) {
        await db.delete(account).where(eq(account.id, newAccount.id))
        throw new Error('Failed to create initial balance')
      }

      return { ok: true, data: newAccount } satisfies ServerFnResult<typeof newAccount>
    } catch (err) {
      logger.error({ err, operation: 'create_account' }, 'Failed to create new account')
      return { ok: false, error: 'Failed to create account' } satisfies ServerFnResult<never>
    }
  })

export const updateAccountAction = createServerFn({ method: 'POST' })
  .middleware([functionAuthMiddleware])
  .inputValidator(EditAccountSchema)
  .handler(async ({ data, context }) => {
    const userId = context.session?.user.id
    try {
      if (!userId) throw new Error('Unauthorized')

      await db.transaction(async (tx) => {
        const [updatedAccount] = await tx
          .update(account)
          .set({
            name: data.name,
            type: data.type,
            currency: data.currency,
          })
          .where(and(eq(account.id, data.id), eq(account.userId, userId)))
          .returning()

        if (!updatedAccount) tx.rollback()

        const [balance] = await tx
          .insert(accountBalance)
          .values({
            accountId: data.id,
            date: new Date().toISOString().split('T')[0],
            balance: data.balance * 100,
          })
          .onConflictDoUpdate({
            target: [accountBalance.accountId, accountBalance.date],
            set: { balance: data.balance * 100 },
          })
          .returning({ id: accountBalance.id })

        if (!balance) tx.rollback()
      })

      return { ok: true, data: null } satisfies ServerFnResult<null>
    } catch (err) {
      logger.error({ err, operation: 'update_account' }, 'Failed to update account')
      return { ok: false, error: 'Failed to update account' } satisfies ServerFnResult<never>
    }
  })

export const deleteAccountAction = createServerFn({ method: 'POST' })
  .middleware([functionAuthMiddleware])
  .inputValidator(DeleteAccountSchema)
  .handler(async ({ data, context }) => {
    const userId = context.session?.user.id
    try {
      if (!userId) throw new Error('Unauthorized')

      await db.transaction(async (tx) => {
        const deletedAccount = await tx
          .delete(account)
          .where(and(eq(account.id, data.id), eq(account.userId, userId)))
          .returning()

        if (deletedAccount.length === 0) tx.rollback()
      })

      return { ok: true, data: null } satisfies ServerFnResult<null>
    } catch (err) {
      logger.error({ err, operation: 'delete_account' }, 'Failed to delete account')
      return { ok: false, error: 'Failed to delete account' } satisfies ServerFnResult<never>
    }
  })
