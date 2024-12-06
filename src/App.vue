<script setup lang="ts">
import Navigation from '@/components/layout/Navigation.vue'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
</script>

<template>
  <div class="min-h-screen bg-gray-100">
    <Navigation v-if="auth.isAuthenticated" />
    <main :class="{ 'ml-64': auth.isAuthenticated }" class="min-h-screen transition-all duration-300">
      <div class="p-6">
        <router-view />
      </div>
    </main>
  </div>
</template>