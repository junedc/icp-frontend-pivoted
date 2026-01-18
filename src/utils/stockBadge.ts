export function stockBadge(stock: number) {
  if (stock <= 0) return { label: 'Out of stock', cls: 'bg-red-100 text-red-700 border-red-200' }
  if (stock <= 5) return { label: 'Low stock', cls: 'bg-orange-100 text-orange-700 border-orange-200' }
  return { label: 'In stock', cls: 'bg-green-100 text-green-700 border-green-200' }
}
