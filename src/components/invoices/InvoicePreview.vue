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

const subtotal = computed(() => {
  return items.value.reduce((total, item) => total + calculateItemTotal(item), 0)
})

const vatAmount = computed(() => {
  if (customer.value?.include_vat) {
    return subtotal.value * 0.25 // 25% VAT
  }
  return 0
})

const calculateInvoiceTotal = computed(() => {
  return subtotal.value + vatAmount.value
})

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
    <div class="flex justify-between items-start mb-4">
      <div class="text-xs space-y-0.5">
        <h2 class="text-lg font-bold mb-1">{{ company.name }}</h2>
        <div class="grid grid-cols-2 gap-x-4">
          <div>
            <p class="whitespace-pre-line">{{ company.address }}</p>
            <p>{{ company.country }}</p>
          </div>
          <div>
            <p v-if="company.vatId">VAT ID: {{ company.vatId }}</p>
            <p v-if="company.iban">IBAN: {{ company.iban }}</p>
            <p>{{ company.phone }}</p>
            <p>{{ company.email }}</p>
          </div>
        </div>
      </div>
      <div class="text-right ml-4">
        <img v-if="company.logoUrl" :src="company.logoUrl" alt="Company logo" class="h-10 ml-auto" />
      </div>
    </div>

    <hr class="my-4 border-gray-200">

    <!-- Invoice Details and Customer Info -->
    <div class="flex justify-between items-start mb-12">
      <div>
        <h1 class="text-2xl font-bold mb-4">Invoice</h1>
        <div class="space-y-1 text-sm">
          <p><span class="inline-block w-32">Invoice number</span> {{ invoice.number }}</p>
          <p><span class="inline-block w-32">Invoice date</span> {{ formatDate(invoice.date) }}</p>
        </div>
      </div>

      <!-- Customer Info -->
      <div class="text-sm text-right">
        <h2 class="font-medium mb-2">Bill to</h2>
        <p class="font-medium">{{ customer?.name }}</p>
        <p>{{ customer?.address }}</p>
        <p>{{ customer?.postal_code }} {{ customer?.city }}</p>
        <p>{{ customer?.country }}</p>
        <p>{{ customer?.email }}</p>
      </div>
    </div>

    <!-- Invoice Items -->
    <div class="mb-12">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b">
            <th class="py-2 text-left font-medium">Description</th>
            <th class="py-2 text-center font-medium">Qty</th>
            <th class="py-2 text-right font-medium">Unit price</th>
            <th class="py-2 text-right font-medium">Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in items" :key="item.id" class="border-b">
            <td class="py-4">
              {{ item.description }}
              <div class="text-sm text-gray-600" v-if="item.period_start && item.period_end">
                {{ formatDate(item.period_start) }} – {{ formatDate(item.period_end) }}
              </div>
            </td>
            <td class="py-4 text-center">{{ item.quantity }}</td>
            <td class="py-4 text-right">{{ formatCurrency(item.price) }}</td>
            <td class="py-4 text-right">{{ formatCurrency(calculateItemTotal(item)) }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Totals -->
    <div class="space-y-2 text-sm">
      <div class="flex justify-between">
        <span>Subtotal</span>
        <span>{{ formatCurrency(invoice.subtotal) }}</span>
      </div>
      <div v-if="customer?.include_vat" class="flex justify-between">
        <span>VAT (25%)</span>
        <span>{{ formatCurrency(invoice.vat) }}</span>
      </div>
      <div class="flex justify-between font-bold">
        <span>Total{{ customer?.include_vat ? ' (including VAT)' : '' }}</span>
        <span>{{ formatCurrency(invoice.total) }}</span>
      </div>
    </div>

      <!-- VAT Exemption Info -->
      <div v-if="!customer?.include_vat" class="mt-4">
      <p class="text-xs text-gray-600">PDV nije obračunat temeljem čl.17, stavak 1 Zakona o PDV-u</p>
     </div>

     <!-- Operator Info -->
     <div class="mt-4 mb-8">
      <p class="text-xs text-gray-600">Operator: Teodor Hirš</p>
    </div>

    <!-- Footer -->
    <div class="mt-12 text-sm">
      <p v-if="invoice.tax_note" class="text-gray-600">{{ invoice.tax_note }}</p>
      <p class="text-gray-600">----</p>
    </div>

    <!-- Company Details Footer -->
    <div class="mt-8 text-center text-xs text-gray-600 space-y-1 max-w-3xl mx-auto">
      <p>EONIdeas jednostavno društvo s ograničenom odgovornošću za računalne djelatnosti Teodor Hirš, OIB: 92537995324 i Gordan Jugo, OIB: 84353789089</p>
      <p>Tome Masaryka 2, Varazdin, Croatia OIB: 87607117119 IBAN: HR1123400091110751687 otvoren u banci: Privredna banka Zagreb d.d. Djelatnost:</p>
      <p>RAČUNALNO PROGRAMIRANJE (pretežita djelatnost). Temljni kapital uplaćen u cijelosti</p>
    </div>

    <!-- Print Button -->
    <div class="mt-8 text-center print:hidden">
      <button
        @click="printInvoice"
        class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded inline-flex items-center"
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