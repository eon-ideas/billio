<script setup lang="ts">
import {computed, onMounted, ref, watch} from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useCustomersStore } from '@/stores/customers'
import { useInvoicesStore } from '@/stores/invoices'
import Breadcrumb from '@/components/ui/Breadcrumb.vue'
import InvoiceForm from '@/components/invoices/InvoiceForm.vue'
import PageTitle from '@/components/ui/PageTitle.vue'
import type { InvoiceFormData } from '@/types/invoice'
import type {Customer} from "@/types/customer.ts";

const router = useRouter()
const route = useRoute()
const customersStore = useCustomersStore()
const invoicesStore = useInvoicesStore()

const customer = ref<Customer | null>(null)
const customerId = route.params.customerId as string
const loading = ref(true)
const error = ref<string | null>(null)
const success = ref<string | null>(null)
const templateData = ref<InvoiceFormData | undefined>(undefined)
const templateId = route.query.template as string | undefined

const loadTemplateInvoice = async (id: string) => {
  try {
    const invoice = await invoicesStore.getInvoiceById(id)
    if (!invoice) {
      console.error('Template invoice not found')
      error.value = 'Template invoice not found. Creating a new invoice instead.'
      return
    }
    
    // Use the invoice as a template, but generate a new number if not provided in query
    const newNumber = route.query.number as string || `${invoice.number} (Copy)`
    
    // Create template data without the unique fields
    templateData.value = {
      customer_id: invoice.customer_id,
      number: newNumber,
      date: new Date().toISOString().split('T')[0], // Use current date for the new invoice
      delivery_date: invoice.delivery_date,
      due_date: invoice.due_date,
      invoice_items: invoice.invoice_items?.map(item => ({
        // Generate a temporary ID for each item
        id: crypto.randomUUID(),
        invoice_id: '',
        description: item.description,
        quantity: item.quantity,
        price: item.price
      })) || [],
      subtotal: invoice.subtotal,
      vat: invoice.vat,
      currency_exchange_rate: invoice.currency_exchange_rate
    }
    
    console.log('Template data loaded:', templateData.value)
    success.value = `Invoice ${invoice.number} loaded as template. Make any necessary changes before saving.`
  } catch (err: any) {
    console.error('Error loading template invoice:', err)
    error.value = 'Failed to load template invoice. Creating a new invoice instead.'
  }
}

onMounted(async () => {
  try {
    loading.value = true
    console.log('Fetching customer:', route.params.customerId)
    const fetchedCustomer = await customersStore.getCustomerById(route.params.customerId as string)

    if (!fetchedCustomer) {
      console.error('Customer not found')
      router.push('/customers')
      return
    }
    customer.value = {
      ...fetchedCustomer,
    }
    
    // If template ID is provided, load the template invoice
    if (templateId) {
      await loadTemplateInvoice(templateId)
    }
  } catch (err: any) {
    console.error('Error loading customer:', err)
    error.value = 'Failed to load customer information'
  } finally {
    loading.value = false
  }
})

const breadcrumbItems = computed(() => [
  { name: 'Customers', to: '/customers' },
  { name: customer.value?.name || '', to: `/customers/${customerId}/invoices` },
  { name: 'New Invoice' }
])

const subtitleText = computed(() => {
  return `Create a new invoice for ${customer.value?.name || ''}`
})

const handleSubmit = (data: InvoiceFormData) => {
  invoicesStore.addInvoice({
    ...data,
    customer_id: customerId
  })
  router.push(`/customers/${customerId}/invoices`)
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
        title="New Invoice" 
        :subtitle="subtitleText"
        class="mb-8"
      />

      <!-- Error Message -->
      <div v-if="error" class="mb-6">
        <div class="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p class="text-sm text-red-600">{{ error }}</p>
        </div>
      </div>

      <!-- Success Message -->
      <div v-if="success" class="mb-6">
        <div class="p-4 bg-green-50 border border-green-200 rounded-lg">
          <p class="text-sm text-green-600">{{ success }}</p>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center py-8">
        <div class="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
      </div>

      <!-- Main Content -->
      <div v-else>
        <InvoiceForm
          :customer-id="customerId"
          :initial-data="templateData"
          @submit="handleSubmit"
          @cancel="handleCancel"
        />
      </div>
    </div>
  </div>
</template>