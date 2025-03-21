<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useInvoicesStore } from '@/stores/invoices'
import { useCustomersStore } from '@/stores/customers'
import { RouterLink } from 'vue-router'
import PageTitle from '@/components/ui/PageTitle.vue'

const invoicesStore = useInvoicesStore()
const customersStore = useCustomersStore()

// Load data when component mounts
onMounted(async () => {
  await Promise.all([
    customersStore.fetchCustomers(),
    invoicesStore.fetchInvoices()
  ])
})

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
    <main class="max-w-7xl mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
      <div class="sm:px-0">
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8">
          <PageTitle 
            title="Dashboard" 
            subtitle="Track your business performance and invoice statistics" 
          />
          
          <div class="mt-4 sm:mt-0 overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
            <div class="inline-flex rounded-lg shadow-sm">
              <template v-for="(period, index) in periods" :key="period.days">
                <button
                  @click="selectedPeriod = period"
                  class="px-3 sm:px-4 py-2 text-sm font-medium whitespace-nowrap"
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
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <!-- Total Invoices -->
          <div class="bg-white overflow-hidden shadow rounded-lg">
            <div class="p-4 sm:p-5">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <svg class="h-5 w-5 sm:h-6 sm:w-6 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div class="ml-4 sm:ml-5 w-0 flex-1">
                  <dl>
                    <dt class="text-sm font-medium text-gray-500 truncate">Total Invoices</dt>
                    <dd class="flex items-baseline">
                      <div class="text-xl sm:text-2xl font-semibold text-gray-900">{{ totalInvoices }}</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <!-- Total Amount -->
          <div class="bg-white overflow-hidden shadow rounded-lg">
            <div class="p-4 sm:p-5">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <svg class="h-5 w-5 sm:h-6 sm:w-6 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div class="ml-4 sm:ml-5 w-0 flex-1">
                  <dl>
                    <dt class="text-sm font-medium text-gray-500 truncate">Total Amount</dt>
                    <dd class="flex items-baseline">
                      <div class="text-xl sm:text-2xl font-semibold text-gray-900">{{ formatCurrency(totalAmount) }}</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <!-- Average Invoice -->
          <div class="bg-white overflow-hidden shadow rounded-lg">
            <div class="p-4 sm:p-5">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <svg class="h-5 w-5 sm:h-6 sm:w-6 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div class="ml-4 sm:ml-5 w-0 flex-1">
                  <dl>
                    <dt class="text-sm font-medium text-gray-500 truncate">Average Invoice</dt>
                    <dd class="flex items-baseline">
                      <div class="text-xl sm:text-2xl font-semibold text-gray-900">{{ formatCurrency(averageInvoiceAmount) }}</div>
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
            <div class="p-4 sm:p-6">
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
                      <div class="text-right flex flex-col sm:block">
                        <p class="text-sm font-medium text-gray-900 mb-1 sm:mb-0">
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
        </div>
      </div>
    </main>
  </div>
</template>