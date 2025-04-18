import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

export const useAuthStore = defineStore('auth', () => {
  const router = useRouter()
  const isAuthenticated = ref(false)
  const user = ref<User | null>(null)
  const isInitialized = ref(false)
  const userRole = ref<string | null>(null)

  // Initialize the auth state
  const initAuth = async () => {
    try {
      // Get the current session
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        isAuthenticated.value = true
        user.value = session.user
        await fetchUserRole()
      }
    } catch (error) {
      console.error('Error initializing auth:', error)
    } finally {
      isInitialized.value = true
    }
  }

  const fetchUserRole = async () => {
    try {
      const { data, error } = await supabase.rpc('get_user_role')
      if (error) throw error
      userRole.value = data
    } catch (error) {
      console.error('Error fetching user role:', error)
      userRole.value = null
    }
  }

  const isAdmin = () => {
    return userRole.value === 'ADMIN'
  }

  const login = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    
    if (error) throw error

    if (data.session) {
      isAuthenticated.value = true
      user.value = data.session.user
      await fetchUserRole()
      await router.push('/dashboard')
    }
  }

  const logout = async () => {
    try {
      // Check if we have a session first
      const { data: { session } } = await supabase.auth.getSession()
      
      // If no session, just clean up the local state
      if (!session) {
        isAuthenticated.value = false
        user.value = null
        userRole.value = null
        await router.push('/login')
        return
      }
      
      // Attempt to sign out
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      
      isAuthenticated.value = false
      user.value = null
      userRole.value = null
      await router.push('/login')
    } catch (error) {
      console.error('Logout error:', error)
      // Still cleanup local state and redirect even if there's an error
      isAuthenticated.value = false
      user.value = null
      userRole.value = null
      await router.push('/login')
    }
  }

  // Listen to auth changes
  supabase.auth.onAuthStateChange(async (_event, session) => {
    if (session) {
      isAuthenticated.value = true
      user.value = session.user
      await fetchUserRole()
    } else {
      isAuthenticated.value = false
      user.value = null
      userRole.value = null
    }
  })

  return {
    isAuthenticated,
    isInitialized,
    user,
    userRole,
    isAdmin,
    login,
    logout,
    initAuth
  }
})