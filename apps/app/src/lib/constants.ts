import {
  ArrowDownLeft01Icon,
  ArrowLeftRightIcon,
  ArrowUpRight01Icon,
} from '@hugeicons/core-free-icons'
import type { IconSvgElement } from '@hugeicons/react'

export const TRANSACTIONS_TYPES = ['income', 'expense', 'transfer'] as const

type TransactionType = Record<(typeof TRANSACTIONS_TYPES)[number], IconSvgElement>
export const TRANSACTIONS_ICONS: TransactionType = {
  income: ArrowDownLeft01Icon,
  expense: ArrowUpRight01Icon,
  transfer: ArrowLeftRightIcon,
}
