<!-- src/pages/products/ProductMaintenance.vue -->
<template>
  <div class="min-h-screen bg-slate-50">
    <NavBar />

    <div class="max-w-6xl mx-auto p-4">
      <div class="mt-4 flex items-center justify-between gap-3">
        <div>
          <h1 class="text-xl font-semibold">Product Maintenance</h1>
          <p class="text-sm text-black/60">Create, update, and delete products.</p>
        </div>
        <button class="px-4 py-2 rounded-xl bg-black text-white" @click="openCreate">
          + New Product
        </button>
      </div>

      <div class="mt-4 flex gap-3">
        <input v-model="search" class="border rounded-xl px-3 py-2 w-full" placeholder="Search..." />
        <button @click="onSearch" class="px-4 py-2 rounded-xl border hover:bg-black hover:text-white">
          Search
        </button>
      </div>

      <div class="mt-6 overflow-x-auto border rounded-2xl bg-white">
        <table class="w-full text-sm">
          <thead class="bg-slate-50 text-left">
          <tr>
            <th class="p-3">Name</th>
            <th class="p-3">SKU</th>
            <th class="p-3">Price</th>
            <th class="p-3">Stock</th>
            <th class="p-3">Category</th>
            <th class="p-3"></th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="p in products" :key="p.id" class="border-t">
            <td class="p-3 font-medium">{{ p.name }}</td>
            <td class="p-3">{{ p.sku }}</td>
            <td class="p-3">{{ formatMoney(p.price) }}</td>
            <td class="p-3">{{ p.stock_quantity }}</td>
            <td class="p-3">{{ p.category?.name ?? p.category_id }}</td>
            <td class="p-3 text-right space-x-2">
              <button class="px-3 py-1.5 rounded-lg border hover:bg-black hover:text-white" @click="openEdit(p)">
                Edit
              </button>
              <button
                  class="px-3 py-1.5 rounded-lg border border-red-200 text-red-700 hover:bg-red-50"
                  @click="onDelete(p.id)"
              >
                Delete
              </button>
            </td>
          </tr>

          <tr v-if="!isLoading && products.length === 0">
            <td class="p-6 text-center text-sm text-black/60" colspan="6">No products found.</td>
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
      <div v-if="isError" class="mt-6 text-sm text-red-600">Failed to load products.</div>
    </div>

    <Modal v-if="modalOpen" :title="modalTitle" @close="closeModal">
      <form class="space-y-3" @submit.prevent="onSave">
        <div>
          <label class="text-xs text-black/60">Name</label>
          <input v-model="form.name" class="mt-1 w-full border rounded-xl px-3 py-2" />
        </div>
        <div>
          <label class="text-xs text-black/60">SKU</label>
          <input v-model="form.sku" class="mt-1 w-full border rounded-xl px-3 py-2" />
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="text-xs text-black/60">Price</label>
            <input v-model.number="form.price" type="number" step="0.01" class="mt-1 w-full border rounded-xl px-3 py-2" />
          </div>
          <div>
            <label class="text-xs text-black/60">Stock</label>
            <input v-model.number="form.stock_quantity" type="number" class="mt-1 w-full border rounded-xl px-3 py-2" />
          </div>
        </div>

        <div>
          <label class="text-xs text-black/60">Category</label>
          <select v-model.number="form.category_id" class="mt-1 w-full border rounded-xl px-3 py-2">
            <option :value="0" disabled>Select category</option>
            <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
          </select>
        </div>

        <div class="flex items-center justify-end gap-2 pt-2">
          <button type="button" class="px-4 py-2 rounded-xl border" @click="closeModal">Cancel</button>
          <button class="px-4 py-2 rounded-xl bg-black text-white" :disabled="saving">
            {{ saving ? 'Saving...' : 'Save' }}
          </button>
        </div>
      </form>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import NavBar from '@/components/NavBar.vue'
import Modal from '@/components/Modal.vue'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import {
  fetchProducts,
  fetchCategories,
  createProduct,
  updateProduct,
  deleteProduct,
  type Product,
  type Category,
} from '@/api/products'
import { computed, reactive, ref } from 'vue'
import { formatMoney } from '@/utils/money'
import { useToast } from '@/composables/useToast'

