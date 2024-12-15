<script setup lang="ts">
import { onMounted, ref } from 'vue'
import Navigation from '@/components/layout/Navigation.vue'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const isMobileNavOpen = ref(false)

const toggleMobileNav = () => {
  isMobileNavOpen.value = !isMobileNavOpen.value
}

onMounted(async () => {
  await auth.initAuth()
})
</script>

<template>
  <div v-if="auth.isInitialized" class="min-h-screen bg-gray-100">
    <button
      v-if="auth.isAuthenticated"
      @click="toggleMobileNav"
      class="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-gray-800 text-white"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7" />
      </svg>
    </button>
    
    <Navigation 
      v-if="auth.isAuthenticated" 
      :is-mobile-open="isMobileNavOpen"
      @close="isMobileNavOpen = false"
    />
    
    <main 
      :class="{ 
        'lg:ml-64': auth.isAuthenticated,
        'ml-0': !auth.isAuthenticated || !isMobileNavOpen
      }" 
      class="min-h-screen transition-all duration-300"
    >
      <div class="p-4 md:p-6">
        <router-view />
      </div>
    </main>
  </div>
  <div v-else class="min-h-screen flex items-center justify-center">
    <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
  </div>
</template>