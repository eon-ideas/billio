<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import type { Invoice } from '@/types/invoice'
import type { Customer } from '@/types/customer'
import { useCustomersStore } from '@/stores/customers'
import { useCompanyStore } from '@/stores/company'

const props = defineProps<{
  invoice: Invoice
}>()

const customersStore = useCustomersStore()
const companyStore = useCompanyStore()
const customer = ref<Customer | null>(null)
const company = computed(() => companyStore.companyInfo)

// Ensure we have an array of items, even if empty
const items = computed(() => {
  console.log('Invoice items in preview:', props.invoice.invoice_items)
  return props.invoice.invoice_items || []
})

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: customer.value?.currency || 'USD',
    minimumFractionDigits: 2
  }).format(amount)
}

const formatDate = (date: string | null) => {
  if(!date) return undefined
  const d = new Date(date)
  return `${d.getDate().toString().padStart(2, '0')}.${(d.getMonth() + 1).toString().padStart(2, '0')}.${d.getFullYear()}.`
}

const calculateItemTotal = (item: any) => {
  return (item.quantity || 0) * (item.price || 0)
}

const printInvoice = () => {
  window.print()
}

// Load customer data when component mounts
onMounted(async () => {
  if (props.invoice.customer_id) {
    customer.value = await customersStore.getCustomerById(props.invoice.customer_id)
  }
})
</script>

<template>
  <div class="max-w-4xl mx-auto bg-white p-8 print:p-6 print-area">
    <!-- Company Info at Top -->
    <div class="flex justify-between items-start mb-8">
      <div class="text-sm space-y-1">
        <h2 class="text-xl font-bold mb-2">{{ company.name }}</h2>
        <div>
          <p v-if="company.vatId" class="text-gray-600">VAT ID: {{ company.vatId }}</p>
          <p v-if="company.iban" class="text-gray-600">IBAN: {{ company.iban }}</p>
        </div>
      </div>
      <div class="text-right ml-4">
        <img v-if="company.logoUrl" :src="company.logoUrl" alt="Company logo" class="h-12 ml-auto" />
      </div>
    </div>

    <!-- Invoice Details and Customer Info -->
    <div class="grid grid-cols-2 gap-12 mb-12">
      <div>
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-gray-900">Invoice #{{ invoice.number }}</h1>
          <p class="mt-2 text-lg text-gray-600">{{ formatDate(invoice.date) }}</p>
        </div>
        <div class="space-y-2 text-sm text-gray-600">
          <p><span class="inline-block w-32">Delivery date</span> {{ formatDate(invoice.delivery_date) }}</p>
          <p><span class="inline-block w-32">Due date</span> {{ formatDate(invoice.due_date) }}</p>
          <p><span class="inline-block w-32">Payment method</span>Bank Transfer</p>
        </div>
      </div>

      <!-- Customer Info -->
      <div class="bg-gray-50 p-6 rounded-lg">
        <h2 class="text-sm font-medium text-gray-500 mb-3">BILL TO</h2>
        <div class="space-y-1">
          <p class="text-lg font-medium text-gray-900">{{ customer?.name }}</p>
          <p class="text-gray-600">{{ customer?.address }}</p>
          <p class="text-gray-600">{{ customer?.city }}</p>
          <p class="text-gray-600">VAT ID: {{ customer?.vat_id }}</p>
        </div>
      </div>
    </div>

    <!-- Invoice Items -->
    <div class="mb-12 overflow-x-auto">
      <table class="w-full text-sm">
        <thead>
          <tr>
            <th class="py-3 text-left font-medium text-gray-500 border-b">Description</th>
            <th class="py-3 text-center font-medium text-gray-500 border-b w-24">Qty</th>
            <th class="py-3 text-right font-medium text-gray-500 border-b w-32">Unit price</th>
            <th class="py-3 text-right font-medium text-gray-500 border-b w-32">Amount</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-for="item in items" :key="item.id">
            <td class="py-4 align-top">
              {{ item.description }}
            </td>
            <td class="py-4 text-center align-top">{{ item.quantity }}</td>
            <td class="py-4 text-right align-top">{{ formatCurrency(item.price) }}</td>
            <td class="py-4 text-right align-top">{{ formatCurrency(calculateItemTotal(item)) }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Totals -->
    <div class="ml-auto w-72 space-y-3">
      <div class="flex justify-between text-sm text-gray-600">
        <span>Subtotal</span>
        <span>{{ formatCurrency(invoice.subtotal) }}</span>
      </div>
      <div class="flex justify-between text-sm text-gray-600">
        <span>VAT</span>
        <span>{{ formatCurrency(invoice.vat) }}</span>
      </div>
      <div class="flex justify-between text-lg font-bold text-gray-900 pt-3 border-t">
        <span>Total</span>
        <span>{{ formatCurrency(invoice.total) }}</span>
      </div>

      <!-- VAT Exemption Info -->
      <div v-if="!customer?.include_vat" class="mt-4">
        <p class="text-xs text-gray-500">VAT is not charged pursuant to Article 17, Paragraph 1 of the Croatian VAT Act.</p>
      </div>
    </div>

    <!-- Operator Info -->
    <div class="mt-12 pt-8 border-t text-sm text-gray-500">
      <p>Operator: Teodor Hirš</p>
    </div>

    <!-- Company Details Footer -->
    <div class="mt-8 text-xs text-gray-500 max-w-3xl mx-auto">
      <p class="leading-relaxed">
        EONIdeas jednostavno društvo s ograničenom odgovornošću za računalne djelatnosti Teodor Hirš, OIB: 92537995324 i Gordan Jugo, OIB: 84353789089
        Tome Masaryka 2, Varazdin, Croatia OIB: 87607117119 IBAN: HR1123400091110751687 otvoren u banci: Privredna banka Zagreb d.d. Djelatnost:
        RAČUNALNO PROGRAMIRANJE (pretežita djelatnost). Temljni kapital uplaćen u cijelosti
      </p>
    </div>

    <!-- Print Button -->
    <div class="mt-8 text-center print:hidden">
      <button
        @click="printInvoice"
        class="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-6 rounded-lg inline-flex items-center transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
        </svg>
        Print Receipt
      </button>
    </div>
  </div>
</template>

<style>
@media print {
  @page {
    size: A4;
    margin: 2cm;
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