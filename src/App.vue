<script setup lang="ts">
import { onMounted, ref } from 'vue'
import Navigation from '@/components/layout/Navigation.vue'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const isMobileNavOpen = ref(false)
const isLoading = ref(true)

// Initialize auth on app mount
onMounted(async () => {
  try {
    // Initialize auth state
    await auth.initAuth()
  } catch (error) {
    console.error('Failed to initialize auth:', error)
  } finally {
    // Always set loading to false after auth initialization
    isLoading.value = false
  }
})
</script>

<template>
  <!-- Show loading spinner until auth is initialized -->
  <div v-if="isLoading || !auth.isInitialized" class="h-full flex items-center justify-center">
    <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
  </div>
  
  <!-- Show content only after auth is initialized -->
  <div v-else class="h-full bg-white">
    <template v-if="auth.isAuthenticated">
      <Navigation 
        :is-mobile-open="isMobileNavOpen"
        @close="isMobileNavOpen = false"
        @open="isMobileNavOpen = true"
      />
      
      <div class="lg:pl-72">
        <main class="pt-0 pb-4">
          <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <router-view />
          </div>
        </main>
      </div>
    </template>
    
    <router-view v-else />
  </div>
</template>