import type { InferSelectModel } from 'drizzle-orm'
import { z } from 'zod'
import { CATEGORY_TYPES } from '@/lib/constants'
import type { category } from '@/lib/db/schema'

export type TCategory = InferSelectModel<typeof category>

const CategoryType = z.enum(CATEGORY_TYPES)

export const GetCategoriesSchema = z.object({
  type: CategoryType.optional(),
})

export const CreateCategorySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  color: z.string(),
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

export const ImportCategorySchema = z.object({
  csv: z.string(),
})
