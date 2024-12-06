<script setup lang="ts">
import { computed, ref } from 'vue'
import Navigation from '@/components/layout/Navigation.vue'
import { useInvoicesStore } from '@/stores/invoices'
import { useCustomersStore } from '@/stores/customers'
import { RouterLink } from 'vue-router'

const invoicesStore = useInvoicesStore()
const customersStore = useCustomersStore()

// Time period selection
const periods = [
  { label: 'Last 30 Days', days: 30 },
  { label: '3 Months', days: 90 },
  { label: '6 Months', days: 180 },
  { label: '1 Year', days: 365 }
]
const selectedPeriod = ref(periods[3]) // Default to 1 year

const startDate = computed(() => {
  const date = new Date()
  date.setDate(date.getDate() - selectedPeriod.value.days)
  return date
})

const filteredInvoices = computed(() => {
  return invoicesStore.invoices.filter(invoice => 
    new Date(invoice.date) >= startDate.value
  )
})

const totalInvoices = computed(() => filteredInvoices.value.length)
const totalAmount = computed(() => 
  filteredInvoices.value.reduce((sum, invoice) => sum + invoice.total, 0)
)
const averageInvoiceAmount = computed(() => 
  totalInvoices.value ? totalAmount.value / totalInvoices.value : 0
)

const invoiceSumByCustomer = computed(() => {
  const customerSums = new Map()
  
  filteredInvoices.value.forEach(invoice => {
    const customer = customersStore.getCustomerById(invoice.customerId)
    if (!customer) return

    const currentSum = customerSums.get(customer.id) || 0
    customerSums.set(customer.id, currentSum + invoice.total)
  })

  return Array.from(customerSums.entries())
    .map(([customerId, total]) => ({
      customer: customersStore.getCustomerById(customerId),
      total
    }))
    .sort((a, b) => b.total - a.total) // Sort by total amount descending
})

const recentInvoices = computed(() => {
  return [...filteredInvoices.value]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5)
})

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(amount)
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <Navigation />
    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="px-4 sm:px-0">
        <!-- Header -->
        <div class="sm:flex sm:items-center sm:justify-between mb-8">
          <div>
            <h1 class="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p class="mt-2 text-sm text-gray-600">Track your business performance and invoice statistics</p>
          </div>
          <div class="mt-4 sm:mt-0">
            <div class="inline-flex rounded-lg shadow-sm">
              <template v-for="(period, index) in periods" :key="period.days">
                <button
                  @click="selectedPeriod = period"
                  class="px-4 py-2 text-sm font-medium"
                  :class="[
                    selectedPeriod === period
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50',
                    index === 0 ? 'rounded-l-lg' : '',
                    index === periods.length - 1 ? 'rounded-r-lg' : '',
                    'border border-gray-200',
                    index !== 0 ? '-ml-px' : ''
                  ]"
                >
                  {{ period.label }}
                </button>
              </template>
            </div>
          </div>
        </div>

        <!-- Stats Grid -->
        <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8">
          <!-- Total Invoices -->
          <div class="bg-white overflow-hidden shadow rounded-lg">
            <div class="p-5">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <svg class="h-6 w-6 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div class="ml-5 w-0 flex-1">
                  <dl>
                    <dt class="text-sm font-medium text-gray-500 truncate">Total Invoices</dt>
                    <dd class="flex items-baseline">
                      <div class="text-2xl font-semibold text-gray-900">{{ totalInvoices }}</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <!-- Total Amount -->
          <div class="bg-white overflow-hidden shadow rounded-lg">
            <div class="p-5">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <svg class="h-6 w-6 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div class="ml-5 w-0 flex-1">
                  <dl>
                    <dt class="text-sm font-medium text-gray-500 truncate">Total Amount</dt>
                    <dd class="flex items-baseline">
                      <div class="text-2xl font-semibold text-gray-900">{{ formatCurrency(totalAmount) }}</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <!-- Average Invoice -->
          <div class="bg-white overflow-hidden shadow rounded-lg">
            <div class="p-5">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <svg class="h-6 w-6 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div class="ml-5 w-0 flex-1">
                  <dl>
                    <dt class="text-sm font-medium text-gray-500 truncate">Average Invoice</dt>
                    <dd class="flex items-baseline">
                      <div class="text-2xl font-semibold text-gray-900">{{ formatCurrency(averageInvoiceAmount) }}</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <!-- Recent Invoices -->
          <div class="bg-white shadow rounded-lg">
            <div class="p-6">
              <h2 class="text-lg font-medium text-gray-900 mb-4">Recent Invoices</h2>
              <div class="flow-root">
                <ul role="list" class="-my-5 divide-y divide-gray-200">
                  <li v-for="invoice in recentInvoices" :key="invoice.id" class="py-4">
                    <div class="flex items-center space-x-4">
                      <div class="flex-1 min-w-0">
                        <p class="text-sm font-medium text-gray-900 truncate">
                          Invoice #{{ invoice.number }}
                        </p>
                        <p class="text-sm text-gray-500">
                          {{ formatDate(invoice.date) }}
                        </p>
                      </div>
                      <div class="text-right">
                        <p class="text-sm font-medium text-gray-900">
                          {{ formatCurrency(invoice.total) }}
                        </p>
                        <RouterLink
                          :to="`/invoices/${invoice.id}`"
                          class="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700"
                        >
                          View
                          <svg class="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                          </svg>
                        </RouterLink>
                      </div>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <!-- Customer Summary -->
          <div class="bg-white shadow rounded-lg">
            <div class="p-6">
              <h2 class="text-lg font-medium text-gray-900 mb-4">Top Customers</h2>
              <div class="flow-root">
                <ul role="list" class="-my-5 divide-y divide-gray-200">
                  <li v-for="summary in invoiceSumByCustomer" :key="summary.customer?.id" class="py-4">
                    <div class="flex items-center space-x-4">
                      <div class="flex-1 min-w-0">
                        <p class="text-sm font-medium text-gray-900 truncate">
                          {{ summary.customer?.name || 'Unknown Customer' }}
                        </p>
                        <p class="text-sm text-gray-500">
                          {{ summary.customer?.city }}
                        </p>
                      </div>
                      <div class="text-right">
                        <p class="text-sm font-medium text-gray-900">
                          {{ formatCurrency(summary.total) }}
                        </p>
                        <RouterLink
                          :to="`/customers/${summary.customer?.id}`"
                          class="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700"
                        >
                          View
                          <svg class="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                          </svg>
                        </RouterLink>
                      </div>
                    </div>
                  </li>
                  <li v-if="invoiceSumByCustomer.length === 0" class="py-4">
                    <p class="text-sm text-gray-500 text-center">No invoices found in the selected period</p>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>