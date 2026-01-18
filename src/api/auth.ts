import { http } from './http'
import type { User } from '@/stores/auth'

export type LoginResponse = {
  status: string
  data: { user: User; token: string }
  message: string | null
}

export async function login(payload: { email: string; password: string }) {
  const res = await http.post('/api/login', payload)
  return res.data as LoginResponse
}

export type RegisterResponse = {
  status: string
  data: { user: User; token?: string }
  message: string | null
}

export async function register(payload: { name: string; email: string; password: string; password_confirmation: string }) {
  const res = await http.post('/api/register', payload)
  return res.data as RegisterResponse
}

export async function logout() {
  const res = await http.post('/api/logout')
  return res.data
}
