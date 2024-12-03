import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'

export function useLogin() {
  const loading = ref(false)
  const error = ref<string | null>(null)
  const auth = useAuthStore()

  const login = async (email: string, password: string) => {
    loading.value = true
    error.value = null
    
    try {
      await auth.login(email, password)
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'An error occurred'
    } finally {
      loading.value = false
    }
  }

  return {
    login,
    loading,
    error
  }
}