<template>
  <div class="fixed top-4 right-4 z-50 space-y-2">
    <div
      v-for="t in store.toasts"
      :key="t.id"
      class="w-[320px] rounded-xl border px-4 py-3 shadow bg-white"
      :class="toastClass(t.type)"
    >
      <div class="text-sm font-medium">{{ title(t.type) }}</div>
      <div class="text-sm mt-1 text-black/80">{{ t.message }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useToastStore } from '@/stores/toast'
const store = useToastStore()

function toastClass(type: string) {
  if (type === 'success') return 'border-green-200'
  if (type === 'error') return 'border-red-200'
  return 'border-slate-200'
}
function title(type: string) {
  if (type === 'success') return 'Success'
  if (type === 'error') return 'Error'
  return 'Info'
}
</script>
