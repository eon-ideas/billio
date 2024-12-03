<script setup lang="ts">
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useCustomersStore } from '@/stores/customers'
import { useInvoicesStore } from '@/stores/invoices'
import Navigation from '@/components/layout/Navigation.vue'
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

const handleSubmit = (data: InvoiceFormData) => {
  invoicesStore.addInvoice(data)
  router.push(`/customers/${customerId}/invoices`)
}
</script>

<template>
  <div class="min-h-screen bg-gray-100">
    <Navigation />
    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="px-4 sm:px-0 mb-4">
        <h1 class="text-2xl font-bold text-gray-900">New Invoice</h1>
        <p class="mt-1 text-sm text-gray-500">
          Customer: {{ customer?.name }}
        </p>
      </div>
      <div class="bg-white shadow rounded-lg p-6">
        <InvoiceForm
          :customer-id="customerId"
          @submit="handleSubmit"
        />
      </div>
    </main>
  </div>
</template>