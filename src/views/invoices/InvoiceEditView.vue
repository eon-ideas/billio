<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useCustomersStore } from '@/stores/customers'
import { useInvoicesStore } from '@/stores/invoices'
import Breadcrumb from '@/components/ui/Breadcrumb.vue'
import PageTitle from '@/components/ui/PageTitle.vue'
import InvoiceForm from '@/components/invoices/InvoiceForm.vue'
import type { InvoiceFormData, Invoice } from '@/types/invoice'
import type { Customer } from '@/types/customer'

const router = useRouter()
const route = useRoute()
const customersStore = useCustomersStore()
const invoicesStore = useInvoicesStore()

const customerId = route.params.customerId as string
const invoiceId = route.params.id as string
const customer = ref<Customer | null>(null)
const invoice = ref<Invoice | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)

onMounted(async () => {
  try {
    loading.value = true
    
    customer.value = await customersStore.getCustomerById(customerId)
    if (!customer.value) {
      console.error('Customer not found')
      router.push('/customers')
      return
    }
    
    invoice.value = await invoicesStore.getInvoiceById(invoiceId)
    if (!invoice.value) {
      console.error('Invoice not found')
      router.push(`/customers/${customerId}/invoices`)
      return
    }
    
    // Update breadcrumb when data is loaded
    breadcrumbItems.value[1].name = customer.value.name
    breadcrumbItems.value[3].name = `Edit Invoice #${invoice.value.number}`
  } catch (err: any) {
    console.error('Error loading data:', err)
    error.value = 'Failed to load invoice information'
  } finally {
    loading.value = false
  }
})

const breadcrumbItems = ref([
  { name: 'Customers', to: '/customers' },
  { name: '', to: `/customers/${customerId}/invoices` },
  { name: 'Invoices', to: `/customers/${customerId}/invoices` },
  { name: 'Edit Invoice' }
])

const handleSubmit = async (data: InvoiceFormData) => {
  try {
    await invoicesStore.updateInvoice(invoiceId, {
      ...data,
      customer_id: customerId
    })
    router.push(`/customers/${customerId}/invoices`)
  } catch (err: any) {
    console.error('Error updating invoice:', err)
    error.value = 'Failed to update invoice'
  }
}

const handleCancel = () => {
  router.push(`/customers/${customerId}/invoices`)
}
</script>

<template>
  <div class="min-h-screen bg-white">
    <div class="py-6 px-4 sm:px-6 lg:px-8">
      
      <!-- Breadcrumb -->
      <Breadcrumb :items="breadcrumbItems" class="mb-6" />

      <!-- Header -->
      <PageTitle 
        :title="`Edit Invoice #${invoice?.number || ''}`" 
        :subtitle="`Update invoice details for ${customer?.name || ''}`"
        class="mb-8"
      />

      <!-- Error Message -->
      <div v-if="error" class="mb-6">
        <div class="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p class="text-sm text-red-600">{{ error }}</p>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center py-8">
        <div class="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
      </div>

      <!-- Main Content -->
      <div v-else-if="invoice">
        <InvoiceForm
          :customer-id="customerId"
          :initial-data="invoice"
          @submit="handleSubmit"
          @cancel="handleCancel"
        />
      </div>
    </div>
  </div>
</template>