import axios from 'axios'
import { useAuthStore } from '@/stores/auth'
import { useToastStore } from '@/stores/toast'

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
})

http.interceptors.request.use((config) => {
  const auth = useAuthStore()
  if (auth.token) {
    config.headers = config.headers ?? {}
    config.headers.Authorization = `Bearer ${auth.token}`
  }
  return config
})

http.interceptors.response.use(
  (r) => r,
  (err) => {
    const status = err?.response?.status
    const toast = useToastStore()

    if (status === 401) {
      const auth = useAuthStore()
      auth.clear()
    }

    const msg =
      err?.response?.data?.message ||
      (status ? `Request failed (${status})` : 'Network error')

    if (status && status !== 422) toast.push('error', msg)

    return Promise.reject(err)
  }
)
