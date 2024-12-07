<script setup lang="ts">
import { onMounted } from 'vue'
import Navigation from '@/components/layout/Navigation.vue'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()

onMounted(async () => {
  await auth.initAuth()
})
</script>

<template>
  <div v-if="auth.isInitialized" class="min-h-screen bg-gray-100">
    <Navigation v-if="auth.isAuthenticated" />
    <main :class="{ 'ml-64': auth.isAuthenticated }" class="min-h-screen transition-all duration-300">
      <div class="p-6">
        <router-view />
      </div>
    </main>
  </div>
  <div v-else class="min-h-screen flex items-center justify-center">
    <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
  </div>
</template>