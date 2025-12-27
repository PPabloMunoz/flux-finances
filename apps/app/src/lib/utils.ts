export function parseCurrency(val: number, curr = 'EUR') {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: curr,
    useGrouping: true,
  }).format(val)
}
