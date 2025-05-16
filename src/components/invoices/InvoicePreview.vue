<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import type { Invoice } from '@/types/invoice'
import type { Customer } from '@/types/customer'
import { useCustomersStore } from '@/stores/customers'
import { useCompanyStore } from '@/stores/company'
import { useBarcode } from '@/composables/useBarcode'

const props = defineProps<{
  invoice: Invoice
}>()

const customersStore = useCustomersStore()
const companyStore = useCompanyStore()
const company = computed(() => companyStore.companyInfo)
const customer = ref<Customer | null>(null)
const barcodeUrl = ref<string | null>(null)
const isLoadingBarcode = ref(false)

const items = computed(() => {
  return props.invoice.invoice_items || []
})

const { fetchBarcode } = useBarcode()

const formatCurrency = (amount: number, currency?: string) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency || customer.value?.currency || 'USD',
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

const shouldShowEurTotal = computed(() => {
  return customer.value?.currency && customer.value.currency !== 'EUR' && props.invoice.currency_exchange_rate
})

const calculatedEurTotal = computed(() => {
  if (!shouldShowEurTotal.value || !props.invoice.currency_exchange_rate) return 0
  return props.invoice.total * props.invoice.currency_exchange_rate
})

const printInvoice = () => {
  window.print()
}

const generateBarcode = async () => {
  if (!props.invoice.id || !customer.value?.include_bar_code) return

  isLoadingBarcode.value = true

  try {
    // Make sure we have the latest company info
    await companyStore.loadCompanyInfo()

    // Log company info for debugging
    console.log('Company info for barcode:', companyStore.companyInfo)

    // Default values for required fields
    const defaultCompanyName = 'Company Name'
    const defaultStreet = 'Default Street'
    const defaultCity = 'Default City'
    const defaultIban = 'HR1234567890123456789'

    const paymentData = {
      amount: props.invoice.total,
      recipientName: company.value?.name || defaultCompanyName,
      recipientAddress: {
        street: company.value?.street || defaultStreet,
        houseNumber: company.value?.houseNumber || '1',
        city: {
          name: company.value?.city || defaultCity,
          postalCode: company.value?.postalCode || '10000'
        }
      },
      iban: company.value?.iban || defaultIban,
      model: 'HR99',
      callNumber: props.invoice.number || '',
      description: `Invoice #${props.invoice.number}`
    }

    // Log payment data for debugging
    console.log('Payment data for barcode:', paymentData)

    const url = await fetchBarcode(props.invoice.id, paymentData)
    if (url) {
      barcodeUrl.value = url
    }
  } catch (error) {
    console.error('Error in generateBarcode:', error)
  } finally {
    isLoadingBarcode.value = false
  }
}

onMounted(async () => {
  try {
    // Load company info first
    await companyStore.loadCompanyInfo()
    console.log('Company info loaded:', companyStore.companyInfo)

    // Then load customer info
    if (props.invoice.customer_id) {
      customer.value = await customersStore.getCustomerById(props.invoice.customer_id)
    }

    // Finally generate barcode
    await generateBarcode()
  } catch (error) {
    console.error('Error in onMounted:', error)
  }
})
</script>

