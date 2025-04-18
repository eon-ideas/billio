import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/lib/supabase'
import type { User, Session } from '@supabase/supabase-js'

export const useAuthStore = defineStore('auth', () => {
  const router = useRouter()
  const isAuthenticated = ref(false)
  const user = ref<User | null>(null)
  const isInitialized = ref(false)
  const userRole = ref<string | null>(null)
  const currentSession = ref<Session | null>(null)
  const authInProgress = ref(false)

  // Initialize the auth state
  const initAuth = async () => {
    // Don't try to initialize more than once simultaneously
    if (authInProgress.value) {
      return
    }

    // If already initialized and authenticated, don't reinitialize
    if (isInitialized.value && isAuthenticated.value && user.value) {
      return
    }

    try {
      authInProgress.value = true
      
      // Get the current session
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error) {
        throw error
      }
      
      // Store the session
      currentSession.value = session
      
      if (session) {
        isAuthenticated.value = true
        user.value = session.user
        
        // Set initialized early to allow UI rendering
        isInitialized.value = true
        
        // Fetch role in the background
        fetchUserRole().catch(err => console.error('Error fetching role:', err))
      } else {
        isAuthenticated.value = false
        user.value = null
        userRole.value = null
        isInitialized.value = true
      }
    } catch (error) {
      console.error('Error initializing auth:', error)
      isAuthenticated.value = false
      user.value = null
      userRole.value = null
      currentSession.value = null
      isInitialized.value = true
    } finally {
      authInProgress.value = false
    }
  }

  const fetchUserRole = async () => {
    if (!user.value) {
      userRole.value = null
      return
    }
    
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
      currentSession.value = data.session
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
        currentSession.value = null
        await router.push('/login')
        return
      }
      
      // Attempt to sign out
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      
      isAuthenticated.value = false
      user.value = null
      userRole.value = null
      currentSession.value = null
      await router.push('/login')
    } catch (error) {
      console.error('Logout error:', error)
      // Still cleanup local state and redirect even if there's an error
      isAuthenticated.value = false
      user.value = null
      userRole.value = null
      currentSession.value = null
      await router.push('/login')
    }
  }

  // Listen to auth changes
  supabase.auth.onAuthStateChange(async (_event, session) => {
    if (session) {
      currentSession.value = session
      isAuthenticated.value = true
      user.value = session.user
      isInitialized.value = true
      fetchUserRole().catch(err => console.error('Error fetching role on auth change:', err))
    } else {
      isAuthenticated.value = false
      user.value = null
      userRole.value = null
      currentSession.value = null
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