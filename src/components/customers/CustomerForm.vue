<script setup lang="ts">
import { ref } from 'vue'
import type { CustomerFormData } from '@/types/customer'
import { useCustomersStore } from '@/stores/customers'
import { useRouter } from 'vue-router'

const props = defineProps<{
  initialData?: CustomerFormData
}>()

const emit = defineEmits<{
  (e: 'submit', data: CustomerFormData): void
}>()

const loading = ref(false)
const error = ref<string | null>(null)

const formData = ref<CustomerFormData>(props.initialData || {
  name: '',
  email: '',
  phone: '',
  company: '',
  city: '',
  address: '',
  vat_id: '',
  currency: 'EUR',
  include_vat: false
})

const handleSubmit = async () => {
  try {
    loading.value = true
    error.value = null
    emit('submit', formData.value)
  } catch (err: any) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <form @submit.prevent="handleSubmit" class="space-y-6">
    <!-- Error Message -->
    <div v-if="error" class="p-4 bg-red-50 border border-red-200 rounded-lg">
      <p class="text-sm text-red-600">{{ error }}</p>
    </div>

    <!-- Name -->
    <div>
      <label for="name" class="block text-sm font-medium text-gray-700">Name *</label>
      <input
        type="text"
        id="name"
        v-model="formData.name"
        required
        :disabled="loading"
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
      />
    </div>

    <!-- Email -->
    <div>
      <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
      <input
        type="email"
        id="email"
        v-model="formData.email"
        :disabled="loading"
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
      />
    </div>

    <!-- Phone -->
    <div>
      <label for="phone" class="block text-sm font-medium text-gray-700">Phone</label>
      <input
        type="tel"
        id="phone"
        v-model="formData.phone"
        :disabled="loading"
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
      />
    </div>

    <!-- Company -->
    <div>
      <label for="company" class="block text-sm font-medium text-gray-700">Company</label>
      <input
        type="text"
        id="company"
        v-model="formData.company"
        :disabled="loading"
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
      />
    </div>

    <!-- City -->
    <div>
      <label for="city" class="block text-sm font-medium text-gray-700">City</label>
      <input
        type="text"
        id="city"
        v-model="formData.city"
        :disabled="loading"
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
      />
    </div>

    <!-- Address -->
    <div>
      <label for="address" class="block text-sm font-medium text-gray-700">Address</label>
      <textarea
        id="address"
        v-model="formData.address"
        rows="3"
        :disabled="loading"
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
      ></textarea>
    </div>

    <!-- VAT ID -->
    <div>
      <label for="vat_id" class="block text-sm font-medium text-gray-700">VAT ID</label>
      <input
        type="text"
        id="vat_id"
        v-model="formData.vat_id"
        :disabled="loading"
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
      />
    </div>

    <!-- Currency -->
    <div>
      <label for="currency" class="block text-sm font-medium text-gray-700">Currency *</label>
      <select
        id="currency"
        v-model="formData.currency"
        required
        :disabled="loading"
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
      >
        <option value="EUR">EUR</option>
        <option value="USD">USD</option>
        <option value="GBP">GBP</option>
      </select>
    </div>

    <!-- Include VAT -->
    <div class="flex items-start">
      <div class="flex h-5 items-center">
        <input
          id="include_vat"
          type="checkbox"
          v-model="formData.include_vat"
          :disabled="loading"
          class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:cursor-not-allowed"
        />
      </div>
      <div class="ml-3 text-sm">
        <label for="include_vat" class="font-medium text-gray-700">Include VAT</label>
        <p class="text-gray-500">Check this if VAT should be included in invoices for this customer</p>
      </div>
    </div>

    <!-- Submit Button -->
    <div class="pt-4">
      <button
        type="submit"
        :disabled="loading"
        class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors duration-200"
      >
        <svg
          v-if="loading"
          class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            class="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="4"
          ></circle>
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
        {{ loading ? 'Saving...' : 'Save Customer' }}
      </button>
    </div>
  </form>
</template>