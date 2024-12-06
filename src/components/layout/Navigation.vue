<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import BaseButton from '@/components/ui/BaseButton.vue'

const auth = useAuthStore()

const handleLogout = () => {
  auth.logout()
}

const menuItems = [
  { name: 'Dashboard', path: '/dashboard', icon: 'home' },
  { name: 'Customers', path: '/customers', icon: 'users' },
  { name: 'Company Settings', path: '/company-settings', icon: 'cog' }
]
</script>

<template>
  <nav class="fixed left-0 top-0 h-full w-64 bg-gray-800 text-white shadow-lg">
    <div class="p-4">
      <div class="flex items-center justify-between mb-8">
        <div class="text-xl font-bold">Invoice Master</div>
      </div>

      <div class="space-y-2">
        <router-link
          v-for="item in menuItems"
          :key="item.path"
          :to="item.path"
          class="flex items-center px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-white rounded-lg transition-colors"
          :class="{ 'bg-gray-700 text-white': $route.path.startsWith(item.path) }"
        >
          <span class="text-sm font-medium">{{ item.name }}</span>
        </router-link>
      </div>
    </div>

    <div class="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-700">
      <div class="flex flex-col space-y-3">
        <span class="text-sm text-gray-400">{{ auth.user?.email }}</span>
        <BaseButton @click="handleLogout" class="w-full justify-center">
          Logout
        </BaseButton>
      </div>
    </div>
  </nav>
</template>

<style scoped>
.router-link-active {
  @apply bg-gray-700 text-white;
}
</style>