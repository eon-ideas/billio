<script setup lang="ts">
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useInvoicesStore } from '@/stores/invoices'
import { useCustomersStore } from '@/stores/customers'
import Navigation from '@/components/layout/Navigation.vue'
import InvoicePreview from '@/components/invoices/InvoicePreview.vue'
import Breadcrumb from '@/components/ui/Breadcrumb.vue'

const router = useRouter()
const route = useRoute()
const invoicesStore = useInvoicesStore()
const customersStore = useCustomersStore()

const invoiceId = route.params.id as string
const invoice = computed(() => invoicesStore.getInvoiceById(invoiceId))
const customer = computed(() => invoice.value ? customersStore.getCustomerById(invoice.value.customerId) : null)

const breadcrumbItems = computed(() => {
  if (!invoice.value || !customer.value) return []
  
  return [
    {
      name: 'Customers',
      to: '/customers'
    },
    {
      name: customer.value.name,
      to: `/customers/${customer.value.id}`
    },
    {
      name: 'Invoices',
      to: `/customers/${customer.value.id}/invoices`
    },
    {
      name: `Invoice #${invoice.value.number}`,
    }
  ]
})

if (!invoice.value) {
  router.push('/customers')
}
</script>

<template>
  <div class="min-h-screen bg-gray-100">
    <Navigation />
    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="px-4 sm:px-0">
        <Breadcrumb :items="breadcrumbItems" class="print:hidden" />
        <div class="print-area">
          <InvoicePreview
            v-if="invoice"
            :invoice="invoice"
          />
        </div>
      </div>
    </main>
  </div>
</template>