import {
  accountTypeEnum,
  categoryTypeEnum,
  currencyEnum,
  transactionTypeEnum,
} from '@/lib/db/schema'
import type {
  AccountCsvRow,
  CategoryCsvRow,
  TransactionCsvRow,
  ValidatedAccount,
  ValidatedCategory,
  ValidatedTransaction,
} from '../types'

const ACCOUNT_TYPES = accountTypeEnum.enumValues
const CATEGORY_TYPES = categoryTypeEnum.enumValues
const TRANSACTION_TYPES = transactionTypeEnum.enumValues
const CURRENCIES = currencyEnum.enumValues

export function validateCategoryRow(row: CategoryCsvRow, rowIndex: number): ValidatedCategory {
  const errors: string[] = []
  const name = row.name?.trim() ?? ''
  const type = row.type?.trim().toLowerCase() ?? ''
  const color = row.color?.trim() ?? null

  if (!name) {
    errors.push('Missing required field: name')
  }

  if (!type) {
    errors.push('Missing required field: type')
  } else if (!CATEGORY_TYPES.includes(type as 'inflow' | 'outflow')) {
    errors.push(`Invalid type '${type}' (must be: ${CATEGORY_TYPES.join(', ')})`)
  }

  return {
    name,
    type: type as 'inflow' | 'outflow',
    color,
    isValid: errors.length === 0,
    errors,
    rowIndex,
  }
}

export function validateAccountRow(row: AccountCsvRow, rowIndex: number): ValidatedAccount {
  const errors: string[] = []
  const name = row.name?.trim() ?? ''
  const type = row.type?.trim().toLowerCase() ?? ''
  const subtype = row.subtype?.trim() ?? null
  const currency = row.currency?.trim().toUpperCase() ?? 'EUR'
  const isActiveRaw = row.isActive?.trim().toLowerCase() ?? 'true'

  if (!name) {
    errors.push('Missing required field: name')
  }

  if (!type) {
    errors.push('Missing required field: type')
  } else if (!ACCOUNT_TYPES.includes(type as 'cash' | 'investment' | 'liability' | 'other_asset')) {
    errors.push(`Invalid type '${type}' (must be: ${ACCOUNT_TYPES.join(', ')})`)
  }

  let isActive = true
  if (isActiveRaw === 'true' || isActiveRaw === '1' || isActiveRaw === 'yes') {
    isActive = true
  } else if (isActiveRaw === 'false' || isActiveRaw === '0' || isActiveRaw === 'no') {
    isActive = false
  } else {
    errors.push(`Invalid isActive value '${isActiveRaw}' (must be: true, false, yes, no, 1, 0)`)
  }

  if (currency && !CURRENCIES.includes(currency as (typeof CURRENCIES)[number])) {
    errors.push(`Invalid currency '${currency}'`)
  }

  return {
    name,
    type: type as 'cash' | 'investment' | 'liability' | 'other_asset',
    subtype,
    currency,
    isActive,
    isValid: errors.length === 0,
    errors,
    rowIndex,
  }
}

export function validateTransactionRow(
  row: TransactionCsvRow,
  rowIndex: number,
  existingAccountIds: Set<string>,
  existingCategoryNames: Map<string, string>
): ValidatedTransaction {
  const errors: string[] = []
  const date = row.date?.trim() ?? ''
  const title = row.title?.trim() ?? ''
  const amountRaw = row.amount?.trim() ?? ''
  const type = row.type?.trim().toLowerCase() ?? ''
  const categoryName = row.category?.trim() ?? ''
  const accountName = row.account?.trim() ?? ''
  const description = row.description?.trim() ?? ''
  const isPendingRaw = row.isPending?.trim().toLowerCase() ?? 'false'

  if (!date) {
    errors.push('Missing required field: date')
  } else if (!isValidDate(date)) {
    errors.push(`Invalid date format '${date}' (use: YYYY-MM-DD, DD/MM/YYYY, or MM/DD/YYYY)`)
  }

  if (!title) {
    errors.push('Missing required field: title')
  }

  if (!amountRaw) {
    errors.push('Missing required field: amount')
  } else {
    const amount = Number.parseFloat(amountRaw.replace(/,/g, ''))
    if (Number.isNaN(amount) || amount <= 0) {
      errors.push(`Invalid amount '${amountRaw}' (must be a positive number)`)
    }
  }

  if (!type) {
    errors.push('Missing required field: type')
  } else if (!TRANSACTION_TYPES.includes(type as 'inflow' | 'outflow')) {
    errors.push(`Invalid type '${type}' (must be: ${TRANSACTION_TYPES.join(', ')})`)
  }

  if (!accountName) {
    errors.push('Missing required field: account')
  } else if (!existingAccountIds.has(accountName.toLowerCase())) {
    errors.push(`Account '${accountName}' not found`)
  }

  let categoryId: string | null = null
  if (categoryName) {
    const found = existingCategoryNames.get(categoryName.toLowerCase())
    if (found) {
      categoryId = found
    }
  }

  let isPending = false
  if (isPendingRaw === 'true' || isPendingRaw === '1' || isPendingRaw === 'yes') {
    isPending = true
  } else if (isPendingRaw !== 'false' && isPendingRaw !== '0' && isPendingRaw !== 'no') {
    errors.push(`Invalid isPending value '${isPendingRaw}'`)
  }

  return {
    date,
    title,
    amount: Number.parseFloat(amountRaw.replace(/,/g, '')),
    type: type as 'inflow' | 'outflow',
    categoryId,
    accountId: accountName,
    description,
    isPending,
    isValid: errors.length === 0,
    errors,
    rowIndex,
  }
}

function isValidDate(dateStr: string): boolean {
  const dateFormats = [/^\d{4}-\d{2}-\d{2}$/, /^\d{2}\/\d{2}\/\d{4}$/, /^\d{2}-\d{2}-\d{4}$/]

  if (!dateFormats.some((format) => format.test(dateStr))) {
    return false
  }

  const parsed = parseDate(dateStr)
  return parsed !== null
}

export function parseDate(dateStr: string): Date | null {
  let date: Date | undefined

  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    date = new Date(dateStr)
  } else if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
    const [day, month, year] = dateStr.split('/')
    date = new Date(
      Number.parseInt(year, 10),
      Number.parseInt(month, 10) - 1,
      Number.parseInt(day, 10)
    )
  } else if (/^\d{2}-\d{2}-\d{4}$/.test(dateStr)) {
    const [day, month, year] = dateStr.split('-')
    date = new Date(
      Number.parseInt(year, 10),
      Number.parseInt(month, 10) - 1,
      Number.parseInt(day, 10)
    )
  }

  if (date && !Number.isNaN(date.getTime())) {
    return date
  }

  return null
}

export function formatDateForDb(date: Date): string {
  return date.toISOString().split('T')[0]
}
