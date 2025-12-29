import type { category } from '@flux/db/schema'
import type { InferSelectModel } from 'drizzle-orm'
import { z } from 'zod'
import { CATEGORY_TYPES } from '@/lib/constants'

export type TCategory = InferSelectModel<typeof category>

export const UpdateHouseholdInputValidator = z.object({
  id: z.ulid(),
  newName: z.string().min(2, 'Household name must be at least 2 characters long'),
})

const CategoryType = z.enum(CATEGORY_TYPES)

export const CreateCategorySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  color: z.string().optional(),
  type: CategoryType,
})

export const UpdateCategorySchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Name is required'),
  color: z.string().optional(),
  type: CategoryType,
})

export const DeleteCategorySchema = z.object({
  id: z.string(),
})
