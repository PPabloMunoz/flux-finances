import * as schema from './schema'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

const DB_URL = process.env.DATABASE_URL
if (!DB_URL) {
  throw new Error('DATABASE_URL is not defined in environment variables')
}

const queryClient = postgres(DB_URL)
export const db = drizzle({ client: queryClient, schema })
