<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useCustomersStore } from '@/stores/customers'
import CustomerForm from '@/components/customers/CustomerForm.vue'
import Breadcrumb from '@/components/ui/Breadcrumb.vue'
import PageTitle from '@/components/ui/PageTitle.vue'
import type { CustomerFormData } from '@/types/customer'

const router = useRouter()
const customersStore = useCustomersStore()
const error = ref<string | null>(null)

const breadcrumbItems = [
  { name: 'Customers', to: '/customers' },
  { name: 'New Customer' }
]

const handleSubmit = async (data: CustomerFormData) => {
  try {
    error.value = null
    const customer = await customersStore.addCustomer(data)
    if (customer) {
      router.push('/customers')
    }
  } catch (err: any) {
    error.value = err.message
  }
}

const handleCancel = () => {
  router.push('/customers')
}
</script>

<template>
  <div class="min-h-screen bg-white">
    <div class="py-6 px-4 sm:px-6 lg:px-8">
      <!-- Breadcrumb -->
      <Breadcrumb :items="breadcrumbItems" class="mb-6" />
      
      <!-- Header -->
      <PageTitle 
        title="Add New Customer" 
        subtitle="Create a new customer profile with their business information"
        class="mb-8"
      />

      <!-- Error Message -->
      <div v-if="error" class="mb-6">
        <div class="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p class="text-sm text-red-600">{{ error }}</p>
        </div>
      </div>

      <!-- Main Content -->
      <div class="max-w-4xl mx-auto">
        <CustomerForm 
          @submit="handleSubmit" 
          @cancel="handleCancel"
        />
      </div>
    </div>
  </div>
</template>