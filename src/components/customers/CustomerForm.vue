<script setup lang="ts">
import { ref } from 'vue'
import type { CustomerFormData } from '@/types/customer'
import { useCustomersStore } from '@/stores/customers'
import { useRouter } from 'vue-router'

const props = defineProps<{
  initialData?: CustomerFormData
}>()

const customersStore = useCustomersStore()
const router = useRouter()

const formData = ref<CustomerFormData>(props.initialData || {
  name: '',
  email: '',
  phone: '',
  company: '',
  city: '',
  address: '',
  vatId: '',
  currency: ''
})

const handleSubmit = () => {
  if (props.initialData && 'id' in props.initialData) {
    // Update existing customer
    customersStore.updateCustomer((props.initialData as any).id, formData.value)
  } else {
    // Add new customer
    customersStore.addCustomer(formData.value)
  }
  router.push('/customers')
}

</script>

<template>
  <form @submit.prevent="handleSubmit" class="space-y-6">
    <!-- Name -->
    <div>
      <label for="name" class="block text-sm font-medium text-gray-700">Name *</label>
      <input
        type="text"
        id="name"
        v-model="formData.name"
        required
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
      />
    </div>

    <!-- Email -->
    <div>
      <label for="email" class="block text-sm font-medium text-gray-700">Email *</label>
      <input
        type="email"
        id="email"
        v-model="formData.email"
        required
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
      />
    </div>

    <!-- Phone -->
    <div>
      <label for="phone" class="block text-sm font-medium text-gray-700">Phone *</label>
      <input
        type="tel"
        id="phone"
        v-model="formData.phone"
        required
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
      />
    </div>

    <!-- Company -->
    <div>
      <label for="company" class="block text-sm font-medium text-gray-700">Company</label>
      <input
        type="text"
        id="company"
        v-model="formData.company"
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
      />
    </div>

    <!-- City -->
    <div>
      <label for="city" class="block text-sm font-medium text-gray-700">City</label>
      <input
        type="text"
        id="city"
        v-model="formData.city"
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
      />
    </div>

    <!-- Address -->
    <div>
      <label for="address" class="block text-sm font-medium text-gray-700">Address</label>
      <textarea
        id="address"
        v-model="formData.address"
        rows="3"
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
      ></textarea>
    </div>

    <!-- VAT ID -->
    <div>
      <label for="vatId" class="block text-sm font-medium text-gray-700">VAT ID</label>
      <input
        type="text"
        id="vatId"
        v-model="formData.vatId"
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
      />
    </div>

    <!-- Currency -->
    <div>
      <label for="currency" class="block text-sm font-medium text-gray-700">Currency</label>
      <select
        id="currency"
        v-model="formData.currency"
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
      >
        <option value="">Select currency</option>
        <option value="USD">USD - US Dollar</option>
        <option value="EUR">EUR - Euro</option>
        <option value="GBP">GBP - British Pound</option>
        <option value="JPY">JPY - Japanese Yen</option>
      </select>
    </div>

    <!-- Submit Button -->
    <div class="flex justify-end">
      <button
        type="submit"
        class="inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        {{ props.initialData ? 'Update Customer' : 'Add Customer' }}
      </button>
    </div>
  </form>
</template>