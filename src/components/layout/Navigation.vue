<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import BaseButton from '@/components/ui/BaseButton.vue'

const auth = useAuthStore()

const handleLogout = () => {
  auth.logout()
}
</script>

<template>
  <nav class="bg-gray-800">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <span class="text-white font-bold">Dashboard</span>
          </div>
          <div class="hidden md:block">
            <div class="ml-10 flex items-baseline space-x-4">
              <router-link
                to="/dashboard"
                class="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
              >
                Home
              </router-link>
              <router-link
                to="/customers"
                class="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
              >
                Customers
              </router-link>
              <router-link
                to="/company-settings"
                class="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
              >
                Company Settings
              </router-link>
            </div>
          </div>
        </div>
        <div class="flex items-center">
          <span class="text-gray-300 mr-4">{{ auth.user?.email }}</span>
          <BaseButton @click="handleLogout">
            Logout
          </BaseButton>
        </div>
      </div>
    </div>
  </nav>
</template>