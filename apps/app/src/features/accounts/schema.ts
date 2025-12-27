import { z } from 'zod'
import { AccountTypes } from '@/types/types'

export const NewAccountSchema = z.object({
  type: z.enum(AccountTypes),
  name: z
    .string()
    .min(1, 'Account name is required')
    .max(100, 'Account name must be at most 100 characters'),
  initialBalance: z.coerce.number<string>().min(0, 'Initial balance must be at least 0'),
})
