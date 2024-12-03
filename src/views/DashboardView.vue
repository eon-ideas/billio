<script setup lang="ts">
import Navigation from '@/components/layout/Navigation.vue'
import { useInvoicesStore } from '@/stores/invoices'
import { useCustomersStore } from '@/stores/customers'
import { computed } from 'vue'

const invoicesStore = useInvoicesStore()
const customersStore = useCustomersStore()

const oneYearAgo = new Date()
oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)

const yearlyInvoices = computed(() => {
  return invoicesStore.invoices.filter(invoice => 
    new Date(invoice.date) >= oneYearAgo
  )
})

const totalInvoices = computed(() => yearlyInvoices.value.length)

const invoiceSumByCustomer = computed(() => {
  const customerSums = new Map()
  
  yearlyInvoices.value.forEach(invoice => {
    const customer = customersStore.getCustomerById(invoice.customerId)
    if (!customer) return

    const currentSum = customerSums.get(customer.id) || 0
    customerSums.set(customer.id, currentSum + invoice.total)
  })

  return Array.from(customerSums.entries()).map(([customerId, total]) => ({
    customer: customersStore.getCustomerById(customerId),
    total
  }))
})
</script>

<template>
  <div class="min-h-screen bg-gray-100">
    <Navigation />
    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="px-4 py-6 sm:px-0">
        <div class="bg-white shadow rounded-lg divide-y divide-gray-200">
          <div class="px-6 py-5">
            <h1 class="text-2xl font-bold text-gray-900">Invoice Summary (Past Year)</h1>
          </div>
          
          <!-- Total Invoices Card -->
          <div class="px-6 py-5">
            <h2 class="text-lg font-medium text-gray-900">Total Invoices</h2>
            <p class="mt-2 text-3xl font-semibold text-indigo-600">{{ totalInvoices }}</p>
          </div>

          <!-- Customer Summary -->
          <div class="px-6 py-5">
            <h2 class="text-lg font-medium text-gray-900">Invoice Sum by Customer</h2>
            <div class="mt-4 space-y-4">
              <div v-for="summary in invoiceSumByCustomer" :key="summary.customer?.id" 
                   class="flex justify-between items-center">
                <span class="text-gray-700">{{ summary.customer?.name || 'Unknown Customer' }}</span>
                <span class="text-indigo-600 font-medium">${{ summary.total.toFixed(2) }}</span>
              </div>
              <div v-if="invoiceSumByCustomer.length === 0" class="text-gray-500 text-center py-4">
                No invoices found in the past year
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>