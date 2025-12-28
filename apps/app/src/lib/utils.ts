import type { CurrencyCode, TCountryCode } from './constants'

export function parseCurrency(
  val: number,
  region: TCountryCode = 'ES',
  curr: CurrencyCode = 'EUR'
) {
  return new Intl.NumberFormat(region, {
    style: 'currency',
    currency: curr,
    useGrouping: true,
  }).format(val)
}
