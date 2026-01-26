import { z } from 'zod'
import { COUNTRY_CODES, CURRENCY_CODES, DATE_FORMAT_CODES, TIMEZONE_CODES } from '@/lib/constants'

export const LoginSchema = z.object({
  email: z.email({ message: 'Invalid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters long' }),
})

export const SignupSchema = z
  .object({
    firstName: z.string().min(1, { message: 'First name is required' }),
    lastName: z.string().min(1, { message: 'Last name is required' }),
    email: z.email({ message: 'Invalid email address' }),
    password: z.string().min(6, { message: 'Password must be at least 6 characters long' }),
    confirmPassword: z.string().min(6, {
      message: 'Confirm Password must be at least 6 characters long',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
  })

export const ForgotPasswordSchema = z.object({
  email: z.email({ message: 'Invalid email address' }),
})

export const ResetPasswordSchema = z
  .object({
    password: z.string().min(6, { message: 'Password must be at least 6 characters long' }),
    confirmPassword: z.string().min(6, {
      message: 'Confirm Password must be at least 6 characters long',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
  })

const CurrencySchema = z.enum(CURRENCY_CODES)
const RegionSchema = z.enum(COUNTRY_CODES)
const DateFormatSchema = z.enum(DATE_FORMAT_CODES)
const TimezoneSchema = z.enum(TIMEZONE_CODES)

export const UserPreferencesSchema = z.object({
  id: z.ulid(),
  userId: z.string(),
  currency: CurrencySchema,
  region: RegionSchema,
  dateFormat: DateFormatSchema,
  timezone: TimezoneSchema,
  emailSummaries: z.boolean(),
  budgetAlerts: z.boolean(),
  transactionReminders: z.boolean(),
})

export const UpdateUserPreferencesSchema = z.object({
  currency: CurrencySchema,
  region: RegionSchema,
  dateFormat: DateFormatSchema,
  timezone: TimezoneSchema,
})

export const UpdateNotificationPreferencesSchema = z.object({
  emailSummaries: z.boolean(),
  budgetAlerts: z.boolean(),
  transactionReminders: z.boolean(),
})

export const ChangePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(6),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
  })
