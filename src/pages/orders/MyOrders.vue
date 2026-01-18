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
              <th class="p-3">Order #</th>
              <th class="p-3">Status</th>
              <th class="p-3">Created</th>
              <th class="p-3"></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="o in orders" :key="o.id" class="border-t">
              <td class="p-3 font-medium">#{{ o.id }}</td>
              <td class="p-3">
                <span class="px-2 py-0.5 rounded-full text-xs border" :class="statusCls(o.status)">
                  {{ o.status }}
                </span>
              </td>
              <td class="p-3 text-black/70">{{ formatDate(o.created_at) }}</td>
              <td class="p-3 text-right">
                <RouterLink :to="`/orders/${o.id}`" class="px-3 py-1.5 rounded-lg border hover:bg-black hover:text-white">
                  View
                </RouterLink>
              </td>
            </tr>
          </tbody>
        </table>
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
import { computed } from 'vue'

const q = useQuery({ queryKey: ['orders'], queryFn: () => fetchOrders() })

const orders = computed<Order[]>(() => {
  const d: any = q.data.value
  return d?.data ?? d ?? []
})

const isLoading = computed(() => q.isLoading.value)
const isError = computed(() => q.isError.value)

function formatDate(iso: string) {
  try { return new Date(iso).toLocaleString() } catch { return iso }
}

function statusCls(status: string) {
  if (status === 'completed') return 'border-green-200 bg-green-50 text-green-700'
  if (status === 'cancelled') return 'border-red-200 bg-red-50 text-red-700'
  return 'border-slate-200 bg-slate-50 text-slate-700'
}
</script>
