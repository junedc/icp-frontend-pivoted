<template>
  <header class="border-b bg-white">
    <div class="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
      <!-- LEFT -->
      <div class="flex items-center gap-4">
        <RouterLink to="/" class="font-semibold text-lg">Shop</RouterLink>

        <nav class="hidden sm:flex items-center gap-4 text-sm text-black/70">
          <RouterLink to="/" class="hover:text-black">Product List</RouterLink>
          <RouterLink to="/orders" class="hover:text-black">My Orders</RouterLink>
          <RouterLink v-if="auth.user.email === 'leo@email.com'" to="/maintenance" class="hover:text-black">Maintenance</RouterLink>

        </nav>
      </div>

      <!-- RIGHT -->
      <div class="flex items-center gap-4">
        <!-- CART -->
        <RouterLink
            to="/cart"
            class="relative flex items-center gap-2 text-sm hover:text-black"
        >
          Cart
          <span
              v-if="cart.totalItems"
              class="absolute -top-2 -right-3 text-xs px-2 py-0.5 rounded-full bg-black text-white"
          >
            {{ cart.totalItems }}
          </span>
        </RouterLink>

        <!-- USER -->
<!--        <span-->
<!--            v-if="auth.user"-->
<!--            class="hidden sm:block text-sm text-black/60"-->
<!--        >-->
<!--          {{ auth.user.name }}-->
<!--        </span>-->

        <!-- LOGOUT -->
        <button
            class="text-sm px-3 py-2 rounded-lg border hover:bg-black hover:text-white transition"
            @click="onLogout"
        >
          Sign Out
        </button>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'
import { logout } from '@/api/auth'
import { useToast } from '@/composables/useToast'

const router = useRouter()
const auth = useAuthStore()
const cart = useCartStore()
const toast = useToast()

async function onLogout() {
  try {
    await logout()
  } catch {}
  auth.clear()
  cart.clear()
  toast.info('Logged out')
  router.push('/login')
}
</script>
