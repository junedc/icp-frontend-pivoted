<template>
  <div class="min-h-screen bg-slate-50">
    <NavBar />

    <div class="max-w-6xl mx-auto p-4">
      <div class="mt-4 flex items-start justify-between gap-3">
        <div>
          <h1 class="text-xl font-semibold">Order #{{ id }}</h1>
          <p class="text-sm text-black/60">Details and actions.</p>
        </div>

        <div class="flex items-center gap-2" v-if="order">
          <span class="px-2 py-0.5 rounded-full text-xs border" :class="statusCls(order.status)">
            {{ order.status }}
          </span>
          <button
            v-if="order.status === 'pending'"
            class="px-3 py-2 rounded-xl border hover:bg-black hover:text-white"
            :disabled="completeMut.isPending.value"
            @click="completeMut.mutate()"
          >
            Complete
          </button>
          <button
            v-if="order.status === 'pending'"
            class="px-3 py-2 rounded-xl border border-red-200 text-red-700 hover:bg-red-50"
            :disabled="cancelMut.isPending.value"
            @click="cancelMut.mutate()"
          >
            Cancel
          </button>
        </div>
      </div>

      <div v-if="isLoading" class="mt-6 text-sm text-black/60">Loading...</div>
      <div v-if="isError" class="mt-6 text-sm text-red-600">Failed to load order.</div>

      <div v-if="order" class="mt-6 grid lg:grid-cols-3 gap-4">
        <div class="lg:col-span-2 space-y-3">
          <div v-for="p in order.products ?? []" :key="p.id" class="border rounded-2xl bg-white p-4">
            <div class="flex items-start justify-between gap-3">
              <div>
                <div class="font-semibold">{{ p.name }}</div>
                <div class="text-xs text-black/60">{{ p.sku }}</div>
              </div>
              <div class="text-sm font-semibold">{{ formatMoney(p.pivot.unit_price) }}</div>
            </div>

            <div class="mt-3 flex items-center justify-between text-sm text-black/70">
              <div>Qty: <span class="font-medium text-black">{{ p.pivot.quantity }}</span></div>
              <div>Line: <span class="font-semibold text-black">{{ formatMoney(Number(p.pivot.unit_price) * p.pivot.quantity) }}</span></div>
            </div>
          </div>
        </div>

        <div class="border rounded-2xl bg-white p-4 h-fit">
          <div class="text-sm flex items-center justify-between">
            <span class="text-black/60">Subtotal</span>
            <span class="font-semibold">{{ formatMoney(calcSubtotal(order)) }}</span>
          </div>
          <div class="text-sm flex items-center justify-between mt-2" v-if="order.gst_amount">
            <span class="text-black/60">GST</span>
            <span class="font-semibold">{{ formatMoney(order.gst_amount) }}</span>
          </div>
          <div class="text-sm flex items-center justify-between mt-2" v-if="order.total">
            <span class="text-black/60">Total</span>
            <span class="font-semibold">{{ formatMoney(order.total) }}</span>
          </div>
          <div class="text-xs text-black/50 mt-4">
            Created: {{ formatDate(order.created_at) }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import NavBar from '@/components/NavBar.vue'
import { useRoute } from 'vue-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { cancelOrder, completeOrder, fetchOrder, type Order } from '@/api/orders'
import { computed } from 'vue'
import { formatMoney } from '@/utils/money'
import { useToast } from '@/composables/useToast'

const route = useRoute()
const id = Number(route.params.id)
const toast = useToast()
const qc = useQueryClient()

const q = useQuery({
  queryKey: ['order', id],
  queryFn: () => fetchOrder(id),
})

const order = computed<Order | null>(() => q.data.value ?? null)
const isLoading = computed(() => q.isLoading.value)
const isError = computed(() => q.isError.value)

const cancelMut = useMutation({
  mutationFn: () => cancelOrder(id),
  onSuccess: async () => {
    toast.success('Order cancelled')
    await qc.invalidateQueries({ queryKey: ['order', id] })
    await qc.invalidateQueries({ queryKey: ['orders'] })
    await qc.invalidateQueries({ queryKey: ['products'] })
  },
  onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Cancel failed'),
})

const completeMut = useMutation({
  mutationFn: () => completeOrder(id),
  onSuccess: async () => {
    toast.success('Order completed')
    await qc.invalidateQueries({ queryKey: ['order', id] })
    await qc.invalidateQueries({ queryKey: ['orders'] })
  },
  onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Complete failed'),
})

function formatDate(iso: string) {
  try { return new Date(iso).toLocaleString() } catch { return iso }
}

function statusCls(status: string) {
  if (status === 'completed') return 'border-green-200 bg-green-50 text-green-700'
  if (status === 'cancelled') return 'border-red-200 bg-red-50 text-red-700'
  return 'border-slate-200 bg-slate-50 text-slate-700'
}

function calcSubtotal(o: Order) {
  if (o.subtotal) return Number(o.subtotal)
  return (o.products ?? []).reduce((a, p) => a + Number(p.pivot.unit_price) * p.pivot.quantity, 0)
}
</script>
