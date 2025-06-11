<script setup lang="ts">
import {computed, onMounted, ref} from 'vue'
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

      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center py-8">
        <div class="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
      </div>

      <!-- Main Content -->
      <div v-else>
        <InvoiceForm
          :customer-id="customerId"
          @submit="handleSubmit"
          @cancel="handleCancel"
        />
      </div>
    </div>
  </div>
</template>