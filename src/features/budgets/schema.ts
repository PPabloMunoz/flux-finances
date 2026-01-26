import { z } from 'zod'

export type TBudgetWithSpending = {
  id: string
  amount: number
  createdAt: Date
  updatedAt: Date
  categoryId: string
  categoryName: string
  categoryColor: string
  spent: number
  remaining: number
  percentageUsed: number
}

export const NewBudgetSchema = z.object({
  categoryId: z.ulid('Invalid category ID'),
  amount: z.coerce.number<string>().min(0.01, 'Budget amount must be greater than 0'),
})

export const EditBudgetSchema = z.object({
  id: z.ulid('Invalid budget ID'),
  categoryId: z.ulid('Invalid category ID'),
  amount: z.coerce.number<string>().min(0.01, 'Budget amount must be greater than 0'),
})

export const DeleteBudgetSchema = z.object({
  id: z.ulid('Invalid budget ID'),
})
