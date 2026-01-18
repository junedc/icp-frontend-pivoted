<template>
  <div class="min-h-screen flex items-center justify-center p-6 bg-slate-50">
    <div class="w-full max-w-md border bg-white rounded-2xl p-6 shadow-sm">
      <h1 class="text-xl font-semibold">Register</h1>
      <p class="text-sm text-black/60 mt-1">Create your account.</p>

      <form class="mt-5 space-y-3" @submit.prevent="onSubmit">
        <input v-model="name" class="w-full border rounded-xl px-3 py-2" placeholder="Name" />
        <input v-model="email" class="w-full border rounded-xl px-3 py-2" placeholder="Email" />
        <input v-model="password" type="password" class="w-full border rounded-xl px-3 py-2" placeholder="Password" />
        <input v-model="password_confirmation" type="password" class="w-full border rounded-xl px-3 py-2" placeholder="Confirm Password" />

        <button class="w-full rounded-xl bg-black text-white py-2" :disabled="mutation.isPending.value">
          {{ mutation.isPending.value ? 'Creating...' : 'Register' }}
        </button>

        <div v-if="error" class="text-sm text-red-600">{{ error }}</div>

        <p class="text-sm text-black/70">
          Have an account?
          <RouterLink to="/login" class="underline">Login</RouterLink>
        </p>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useMutation } from '@tanstack/vue-query'
import { register } from '@/api/auth'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'

const router = useRouter()
const auth = useAuthStore()
const toast = useToast()

const name = ref('')
const email = ref('')
const password = ref('')
const password_confirmation = ref('')
const error = ref('')

const mutation = useMutation({
  mutationFn: () => register({ name: name.value, email: email.value, password: password.value, password_confirmation: password_confirmation.value }),
  onSuccess: (res: any) => {
    error.value = ''
    const token = res?.data?.token
    const user = res?.data?.user

    if (token) {
      auth.setAuth(token, user ?? null)
      if (user) auth.setUser(user)
      toast.success('Account created!')
      router.push('/')
      return
    }

    toast.success('Account created! Please login.')
    router.push('/login')
  },
  onError: (e: any) => {
    error.value = e?.response?.data?.message ?? 'Register failed'
  },
})

function onSubmit() {
  mutation.mutate()
}
</script>
