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
    activeOrganizationId: text('active_organization_id'),
  },
  (table) => [index('session_userId_idx').on(table.userId)]
)

export const accountProvider = pgTable(
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

// Household
export const organization = pgTable(
  'organization',
  {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    slug: text('slug').notNull().unique(),
    logo: text('logo'),
    createdAt: timestamp('created_at').notNull(),
    metadata: text('metadata'),
  },
  (table) => [uniqueIndex('organization_slug_uidx').on(table.slug)]
)

// Member of household (organization)
export const member = pgTable(
  'member',
  {
    id: text('id').primaryKey(),
    organizationId: text('organization_id')
      .notNull()
      .references(() => organization.id, { onDelete: 'cascade' }),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    role: text('role').default('member').notNull(),
    createdAt: timestamp('created_at').notNull(),
  },
  (table) => [
    index('member_organizationId_idx').on(table.organizationId),
    index('member_userId_idx').on(table.userId),
  ]
)

export const invitation = pgTable(
  'invitation',
  {
    id: text('id').primaryKey(),
    organizationId: text('organization_id')
      .notNull()
      .references(() => organization.id, { onDelete: 'cascade' }),
    email: text('email').notNull(),
    role: text('role'),
    status: text('status').default('pending').notNull(),
    expiresAt: timestamp('expires_at').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    inviterId: text('inviter_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
  },
  (table) => [
    index('invitation_organizationId_idx').on(table.organizationId),
    index('invitation_email_idx').on(table.email),
  ]
)

export const userRelations = relations(user, ({ one, many }) => ({
  sessions: many(session),
  accountProviders: many(accountProvider),
  member: one(member),
  invitations: many(invitation),
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

export const organizationRelations = relations(organization, ({ many }) => ({
  members: many(member),
  invitations: many(invitation),
}))

export const memberRelations = relations(member, ({ one }) => ({
  organization: one(organization, {
    fields: [member.organizationId],
    references: [organization.id],
  }),
  user: one(user, {
    fields: [member.userId],
    references: [user.id],
  }),
}))

export const invitationRelations = relations(invitation, ({ one }) => ({
  organization: one(organization, {
    fields: [invitation.organizationId],
    references: [organization.id],
  }),
  user: one(user, {
    fields: [invitation.inviterId],
    references: [user.id],
  }),
}))

// ==============================================================================
// ============================= Finish Auth Schema =============================
// ==============================================================================

export const userPreferences = pgTable('user_preferences', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => ulid()),
  userId: text('user_id')
    .references(() => user.id)
    .notNull(),
  currency: text('currency').default('EUR').notNull(),
  dateFormat: text('date_format').default('DD/MM/YYYY').notNull(),
  timezone: text('timezone').default('UTC').notNull(),
})

export const institution = pgTable('institution', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => ulid()),
  name: text('name').notNull(),
  providerId: text('provider_id'), // Plaid/Teller ID
  logoUrl: text('logo_url'),
})

export const account = pgTable('account', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => ulid()),
  userId: text('user_id')
    .references(() => user.id)
    .notNull(),
  institutionId: text('institution_id').references(() => institution.id),
  name: text('name').notNull(),
  type: accountTypeEnum('type').notNull(),
  subtype: text('subtype'),
  currency: text('currency').default('USD').notNull(),
  currentBalance: numeric('current_balance', { precision: 19, scale: 4 }).default('0').notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const category = pgTable('category', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => ulid()),
  organizationId: text('organization_id')
    .references(() => organization.id)
    .notNull(),
  name: text('name').notNull(),
  icon: text('icon'),
  color: text('color'),
  parentId: text('parent_id'),
})

export const merchant = pgTable('merchant', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => ulid()),
  name: text('name').notNull().unique(),
  logoUrl: text('logo_url'),
})

export const tag = pgTable('tag', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => ulid()),
  organizationId: text('organization_id')
    .references(() => organization.id)
    .notNull(),
  name: text('name').notNull(),
})

