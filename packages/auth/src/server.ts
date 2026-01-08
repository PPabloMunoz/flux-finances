import { db } from '@flux/db'
import * as schema from '@flux/db/schema'
import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
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
  plugins: [tanstackStartCookies()],
})
