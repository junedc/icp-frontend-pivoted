<template>
  <div class="fixed inset-0 z-40 flex items-center justify-center p-4">
    <div class="absolute inset-0 bg-black/40" @click="$emit('close')"></div>
    <div class="relative w-full max-w-lg bg-white rounded-2xl shadow p-5">
      <div class="flex items-center justify-between">
        <h3 class="font-semibold">{{ title }}</h3>
        <button class="text-sm px-2 py-1 rounded hover:bg-black/5" @click="$emit('close')">✕</button>
      </div>
      <div class="mt-4"><slot /></div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ title: string }>()
defineEmits<{ (e:'close'): void }>()
</script>
