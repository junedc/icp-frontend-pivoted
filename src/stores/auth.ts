import { defineStore } from 'pinia'

export type User = { id: number; name: string; email: string }

const LS_TOKEN = 'auth_token'
const LS_USER = 'auth_user'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: (localStorage.getItem(LS_TOKEN) as string | null),
    user: (localStorage.getItem(LS_USER) ? JSON.parse(localStorage.getItem(LS_USER) as string) : null) as User | null,
  }),
  getters: { isAuthenticated: (s) => !!s.token },
  actions: {
    setAuth(token: string, user?: User | null) {
      this.token = token
      localStorage.setItem(LS_TOKEN, token)
      if (user) this.setUser(user)
    },
    setUser(user: User) {
      this.user = user
      localStorage.setItem(LS_USER, JSON.stringify(user))
    },
    clear() {
      this.token = null
      this.user = null
      localStorage.removeItem(LS_TOKEN)
      localStorage.removeItem(LS_USER)
    },
  },
})
