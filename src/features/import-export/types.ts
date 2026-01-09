export type ImportType = 'categories' | 'accounts' | 'transactions'

export interface CategoryCsvRow {
  name: string
  type: string
  color?: string
}

export interface AccountCsvRow {
  name: string
  type: string
  subtype?: string
  currency?: string
  isActive?: string
}

export interface TransactionCsvRow {
  date: string
  title: string
  amount: string
  type: string
  category?: string
  account?: string
  description?: string
  isPending?: string
}

export type CsvRow = CategoryCsvRow | AccountCsvRow | TransactionCsvRow

export interface ValidatedCategory {
  name: string
  type: 'inflow' | 'outflow'
  color: string | null
  isValid: boolean
  errors: string[]
  rowIndex: number
}

export interface ValidatedAccount {
  name: string
  type: 'cash' | 'investment' | 'liability' | 'other_asset'
  subtype: string | null
  currency: string
  isActive: boolean
  isValid: boolean
  errors: string[]
  rowIndex: number
}

export interface ValidatedTransaction {
  date: string
  title: string
  amount: number
  type: 'inflow' | 'outflow'
  categoryId: string | null
  accountId: string | null
  description: string
  isPending: boolean
  isValid: boolean
  errors: string[]
  rowIndex: number
}

export type ValidatedRow = ValidatedCategory | ValidatedAccount | ValidatedTransaction

export interface ImportPreview {
  type: ImportType
  totalRows: number
  validRows: number
  invalidRows: number
  rows: ValidatedRow[]
  accountsFound?: Map<string, string>
  categoriesFound?: Map<string, string>
}

export interface ImportResult {
  success: boolean
  imported: number
  errors: string[]
}

export interface ExportResult {
  csv: string
  fileName: string
}
