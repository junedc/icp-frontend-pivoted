<!-- src/components/NavBar.vue -->
<template>
  <header class="border-b bg-white">
    <div class="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
      <!-- LEFT -->
      <div class="flex items-center gap-3">
        <!-- Hamburger (mobile) -->
        <button
            type="button"
            class="sm:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg border hover:bg-black hover:text-white transition"
            @click="isOpen = !isOpen"
            aria-label="Toggle menu"
        >
          <!-- simple icon -->
          <span class="text-lg leading-none">☰</span>
        </button>

        <RouterLink to="/" class="font-semibold text-lg" @click="closeMobile">
          Home
        </RouterLink>

        <!-- Desktop nav -->
        <nav class="hidden sm:flex items-center gap-4 text-sm text-black/70">
          <RouterLink to="/" class="hover:text-black">Products</RouterLink>
          <RouterLink to="/orders" class="hover:text-black">My Orders</RouterLink>
          <RouterLink to="/maintenance" class="hover:text-black">Maintenance</RouterLink>
        </nav>
      </div>

      <!-- RIGHT -->
      <div class="flex items-center gap-4">
        <!-- Cart (top-right) -->
        <RouterLink
            to="/cart"
            class="relative flex items-center gap-2 text-sm hover:text-black"
            @click="closeMobile"
        >
          Cart
          <span
              v-if="cart.totalItems"
              class="absolute -top-2 -right-3 text-xs px-2 py-0.5 rounded-full bg-black text-white"
          >
            {{ cart.totalItems }}
          </span>
        </RouterLink>

        <span v-if="auth.user" class="hidden sm:block text-sm text-black/60">
          {{ auth.user.name }}
        </span>

        <button
            type="button"
            class="text-sm px-3 py-2 rounded-lg border hover:bg-black hover:text-white transition"
            @click="onLogout"
        >
          Logout
        </button>
      </div>
    </div>

    <!-- Mobile dropdown -->
    <div v-if="isOpen" class="sm:hidden border-t bg-white">
      <div class="max-w-6xl mx-auto px-4 py-3">
        <nav class="flex flex-col gap-2 text-sm">
          <RouterLink to="/" class="px-3 py-2 rounded-lg hover:bg-black/5" @click="closeMobile">
            Products
          </RouterLink>
          <RouterLink to="/maintenance" class="px-3 py-2 rounded-lg hover:bg-black/5" @click="closeMobile">
            Maintenance
          </RouterLink>
          <RouterLink to="/orders" class="px-3 py-2 rounded-lg hover:bg-black/5" @click="closeMobile">
            My Orders
          </RouterLink>
          <RouterLink to="/cart" class="px-3 py-2 rounded-lg hover:bg-black/5" @click="closeMobile">
            Cart
          </RouterLink>

          <div v-if="auth.user" class="pt-2 text-xs text-black/50">
            Signed in as <span class="font-medium text-black/70">{{ auth.user.name }}</span>
          </div>
        </nav>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'
import { logout } from '@/api/auth'
import { useToast } from '@/composables/useToast'

const router = useRouter()
const auth = useAuthStore()
const cart = useCartStore()
const toast = useToast()

const isOpen = ref(false)

function closeMobile() {
  isOpen.value = false
}

async function onLogout() {
  try {
    await logout()
  } catch {}
  auth.clear()
  cart.clear()
  closeMobile()
  toast.info('Logged out')
  router.push('/login')
}
</script>
