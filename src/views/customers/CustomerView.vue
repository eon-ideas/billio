<script setup lang="ts">
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useCustomersStore } from '@/stores/customers'
import Breadcrumb from '@/components/ui/Breadcrumb.vue'

const router = useRouter()
const route = useRoute()
const customersStore = useCustomersStore()

const customerId = route.params.id as string
const customer = computed(() => customersStore.getCustomerById(customerId))

if (!customer.value) {
  router.push('/customers')
}

const breadcrumbItems = computed(() => [
  { name: 'Customers', to: '/customers' },
  { name: customer.value?.name || '' }
])

const handleEdit = () => {
  router.push(`/customers/${customerId}/edit`)
}

const handleViewInvoices = () => {
  router.push(`/customers/${customerId}/invoices`)
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <main class="py-6 px-4 sm:px-6 lg:px-8">
      <!-- Breadcrumb -->
      <Breadcrumb :items="breadcrumbItems" />

      <!-- Header -->
      <div class="mb-8">
        <div class="sm:flex sm:items-center sm:justify-between">
          <div>
            <h1 class="text-2xl font-bold text-gray-900">
              {{ customer?.name }}
            </h1>
            <p class="mt-1 text-sm text-gray-500">
              Customer Details
            </p>
          </div>
          <div class="mt-4 sm:mt-0 space-x-3">
            <button
              @click="handleViewInvoices"
              class="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg class="-ml-1 mr-2 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              View Invoices
            </button>
            <button
              @click="handleEdit"
              class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg class="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit Customer
            </button>
          </div>
        </div>
      </div>

      <!-- Customer Details -->
      <div class="bg-white shadow-sm rounded-lg border border-gray-200">
        <div class="px-4 py-5 sm:p-6">
          <dl class="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
            <div>
              <dt class="text-sm font-medium text-gray-500">Company Name</dt>
              <dd class="mt-1 text-sm text-gray-900">{{ customer?.name }}</dd>
            </div>
            <div>
              <dt class="text-sm font-medium text-gray-500">VAT ID</dt>
              <dd class="mt-1 text-sm text-gray-900">{{ customer?.vatId }}</dd>
            </div>
            <div>
              <dt class="text-sm font-medium text-gray-500">Currency</dt>
              <dd class="mt-1 text-sm text-gray-900">{{ customer?.currency }}</dd>
            </div>
            <div>
              <dt class="text-sm font-medium text-gray-500">City</dt>
              <dd class="mt-1 text-sm text-gray-900">{{ customer?.city }}</dd>
            </div>
            <div class="sm:col-span-2">
              <dt class="text-sm font-medium text-gray-500">Address</dt>
              <dd class="mt-1 text-sm text-gray-900">{{ customer?.address }}</dd>
            </div>
          </dl>
        </div>
      </div>
    </main>
  </div>
</template>
