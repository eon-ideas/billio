<script setup lang="ts">
import { computed } from 'vue'
import { useInvoicesStore } from '@/stores/invoices'
import { useCustomersStore } from '@/stores/customers'
import { useRouter } from 'vue-router'

const props = defineProps<{
  customerId: string
  searchQuery?: string
}>()

const router = useRouter()
const invoicesStore = useInvoicesStore()
const customersStore = useCustomersStore()

const customer = computed(() => customersStore.getCustomerById(props.customerId))
const invoices = computed(() => {
  const allInvoices = invoicesStore.invoices
  let filteredInvoices = allInvoices.filter(i => i.customer_id === props.customerId)
  
  if (props.searchQuery) {
    const query = props.searchQuery.toLowerCase()
    filteredInvoices = filteredInvoices.filter(invoice => 
      invoice.number.toLowerCase().includes(query) ||
      invoice.total.toString().includes(query)
    )
  }
  
  return filteredInvoices
})

const handleEdit = (id: string) => {
  router.push(`/customers/${props.customerId}/invoices/${id}/edit`)
}

const handlePreview = (id: string) => {
  router.push(`/customers/${props.customerId}/invoices/${id}/preview`)
}

const handleTogglePaid = (id: string) => {
  invoicesStore.toggleInvoicePaid(id)
}

const formatCurrency = (amount: number, currency: string) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(amount)
}
</script>

<template>
  <div class="overflow-x-auto">
    <table class="min-w-full divide-y divide-gray-200">
      <thead class="bg-gray-50">
        <tr>
          <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Number</th>
          <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
          <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
          <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
          <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
          <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
        </tr>
      </thead>
      <tbody class="bg-white divide-y divide-gray-200">
        <tr v-for="invoice in invoices" 
            :key="invoice.id"
            class="hover:bg-gray-50 transition-colors"
        >
          <td class="px-6 py-4 whitespace-nowrap">
            <button
              @click="handlePreview(invoice.id)"
              class="text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors"
            >
              {{ invoice.number }}
            </button>
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
            {{ new Date(invoice.date).toLocaleDateString() }}
          </td>
          <td class="px-6 py-4 whitespace-nowrap">
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {{ invoice.items.length }}
            </span>
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
            {{ formatCurrency(invoice.total, customer?.currency || 'USD') }}
          </td>
          <td class="px-6 py-4 whitespace-nowrap">
            <button
              @click="handleTogglePaid(invoice.id)"
              :class="[
                'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors',
                invoice.paid 
                  ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                  : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
              ]"
            >
              <span class="flex items-center">
                <span class="h-2 w-2 mr-1.5 rounded-full" :class="[
                  invoice.paid ? 'bg-green-400' : 'bg-yellow-400'
                ]"></span>
                {{ invoice.paid ? 'Paid' : 'Unpaid' }}
              </span>
            </button>
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-sm">
            <div class="flex items-center space-x-3">
              <button
                @click="handlePreview(invoice.id)"
                class="text-gray-400 hover:text-blue-600 transition-colors"
                title="Preview invoice"
              >
                <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </button>
              <button
                @click="handleEdit(invoice.id)"
                class="text-gray-400 hover:text-blue-600 transition-colors"
                title="Edit invoice"
              >
                <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button
                @click="handleTogglePaid(invoice.id)"
                class="text-gray-400 hover:text-blue-600 transition-colors"
                :title="invoice.paid ? 'Mark as unpaid' : 'Mark as paid'"
              >
                <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>