import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { tanstackStartCookies } from 'better-auth/tanstack-start'
import { db } from '@/lib/db'
import * as schema from '@/lib/db/schema'
import { logger } from '../logger'

const { VITE_PUBLIC_URL, TRUSTED_ORIGINS } = process.env
if (!VITE_PUBLIC_URL) throw new Error('VITE_PUBLIC_URL is not defined')
if (!TRUSTED_ORIGINS) throw new Error('TRUSTED_ORIGINS is not defined')

export const auth = betterAuth({
  trustedOrigins: [TRUSTED_ORIGINS],
  database: drizzleAdapter(db, {
    provider: 'sqlite',
    schema: { ...schema, account: schema.accountProvider },
  }),
  user: {
    deleteUser: {
      enabled: true,
      beforeDelete: async () => {
        logger.info({ event: 'user_deletion' }, 'User deletion initiated')
      },
    },
  },
  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, url }, _request) => {
      logger.info(
        { event: 'password_reset_email', email: user.email, url },
        'Simulating password reset email'
      )
    },
    onPasswordReset: async ({ user }, _request) => {
      logger.info(
        { event: 'password_reset_completed', email: user.email },
        'Password reset completed'
      )
    },
  },
  emailVerification: {
    sendVerificationEmail: async (data) => {
      logger.info(
        { event: 'verification_email', email: data.user.email },
        'Verification email sent'
      )
    },
  },
  appName: 'Flux Finances',
  plugins: [tanstackStartCookies()],
})
