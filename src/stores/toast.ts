import { defineStore } from 'pinia'

export type ToastType = 'success' | 'error' | 'info'
export type Toast = { id: string; type: ToastType; message: string }

export const useToastStore = defineStore('toast', {
  state: () => ({ toasts: [] as Toast[] }),
  actions: {
    push(type: ToastType, message: string) {
      const id = Math.random().toString(36).slice(2)
      this.toasts.push({ id, type, message })
      setTimeout(() => this.remove(id), 3500)
    },
    remove(id: string) {
      this.toasts = this.toasts.filter(t => t.id !== id)
    },
    clear() {
      this.toasts = []
    },
  },
})
