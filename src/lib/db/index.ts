import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { logger } from '../logger'
import * as schema from './schema'

const DB_URL = process.env.DATABASE_URL
if (!DB_URL) {
  throw new Error('DATABASE_URL is not defined in environment variables')
}

// biome-ignore lint/complexity/noBannedTypes: This is required by the postgres library
const clientConfig: postgres.Options<{}> = {
  max: process.env.NODE_ENV === 'production' ? 20 : 1,
  ssl: 'prefer',
  idle_timeout: 20,
  connect_timeout: 10,
}

// Prevent multiple instances in development (Singleton)
const globalForDb = global as unknown as {
  conn: postgres.Sql | undefined
}

const conn = globalForDb.conn ?? postgres(DB_URL, clientConfig)
if (process.env.NODE_ENV !== 'production') globalForDb.conn = conn

export const db = drizzle(conn, { schema })

// Close the connection pool when the process exits
process.on('SIGTERM', async () => {
  logger.info({ operation: 'db_shutdown' }, 'Closing database connection...')
  await conn.end()
  process.exit(0)
})
