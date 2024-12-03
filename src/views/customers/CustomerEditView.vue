<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router'
import { useCustomersStore } from '@/stores/customers'
import Navigation from '@/components/layout/Navigation.vue'
import CustomerForm from '@/components/customers/CustomerForm.vue'
import type { CustomerFormData } from '@/types/customer'

const router = useRouter()
const route = useRoute()
const customersStore = useCustomersStore()

const customerId = route.params.id as string
const customer = customersStore.getCustomerById(customerId)

if (!customer) {
  router.push('/customers')
}

const handleSubmit = (data: CustomerFormData) => {
  customersStore.updateCustomer(customerId, data)
  router.push('/customers')
}
</script>

<template>
  <div class="min-h-screen bg-gray-100">
    <Navigation />
    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="px-4 sm:px-0 mb-4">
        <h1 class="text-2xl font-bold text-gray-900">Edit Customer</h1>
      </div>
      <div class="bg-white shadow rounded-lg p-6">
        <CustomerForm 
          v-if="customer"
          :initial-data="customer"
          @submit="handleSubmit"
        />
      </div>
    </main>
  </div>
</template>