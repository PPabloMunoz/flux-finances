import { db } from '@flux/db'
import * as schema from '@flux/db/schema'
import { checkout, polar, portal, webhooks } from '@polar-sh/better-auth'
import { Polar } from '@polar-sh/sdk'
import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { tanstackStartCookies } from 'better-auth/tanstack-start'

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
      getCustomerCreateParams: async ({ user }) => ({
        metadata: {
          external_id: user.id ?? 'NO ID',
        },
      }),
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
          },
          onSubscriptionRevoked: async ({ data }) => {
            console.log('Subscription revoked:', data.id)
          },
          onSubscriptionCanceled: async ({ data }) => {
            console.log('Subscription canceled:', data.id)
          },
        }),
      ],
    }),
    tanstackStartCookies(),
  ],
})
