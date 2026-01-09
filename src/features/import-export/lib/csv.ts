import Papa from 'papaparse'
import type { AccountCsvRow, CategoryCsvRow, TransactionCsvRow } from '../types'

export function parseCsv(csvContent: string): Record<string, string>[] {
  const result = Papa.parse<Record<string, string>>(csvContent, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => header.trim().toLowerCase(),
  })

  if (result.errors.length > 0) {
    console.warn('CSV parse warnings:', result.errors)
  }

  return result.data
}

export function parseCategoryCsv(csvContent: string): CategoryCsvRow[] {
  return parseCsv(csvContent) as unknown as CategoryCsvRow[]
}

export function parseAccountCsv(csvContent: string): AccountCsvRow[] {
  return parseCsv(csvContent) as unknown as AccountCsvRow[]
}

export function parseTransactionCsv(csvContent: string): TransactionCsvRow[] {
  return parseCsv(csvContent) as unknown as TransactionCsvRow[]
}

export function generateCsv<T extends Record<string, unknown>>(
  data: T[],
  headers: (keyof T)[]
): string {
  const rows = data.map((row) => {
    const obj: Record<string, string> = {}
    for (const header of headers) {
      const value = row[header]
      if (value === null || value === undefined) {
        obj[header as string] = ''
      } else if (typeof value === 'boolean') {
        obj[header as string] = value.toString()
      } else {
        obj[header as string] = String(value)
      }
    }
    return obj
  })

  return Papa.unparse(rows, {
    columns: headers.map((h) => h as string),
  })
}

export function downloadCsv(csvContent: string, fileName: string): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', fileName)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
