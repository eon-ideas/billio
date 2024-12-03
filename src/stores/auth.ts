import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

export const useAuthStore = defineStore('auth', () => {
  const router = useRouter()
  const isAuthenticated = ref(false)
  const user = ref<{ email: string } | null>(null)

  const login = async (email: string, password: string) => {
    if (email === 'test@example.com' && password === 'password') {
      isAuthenticated.value = true
      user.value = { email }
      await router.push('/dashboard')
      return true
    }
    throw new Error('Invalid credentials')
  }

  const logout = async () => {
    isAuthenticated.value = false
    user.value = null
    await router.push('/login')
  }

  return {
    isAuthenticated,
    user,
    login,
    logout
  }
})