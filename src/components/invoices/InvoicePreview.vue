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
  <div class="max-w-4xl mx-auto bg-white p-5 print:p-4 print-area border border-gray-300 rounded-lg">
    <!-- Company Info at Top -->
    <div class="flex justify-between items-start mb-4">
      <div class="text-xs space-y-0.5">
        <h2 class="text-lg font-bold mb-1">{{ company.name }}</h2>
        <div>
          <p class="text-gray-600">{{ company.address }}</p>
          <p v-if="company.vatId" class="text-gray-600">OIB: {{ company.pinId }}</p>          
        </div>
      </div>
      <div class="text-right ml-4">
        <img v-if="company.logoUrl" :src="company.logoUrl" alt="Company logo" class="h-10 ml-auto" />
        <p v-if="company.web" class="text-gray-600 text-xs mt-1">web: <a class="hover:underline" :href="`https://${company.web}`" target="_blank">{{ company.web }}</a></p>
        <p v-if="company.email" class="text-gray-600 text-xs">email: <a class="hover:underline" :href="`mailto:${company.email}`">{{ company.email }}</a></p>
      </div>
    </div>

    <!-- Invoice Details and Customer Info -->
    <div class="grid grid-cols-2 gap-6 mb-6">
      <div>
        <div class="mb-2">
          <h1 class="text-xl font-bold text-gray-900">Invoice #{{ invoice.number }}</h1>
        </div>
        <div class="text-xs text-gray-600 space-y-0">
          <p class="flex items-center py-0.5"><span class="w-28 flex-shrink-0">Invoice date</span> {{ formatDate(invoice.date) }}</p>
          <p class="flex items-center py-0.5"><span class="w-28 flex-shrink-0">Delivery date</span> {{ formatDate(invoice.delivery_date) }}</p>
          <p class="flex items-center py-0.5"><span class="w-28 flex-shrink-0">Due date</span> {{ formatDate(invoice.due_date) }}</p>
          <p class="flex items-center py-0.5"><span class="w-28 flex-shrink-0">Payment method</span>Bank Transfer</p>
          <p class="flex items-center py-0.5"><span class="w-28 flex-shrink-0">Operator</span>Teodor Hirs</p>
        </div>
      </div>

      <!-- Customer Info -->
      <div class="border border-gray-300 p-3 rounded-lg flex flex-col">
        <div>
          <div class="mb-2">
            <h2 class="text-xs font-medium text-gray-500">CUSTOMER</h2>
          </div>
          <div class="text-xs text-gray-600 space-y-0">
            <p class="flex items-center py-0.5 text-sm font-medium text-gray-900">{{ customer?.company || 'N/A' }}</p>
            <p class="flex items-center py-0.5">{{ customer?.address || 'N/A' }}</p>
            <p class="flex items-center py-0.5">{{ customer?.city || 'N/A' }}</p>
            <p class="flex items-center py-0.5">VAT ID: {{ customer?.vat_id || 'N/A' }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Invoice Items -->
    <div class="mb-6 overflow-x-auto">
      <table class="w-full text-xs">
        <thead>
          <tr>
            <th class="py-2 text-center font-medium text-gray-500 border-b w-12">No.</th>
            <th class="py-2 text-left font-medium text-gray-500 border-b">Description</th>
            <th class="py-2 text-center font-medium text-gray-500 border-b w-20">Qty</th>
            <th class="py-2 text-right font-medium text-gray-500 border-b w-28">Unit price</th>
            <th class="py-2 text-right font-medium text-gray-500 border-b w-28">Amount</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-for="(item, index) in items" :key="item.id">
            <td class="py-2 text-center align-top">{{ index + 1 }}</td>
            <td class="py-2 align-top">
              {{ item.description }}
            </td>
            <td class="py-2 text-center align-top">{{ item.quantity }}</td>
            <td class="py-2 text-right align-top">{{ formatCurrency(item.price) }}</td>
            <td class="py-2 text-right align-top">{{ formatCurrency(calculateItemTotal(item)) }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Totals -->
    <div class="ml-auto w-64 space-y-2">
      <div class="flex justify-between text-xs text-gray-600">
        <span>Subtotal</span>
        <span>{{ formatCurrency(invoice.subtotal) }}</span>
      </div>
      <div class="flex justify-between text-xs text-gray-600">
        <span>VAT</span>
        <span>{{ formatCurrency(invoice.vat) }}</span>
      </div>
      <div class="flex justify-between text-sm font-bold text-gray-900 pt-2 border-t">
        <span>Total</span>
        <span>{{ formatCurrency(invoice.total) }}</span>
      </div>

      <!-- VAT Exemption Info -->
      <div v-if="!customer?.include_vat" class="mt-2">
        <p class="text-xs text-gray-500">VAT is not charged pursuant to Article 17, Paragraph 1 of the Croatian VAT Act.</p>
      </div>
    </div>

    <!-- Operator Info -->
    <div class="mt-6 pt-4 border-t"></div>

    <!-- Company Details Footer -->
    <div class="mt-2 text-[0.65rem] leading-3 tracking-tight text-gray-500 max-w-3xl mx-auto">
      <p>
        EONIdeas jednostavno društvo s ograničenom odgovornošću za računalne djelatnosti Teodor Hirš, OIB: 92537995324 i Gordan Jugo, OIB: 84353789089
        Tome Masaryka 2, Varazdin, Croatia OIB: 87607117119 IBAN: HR1123400091110751687 otvoren u banci: Privredna banka Zagreb d.d. Djelatnost:
        RAČUNALNO PROGRAMIRANJE (pretežita djelatnost). Temljni kapital uplaćen u cijelosti
      </p>
    </div>

    <!-- Print Button -->
    <div class="mt-6 text-center print:hidden">
      <button
        @click="printInvoice"
        class="bg-blue-600 hover:bg-blue-700 text-white font-medium py-1.5 px-4 rounded text-xs inline-flex items-center transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
    margin-header: 0;
    margin-footer: 0;
  }
  
  html {
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  
  @page :first {
    margin-top: 0;
    margin-bottom: 0;
  }
  
  @page :left {
    margin-left: 0;
    margin-right: 0;
    margin-header: 0;
    margin-footer: 0;
  }
  
  @page :right {
    margin-left: 0;
    margin-right: 0;
    margin-header: 0;
    margin-footer: 0;
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