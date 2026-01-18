import { useToastStore } from '@/stores/toast'

export function useToast() {
  const toast = useToastStore()
  return {
    success: (msg: string) => toast.push('success', msg),
    error: (msg: string) => toast.push('error', msg),
    info: (msg: string) => toast.push('info', msg),
  }
}
