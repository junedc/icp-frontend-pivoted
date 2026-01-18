export function formatMoney(value: number | string, currency = 'AUD') {
  const num = typeof value === 'string' ? Number(value) : value
  if (Number.isNaN(num)) return '—'
  return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(num)
}
