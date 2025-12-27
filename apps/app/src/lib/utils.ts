import type { CurrencyCode } from './constants'

export function parseCurrency(val: number, curr: CurrencyCode = 'EUR') {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: curr,
    useGrouping: true,
  }).format(val)
}
