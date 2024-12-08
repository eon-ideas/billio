<script setup lang="ts">
import { computed } from 'vue'
import type { Invoice } from '@/types/invoice'
import { useCustomersStore } from '@/stores/customers'
import { useCompanyStore } from '@/stores/company'

const props = defineProps<{
  invoice: Invoice
}>()

const customersStore = useCustomersStore()
const companyStore = useCompanyStore()
const customer = computed(() => customersStore.getCustomerById(props.invoice.customer_id))
const company = computed(() => companyStore.companyInfo)

// Ensure we have an array of items, even if empty
const items = computed(() => {
  console.log('Invoice items in preview:', props.invoice.items)
  return props.invoice.items || []
})

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: customer.value?.currency || 'USD',
    minimumFractionDigits: 2
  }).format(amount)
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const calculateItemTotal = (item: any) => {
  return (item.quantity || 0) * (item.price || 0)
}

const calculateInvoiceTotal = computed(() => {
  return items.value.reduce((total, item) => total + calculateItemTotal(item), 0)
})

const printInvoice = () => {
  window.print()
}
</script>

<template>
  <div class="max-w-4xl mx-auto bg-white p-8 print:p-6 print-area rounded-lg shadow-lg print:shadow-none">
    <!-- Header with Company Logo and Info -->
    <div class="grid grid-cols-2 gap-8 mb-12">
      <div class="flex items-start space-x-4">
        <div v-if="company.logoUrl" class="w-32 h-32 print:w-24 print:h-24">
          <img :src="company.logoUrl" alt="Company logo" class="w-full h-full object-contain" />
        </div>
        <div class="text-gray-600">
          <h2 class="font-bold text-xl text-gray-900 mb-2">{{ company.name }}</h2>
          <p class="whitespace-pre-line mb-1">{{ company.address }}</p>
          <p class="mb-1">VAT ID: {{ company.vatId }}</p>
          <p>IBAN: {{ company.iban }}</p>
        </div>
      </div>
      <div class="text-right">
        <div class="inline-block bg-blue-50 print:bg-transparent px-6 py-4 rounded-lg">
          <h1 class="text-3xl font-bold text-blue-600 print:text-gray-900 mb-3">INVOICE</h1>
          <p class="text-gray-600 mb-1">Invoice #: <span class="font-medium">{{ invoice.number }}</span></p>
          <p class="text-gray-600">Date: <span class="font-medium">{{ formatDate(invoice.date) }}</span></p>
        </div>
      </div>
    </div>

    <!-- Customer Info -->
    <div class="mb-12 bg-gray-50 print:bg-transparent p-6 rounded-lg">
      <h2 class="font-bold text-gray-900 mb-3">Bill To:</h2>
      <div class="text-gray-600">
        <p class="text-lg font-medium text-gray-900 mb-2">{{ customer?.name }}</p>
        <p class="mb-1">{{ customer?.address }}</p>
        <p class="mb-1">{{ customer?.city }}</p>
        <p>VAT ID: {{ customer?.vatId }}</p>
      </div>
    </div>

    <!-- Invoice Items -->
    <div class="mb-12 overflow-x-auto">
      <table class="w-full">
        <thead>
          <tr class="bg-gray-50 print:bg-transparent">
            <th class="py-3 px-4 text-left font-semibold text-gray-900">Description</th>
            <th class="py-3 px-4 text-right font-semibold text-gray-900">Quantity</th>
            <th class="py-3 px-4 text-right font-semibold text-gray-900">Price</th>
            <th class="py-3 px-4 text-right font-semibold text-gray-900">Total</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          <tr v-for="item in items" :key="item.id">
            <td class="py-4 px-4 text-gray-600">{{ item.description }}</td>
            <td class="py-4 px-4 text-right text-gray-600">{{ item.quantity }}</td>
            <td class="py-4 px-4 text-right text-gray-600">{{ formatCurrency(item.price) }}</td>
            <td class="py-4 px-4 text-right text-gray-900 font-medium">
              {{ formatCurrency(calculateItemTotal(item)) }}
            </td>
          </tr>
        </tbody>
        <tfoot>
          <tr class="border-t-2 border-gray-300">
            <td colspan="3" class="py-6 px-4 text-right font-bold text-gray-900">Total:</td>
            <td class="py-6 px-4 text-right font-bold text-gray-900 text-lg">
              {{ formatCurrency(calculateInvoiceTotal) }}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>

    <!-- Payment Info -->
    <div class="bg-blue-50 print:bg-transparent p-6 rounded-lg text-gray-600">
      <h3 class="font-bold text-gray-900 mb-3">Payment Information</h3>
      <div class="space-y-1">
        <p><span class="font-medium">Bank Account:</span> {{ company.iban }}</p>
        <p><span class="font-medium">Payment Reference:</span> Invoice #{{ invoice.number }}</p>
        <p class="text-sm mt-4">Please include the invoice number as payment reference</p>
      </div>
    </div>

    <!-- Print Button -->
    <div class="mt-8 text-center print:hidden">
      <button
        @click="printInvoice"
        class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-colors duration-200 inline-flex items-center"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
        </svg>
        Print Invoice
      </button>
    </div>
  </div>
</template>

<style>
@media print {
  @page {
    size: A4;
    margin: 1.5cm;
  }
  
  body {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
  
  body * {
    visibility: hidden;
  }
  
  .print-area, .print-area * {
    visibility: visible;
  }
  
  .print-area {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
  }
  
  /* Ensure background colors print */
  * {
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  
  /* Improve text contrast for printing */
  .text-gray-600 {
    color: #374151 !important;
  }
  
  /* Remove shadows and borders for cleaner print */
  .shadow-lg, .rounded-lg {
    box-shadow: none !important;
    border-radius: 0 !important;
  }
  
  /* Ensure proper page breaks */
  table {
    page-break-inside: auto;
  }
  
  tr {
    page-break-inside: avoid;
    page-break-after: auto;
  }
  
  thead {
    display: table-header-group;
  }
  
  tfoot {
    display: table-footer-group;
  }
}
</style>