import type { InferSelectModel } from 'drizzle-orm'
import { z } from 'zod'
import { ACCOUNT_TYPES, CURRENCY_CODES } from '@/lib/constants'
import type { account } from '@/lib/db/schema'

export type TAccount = InferSelectModel<typeof account>

export const NewAccountSchema = z.object({
  type: z.enum(ACCOUNT_TYPES),
  name: z
    .string()
    .min(1, 'Account name is required')
    .max(100, 'Account name must be at most 100 characters'),
  balance: z.coerce.number<string>(),
})

export const EditAccountSchema = NewAccountSchema.extend({
  id: z.ulid(),
  isActive: z.boolean(),
  currency: z.enum(CURRENCY_CODES),
})

export const DeleteAccountSchema = z.object({
  id: z.ulid(),
})
