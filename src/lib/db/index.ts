import { createClient } from '@libsql/client'
import { drizzle } from 'drizzle-orm/libsql'
import * as schema from './schema'

const DB_URL = process.env.DATABASE_URL
if (!DB_URL) {
  throw new Error('DATABASE_URL is not defined in environment variables')
}

const client = createClient({ url: DB_URL.startsWith('file:') ? DB_URL : `file:${DB_URL}` })
await client.execute('PRAGMA foreign_keys = ON;')
await client.execute('PRAGMA journal_mode = WAL;')
await client.execute('PRAGMA synchronous = NORMAL;')
export const db = drizzle({ client, schema })
