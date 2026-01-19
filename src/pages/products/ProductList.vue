<!-- src/pages/products/ProductList.vue -->
<template>
  <div class="min-h-screen bg-slate-50">
    <NavBar />

    <div class="max-w-6xl mx-auto p-4">
      <div class="mt-4">
        <h1 class="text-xl font-semibold">Products</h1>
        <p class="text-sm text-black/60">Browse products and add to cart.</p>
      </div>

      <div class="mt-4 flex gap-3">
        <input
            v-model="search"
            class="border rounded-xl px-3 py-2 w-full"
            placeholder="Search products..."
            @keyup.enter="onSearch"
        />
        <button @click="onSearch" class="px-4 py-2 rounded-xl bg-black text-white">
          Search
        </button>
      </div>

      <div v-if="isLoading" class="mt-6 text-sm text-black/60">Loading...</div>
      <div v-if="isError" class="mt-6 text-sm text-red-600">Failed to load products.</div>

      <div class="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-4" v-if="products.length">
        <ProductCard v-for="p in products" :key="p.id" :product="p" @add="addToCart" />
      </div>

      <div v-if="!isLoading && !isError && products.length === 0" class="mt-6 text-sm text-black/60">
        No products found.
      </div>

      <!-- Pagination -->
      <div v-if="pagination.enabled" class="mt-6 flex items-center justify-between gap-3">
        <div class="text-sm text-black/60">
          Page <span class="font-medium text-black">{{ pagination.page }}</span>
          of <span class="font-medium text-black">{{ pagination.lastPage }}</span>
        </div>

        <div class="flex items-center gap-2">
          <button
              class="px-3 py-2 rounded-xl border text-sm hover:bg-black hover:text-white disabled:opacity-50"
              :disabled="pagination.page <= 1 || isLoading"
              @click="goToPage(pagination.page - 1)"
          >
            Prev
          </button>

          <button
              v-for="p in pageButtons"
              :key="p"
              class="px-3 py-2 rounded-xl border text-sm"
              :class="p === pagination.page ? 'bg-black text-white border-black' : 'hover:bg-black hover:text-white'"
              :disabled="isLoading"
              @click="goToPage(p)"
          >
            {{ p }}
          </button>

          <button
              class="px-3 py-2 rounded-xl border text-sm hover:bg-black hover:text-white disabled:opacity-50"
              :disabled="pagination.page >= pagination.lastPage || isLoading"
              @click="goToPage(pagination.page + 1)"
          >
            Next
          </button>
        </div>
      </div>
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
const page = ref(1)

const q = useQuery({
  queryKey: ['products', () => search.value, () => page.value],
  queryFn: () => fetchProducts({ search: search.value, page: page.value } as any),
})

const raw = computed<any>(() => q.data.value)

const products = computed<Product[]>(() => {
  const d = raw.value
  // supports paginator { data: [...] } or plain array
  return d?.data ?? d ?? []
})

watchEffect(() => {
  for (const p of products.value) cart.syncStock(p.id, p.stock_quantity)
})

const pagination = computed(() => {
  const d = raw.value
  if (!d || Array.isArray(d)) return { enabled: false, page: 1, lastPage: 1 }

  const current = d?.meta?.current_page ?? d?.current_page ?? 1
  const last = d?.meta?.last_page ?? d?.last_page ?? 1

  return { enabled: Number(last) > 1, page: Number(current), lastPage: Number(last) }
})

const pageButtons = computed(() => {
  if (!pagination.value.enabled) return []
  const current = pagination.value.page
  const last = pagination.value.lastPage

  const start = Math.max(1, current - 2)
  const end = Math.min(last, start + 4)
  const adjustedStart = Math.max(1, end - 4)

  const pages: number[] = []
  for (let p = adjustedStart; p <= end; p++) pages.push(p)
  return pages
})

const isLoading = computed(() => q.isLoading.value)
const isError = computed(() => q.isError.value)

function onSearch() {
  page.value = 1
  q.refetch()
}

function goToPage(p: number) {
  if (p < 1) return
  if (pagination.value.enabled && p > pagination.value.lastPage) return
  page.value = p
}

function addToCart(p: Product) {
  if (p.stock_quantity <= 0) return
  cart.add({ product_id: p.id, name: p.name, sku: p.sku, price: p.price, stock_quantity: p.stock_quantity })
  toast.success('Added to cart')
}
</script>
