import { http } from './http'

export type Category = { id: number; name: string }

export type Product = {
  id: number
  name: string
  sku: string
  price: string
  stock_quantity: number
  category_id: number
  category?: Category
}

export async function fetchProducts(params?: { search?: string; category_id?: number }) {
  const res = await http.get('/api/products', { params })
  return res.data
}

export async function createProduct(payload: Partial<Product>) {
  const res = await http.post('/api/products', payload)
  return res.data as Product
}

export async function updateProduct(id: number, payload: Partial<Product>) {
  const res = await http.put(`/api/products/${id}`, payload)
  return res.data as Product
}

export async function deleteProduct(id: number) {
  await http.delete(`/api/products/${id}`)
}

export async function fetchCategories() {
  const res = await http.get('/api/categories')
  return res.data
}
