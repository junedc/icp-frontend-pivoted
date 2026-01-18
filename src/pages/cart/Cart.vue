<template>
  <div class="min-h-screen bg-slate-50">
    <NavBar />

    <div class="max-w-6xl mx-auto p-4">
      <h1 class="text-xl font-semibold mt-4">Cart</h1>
      <p class="text-sm text-black/60">Review items and place your order.</p>

      <div v-if="cart.items.length === 0" class="mt-6 border rounded-2xl bg-white p-6 text-sm text-black/60">
        Your cart is empty.
      </div>

      <div v-else class="mt-6 grid lg:grid-cols-3 gap-4">
        <div class="lg:col-span-2 space-y-3">
          <div v-for="item in cart.items" :key="item.product_id" class="border rounded-2xl bg-white p-4">
            <div class="flex items-start justify-between gap-3">
              <div>
                <div class="font-semibold">{{ item.name }}</div>
                <div class="text-xs text-black/60">{{ item.sku }}</div>
              </div>
              <button class="text-sm px-3 py-1.5 rounded-lg border hover:bg-black hover:text-white" @click="cart.remove(item.product_id)">
                Remove
              </button>
            </div>

            <div class="mt-3 flex items-center justify-between">
              <div class="text-sm font-semibold">{{ formatMoney(item.price) }}</div>
              <div class="text-xs text-black/60">Stock: {{ item.stock_quantity }}</div>
            </div>

            <div class="mt-3 flex items-center gap-3">
              <label class="text-xs text-black/60">Qty</label>
              <input
                type="number"
                min="1"
                :max="item.stock_quantity"
                class="w-24 border rounded-xl px-3 py-2"
                :value="item.quantity"
                @input="cart.setQty(item.product_id, Number(($event.target as HTMLInputElement).value))"
              />
              <div class="ml-auto text-sm font-semibold">
                {{ formatMoney(Number(item.price) * item.quantity) }}
              </div>
            </div>
          </div>
        </div>

        <div class="border rounded-2xl bg-white p-4 h-fit">
          <div class="flex items-center justify-between text-sm">
            <span class="text-black/60">Subtotal</span>
            <span class="font-semibold">{{ formatMoney(cart.subtotal) }}</span>
          </div>

          <button class="mt-4 w-full rounded-xl bg-black text-white py-2" :disabled="placeMutation.isPending.value" @click="placeOrder">
            {{ placeMutation.isPending.value ? 'Placing...' : 'Place Order' }}
          </button>

          <div v-if="validationError" class="mt-3 text-sm text-red-600">{{ validationError }}</div>

          <button class="mt-3 w-full rounded-xl border py-2 text-sm hover:bg-black hover:text-white" @click="cart.clear()">
            Clear Cart
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import NavBar from '@/components/NavBar.vue'
import { useCartStore } from '@/stores/cart'
import { formatMoney } from '@/utils/money'
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { createOrder } from '@/api/orders'
import { useToast } from '@/composables/useToast'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const cart = useCartStore()
cart.hydrate()
const toast = useToast()
const qc = useQueryClient()
const router = useRouter()

const validationError = ref('')

const placeMutation = useMutation({
  mutationFn: () => createOrder(cart.items.map(i => ({ product_id: i.product_id, quantity: i.quantity }))),
  onSuccess: async (order) => {
    validationError.value = ''
    toast.success('Order created')
    cart.clear()
    await qc.invalidateQueries({ queryKey: ['orders'] })
    await qc.invalidateQueries({ queryKey: ['products'] })
    router.push(`/orders/${order.id}`)
  },
  onError: (e: any) => {
    const msg = e?.response?.data?.message
    const itemsMsg = e?.response?.data?.errors?.items?.[0]
    validationError.value = itemsMsg || msg || 'Failed to place order'
    toast.error(validationError.value)
  },
})

function placeOrder() {
  if (cart.items.length === 0) return
  placeMutation.mutate()
}
</script>
