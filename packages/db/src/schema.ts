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
  'cash',
  'investment',
  'liability',
  'other_asset',
])
export const currencyEnum = pgEnum('currency', [
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
])

export const transactionTypeEnum = pgEnum('transaction_type', ['inflow', 'outflow'])
export const categoryTypeEnum = pgEnum('category_type', ['inflow', 'outflow'])

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
    .references(() => user.id, { onDelete: 'cascade' })
    .notNull(),
  currency: currencyEnum('currency').default('EUR').notNull(),
  region: text('region').default('ES').notNull(), // For currency formatting, etc.
  dateFormat: text('date_format').default('DD/MM/YYYY').notNull(),
  timezone: text('timezone').default('Europe/Madrid').notNull(),
})

export const account = pgTable('account', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => ulid()),
  organizationId: text('organization_id')
    .references(() => organization.id, { onDelete: 'cascade' })
    .notNull(),
  name: text('name').notNull(),
  type: accountTypeEnum('type').notNull(),
  subtype: text('subtype'),
  currency: currencyEnum('currency').default('EUR').notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const category = pgTable('category', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => ulid()),
  organizationId: text('organization_id')
    .references(() => organization.id, { onDelete: 'cascade' })
    .notNull(),
  name: text('name').notNull(),
  type: categoryTypeEnum('type').notNull(),
  color: text('color'),
  parentId: text('parent_id'),
})

export const budget = pgTable(
  'budget',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => ulid()),
    categoryId: text('category_id')
      .references(() => category.id, { onDelete: 'cascade' })
      .notNull(),
    amount: numeric('amount', { precision: 19, scale: 4 }).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (t) => [uniqueIndex('budget_category_idx').on(t.categoryId)]
)

export const transaction = pgTable('transaction', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => ulid()),
  accountId: text('account_id')
    .references(() => account.id, { onDelete: 'cascade' })
    .notNull(),
  categoryId: text('category_id').references(() => category.id, { onDelete: 'set null' }),
  date: date('date').notNull(),
  amount: numeric('amount', { precision: 19, scale: 4 }).notNull(),
  type: transactionTypeEnum('type').notNull(),
  title: text('title').notNull(),
  description: text('description').notNull().default(''),
  isPending: boolean('is_pending').default(false).notNull(),
  isInvestmentContribution: boolean('is_investment_contribution').default(false).notNull(),
  providerId: text('provider_id'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// --- INVESTMENT TABLES ---

export const accountBalance = pgTable(
  'account_balance',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => ulid()),
    accountId: text('account_id')
      .references(() => account.id, { onDelete: 'cascade' })
      .notNull(),
    date: date('date').notNull(),
    balance: numeric('balance', { precision: 19, scale: 4 }).notNull(),
  },
  (t) => [uniqueIndex('account_date_idx').on(t.accountId, t.date)]
)

// --- RELATIONS ---

export const accountRelations = relations(account, ({ one, many }) => ({
  organization: one(organization, {
    fields: [account.organizationId],
    references: [organization.id],
  }),
  transactions: many(transaction),
  balances: many(accountBalance),
  accountBalances: many(accountBalance),
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
  budgets: many(budget),
}))

export const budgetRelations = relations(budget, ({ one }) => ({
  organization: one(organization, {
    fields: [budget.categoryId],
    references: [organization.id],
  }),
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
