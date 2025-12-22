import { relations } from 'drizzle-orm'
import {
  boolean,
  date,
  index,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core'
import { ulid } from 'ulid'

export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').default(false).notNull(),
  image: text('image'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
})

export const session = pgTable(
  'session',
  {
    id: text('id').primaryKey(),
    expiresAt: timestamp('expires_at').notNull(),
    token: text('token').notNull().unique(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
  },
  (table) => [index('session_userId_idx').on(table.userId)]
)

export const account = pgTable(
  'account',
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
    accessTokenExpiresAt: timestamp('access_token_expires_at'),
    refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
    scope: text('scope'),
    password: text('password'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index('account_userId_idx').on(table.userId)]
)

export const verification = pgTable(
  'verification',
  {
    id: text('id').primaryKey(),
    identifier: text('identifier').notNull(),
    value: text('value').notNull(),
    expiresAt: timestamp('expires_at').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
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

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}))

// ==============================================================================
// ============================= Finish Auth Schema =============================
// ==============================================================================

// --- ENUMS ---

export const accountTypeEnum = pgEnum('account_type', [
  'depository',
  'credit',
  'investment',
  'loan',
  'other_asset',
  'other_liability',
])

export const transactionTypeEnum = pgEnum('transaction_type', ['inflow', 'outflow'])

// --- TABLES ---

export const households = pgTable('households', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => ulid()),
  name: text('name').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const users = pgTable('users', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => ulid()),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  householdId: text('household_id').references(() => households.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const institutions = pgTable('institutions', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => ulid()),
  name: text('name').notNull(),
  providerId: text('provider_id'), // Plaid/Teller ID
  logoUrl: text('logo_url'),
})

export const accounts = pgTable('accounts', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => ulid()),
  userId: text('user_id')
    .references(() => users.id)
    .notNull(),
  institutionId: text('institution_id').references(() => institutions.id),
  name: text('name').notNull(),
  type: accountTypeEnum('type').notNull(),
  subtype: text('subtype'),
  currency: text('currency').default('USD').notNull(),
  currentBalance: numeric('current_balance', { precision: 19, scale: 4 }).default('0').notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const categories = pgTable('categories', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => ulid()),
  householdId: text('household_id')
    .references(() => households.id)
    .notNull(),
  name: text('name').notNull(),
  icon: text('icon'),
  color: text('color'),
  parentId: text('parent_id'),
})

export const merchants = pgTable('merchants', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => ulid()),
  name: text('name').notNull().unique(),
  logoUrl: text('logo_url'),
})

export const tags = pgTable('tags', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => ulid()),
  householdId: text('household_id')
    .references(() => households.id)
    .notNull(),
  name: text('name').notNull(),
})

export const transactions = pgTable('transactions', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => ulid()),
  accountId: text('account_id')
    .references(() => accounts.id)
    .notNull(),
  categoryId: text('category_id').references(() => categories.id),
  merchantId: text('merchant_id').references(() => merchants.id),
  date: date('date').notNull(),
  amount: numeric('amount', { precision: 19, scale: 4 }).notNull(),
  type: transactionTypeEnum('type').notNull(),
  description: text('description'),
  isPending: boolean('is_pending').default(false).notNull(),
  providerId: text('provider_id'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const transactionTags = pgTable(
  'transaction_tags',
  {
    transactionId: text('transaction_id')
      .references(() => transactions.id)
      .notNull(),
    tagId: text('tag_id')
      .references(() => tags.id)
      .notNull(),
  },
  (t) => [uniqueIndex('transaction_tag_pk').on(t.transactionId, t.tagId)]
)

// --- INVESTMENT TABLES ---

export const securities = pgTable('securities', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => ulid()),
  ticker: text('ticker').notNull().unique(),
  name: text('name').notNull(),
  type: text('type'), // stock, etf, crypto
  currency: text('currency').default('USD').notNull(),
})

export const securityPrices = pgTable(
  'security_prices',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => ulid()),
    securityId: text('security_id')
      .references(() => securities.id)
      .notNull(),
    date: date('date').notNull(),
    price: numeric('price', { precision: 19, scale: 4 }).notNull(),
  },
  (t) => [uniqueIndex('sec_price_date_idx').on(t.securityId, t.date)]
)

export const holdings = pgTable('holdings', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => ulid()),
  accountId: text('account_id')
    .references(() => accounts.id)
    .notNull(),
  securityId: text('security_id')
    .references(() => securities.id)
    .notNull(),
  quantity: numeric('quantity', { precision: 19, scale: 6 }).notNull(),
})

// For assets like real estate or cars that don't have a ticker
export const valuations = pgTable('valuations', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => ulid()),
  accountId: text('account_id')
    .references(() => accounts.id)
    .notNull(),
  date: date('date').notNull(),
  amount: numeric('amount', { precision: 19, scale: 4 }).notNull(),
})

export const accountBalances = pgTable(
  'account_balances',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => ulid()),
    accountId: text('account_id')
      .references(() => accounts.id)
      .notNull(),
    date: date('date').notNull(),
    balance: numeric('balance', { precision: 19, scale: 4 }).notNull(),
  },
  (t) => [uniqueIndex('account_date_idx').on(t.accountId, t.date)]
)

export const exchangeRates = pgTable('exchange_rates', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => ulid()),
  fromCurrency: text('from_currency').notNull(),
  toCurrency: text('to_currency').notNull(),
  date: date('date').notNull(),
  rate: numeric('rate', { precision: 19, scale: 6 }).notNull(),
})

// --- RELATIONS --- (Summary)

export const accountsRelations = relations(accounts, ({ many }) => ({
  transactions: many(transactions),
  holdings: many(holdings),
  balances: many(accountBalances),
  valuations: many(valuations),
}))

export const securityRelations = relations(securities, ({ many }) => ({
  prices: many(securityPrices),
  holdings: many(holdings),
}))
