import { http } from './http'

export type OrderItem = {
  id: number
  name: string
  sku: string
  price: string
  stock_quantity: number
  pivot: { quantity: number; unit_price: string }
}

export type Order = {
  id: number
  status: 'pending' | 'completed' | 'cancelled'
  created_at: string
  subtotal?: string
  gst_rate?: string
  gst_amount?: string
  total?: string
  products?: OrderItem[]
}

export async function createOrder(items: { product_id: number; quantity: number }[]) {
  const res = await http.post('/api/orders', { items })
  return res.data as Order
}

export async function fetchOrders() {
  const res = await http.get('/api/orders')
  return res.data
}

export async function fetchOrder(id: number) {
  const res = await http.get(`/api/orders/${id}`)
  return res.data as Order
}

export async function cancelOrder(id: number) {
  const res = await http.patch(`/api/orders/${id}/cancel`)
  return res.data as Order
}

export async function completeOrder(id: number) {
  const res = await http.patch(`/api/orders/${id}/complete`)
  return res.data as Order
}
