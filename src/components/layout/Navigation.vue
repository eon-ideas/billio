<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import BaseButton from '@/components/ui/BaseButton.vue'

defineProps<{
  isMobileOpen: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

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
  <nav 
    :class="{
      'translate-x-0': isMobileOpen,
      '-translate-x-full': !isMobileOpen,
      'lg:translate-x-0': true
    }"
    class="fixed left-0 top-0 h-full w-64 bg-gray-800 text-white shadow-lg transform transition-transform duration-300 z-40"
  >
    <div class="p-4">
      <div class="flex items-center justify-between mb-8">
        <div class="text-xl font-bold">Invoice Master</div>
        <button 
          @click="emit('close')"
          class="lg:hidden p-2 rounded-md hover:bg-gray-700"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div class="space-y-2">
        <router-link
          v-for="item in menuItems"
          :key="item.path"
          :to="item.path"
          class="flex items-center px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-white rounded-lg transition-colors"
          :class="{ 'bg-gray-700 text-white': $route.path.startsWith(item.path) }"
          @click="emit('close')"
        >
          <span class="text-sm font-medium">{{ item.name }}</span>
        </router-link>
      </div>
    </div>

    <div class="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-700">
      <div class="flex flex-col space-y-3">
        <span class="text-sm text-gray-400 truncate">{{ auth.user?.email }}</span>
        <BaseButton @click="handleLogout" class="w-full justify-center">
          Logout
        </BaseButton>
      </div>
    </div>
  </nav>

  <!-- Overlay for mobile -->
  <div 
    v-if="isMobileOpen"
    @click="emit('close')"
    class="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
  ></div>
</template>