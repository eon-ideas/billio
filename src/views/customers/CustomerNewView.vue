<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useCustomersStore } from '@/stores/customers'
import Navigation from '@/components/layout/Navigation.vue'
import CustomerForm from '@/components/customers/CustomerForm.vue'
import type { CustomerFormData } from '@/types/customer'

const router = useRouter()
const customersStore = useCustomersStore()

const handleSubmit = (data: CustomerFormData) => {
  customersStore.addCustomer(data)
  router.push('/customers')
}
</script>

<template>
  <div class="min-h-screen bg-gray-100">
    <Navigation />
    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="px-4 sm:px-0 mb-4">
        <h1 class="text-2xl font-bold text-gray-900">Add New Customer</h1>
      </div>
      <div class="bg-white shadow rounded-lg p-6">
        <CustomerForm @submit="handleSubmit" />
      </div>
    </main>
  </div>
</template>