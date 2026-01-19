<!-- src/pages/orders/MyOrders.vue -->
<template>
  <div class="min-h-screen bg-slate-50">
    <NavBar />

    <div class="max-w-6xl mx-auto p-4">
      <h1 class="text-xl font-semibold mt-4">My Orders</h1>
      <p class="text-sm text-black/60">Track your recent orders.</p>

      <div class="mt-6 border rounded-2xl bg-white overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-slate-50 text-left">
          <tr>
            <th class="p-3"></th>
            <th class="p-3">Order #</th>
            <th class="p-3">Status</th>
            <th class="p-3">Created</th>
            <th class="p-3"></th>
          </tr>
          </thead>

          <tbody>
          <tr v-for="o in orders" :key="o.id" class="border-t">
            <!-- IMAGE PLACEHOLDER -->
            <td class="p-3">
              <div class="w-10 h-10 bg-slate-200 rounded-lg flex items-center justify-center">
                <span class="text-[10px] text-slate-500">Img</span>
              </div>
            </td>

            <!-- ORDER ID -->
            <td class="p-3 font-medium">#{{ o.id }}</td>

            <!-- STATUS -->
            <td class="p-3">
                <span class="px-2 py-0.5 rounded-full text-xs border" :class="statusCls(o.status)">
                  {{ o.status }}
                </span>
            </td>

            <!-- CREATED -->
            <td class="p-3 text-black/70">{{ formatDate(o.created_at) }}</td>

            <!-- ACTION -->
            <td class="p-3 text-right">
              <RouterLink
                  :to="`/orders/${o.id}`"
                  class="px-3 py-1.5 rounded-lg border hover:bg-black hover:text-white"
              >
                View
              </RouterLink>
            </td>
          </tr>

          <tr v-if="!isLoading && !isError && orders.length === 0">
            <td class="p-6 text-center text-sm text-black/60" colspan="5">No orders found.</td>
          </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="pagination.enabled" class="mt-4 flex items-center justify-between gap-3">
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

      <div v-if="isLoading" class="mt-6 text-sm text-black/60">Loading...</div>
      <div v-if="isError" class="mt-6 text-sm text-red-600">Failed to load orders.</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import NavBar from '@/components/NavBar.vue'
import { useQuery } from '@tanstack/vue-query'
import { fetchOrders, type Order } from '@/api/orders'
import { computed, ref } from 'vue'

const page = ref(1)

const q = useQuery({
  queryKey: ['orders', () => page.value],
  queryFn: () => fetchOrders({ page: page.value } as any),
})

const raw = computed<any>(() => q.data.value)

const orders = computed<Order[]>(() => {
  const d = raw.value
  return d?.data ?? d ?? []
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

function goToPage(p: number) {
  if (p < 1) return
  if (pagination.value.enabled && p > pagination.value.lastPage) return
  page.value = p
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString()
  } catch {
    return iso
  }
}

function statusCls(status: string) {
  if (status === 'completed') return 'border-green-200 bg-green-50 text-green-700'
  if (status === 'cancelled') return 'border-red-200 bg-red-50 text-red-700'
  return 'border-slate-200 bg-slate-50 text-slate-700'
}
</script>
