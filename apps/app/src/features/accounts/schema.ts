import { z } from 'zod'
import { CURRENCY_CODES } from '@/lib/constants'
import { AccountTypes } from '@/types/types'

export const NewAccountSchema = z.object({
  type: z.enum(AccountTypes),
  name: z
    .string()
    .min(1, 'Account name is required')
    .max(100, 'Account name must be at most 100 characters'),
  balance: z.coerce.number<string>().min(0, 'Initial balance must be at least 0'),
})

export const EditAccountSchema = NewAccountSchema.extend({
  id: z.ulid(),
  isActive: z.boolean(),
  currency: z.enum(CURRENCY_CODES),
})

export const DeleteAccountSchema = z.object({
  id: z.ulid(),
})
