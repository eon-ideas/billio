<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useCustomersStore } from '@/stores/customers'
import CustomerForm from '@/components/customers/CustomerForm.vue'
import Breadcrumb from '@/components/ui/Breadcrumb.vue'
import PageTitle from '@/components/ui/PageTitle.vue'
import type { CustomerFormData, Customer } from '@/types/customer'

const router = useRouter()
const route = useRoute()
const customersStore = useCustomersStore()
const customer = ref<Customer | null>(null)
const error = ref<string | null>(null)

const customerId = route.params.id as string

onMounted(async () => {
  try {
    customer.value = await customersStore.getCustomerById(customerId)
    if (!customer.value) {
      router.push('/customers')
    }
  } catch (err: any) {
    error.value = err.message
  }
})

const breadcrumbItems = [
  { name: 'Customers', to: '/customers' },
  { name: customer.value?.name || 'Edit Customer' }
]

const handleSubmit = async (data: CustomerFormData) => {
  try {
    error.value = null
    await customersStore.updateCustomer(customerId, data)
    router.push('/customers')
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
        title="Edit Customer" 
        subtitle="Update customer profile and business information"
        class="mb-8"
      />

      <!-- Error Message -->
      <div v-if="error" class="mb-6">
        <div class="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p class="text-sm text-red-600">{{ error }}</p>
        </div>
      </div>

      <!-- Main Content -->
      <div>
        <CustomerForm 
          v-if="customer"
          :initial-data="customer"
          @submit="handleSubmit"
          @cancel="handleCancel"
        />
      </div>
    </div>
  </div>
</template>