<template>
  <div class="relative">
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
      <div class="print:flex print:flex-col print:min-h-[calc(100vh-18rem)]">
        <div class="flex justify-between items-start mb-14">
          <div class="text-xs space-y-0.5">
            <h2 class="text-lg font-bold mb-1">{{ company.name }}</h2>
            <div>
              <p class="text-gray-600">{{ [company.street, company.houseNumber].filter(Boolean).join(' ') }}</p>
              <p class="text-gray-600">{{ [company.postalCode, company.city].filter(Boolean).join(' ') }}</p>
              <p v-if="company.vatId" class="text-gray-600">OIB: {{ company.pinId }}</p>
              <p class="text-gray-600">IBAN: <span class="font-mono">{{ company.iban }}</span></p>
            </div>
          </div>
          <div class="text-right ml-4">
            <img v-if="company.logoUrl" :src="company.logoUrl" alt="Company logo" class="h-10 ml-auto" />
            <p v-if="company.web" class="text-gray-600 text-xs mt-1">web: <a class="hover:underline" :href="`https://${company.web}`" target="_blank">{{ company.web }}</a></p>
            <p v-if="company.email" class="text-gray-600 text-xs">email: <a class="hover:underline" :href="`mailto:${company.email}`">{{ company.email }}</a></p>
          </div>
        </div>

        <div class="grid grid-cols-5 gap-6 mb-6">
          <div class="col-span-3">
            <div class="mb-2">
              <h1 class="text-xl font-bold text-gray-900">
                Račun{{ customer?.include_english_translation ? ' / Invoice' : '' }}: #{{ invoice.number }}
              </h1>
            </div>
            <div class="text-xs text-gray-600 space-y-0">
              <p class="flex items-center py-0.5"><span class="w-52 flex-shrink-0">Vrijeme izdavanja{{ customer?.include_english_translation ? ' / Invoice date' : '' }}</span> {{ formatDate(invoice.date) }}</p>
              <p class="flex items-center py-0.5"><span class="w-52 flex-shrink-0">Datum isporuke{{ customer?.include_english_translation ? ' / Delivery date' : '' }}</span> {{ formatDate(invoice.delivery_date) }}</p>
              <p class="flex items-center py-0.5"><span class="w-52 flex-shrink-0">Datum dospijeća{{ customer?.include_english_translation ? ' / Due date' : '' }}</span> {{ formatDate(invoice.due_date) }}</p>
              <p class="flex items-center py-0.5"><span class="w-52 flex-shrink-0">Način plaćanja{{ customer?.include_english_translation ? ' / Payment method' : '' }}</span>Transakcijski račun{{ customer?.include_english_translation ? ' / Bank Transfer' : '' }}</p>
              <p class="flex items-center py-0.5"><span class="w-52 flex-shrink-0">Operater{{ customer?.include_english_translation ? ' / Operator' : '' }}</span>Teodor Hirs</p>
            </div>
          </div>

          <div class="col-span-2 border border-gray-300 p-3 rounded-lg flex flex-col">
            <div>
              <div class="mb-2">
                <h2 class="text-xs font-medium text-gray-500">KUPAC{{ customer?.include_english_translation ? ' / CUSTOMER' : '' }}</h2>
              </div>
              <div class="text-xs text-gray-600 space-y-0">
                <p class="flex items-center py-0.5 text-sm font-medium text-gray-900">{{ customer?.company || 'N/A' }}</p>
                <!-- Structured address display -->
                <p class="flex items-center py-0.5">{{ [customer?.street, customer?.house_number].filter(Boolean).join(' ') || 'N/A' }}</p>
                <p class="flex items-center py-0.5">{{ [customer?.postal_code, customer?.city].filter(Boolean).join(' ') || 'N/A' }}</p>
                <p v-if="customer?.country" class="flex items-center py-0.5">{{ customer.country }}</p>
                <p class="flex items-center py-0.5">{{ customer?.include_english_translation ? 'TAX ID / VAT ID:' : 'OIB:' }} {{ customer?.vat_id || 'N/A' }}</p>
              </div>
            </div>
          </div>
        </div>

        <div class="mt-10 mb-6 overflow-x-auto">
          <table class="w-full text-xs">
            <thead>
              <tr>
                <th class="py-2 text-center font-medium text-gray-500 border-b w-16 whitespace-nowrap">Rb.{{ customer?.include_english_translation ? '/No.' : '' }}</th>
                <th class="py-2 text-left font-medium text-gray-500 border-b w-3/5">Opis{{ customer?.include_english_translation ? '/Description' : '' }}</th>
                <th class="py-2 text-center font-medium text-gray-500 border-b w-28 whitespace-nowrap">Kol.{{ customer?.include_english_translation ? '/Qty' : '' }}</th>
                <th class="py-2 text-center font-medium text-gray-500 border-b w-28 whitespace-nowrap">Jmj{{ customer?.include_english_translation ? '/Unit' : '' }}</th>
                <th class="py-2 text-right font-medium text-gray-500 border-b w-36 whitespace-nowrap">Cijena{{ customer?.include_english_translation ? '/Price' : '' }}</th>
                <th class="py-2 text-right font-medium text-gray-500 border-b w-36 whitespace-nowrap">Iznos{{ customer?.include_english_translation ? '/Amount' : '' }}</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-for="(item, index) in items" :key="item.id">
                <td class="py-2 text-center align-top">{{ index + 1 }}</td>
                <td class="py-2 align-top">
                  {{ item.description }}
                </td>
                <td class="py-2 text-center align-top">{{ item.quantity }}</td>
                <td class="py-2 text-center align-top">Usl.{{ customer?.include_english_translation ? '/Serv.' : '' }}</td>
                <td class="py-2 text-right align-top">{{ formatCurrency(item.price) }}</td>
                <td class="py-2 text-right align-top">{{ formatCurrency(calculateItemTotal(item)) }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="ml-auto w-64 space-y-2">
          <div class="flex justify-between text-xs text-gray-600">
            <span>Subtotal</span>
            <span>{{ formatCurrency(invoice.subtotal) }}</span>
          </div>
          <div class="flex justify-between text-xs text-gray-600">
            <span>{{ customer?.include_english_translation ? 'PDV/VAT' : 'PDV' }}</span>
            <span>{{ formatCurrency(invoice.vat) }}</span>
          </div>
          <div v-if="shouldShowEurTotal" class="flex justify-between text-sm text-gray-900 pt-2 border-t">
            <span>Ukupno{{ customer?.include_english_translation ? '/Total' : '' }} EUR:</span>
            <span class="font-bold">{{ formatCurrency(calculatedEurTotal, 'EUR') }}</span>
          </div>
          <div class="flex justify-between text-sm text-gray-900" :class="{ 'pt-2 border-t': !shouldShowEurTotal }">
            <span>{{ shouldShowEurTotal ? `Ukupno${customer?.include_english_translation ? '/Total' : ''} ${customer?.currency}:` : (customer?.include_english_translation ? 'Ukupno/Total' : 'Ukupno') }}</span>
            <span class="font-bold">{{ formatCurrency(invoice.total) }}</span>
          </div>

          <div v-if="!customer?.include_vat" class="mt-2">
            <p class="text-[0.65rem] text-gray-500">PDV nije obračunat temeljem čl.17, stavak 1 Zakona o PDV-u{{ customer?.include_english_translation ? ' / VAT is not charged pursuant to Article 17, Paragraph 1 of the Croatian VAT Act' : '' }}.</p>
          </div>
          
          <div v-if="shouldShowEurTotal" class="mt-2">
            <p class="text-[0.65rem] text-gray-500">Tečaj{{ customer?.include_english_translation ? '/Currency' : '' }} 1 {{ customer?.currency }} = {{ props.invoice.currency_exchange_rate?.toFixed(6) }} EUR</p>
          </div>
        </div>

        <div class="my-6 border-b border-gray-200"></div>

        <div class="mt-10 mb-6 text-sm payment-details">
          <div class="max-w-2xl mx-auto bg-gray-50 border-2 border-gray-200 rounded-lg p-6 text-center space-y-3">
            <h3 class="font-bold text-gray-800 text-base mb-3 border-b border-gray-200 pb-2">{{ customer?.include_english_translation ? 'Podaci za plaćanje / Payment Details' : 'Podaci za plaćanje' }}</h3>
            <div class="flex flex-col items-center justify-center space-y-2">
              <p class="flex items-center justify-center">
                <span class="font-bold text-gray-700 mr-3">IBAN:</span> 
                <span class="font-mono font-bold text-gray-900 tracking-wide text-base">{{ company.iban }}</span>
              </p>
              <p class="flex items-center justify-center flex-wrap">
                <span class="font-bold text-gray-700 mr-3">Model i poziv na broj{{ customer?.include_english_translation ? ' / Model and reference number' : '' }}:</span> 
                <span class="font-mono font-bold text-gray-900 tracking-wide text-base">HR99 {{ invoice.number }}</span>
              </p>
            </div>

            <div v-if="isLoadingBarcode" class="mt-4 flex flex-col items-center">
              <p class="font-medium text-gray-700 mb-2">Generating barcode</p>
              <div class="flex justify-center items-center h-20">
                <svg class="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            </div>

            <div v-else-if="barcodeUrl && customer?.include_bar_code" class="mt-4 flex flex-col items-center">
              <p class="font-medium text-gray-700 mb-2">Skeniraj za plaćanje{{ customer?.include_english_translation ? ' / Scan barcode for payment' : '' }}</p>
              <img :src="barcodeUrl" alt="Payment barcode" class="max-w-full h-auto" style="max-height: 120px;" />
            </div>
          </div>
        </div>

        <div class="print:flex-grow"></div>
      </div><!-- End of main content wrapper -->

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