export const transaction = pgTable('transaction', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => ulid()),
  accountId: text('account_id')
    .references(() => account.id)
    .notNull(),
  categoryId: text('category_id').references(() => category.id),
  merchantId: text('merchant_id').references(() => merchant.id),
  date: date('date').notNull(),
  amount: numeric('amount', { precision: 19, scale: 4 }).notNull(),
  type: transactionTypeEnum('type').notNull(),
  description: text('description'),
  isPending: boolean('is_pending').default(false).notNull(),
  providerId: text('provider_id'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const transactionTag = pgTable(
  'transaction_tag',
  {
    transactionId: text('transaction_id')
      .references(() => transaction.id)
      .notNull(),
    tagId: text('tag_id')
      .references(() => tag.id)
      .notNull(),
  },
  (t) => [uniqueIndex('transaction_tag_pk').on(t.transactionId, t.tagId)]
)

// --- INVESTMENT TABLES ---

export const security = pgTable('security', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => ulid()),
  ticker: text('ticker').notNull().unique(),
  name: text('name').notNull(),
  type: text('type'), // stock, etf, crypto
  currency: text('currency').default('USD').notNull(),
})

export const securityPrice = pgTable(
  'security_price',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => ulid()),
    securityId: text('security_id')
      .references(() => security.id)
      .notNull(),
    date: date('date').notNull(),
    price: numeric('price', { precision: 19, scale: 4 }).notNull(),
  },
  (t) => [uniqueIndex('sec_price_date_idx').on(t.securityId, t.date)]
)

export const holding = pgTable('holding', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => ulid()),
  accountId: text('account_id')
    .references(() => account.id)
    .notNull(),
  securityId: text('security_id')
    .references(() => security.id)
    .notNull(),
  quantity: numeric('quantity', { precision: 19, scale: 6 }).notNull(),
})

// For assets like real estate or cars that don't have a ticker
export const valuation = pgTable('valuation', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => ulid()),
  accountId: text('account_id')
    .references(() => account.id)
    .notNull(),
  date: date('date').notNull(),
  amount: numeric('amount', { precision: 19, scale: 4 }).notNull(),
})

export const accountBalance = pgTable(
  'account_balance',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => ulid()),
    accountId: text('account_id')
      .references(() => account.id)
      .notNull(),
    date: date('date').notNull(),
    balance: numeric('balance', { precision: 19, scale: 4 }).notNull(),
  },
  (t) => [uniqueIndex('account_date_idx').on(t.accountId, t.date)]
)

export const exchangeRate = pgTable('exchange_rate', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => ulid()),
  fromCurrency: text('from_currency').notNull(),
  toCurrency: text('to_currency').notNull(),
  date: date('date').notNull(),
  rate: numeric('rate', { precision: 19, scale: 6 }).notNull(),
})

// --- RELATIONS ---

export const accountRelations = relations(account, ({ one, many }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
  institution: one(institution, {
    fields: [account.institutionId],
    references: [institution.id],
  }),
  transactions: many(transaction),
  holdings: many(holding),
  balances: many(accountBalance),
  valuations: many(valuation),
}))

export const categoryRelations = relations(category, ({ one, many }) => ({
  organization: one(organization, {
    fields: [category.organizationId],
    references: [organization.id],
  }),
  parent: one(category, {
    fields: [category.parentId],
    references: [category.id],
    relationName: 'category_parent',
  }),
  subcategories: many(category, {
    relationName: 'category_parent',
  }),
}))

export const transactionRelations = relations(transaction, ({ one, many }) => ({
  account: one(account, {
    fields: [transaction.accountId],
    references: [account.id],
  }),
  category: one(category, {
    fields: [transaction.categoryId],
    references: [category.id],
  }),
  merchant: one(merchant, {
    fields: [transaction.merchantId],
    references: [merchant.id],
  }),
  tags: many(transactionTag),
}))

export const securityRelations = relations(security, ({ many }) => ({
  prices: many(securityPrice),
  holdings: many(holding),
}))
