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

// Find the customer with the most invoices
const topCustomer = computed(() => {
  if (filteredInvoices.value.length === 0) return null
  
  // Count invoices by customer
  const customerInvoiceCounts = filteredInvoices.value.reduce((counts, invoice) => {
    counts[invoice.customer_id] = (counts[invoice.customer_id] || 0) + 1
    return counts
  }, {} as Record<string, number>)
  
  // Find the customer_id with the most invoices
  let topCustomerId = ''
  let maxCount = 0
  
  Object.entries(customerInvoiceCounts).forEach(([customerId, count]) => {
    if (count > maxCount) {
      maxCount = count
      topCustomerId = customerId
    }
  })
  
  // Get the customer details
  const customer = customersStore.customers.find(c => c.id === topCustomerId)
  
  if (!customer) return null
  
  return {
    customer,
    invoiceCount: maxCount
  }
})

// Format for top customer display
const topCustomerInfo = computed(() => {
  if (!topCustomer.value) return 'No data'
  
  return topCustomer.value.customer.name
})

// Mock data for change percentages (in a real app, this would be calculated from historical data)
const stats = computed(() => [
  { 
    name: 'Total Invoices', 
    value: totalInvoices.value.toString(), 
    change: '+5.25%', 
    changeType: 'positive' 
  },
  { 
    name: 'Total Revenue', 
    value: formatCurrency(totalAmount.value), 
    change: '+4.75%', 
    changeType: 'positive' 
  },
  { 
    name: 'Average Invoice', 
    value: formatCurrency(averageInvoiceAmount.value), 
    change: '+2.45%', 
    changeType: 'positive' 
  },
  {
    name: 'Top Customer',
    value: topCustomerInfo.value,
    change: topCustomer.value ? `${topCustomer.value.invoiceCount} invoices` : '',
    changeType: 'neutral'
  }
])

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
  <div class="min-h-screen">
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
        <dl class="mx-auto grid grid-cols-1 gap-px bg-gray-900/5 sm:grid-cols-2 lg:grid-cols-4 mb-6 sm:mb-8 rounded-lg overflow-hidden shadow">
          <div v-for="stat in stats" :key="stat.name" class="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2 bg-white px-4 py-6 sm:px-6 xl:px-8">
            <dt class="text-sm font-medium text-gray-500">{{ stat.name }}</dt>
            <dd :class="[stat.changeType === 'negative' ? 'text-rose-600' : stat.changeType === 'positive' ? 'text-emerald-600' : 'text-gray-500', 'text-xs font-medium']">{{ stat.change }}</dd>
            <dd class="w-full flex-none text-2xl font-medium tracking-tight text-gray-900">{{ stat.value }}</dd>
          </div>
        </dl>

        <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <!-- Recent Invoices -->
          <div class="bg-white shadow rounded-lg">
            <div class="p-4 sm:p-6">
              <h2 class="text-lg font-medium text-gray-900 mb-4">Recent Invoices</h2>
              <div class="flow-root">
                <ul role="list" class="divide-y divide-gray-100 overflow-hidden bg-white ring-1 ring-gray-900/5 sm:rounded-xl">
                  <li v-for="invoice in recentInvoices" :key="invoice.id" class="relative flex justify-between gap-x-6 px-4 py-5 hover:bg-gray-50 sm:px-6">
                    <div class="flex min-w-0 gap-x-4">
                      <div class="flex-none rounded-full bg-gray-100 p-2">
                        <svg class="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div class="min-w-0 flex-auto">
                        <p class="text-sm/6 font-semibold text-gray-900">
                          <RouterLink :to="`/customers/${invoice.customer_id}/invoices/${invoice.id}/preview`">
                            <span class="absolute inset-x-0 -top-px bottom-0" />
                            Invoice #{{ invoice.number }}
                          </RouterLink>
                        </p>
                        <p class="mt-1 text-xs/5 text-gray-500">
                          {{ formatDate(invoice.date) }}
                        </p>
                      </div>
                    </div>
                    <div class="flex shrink-0 items-center gap-x-4">
                      <div class="hidden sm:flex sm:flex-col sm:items-end">
                        <p class="text-sm/6 font-medium text-gray-900">{{ formatCurrency(invoice.total) }}</p>
                        <p class="mt-1 text-xs/5 text-gray-500">
                          <span :class="invoice.paid ? 'text-emerald-600' : 'text-amber-600'">
                            {{ invoice.paid ? 'Paid' : 'Pending' }}
                          </span>
                        </p>
                      </div>
                      <svg class="h-5 w-5 flex-none text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fill-rule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clip-rule="evenodd" />
                      </svg>
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