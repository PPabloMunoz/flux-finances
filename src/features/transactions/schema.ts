import { z } from 'zod'
import { TRANSACTIONS_TYPES } from '@/lib/constants'

export const NewTransactionSchema = z.object({
  title: z.string().min(1, 'Name is required').max(100, 'Name must be at most 100 characters'),
  accountId: z.ulid({ error: 'Select an account' }),
  categoryId: z.ulid().or(z.literal('')).nullable(),
  date: z
    .string()
    .refine((date) => !Number.isNaN(Date.parse(date)), { message: 'Invalid date format' }),
  amount: z.coerce
    .number<string>()
    .positive('Amount must be a positive number')
    .min(0.01, 'Amount must be at least 0.01'),
  type: z.enum(TRANSACTIONS_TYPES),
  description: z.string().max(255, 'Description must be at most 255 characters'),
})

export const UpdateTransactionSchema = NewTransactionSchema.extend({
  id: z.ulid({ error: 'Invalid transaction ID' }),
  transferId: z.string().nullable(),
})

export const DeleteTransactionSchema = z.object({
  id: z.ulid({ error: 'Invalid transaction ID' }),
})

export const TransferSchema = z
  .object({
    fromAccountId: z.ulid({ error: 'Select source account' }),
    toAccountId: z.ulid({ error: 'Select destination account' }),
    amount: z.coerce.number<string>().positive().min(0.01, 'Amount must be at least 0.01'),
    date: z
      .string()
      .refine((date) => !Number.isNaN(Date.parse(date)), { message: 'Invalid date format' }),
  })
  .refine((data) => data.fromAccountId !== data.toAccountId, {
    message: 'Source and destination accounts must be different',
    path: ['toAccountId'],
  })

export const ImportTransactionSchema = z.object({
  csv: z.string(),
})
