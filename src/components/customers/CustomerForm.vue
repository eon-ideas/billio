<script setup lang="ts">
import { ref } from 'vue'
import type { CustomerFormData } from '@/types/customer'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseButton from '@/components/ui/BaseButton.vue'

const props = defineProps<{
  initialData?: CustomerFormData
}>()

const emit = defineEmits<{
  (e: 'submit', data: CustomerFormData): void
}>()

const formData = ref<CustomerFormData>(props.initialData ?? {
  name: '',
  city: '',
  address: '',
  vatId: '',
  currency: ''
})

const currencies = [
  'USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'CNY', 'INR'
]

const handleSubmit = () => {
  emit('submit', { ...formData.value })
}
</script>

<template>
  <form @submit.prevent="handleSubmit" class="space-y-6">
    <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
      <!-- Company Information -->
      <div class="sm:col-span-2">
        <h3 class="text-sm font-medium text-gray-900 mb-4">Company Information</h3>
        <div class="space-y-4">
          <BaseInput
            v-model="formData.name"
            label="Company Name"
            placeholder="Enter company name"
            required
            class="w-full"
          >
            <template #prefix>
              <svg class="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </template>
          </BaseInput>

          <BaseInput
            v-model="formData.vatId"
            label="VAT ID"
            placeholder="Enter VAT identification number"
            required
            class="w-full"
          >
            <template #prefix>
              <svg class="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </template>
          </BaseInput>
        </div>
      </div>

      <!-- Location -->
      <div class="sm:col-span-2">
        <h3 class="text-sm font-medium text-gray-900 mb-4">Location</h3>
        <div class="space-y-4">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <BaseInput
              v-model="formData.city"
              label="City"
              placeholder="Enter city"
              required
              class="w-full"
            >
              <template #prefix>
                <svg class="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </template>
            </BaseInput>

            <div class="relative">
              <BaseInput
                v-model="formData.currency"
                label="Currency"
                placeholder="Select currency"
                required
                list="currency-options"
                class="w-full"
              >
                <template #prefix>
                  <svg class="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </template>
              </BaseInput>
              <datalist id="currency-options">
                <option v-for="currency in currencies" :key="currency" :value="currency" />
              </datalist>
            </div>
          </div>

          <BaseInput
            v-model="formData.address"
            label="Street Address"
            placeholder="Enter complete address"
            required
            class="w-full"
          >
            <template #prefix>
              <svg class="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </template>
          </BaseInput>
        </div>
      </div>
    </div>

    <!-- Form Actions -->
    <div class="flex items-center justify-end pt-6 border-t border-gray-200">
      <BaseButton
        type="submit"
        class="px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        {{ initialData ? 'Save Changes' : 'Create Customer' }}
      </BaseButton>
    </div>
  </form>
</template>

<style scoped>
.form-input:focus {
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5);
}
</style>