const toast = useToast()
const qc = useQueryClient()

const search = ref('')
const page = ref(1)

const q = useQuery({
  queryKey: ['products', 'maintenance', () => search.value, () => page.value],
  queryFn: () => fetchProducts({ search: search.value, page: page.value } as any),
})

const catQ = useQuery({
  queryKey: ['categories'],
  queryFn: () => fetchCategories(),
})

const raw = computed<any>(() => q.data.value)

const products = computed<Product[]>(() => {
  const d = raw.value
  // Supports: paginator { data: [...] } or plain array
  return d?.data ?? d ?? []
})

const categories = computed<Category[]>(() => {
  const d: any = catQ.data.value
  return d?.data ?? d ?? []
})

const pagination = computed(() => {
  const d = raw.value

  // If plain array -> no pagination
  if (!d || Array.isArray(d)) {
    return { enabled: false, page: 1, lastPage: 1 }
  }

  // Laravel default paginator (sometimes meta exists)
  const current =
      d?.meta?.current_page ??
      d?.current_page ??
      1

  const last =
      d?.meta?.last_page ??
      d?.last_page ??
      1

  return { enabled: last > 1, page: Number(current), lastPage: Number(last) }
})

const pageButtons = computed(() => {
  if (!pagination.value.enabled) return []
  const current = pagination.value.page
  const last = pagination.value.lastPage

  // show up to 5 buttons around current
  const start = Math.max(1, current - 2)
  const end = Math.min(last, start + 4)
  const adjustedStart = Math.max(1, end - 4)

  const pages: number[] = []
  for (let p = adjustedStart; p <= end; p++) pages.push(p)
  return pages
})

const isLoading = computed(() => q.isLoading.value || catQ.isLoading.value)
const isError = computed(() => q.isError.value || catQ.isError.value)

function onSearch() {
  page.value = 1
  q.refetch()
}

function goToPage(p: number) {
  if (p < 1) return
  if (pagination.value.enabled && p > pagination.value.lastPage) return
  page.value = p
}

const modalOpen = ref(false)
const modalTitle = ref('')
const editingId = ref<number | null>(null)

const form = reactive({
  name: '',
  sku: '',
  price: 0,
  stock_quantity: 0,
  category_id: 0,
})

function openCreate() {
  editingId.value = null
  modalTitle.value = 'Create Product'
  Object.assign(form, {
    name: '',
    sku: '',
    price: 0,
    stock_quantity: 0,
    category_id: categories.value[0]?.id ?? 0,
  })
  modalOpen.value = true
}

function openEdit(p: Product) {
  editingId.value = p.id
  modalTitle.value = 'Edit Product'
  Object.assign(form, {
    name: p.name,
    sku: p.sku,
    price: Number(p.price),
    stock_quantity: p.stock_quantity,
    category_id: p.category_id,
  })
  modalOpen.value = true
}

function closeModal() {
  modalOpen.value = false
}

const saveMutation = useMutation({
  mutationFn: async () => {
    const payload = {
      name: form.name,
      sku: form.sku,
      price: form.price,
      stock_quantity: form.stock_quantity,
      category_id: form.category_id,
    }
    if (editingId.value) return updateProduct(editingId.value, payload)
    return createProduct(payload)
  },
  onSuccess: async () => {
    toast.success('Saved')
    modalOpen.value = false
    await qc.invalidateQueries({ queryKey: ['products'] })
    await qc.invalidateQueries({ queryKey: ['products', 'maintenance'] })
  },
  onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Save failed'),
})

const deleteMutation = useMutation({
  mutationFn: (id: number) => deleteProduct(id),
  onSuccess: async () => {
    toast.success('Deleted')
    await qc.invalidateQueries({ queryKey: ['products'] })
    await qc.invalidateQueries({ queryKey: ['products', 'maintenance'] })
  },
  onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Delete failed'),
})

const saving = computed(() => saveMutation.isPending.value)

function onSave() {
  saveMutation.mutate()
}

function onDelete(id: number) {
  if (confirm('Delete this product?')) deleteMutation.mutate(id)
}
</script>
