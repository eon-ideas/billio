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
  <div class="relative">
    <!-- Print Button - Positioned outside invoice content area -->
    <div class="max-w-4xl mx-auto text-right mb-4 print:hidden">
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
    
    <div class="max-w-4xl mx-auto bg-white p-5 print:p-4 print-area border border-gray-300 rounded-lg">
      <!-- Wrapping all content except company details in a container for print layout -->
      <div class="print:flex print:flex-col print:min-h-[calc(100vh-18rem)]">
        <!-- Company Info at Top -->
        <div class="flex justify-between items-start mb-14">
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
        <div class="grid grid-cols-5 gap-6 mb-6">
          <div class="col-span-3">
            <div class="mb-2">
              <h1 class="text-xl font-bold text-gray-900">Račun / Invoice: #{{ invoice.number }}</h1>
            </div>
            <div class="text-xs text-gray-600 space-y-0">
              <p class="flex items-center py-0.5"><span class="w-52 flex-shrink-0">Vrijeme izdavanja / Invoice date</span> {{ formatDate(invoice.date) }}</p>
              <p class="flex items-center py-0.5"><span class="w-52 flex-shrink-0">Datum isporuke / Delivery date</span> {{ formatDate(invoice.delivery_date) }}</p>
              <p class="flex items-center py-0.5"><span class="w-52 flex-shrink-0">Datum dospijeća / Due date</span> {{ formatDate(invoice.due_date) }}</p>
              <p class="flex items-center py-0.5"><span class="w-52 flex-shrink-0">Način plaćanja / Payment method</span>Transakcijski račun / Bank Transfer</p>
              <p class="flex items-center py-0.5"><span class="w-52 flex-shrink-0">Operater / Operator</span>Teodor Hirs</p>
            </div>
          </div>

          <!-- Customer Info -->
          <div class="col-span-2 border border-gray-300 p-3 rounded-lg flex flex-col">
            <div>
              <div class="mb-2">
                <h2 class="text-xs font-medium text-gray-500">KUPAC / CUSTOMER</h2>
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
        <div class="mt-10 mb-6 overflow-x-auto">
          <table class="w-full text-xs">
            <thead>
              <tr>
                <th class="py-2 text-center font-medium text-gray-500 border-b w-16 whitespace-nowrap">Rb. / No.</th>
                <th class="py-2 text-left font-medium text-gray-500 border-b">Opis / Description</th>
                <th class="py-2 text-center font-medium text-gray-500 border-b w-28 whitespace-nowrap">Količina / Qty</th>
                <th class="py-2 text-center font-medium text-gray-500 border-b w-28 whitespace-nowrap">Jmj / Unit</th>
                <th class="py-2 text-right font-medium text-gray-500 border-b w-36 whitespace-nowrap">Cijena / Unit price</th>
                <th class="py-2 text-right font-medium text-gray-500 border-b w-36 whitespace-nowrap">Iznos / Amount</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-for="(item, index) in items" :key="item.id">
                <td class="py-2 text-center align-top">{{ index + 1 }}</td>
                <td class="py-2 align-top">
                  {{ item.description }}
                </td>
                <td class="py-2 text-center align-top">{{ item.quantity }}</td>
                <td class="py-2 text-center align-top">Usl./Serv.</td>
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
            <p class="text-[0.65rem] text-gray-500">PDV nije obračunat temeljem čl.17, stavak 1 Zakona o PDV-u / VAT is not charged pursuant to Article 17, Paragraph 1 of the Croatian VAT Act.</p>
          </div>
        </div>

        <!-- Visual separator between totals and payment details -->
        <div class="my-6 border-b border-gray-200"></div>

        <!-- Payment Details -->
        <div class="mt-10 mb-4 text-xs payment-details">
          <div class="space-y-0.5 text-gray-600">
            <p class="flex items-center"><span class="w-36 flex-shrink-0 font-bold text-gray-700">Platiti na račun / Pay to:</span> {{ company.name }}</p>
            <p class="flex items-center"><span class="w-36 flex-shrink-0"></span> {{ company.address }}</p>
            <p class="flex items-center"><span class="w-36 flex-shrink-0"></span> IBAN: {{ company.iban }}</p>
            <p class="flex items-center mt-1"><span class="w-36 flex-shrink-0 font-bold text-gray-700">Model i poziv na broj / Model and reference number:</span> HR99 {{ invoice.number }}</p>
          </div>
        </div>

        <!-- Push space to move company details to bottom when printing -->
        <div class="print:flex-grow"></div>
      </div><!-- End of main content wrapper -->

      <!-- Company Details - At bottom of page when printing -->
      <div class="mt-2 text-[0.65rem] leading-3 tracking-tight text-gray-500 max-w-3xl mx-auto print:fixed print:bottom-0 print:left-0 print:right-0 print:mx-auto print:w-[calc(100%-4cm)] print:mt-0 print:pb-4">
        <p>
          EONIdeas jednostavno društvo s ograničenom odgovornošću za računalne djelatnosti Teodor Hirš, OIB: 92537995324 i Gordan Jugo, OIB: 84353789089
          Tome Masaryka 2, Varazdin, Croatia OIB: 87607117119 IBAN: HR1123400091110751687 otvoren u banci: Privredna banka Zagreb d.d. Djelatnost:
          RAČUNALNO PROGRAMIRANJE (pretežita djelatnost). Temljni kapital uplaćen u cijelosti
        </p>
      </div>
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

  /* Force consistent font in print view */
  * {
    font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, 
                 "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", 
                 "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji" !important;
  }
  
  /* Ensure no borders appear in print view */
  .border-t {
    border-top: none !important;
  }
  
  .print-area {
    border: none !important;
  }
  
  /* Ensure proper spacing for payment details */
  .payment-details {
    margin-top: 3rem !important;
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