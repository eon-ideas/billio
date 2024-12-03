<script setup lang="ts">
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useCustomersStore } from '@/stores/customers'
import Navigation from '@/components/layout/Navigation.vue'
import InvoiceList from '@/components/invoices/InvoiceList.vue'
import BaseButton from '@/components/ui/BaseButton.vue'

const router = useRouter()
const route = useRoute()
const customersStore = useCustomersStore()

const customerId = route.params.customerId as string
const customer = computed(() => customersStore.getCustomerById(customerId))

if (!customer.value) {
  router.push('/customers')
}

const handleAddNew = () => {
  router.push(`/customers/${customerId}/invoices/new`)
}
</script>

<template>
  <div class="min-h-screen bg-gray-100">
    <Navigation />
    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="px-4 sm:px-0 flex justify-between items-center mb-4">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">
            Invoices - {{ customer?.name }}
          </h1>
          <p class="mt-1 text-sm text-gray-500">
            Currency: {{ customer?.currency }}
          </p>
        </div>
        <BaseButton @click="handleAddNew">Add New Invoice</BaseButton>
      </div>
      <div class="bg-white shadow rounded-lg">
        <InvoiceList :customer-id="customerId" />
      </div>
    </main>
  </div>
</template>