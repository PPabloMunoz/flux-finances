import { z } from 'zod'

export const CategoryImportSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  type: z.enum(['inflow', 'outflow']),
  color: z.string().optional().nullable(),
})

export const AccountImportSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  type: z.enum(['cash', 'investment', 'liability', 'other_asset']),
  subtype: z.string().optional().nullable(),
  currency: z.string().optional().default('EUR'),
  isActive: z.boolean().optional().default(true),
})

export const TransactionImportSchema = z.object({
  date: z.string().min(1, 'Date is required'),
  title: z.string().min(1, 'Title is required'),
  amount: z.number().positive('Amount must be positive'),
  type: z.enum(['inflow', 'outflow']),
  categoryId: z.string().optional().nullable(),
  accountId: z.string().min(1, 'Account is required'),
  description: z.string().optional().default(''),
  isPending: z.boolean().optional().default(false),
  isInvestmentContribution: z.boolean().optional().default(false),
})

export const PreviewImportSchema = z.object({
  type: z.enum(['categories', 'accounts', 'transactions']),
  csvContent: z.string().min(1, 'CSV content is required'),
})

export const ProcessImportSchema = z.object({
  type: z.enum(['categories', 'accounts', 'transactions']),
  rows: z.array(
    z.object({
      rowIndex: z.number(),
      isValid: z.boolean(),
      data: z.record(z.string(), z.unknown()),
      errors: z.array(z.string()),
    })
  ),
})
