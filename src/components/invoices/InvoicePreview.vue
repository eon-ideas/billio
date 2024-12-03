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
const customer = computed(() => customersStore.getCustomerById(props.invoice.customerId))
const company = computed(() => companyStore.companyInfo)

const printInvoice = () => {
  window.print()
}
</script>

<template>
  <div class="max-w-4xl mx-auto bg-white p-8 print:p-4">
    <!-- Header with Company Logo and Info -->
    <div class="flex justify-between items-start mb-8">
      <div class="flex items-start space-x-4">
        <div v-if="company.logoUrl" class="w-24 h-24">
          <img :src="company.logoUrl" alt="Company logo" class="w-full h-full object-contain" />
        </div>
        <div>
          <h2 class="font-bold text-xl">{{ company.name }}</h2>
          <p class="whitespace-pre-line">{{ company.address }}</p>
          <p>VAT ID: {{ company.vatId }}</p>
          <p>IBAN: {{ company.iban }}</p>
        </div>
      </div>
      <div>
        <h1 class="text-2xl font-bold mb-2">INVOICE</h1>
        <p class="text-gray-600">Invoice #: {{ invoice.number }}</p>
        <p class="text-gray-600">Date: {{ new Date(invoice.date).toLocaleDateString() }}</p>
      </div>
    </div>

    <!-- Customer Info -->
    <div class="mb-8">
      <h2 class="font-bold mb-2">Bill To:</h2>
      <p>{{ customer?.name }}</p>
      <p>{{ customer?.address }}</p>
      <p>{{ customer?.city }}</p>
      <p>VAT ID: {{ customer?.vatId }}</p>
    </div>

    <!-- Invoice Items -->
    <table class="w-full mb-8">
      <thead>
        <tr class="border-b-2 border-gray-300">
          <th class="py-2 text-left">Description</th>
          <th class="py-2 text-right">Quantity</th>
          <th class="py-2 text-right">Price</th>
          <th class="py-2 text-right">Total</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in invoice.items" :key="item.id" class="border-b border-gray-200">
          <td class="py-2">{{ item.description }}</td>
          <td class="py-2 text-right">{{ item.quantity }}</td>
          <td class="py-2 text-right">{{ item.price.toFixed(2) }}</td>
          <td class="py-2 text-right">{{ (item.quantity * item.price).toFixed(2) }}</td>
        </tr>
      </tbody>
      <tfoot>
        <tr>
          <td colspan="3" class="py-4 text-right font-bold">Total:</td>
          <td class="py-4 text-right font-bold">
            {{ invoice.total.toFixed(2) }} {{ customer?.currency }}
          </td>
        </tr>
      </tfoot>
    </table>

    <!-- Payment Info -->
    <div class="border-t pt-4 text-sm text-gray-600">
      <p class="font-bold mb-1">Payment Information:</p>
      <p>IBAN: {{ company.iban }}</p>
      <p>Invoice #{{ invoice.number }} as payment reference</p>
    </div>

    <!-- Print Button -->
    <div class="mt-8 print:hidden">
      <button
        @click="printInvoice"
        class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Print Invoice
      </button>
    </div>
  </div>
</template>

<style>
@media print {
  @page {
    margin: 1cm;
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
  }
}
</style>