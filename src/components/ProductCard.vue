<template>
  <div class="border rounded-2xl p-4 bg-white hover:shadow-sm transition">

    <div class="h-48 w-full bg-gray-200 rounded-lg mb-2"></div>
    <div class="flex items-start justify-between gap-3">
      <div>
        <div class="font-semibold">{{ product.name }}</div>
        <div class="text-xs text-black/60">{{ product.sku }}</div>
      </div>
      <span class="text-xs border rounded-full px-2 py-0.5" :class="badge.cls">{{ badge.label }}</span>
    </div>

    <div class="mt-3 flex items-center justify-between">
      <div class="text-sm font-semibold">{{ formatMoney(product.price) }}</div>
      <div class="text-xs text-black/60">Stock: {{ product.stock_quantity }}</div>
    </div>

    <button
        class="mt-4 w-full rounded-xl py-2 text-sm font-medium border transition"
        :disabled="product.stock_quantity <= 0"
        :class="product.stock_quantity > 0 ? 'hover:bg-blue-600 hover:text-white' : 'opacity-50 cursor-not-allowed'"
        @click="$emit('add', product)"
    >
      Add to cart
    </button>
  </div>
</template>

<script setup lang="ts">
import type {Product} from '@/api/products'
import {formatMoney} from '@/utils/money'
import {stockBadge} from '@/utils/stockBadge'
import {computed} from 'vue'

const props = defineProps<{ product: Product }>()
defineEmits<{ (e: 'add', p: Product): void }>()

const badge = computed(() => stockBadge(props.product.stock_quantity))
</script>
