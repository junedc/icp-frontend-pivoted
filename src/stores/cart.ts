import { defineStore } from 'pinia'

export type CartItem = {
  product_id: number
  name: string
  sku: string
  price: string
  stock_quantity: number
  quantity: number
}

export const useCartStore = defineStore('cart', {
  state: () => ({ items: [] as CartItem[] }),
  getters: {
    totalItems: (s) => s.items.reduce((a, i) => a + i.quantity, 0),
    subtotal: (s) => s.items.reduce((a, i) => a + Number(i.price) * i.quantity, 0),
  },
  actions: {
    hydrate() {
      const raw = localStorage.getItem('cart_items')
      if (raw) this.items = JSON.parse(raw)
    },
    persist() {
      localStorage.setItem('cart_items', JSON.stringify(this.items))
    },
    add(item: Omit<CartItem, 'quantity'>) {
      const existing = this.items.find(x => x.product_id === item.product_id)
      if (existing) {
        if (existing.quantity < existing.stock_quantity) existing.quantity += 1
        this.persist()
        return
      }
      this.items.push({ ...item, quantity: 1 })
      this.persist()
    },
    setQty(productId: number, qty: number) {
      const it = this.items.find(x => x.product_id === productId)
      if (!it) return
      it.quantity = Math.max(1, Math.min(qty, it.stock_quantity))
      this.persist()
    },
    remove(productId: number) {
      this.items = this.items.filter(x => x.product_id !== productId)
      this.persist()
    },
    clear() {
      this.items = []
      this.persist()
    },
    syncStock(productId: number, stock: number) {
      const it = this.items.find(x => x.product_id === productId)
      if (!it) return
      it.stock_quantity = stock
      if (stock > 0 && it.quantity > stock) it.quantity = stock
      this.persist()
    },
  },
})
