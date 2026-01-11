import { checkout, polar, portal, webhooks } from '@polar-sh/better-auth'
import { Polar } from '@polar-sh/sdk'
import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { twoFactor } from 'better-auth/plugins'
import { tanstackStartCookies } from 'better-auth/tanstack-start'
import { createSubscription, deleteSubscription } from '@/features/subscription/actions'
import { db } from '@/lib/db'
import * as schema from '@/lib/db/schema'
import { IS_CLOUD } from '../constants'
import { logger } from '../logger'

const {
  GOOGLE_CLIENT_ID: googleClientId,
  GOOGLE_CLIENT_SECRET: googleClientSecret,
  GITHUB_CLIENT_ID: githubClientId,
  GITHUB_CLIENT_SECRET: githubClientSecret,
} = process.env

const polarClient = new Polar({
  accessToken: process.env.POLAR_ACCESS_TOKEN,
  server: process.env.POLAR_MODE === 'production' ? 'production' : 'sandbox',
})

export const auth = betterAuth({
  trustedOrigins: ['http://localhost:3001'],
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: {
      ...schema,
      account: schema.accountProvider,
    },
  }),
  emailAndPassword: {
    enabled: !IS_CLOUD,
    sendResetPassword: async ({ user }, _request) => {
      logger.info(
        { event: 'password_reset_email', email: user.email },
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
  socialProviders: {
    google: {
      enabled: true,
      clientId: googleClientId ?? '',
      clientSecret: googleClientSecret ?? '',
    },
    github: {
      enabled: true,
      clientId: githubClientId ?? '',
      clientSecret: githubClientSecret ?? '',
    },
  },
  appName: 'Flux Finances',
  plugins: [
    twoFactor({ issuer: 'Flux Finances' }),
    polar({
      client: polarClient,
      createCustomerOnSignUp: true,
      use: [
        checkout({
          products: [{ productId: process.env.POLAR_PRODUCT_ID || '', slug: 'cloud-pro-version' }],
          successUrl: process.env.POLAR_SUCCESS_URL,
          authenticatedUsersOnly: true,
        }),
        portal({ returnUrl: process.env.POLAR_PORTAL_RETURN_URL }),
        webhooks({
          secret: process.env.POLAR_WEBHOOK_SECRET || '',
          onSubscriptionCreated: async ({ data }) => {
            logger.info(
              {
                event: 'subscription_created',
                subscriptionId: data.id,
                customerId: data.customer.id,
              },
              'Subscription created'
            )
            const subId = data.id
            const customerId = data.customer.id
            const externalId = data.customer.externalId
            if (!externalId) throw new Error('No externalId found on customer')

            await createSubscription(subId, customerId, externalId, data.status)
            logger.info(
              { event: 'subscription_linked', subscriptionId: subId, userId: externalId },
              'Subscription linked to user'
            )
          },
          onSubscriptionRevoked: async ({ data }) => {
            logger.info(
              { event: 'subscription_revoked', subscriptionId: data.id },
              'Subscription revoked'
            )
            const subId = data.id

            await deleteSubscription(subId)
            logger.info(
              { event: 'subscription_removed', subscriptionId: subId },
              'Subscription removed from database'
            )
          },
        }),
      ],
    }),
    tanstackStartCookies(),
  ],
})
