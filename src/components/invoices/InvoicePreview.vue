<script setup lang="ts">
import { computed } from 'vue'
import type { Invoice } from '@/types/invoice'
import { useCustomersStore } from '@/stores/customers'

const props = defineProps<{
  invoice: Invoice
}>()

const customersStore = useCustomersStore()
const customer = computed(() => customersStore.getCustomerById(props.invoice.customerId))

const printInvoice = () => {
  window.print()
}
</script>

<template>
  <div class="max-w-4xl mx-auto bg-white p-8 print:p-4">
    <div class="flex justify-between items-start mb-8">
      <div>
        <h1 class="text-2xl font-bold mb-2">INVOICE</h1>
        <p class="text-gray-600">Invoice #: {{ invoice.number }}</p>
        <p class="text-gray-600">Date: {{ new Date(invoice.date).toLocaleDateString() }}</p>
      </div>
      <div class="text-right">
        <h2 class="font-bold mb-2">Bill To:</h2>
        <p>{{ customer?.name }}</p>
        <p>{{ customer?.address }}</p>
        <p>{{ customer?.city }}</p>
        <p>VAT ID: {{ customer?.vatId }}</p>
      </div>
    </div>

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

    <div class="print:hidden">
      <BaseButton @click="printInvoice">Print Invoice</BaseButton>
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