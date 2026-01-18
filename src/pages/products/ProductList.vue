<template>
  <div class="min-h-screen bg-slate-50">
    <NavBar />

    <div class="max-w-6xl mx-auto p-4">
      <div class="mt-4 flex gap-3">
        <input v-model="search" class="border rounded-xl px-3 py-2 w-full" placeholder="Search products..." />
        <button @click="refetch" class="px-4 py-2 rounded-xl bg-black text-white">Search</button>
      </div>

      <div class="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <ProductCard v-for="p in products" :key="p.id" :product="p" @add="addToCart" />
      </div>

      <div v-if="isLoading" class="mt-6 text-sm text-black/60">Loading...</div>
      <div v-if="isError" class="mt-6 text-sm text-red-600">Failed to load products.</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import NavBar from '@/components/NavBar.vue'
import ProductCard from '@/components/ProductCard.vue'
import { useQuery } from '@tanstack/vue-query'
import { fetchProducts, type Product } from '@/api/products'
import { useCartStore } from '@/stores/cart'
import { computed, ref, watchEffect } from 'vue'
import { useToast } from '@/composables/useToast'

const cart = useCartStore()
cart.hydrate()
const toast = useToast()

const search = ref('')

const q = useQuery({
  queryKey: ['products', () => search.value],
  queryFn: () => fetchProducts({ search: search.value }),
})

const products = computed<Product[]>(() => {
  const d: any = q.data.value
  return d?.data ?? d ?? []
})

watchEffect(() => {
  for (const p of products.value) cart.syncStock(p.id, p.stock_quantity)
})

const isLoading = computed(() => q.isLoading.value)
const isError = computed(() => q.isError.value)
const refetch = () => q.refetch()

function addToCart(p: Product) {
  if (p.stock_quantity <= 0) return
  cart.add({ product_id: p.id, name: p.name, sku: p.sku, price: p.price, stock_quantity: p.stock_quantity })
  toast.success('Added to cart')
}
</script>
