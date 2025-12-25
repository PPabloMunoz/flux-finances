import { db } from '@flux/db'
import * as schema from '@flux/db/schema'
import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { organization } from 'better-auth/plugins'
import { tanstackStartCookies } from 'better-auth/tanstack-start'

const {
  GOOGLE_CLIENT_ID: googleClientId,
  GOOGLE_CLIENT_SECRET: googleClientSecret,
  GITHUB_CLIENT_ID: githubClientId,
  GITHUB_CLIENT_SECRET: githubClientSecret,
} = process.env

export const auth = betterAuth({
  trustedOrigins: ['http://localhost:3001'],
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: {
      ...schema,
      account: schema.accountProvider,
    },
  }),
  user: {
    additionalFields: {
      householdId: {
        type: 'string',
        fieldName: 'household_id',
        required: false,
        input: false,
        returned: true,
      },
    },
  },
  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, url, token }, _request) => {
      // TODO: Create sending email function with resend
      console.log(`Simulatting sending email to ${user.email}...`)
      console.log(`URL sended: ${url}`)
      console.log(`Token: ${token}`)
    },
    onPasswordReset: async ({ user }, _request) => {
      // TODO: Create sending email function with resend
      console.log('INFO: TODO SEND EMAIL - PASSWORD HAS BEEN RESET')
      console.log(`Password for user ${user.email} has been reset.`)
    },
  },
  emailVerification: {
    sendVerificationEmail: async (data) => {
      // TODO: Create sending email function with resend
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
  plugins: [organization(), tanstackStartCookies()], // make sure tanstackStartCookies is the last plugin in the array
})
