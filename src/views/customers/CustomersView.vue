<script setup lang="ts">
import { useRouter } from 'vue-router'
import Navigation from '@/components/layout/Navigation.vue'
import CustomerList from '@/components/customers/CustomerList.vue'
import BaseButton from '@/components/ui/BaseButton.vue'

const router = useRouter()

const handleAddNew = () => {
  router.push('/customers/new')
}
</script>

<template>
  <div class="min-h-screen bg-gray-100">
    <Navigation />
    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="px-4 sm:px-0 flex justify-between items-center mb-4">
        <h1 class="text-2xl font-bold text-gray-900">Customers</h1>
        <BaseButton @click="handleAddNew">Add New Customer</BaseButton>
      </div>
      <div class="bg-white shadow rounded-lg">
        <CustomerList />
      </div>
    </main>
  </div>
</template>