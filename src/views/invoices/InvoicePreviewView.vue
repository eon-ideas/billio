<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useInvoicesStore } from '@/stores/invoices'
import { useCustomersStore } from '@/stores/customers'
import Navigation from '@/components/layout/Navigation.vue'
import InvoicePreview from '@/components/invoices/InvoicePreview.vue'
import Breadcrumb from '@/components/ui/Breadcrumb.vue'
import type { Invoice } from '@/types/invoice'
import type { Customer } from '@/types/customer'

const router = useRouter()
const route = useRoute()
const invoicesStore = useInvoicesStore()
const customersStore = useCustomersStore()

const invoiceId = route.params.id as string
const invoice = ref<Invoice | null>(null)
const customer = ref<Customer | null>(null)
const loading = ref(true)
const breadcrumbItems = ref([
  { name: 'Customers', to: '/customers' },
  { name: '', to: '' },
  { name: 'Invoices', to: '' },
  { name: 'Invoice Preview' }
])

onMounted(async () => {
  try {
    loading.value = true
    console.log('Fetching invoice:', invoiceId)
    const fetchedInvoice = await invoicesStore.getInvoiceById(invoiceId)
    
    if (!fetchedInvoice) {
      console.error('Invoice not found')
      router.push('/customers')
      return
    }
    
    console.log('Fetched invoice:', fetchedInvoice)
    console.log('Invoice items:', fetchedInvoice.invoice_items)
    
    invoice.value = {
      ...fetchedInvoice,
      invoice_items: fetchedInvoice.invoice_items || [] // Handle both items and invoice_items
    }

    customer.value = await customersStore.getCustomerById(fetchedInvoice.customer_id)
    if (!customer.value) {
      console.error('Customer not found')
      router.push('/customers')
      return
    }

    // Update breadcrumb
    breadcrumbItems.value = [
      { name: 'Customers', to: '/customers' },
      { name: customer.value.name, to: `/customers/${customer.value.id}` },
      { name: 'Invoices', to: `/customers/${customer.value.id}/invoices` },
      { name: `Invoice #${invoice.value.number}` }
    ]
  } catch (error) {
    console.error('Error loading invoice:', error)
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="min-h-screen bg-gray-100">
    <Navigation />
    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="px-4 sm:px-0">
        <Breadcrumb :items="breadcrumbItems" class="print:hidden" />
        <div v-if="loading" class="flex justify-center items-center h-64">
          <div class="text-center">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p class="mt-4 text-gray-600">Loading invoice...</p>
          </div>
        </div>
        <div v-else-if="invoice && customer" class="print-area">
          <InvoicePreview :invoice="invoice" />
        </div>
        <div v-else class="flex justify-center items-center h-64">
          <div class="text-center">
            <p class="text-gray-600">Invoice not found</p>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>