import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/lib/supabase'
import type { User, Session } from '@supabase/supabase-js'

// Storage bucket name for user avatars
const STORAGE_BUCKET = 'public' // Change this to match your actual bucket name in Supabase

interface UserProfile {
  id: string
  nickname: string
  avatar_url: string | null
  role: string | null
  email: string
}

export const useAuthStore = defineStore('auth', () => {
  const router = useRouter()
  const isAuthenticated = ref(false)
  const user = ref<User | null>(null)
  const isInitialized = ref(false)
  const userRole = ref<string | null>(null)
  const currentSession = ref<Session | null>(null)
  const authInProgress = ref(false)
  const userProfile = ref<UserProfile | null>(null)
  const isProfileLoading = ref(false)

  // Initialize the auth state
  const initAuth = async () => {
    // Don't try to initialize more than once simultaneously
    if (authInProgress.value) {
      // If initialization is in progress, wait for it to complete
      return new Promise((resolve) => {
        const checkInterval = setInterval(() => {
          if (!authInProgress.value) {
            clearInterval(checkInterval)
            resolve(true)
          }
        }, 100)
      })
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
  
  const fetchUserProfile = async () => {
    if (!user.value) {
      userProfile.value = null
      return
    }
    
    isProfileLoading.value = true
    
    try {
      const { data, error } = await supabase.rpc('get_user_profile')
      if (error) throw error
      
      userProfile.value = data
    } catch (error) {
      console.error('Error fetching user profile:', error)
      // Create a minimal profile with available data if full profile fetch fails
      if (user.value) {
        userProfile.value = {
          id: user.value.id,
          nickname: user.value.email || 'User',
          avatar_url: null,
          role: userRole.value,
          email: user.value.email || ''
        }
      }
    } finally {
      isProfileLoading.value = false
    }
  }

  const isAdmin = () => {
    return userRole.value === 'ADMIN'
  }

  const login = async (email: string, password: string, rememberMe: boolean = false) => {
    // If rememberMe is false, we'll use sessionStorage which is cleared when the browser is closed
    // If rememberMe is true, we'll use localStorage which persists until explicitly cleared
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    
    if (error) throw error

    // If user doesn't want to be remembered, update the session storage type
    if (!rememberMe && data.session) {
      // Set session to be stored in sessionStorage instead of localStorage
      await supabase.auth.setSession({
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token
      })
    }

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

  const updateUserProfile = async (nickname: string) => {
    if (!user.value) throw new Error('Not authenticated')
    
    isProfileLoading.value = true
    
    try {
      const { data, error } = await supabase.rpc('update_user_profile', {
        p_nickname: nickname,
        p_avatar_url: userProfile.value?.avatar_url || null
      })
      
      if (error) throw error
      
      // Update local profile data
      if (userProfile.value) {
        userProfile.value.nickname = data.nickname
      } else {
        await fetchUserProfile()
      }
      
      return data
    } catch (error) {
      console.error('Error updating profile:', error)
      throw error
    } finally {
      isProfileLoading.value = false
    }
  }
  
  const uploadAvatar = async (file: File) => {
    if (!user.value) throw new Error('Not authenticated')
    
    isProfileLoading.value = true
    
    try {
      // Create a unique file path for the avatar
      const fileExt = file.name.split('.').pop()
      const filePath = `user-avatars/${user.value.id}-${Date.now()}.${fileExt}`
      
      // Upload the avatar image to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        })
      
      if (uploadError) throw uploadError
      
      // Get a signed URL for the uploaded image that includes authentication
      const { data } = await supabase.storage
        .from(STORAGE_BUCKET)
        .createSignedUrl(filePath, 60 * 60 * 24 * 7) // 7 days expiry
      
      const avatarUrl = data?.signedUrl || ''
      
      // Update the user profile with the new avatar URL
      const { data: updatedProfile, error } = await supabase.rpc('update_user_profile', {
        p_nickname: userProfile.value?.nickname || null,
        p_avatar_url: avatarUrl
      })
      
      if (error) throw error
      
      // Update local profile data
      if (userProfile.value) {
        userProfile.value.avatar_url = updatedProfile.avatar_url
      } else {
        await fetchUserProfile()
      }
      
      return updatedProfile
    } catch (error) {
      console.error('Error uploading avatar:', error)
      throw error
    } finally {
      isProfileLoading.value = false
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
      fetchUserProfile().catch(err => console.error('Error fetching profile on auth change:', err))
    } else {
      isAuthenticated.value = false
      user.value = null
      userRole.value = null
      userProfile.value = null
      currentSession.value = null
      isInitialized.value = true
    }
  })

  // Function to refresh the signed URL for an avatar
  const refreshAvatarUrl = async () => {
    if (!userProfile.value?.avatar_url || !isAuthenticated.value || !user.value) return

    try {
      // Check if we have a valid session first
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()

      if (sessionError || !session) {
        console.error('No valid session for refreshing avatar URL')
        return
      }

      // Extract the file path from the avatar URL
      const url = userProfile.value.avatar_url
      const pathMatch = url.match(/\/storage\/v1\/object\/sign\/([^\/]+)\/(.*)(?:\?|$)/)

      if (!pathMatch || !pathMatch[1] || !pathMatch[2]) {
        console.error('Could not extract file path from avatar URL:', url)
        return
      }

      // Extract bucket and file path separately to avoid double bucket prefix
      const bucket = pathMatch[1] // This should be 'public'
      const filePath = pathMatch[2] // This should be the actual file path

      // Remove any duplicate bucket prefix if present
      const cleanFilePath = filePath.startsWith(bucket + '/')
        ? filePath.substring(bucket.length + 1)
        : filePath

      console.log('Refreshing signed URL for:', cleanFilePath)

      // Create a new signed URL
      const { data, error } = await supabase.storage
        .from(STORAGE_BUCKET)
        .createSignedUrl(cleanFilePath, 60 * 60 * 24 * 30) // 30 days expiry

      if (error) {
        console.error('Error creating signed URL:', error)
        return
      }

      if (data?.signedUrl && userProfile.value) {
        userProfile.value.avatar_url = data.signedUrl
        console.log('Avatar URL refreshed:', data.signedUrl)
      }
    } catch (error) {
      console.error('Error refreshing avatar URL:', error)
    }
  }

  // Function to change the user's password
  const changePassword = async (currentPassword: string, newPassword: string) => {
    if (!user.value || !user.value.email) throw new Error('Not authenticated')

    try {
      // First, verify the current password by attempting to sign in
      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email: user.value.email,
        password: currentPassword
      })

      if (verifyError) {
        throw new Error('Current password is incorrect')
      }

      // If verification succeeds, update to the new password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (updateError) throw updateError

      return { success: true }
    } catch (error) {
      console.error('Error changing password:', error)
      throw error
    }
  }

  return {
    isAuthenticated,
    isInitialized,
    user,
    userRole,
    userProfile,
    isProfileLoading,
    isAdmin,
    login,
    logout,
    initAuth,
    fetchUserProfile,
    updateUserProfile,
    uploadAvatar,
    refreshAvatarUrl,
    changePassword
  }
})