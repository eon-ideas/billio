<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useCustomersStore } from '@/stores/customers'
import CustomerForm from '@/components/customers/CustomerForm.vue'
import Breadcrumb from '@/components/ui/Breadcrumb.vue'
import type { CustomerFormData } from '@/types/customer'

const router = useRouter()
const customersStore = useCustomersStore()
const error = ref<string | null>(null)

const breadcrumbItems = [
  { name: 'Customers', to: '/customers' },
  { name: 'New Customer' }
]

const handleSubmit = async (data: CustomerFormData) => {
  try {
    error.value = null
    const customer = await customersStore.addCustomer(data)
    if (customer) {
      router.push('/customers')
    }
  } catch (err: any) {
    error.value = err.message
  }
}
</script>

<template>
  <Breadcrumb :items="breadcrumbItems" class="hidden sm:block  mb-10" />
  <div class="min-h-screen bg-gray-50">
    <main class="py-6 px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="mb-8">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Add New Customer</h1>
          <p class="mt-1 text-sm text-gray-500">
            Create a new customer profile with their business information
          </p>
        </div>
      </div>

      <!-- Error Message -->
      <div v-if="error" class="mb-6">
        <div class="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p class="text-sm text-red-600">{{ error }}</p>
        </div>
      </div>

      <!-- Main Content -->
      <div class="max-w-2xl">
        <div class="bg-white shadow-sm rounded-lg border border-gray-200">
          <div class="p-6">
            <div class="flex items-center space-x-3 pb-6 mb-6 border-b border-gray-200">
              <div class="flex-shrink-0 h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center">
                <svg class="h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <div>
                <h2 class="text-lg font-medium text-gray-900">New Customer Details</h2>
                <p class="text-sm text-gray-500">Fill in the information below to create a new customer profile</p>
              </div>
            </div>

            <CustomerForm @submit="handleSubmit" />
          </div>
        </div>
      </div>
    </main>
  </div>
</template>