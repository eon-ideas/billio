<script setup lang="ts">
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useCustomersStore } from '@/stores/customers'
import { useInvoicesStore } from '@/stores/invoices'
import Breadcrumb from '@/components/ui/Breadcrumb.vue'
import InvoiceForm from '@/components/invoices/InvoiceForm.vue'
import type { InvoiceFormData } from '@/types/invoice'

const router = useRouter()
const route = useRoute()
const customersStore = useCustomersStore()
const invoicesStore = useInvoicesStore()

const customerId = route.params.customerId as string
const customer = computed(() => customersStore.getCustomerById(customerId))

if (!customer.value) {
  router.push('/customers')
}

const breadcrumbItems = computed(() => [
  { name: 'Customers', to: '/customers' },
  { name: customer.value?.name || '', to: `/customers/${customerId}` },
  { name: 'New Invoice' }
])

const handleSubmit = (data: InvoiceFormData) => {
  invoicesStore.addInvoice({
    ...data,
    customer_id: customerId
  })
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
        <div>
          <h1 class="text-2xl font-bold text-gray-900">New Invoice</h1>
          <p class="mt-1 text-sm text-gray-500">
            Create a new invoice for {{ customer?.name }}
          </p>
        </div>
      </div>

      <!-- Main Content -->
      <div class="max-w-3xl">
        <div class="bg-white shadow-sm rounded-lg border border-gray-200">
          <div class="p-6">
            <div class="flex items-center space-x-3 pb-6 mb-6 border-b border-gray-200">
              <div class="flex-shrink-0 h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center">
                <svg class="h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h2 class="text-lg font-medium text-gray-900">Invoice Details</h2>
                <p class="text-sm text-gray-500">Fill in the information below to create a new invoice</p>
              </div>
            </div>

            <InvoiceForm
              :customer-id="customerId"
              @submit="handleSubmit"
            />
          </div>
        </div>
      </div>
    </main>
  </div>
</template>