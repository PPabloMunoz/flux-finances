import { db } from '@flux/db'
import * as schema from '@flux/db/schema'
import { checkout, polar, portal, webhooks } from '@polar-sh/better-auth'
import { Polar } from '@polar-sh/sdk'
import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { tanstackStartCookies } from 'better-auth/tanstack-start'
import {
  createSubscription,
  deleteSubscription,
} from '../../../apps/app/src/features/subscription/actions'

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
    enabled: true,
    sendResetPassword: async ({ user, url, token }, _request) => {
      console.log(`Simulatting sending email to ${user.email}...`)
      console.log(`URL sended: ${url}`)
      console.log(`Token: ${token}`)
    },
    onPasswordReset: async ({ user }, _request) => {
      console.log('INFO: TODO SEND EMAIL - PASSWORD HAS BEEN RESET')
      console.log(`Password for user ${user.email} has been reset.`)
    },
  },
  emailVerification: {
    sendVerificationEmail: async (data) => {
      console.log('Send verification email to:', data.user.email)
      console.log('Verification link:', data.url)
      console.log('Verification Token:', data.token)
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
  plugins: [
    polar({
      client: polarClient,
      createCustomerOnSignUp: true,
      use: [
        checkout({
          products: [{ productId: process.env.POLAR_PRODUCT_ID || '', slug: 'cloud-pro-version' }],
          successUrl: process.env.POLAR_SUCCESS_URL,
          authenticatedUsersOnly: true,
        }),
        portal(),
        webhooks({
          secret: process.env.POLAR_WEBHOOK_SECRET || '',
          onSubscriptionCreated: async ({ data }) => {
            console.log('Subscription created:', data.id)
            const subId = data.id
            const customerId = data.customer.id
            const externalId = data.customer.externalId
            if (!externalId) throw new Error('No externalId found on customer')

            console.log(`Linking subscription ${subId} to user ${externalId}`)
            await createSubscription(subId, customerId, externalId, data.status)
            console.log('Subscription linked to user successfully')
          },
          onSubscriptionRevoked: async ({ data }) => {
            console.log('Subscription revoked:', data.id)
            const subId = data.id

            console.log(`Removing subscription ${subId} from database`)
            await deleteSubscription(subId)
            console.log('Subscription removed successfully')
          },
        }),
      ],
    }),
    tanstackStartCookies(),
  ],
})
