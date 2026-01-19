<template>
  <div class="min-h-screen flex items-center justify-center p-6 bg-slate-50">
    <div class="w-full max-w-md border bg-white rounded-2xl p-6 shadow-sm">
      <h1 class="text-xl font-semibold">Login</h1>

      <p class="text-sm text-black/60 mt-1">Sign in to continue.</p>

      <div v-if="error" class="text-sm text-red-600">{{ error }}</div>

      <form class="mt-5 space-y-3" @submit.prevent="onSubmit">
        <input v-model="email" class="w-full border rounded-xl px-3 py-2" placeholder="Email" />
        <input v-model="password" type="password" class="w-full border rounded-xl px-3 py-2" placeholder="Password" />

        <button class="w-full rounded-xl bg-black text-white py-2" :disabled="mutation.isPending.value">
          {{ mutation.isPending.value ? 'Signing in...' : 'Login' }}
        </button>


        <p class="text-sm text-black/70">
          No account?
          <RouterLink to="/register" class="underline">Register</RouterLink>
        </p>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useMutation } from '@tanstack/vue-query'
import { login } from '@/api/auth'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'

const router = useRouter()
const auth = useAuthStore()
const toast = useToast()

const email = ref('')
const password = ref('')
const error = ref('')

const mutation = useMutation({
  mutationFn: () => login({ email: email.value, password: password.value }),
  onSuccess: (res) => {
    error.value = ''
    const token = res?.data?.token
    const user = res?.data?.user

    if (!token) {
      error.value = 'Login succeeded but token is missing from response.'
      return
    }

    auth.setAuth(token, user ?? null)
    if (user) auth.setUser(user)

    toast.success('Welcome back!')
    router.push('/')
  },
  onError: (e: any) => {
    error.value = e?.response?.data?.message ?? 'Login failed'
  },
})

function onSubmit() {
  mutation.mutate()
}
</script>
