import { relations, sql } from 'drizzle-orm'
import {
  type AnySQLiteColumn,
  index,
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from 'drizzle-orm/sqlite-core'
import { ulid } from 'ulid'

const sqliteBoolean = (name: string) => integer(name, { mode: 'boolean' })
const sqliteTimestamp = (name: string) => integer(name, { mode: 'timestamp' })

export const user = sqliteTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: integer('email_verified', { mode: 'boolean' }).default(false).notNull(),
  image: text('image'),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
    .$onUpdate(() => new Date())
    .notNull(),
})

export const session = sqliteTable(
  'session',
  {
    id: text('id').primaryKey(),
    expiresAt: integer('expires_at', { mode: 'timestamp_ms' }).notNull(),
    token: text('token').notNull().unique(),
    createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
      .$onUpdate(() => new Date())
      .notNull(),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
  },
  (table) => [index('session_userId_idx').on(table.userId)]
)

export const accountProvider = sqliteTable(
  'account_provider',
  {
    id: text('id').primaryKey(),
    accountId: text('account_id').notNull(),
    providerId: text('provider_id').notNull(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    accessToken: text('access_token'),
    refreshToken: text('refresh_token'),
    idToken: text('id_token'),
    accessTokenExpiresAt: integer('access_token_expires_at', {
      mode: 'timestamp_ms',
    }),
    refreshTokenExpiresAt: integer('refresh_token_expires_at', {
      mode: 'timestamp_ms',
    }),
    scope: text('scope'),
    password: text('password'),
    createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index('account_userId_idx').on(table.userId)]
)

export const verification = sqliteTable(
  'verification',
  {
    id: text('id').primaryKey(),
    identifier: text('identifier').notNull(),
    value: text('value').notNull(),
    expiresAt: integer('expires_at', { mode: 'timestamp_ms' }).notNull(),
    createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index('verification_identifier_idx').on(table.identifier)]
)

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
}))

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}))

export const accountProviderRelations = relations(accountProvider, ({ one }) => ({
  user: one(user, {
    fields: [accountProvider.userId],
    references: [user.id],
  }),
}))

export const currencyEnum = [
  'USD',
  'EUR',
  'GBP',
  'JPY',
  'AUD',
  'CAD',
  'CHF',
  'CNY',
  'SEK',
  'NZD',
] as const
export const accountTypeEnum = ['cash', 'investment', 'liability', 'other_asset'] as const
export const transactionTypeEnum = ['inflow', 'outflow'] as const
export const categoryTypeEnum = ['inflow', 'outflow'] as const

export const userPreferences = sqliteTable('user_preferences', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => ulid()),
  userId: text('user_id')
    .references(() => user.id, { onDelete: 'cascade' })
    .notNull(),
  currency: text('currency').$type<(typeof currencyEnum)[number]>().default('EUR').notNull(),
  region: text('region').default('ES').notNull(),
  dateFormat: text('date_format').default('DD/MM/YYYY').notNull(),
  timezone: text('timezone').default('Europe/Madrid').notNull(),
  emailSummaries: sqliteBoolean('email_summaries').default(true).notNull(),
  budgetAlerts: sqliteBoolean('budget_alerts').default(true).notNull(),
  transactionReminders: sqliteBoolean('transaction_reminders').default(false).notNull(),
})

export const account = sqliteTable('account', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => ulid()),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  type: text('type').$type<(typeof accountTypeEnum)[number]>().notNull(),
  subtype: text('subtype'),
  currency: text('currency').$type<(typeof currencyEnum)[number]>().default('EUR').notNull(),
  isActive: sqliteBoolean('is_active').default(true).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp_ms' })
    .notNull()
    .default(sql`(unixepoch() * 1000)`),
})

export const category = sqliteTable('category', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => ulid()),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  type: text('type').$type<(typeof categoryTypeEnum)[number]>().notNull(),
  color: text('color').notNull(),
  parentId: text('parent_id'),
})

export const budget = sqliteTable(
  'budget',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => ulid()),
    categoryId: text('category_id')
      .references(() => category.id, { onDelete: 'cascade' })
      .notNull(),
    amount: integer('amount').notNull(),
    createdAt: integer('created_at', { mode: 'timestamp_ms' })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
      .$onUpdate(() => sql`(unixepoch() * 1000)`)
      .default(sql`(unixepoch() * 1000)`)
      .notNull(),
  },
  (t) => [uniqueIndex('budget_category_idx').on(t.categoryId)]
)

export const transaction = sqliteTable('transaction', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => ulid()),
  accountId: text('account_id')
    .references(() => account.id, { onDelete: 'cascade' })
    .notNull(),
  categoryId: text('category_id').references(() => category.id, { onDelete: 'set null' }),
  date: text('date').notNull(),
  amount: integer('amount').notNull(),
  type: text('type').$type<(typeof transactionTypeEnum)[number]>().notNull(),
  title: text('title').notNull(),
  description: text('description').notNull().default(''),
  isPending: sqliteBoolean('is_pending').default(false).notNull(),
  isInvestmentContribution: sqliteBoolean('is_investment_contribution').default(false).notNull(),
  transferId: text('transfer_id').references((): AnySQLiteColumn => transaction.id, {
    onDelete: 'set null',
  }),
  createdAt: sqliteTimestamp('created_at').default(sql`(unixepoch() * 1000)`).notNull(),
})

export const accountBalance = sqliteTable(
  'account_balance',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => ulid()),
    accountId: text('account_id')
      .references(() => account.id, { onDelete: 'cascade' })
      .notNull(),
    date: text('date').notNull(),
    balance: integer('balance').notNull(),
  },
  (t) => [uniqueIndex('account_date_idx').on(t.accountId, t.date)]
)

export const accountRelations = relations(account, ({ one, many }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
  transactions: many(transaction),
  balances: many(accountBalance),
  accountBalances: many(accountBalance),
}))

export const categoryRelations = relations(category, ({ one, many }) => ({
  user: one(user, {
    fields: [category.userId],
    references: [user.id],
  }),
  parent: one(category, {
    fields: [category.parentId],
    references: [category.id],
    relationName: 'category_parent',
  }),
  subcategories: many(category, {
    relationName: 'category_parent',
  }),
  budgets: many(budget),
}))

export const budgetRelations = relations(budget, ({ one }) => ({
  category: one(category, {
    fields: [budget.categoryId],
    references: [category.id],
  }),
}))

export const transactionRelations = relations(transaction, ({ one }) => ({
  account: one(account, {
    fields: [transaction.accountId],
    references: [account.id],
  }),
  category: one(category, {
    fields: [transaction.categoryId],
    references: [category.id],
  }),
}))

export const accountBalanceRelations = relations(accountBalance, ({ one }) => ({
  account: one(account, {
    fields: [accountBalance.accountId],
    references: [account.id],
  }),
}))
