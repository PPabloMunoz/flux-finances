import type { ClassValue } from 'clsx'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { CURRENCY_CODES, TCountryCode } from './constants'

export function cn(...inputs: Array<ClassValue>) {
  return twMerge(clsx(inputs))
}

export function parseCurrency(
  val: number,
  region: TCountryCode = 'ES',
  curr: (typeof CURRENCY_CODES)[number] = 'EUR'
) {
  return new Intl.NumberFormat(region, {
    style: 'currency',
    currency: curr,
    useGrouping: true,
    currencyDisplay: 'narrowSymbol',
  }).format(val)
}
