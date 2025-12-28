import type { CURRENCY_CODES, TCountryCode } from './constants'

export function parseCurrency(
  val: number,
  region: TCountryCode = 'ES',
  curr: (typeof CURRENCY_CODES)[number] = 'EUR'
) {
  return new Intl.NumberFormat(region, {
    style: 'currency',
    currency: curr,
    useGrouping: true,
  }).format(val)
}
