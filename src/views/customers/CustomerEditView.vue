<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useCustomersStore } from '@/stores/customers'
import CustomerForm from '@/components/customers/CustomerForm.vue'
import Breadcrumb from '@/components/ui/Breadcrumb.vue'
import type { CustomerFormData, Customer } from '@/types/customer'

const router = useRouter()
const route = useRoute()
const customersStore = useCustomersStore()
const customer = ref<Customer | null>(null)

const customerId = route.params.id as string

onMounted(async () => {
  customer.value = await customersStore.getCustomerById(customerId)
  if (!customer.value) {
    router.push('/customers')
  }
})

const breadcrumbItems = [
  { name: 'Customers', to: '/customers' },
  { name: customer.value?.name || 'Edit Customer' }
]

const handleSubmit = async (data: CustomerFormData) => {
  await customersStore.updateCustomer(customerId, data)
  router.push('/customers')
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <main class="py-6 px-4 sm:px-6 lg:px-8">
      <!-- Breadcrumb -->
      <Breadcrumb :items="breadcrumbItems" />

      <!-- Header -->
      <div class="mb-8">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Edit Customer</h1>
          <p class="mt-1 text-sm text-gray-500">
            Update customer profile and business information
          </p>
        </div>
      </div>

      <!-- Main Content -->
      <div class="max-w-2xl">
        <div class="bg-white shadow-sm rounded-lg border border-gray-200">
          <div class="p-6">
            <div class="flex items-center space-x-3 pb-6 mb-6 border-b border-gray-200">
              <div class="flex-shrink-0 h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center">
                <svg class="h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <h2 class="text-lg font-medium text-gray-900">Customer Details</h2>
                <p class="text-sm text-gray-500">Update the information below to modify the customer profile</p>
              </div>
            </div>

            <CustomerForm 
              v-if="customer"
              :initial-data="customer"
              @submit="handleSubmit"
            />
          </div>
        </div>
      </div>
    </main>
  </div>
</template>