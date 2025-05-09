<script setup lang="ts">
import { ref, watch } from 'vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import SelectMenu from '@/components/ui/SelectMenu.vue'
import Checkbox from '@/components/ui/Checkbox.vue'
import type { CustomerFormData } from '@/types/customer'

const props = defineProps<{
  initialData?: CustomerFormData
}>()

const emit = defineEmits<{
  (e: 'submit', data: CustomerFormData): void
  (e: 'cancel'): void
}>()

const loading = ref(false)
const error = ref<string | null>(null)

const formData = ref<CustomerFormData>(props.initialData || {
  name: '',
  email: '',
  phone: '',
  company: '',
  street: '',
  house_number: '',
  postal_code: '',
  city: '',
  country: '',
  address: '', // Keeping for backward compatibility
  vat_id: '',
  currency: 'EUR',
  include_vat: false,
  include_english_translation: false,
  include_bar_code: false
})

const currencies = [
  { value: 'EUR', label: 'EUR' },
  { value: 'CHF', label: 'CHF' },
  { value: 'USD', label: 'USD' }
]

// Track the selected currency separately to handle object vs string conversion
const selectedCurrency = ref(
  typeof formData.value.currency === 'string'
    ? currencies.find(c => c.value === formData.value.currency) || currencies[0]
    : formData.value.currency
)

// Update formData.currency when selectedCurrency changes
watch(selectedCurrency, (newVal) => {
  if (newVal && typeof newVal === 'object' && 'value' in newVal) {
    formData.value.currency = newVal.value
  } else if (typeof newVal === 'string') {
    formData.value.currency = newVal
  }
}, { immediate: true })

const handleSubmit = async () => {
  try {
    loading.value = true
    error.value = null
    
    // Ensure currency is a string value before submitting
    if (typeof formData.value.currency === 'object' && formData.value.currency !== null) {
      formData.value.currency = (formData.value.currency as any).value || 'EUR'
    }
    
    emit('submit', formData.value)
  } catch (err: any) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

const handleCancel = () => {
  emit('cancel')
}
</script>

<template>
  <form @submit.prevent="handleSubmit">
    <!-- Error Message -->
    <div v-if="error" class="mb-6">
      <div class="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p class="text-sm text-red-600">{{ error }}</p>
      </div>
    </div>

    <div class="space-y-12 sm:space-y-16">
      <div>
        <h2 class="text-base/7 font-semibold text-gray-900">Customer Information</h2>
        <p class="mt-1 max-w-2xl text-sm/6 text-gray-600">
          Enter the customer's details for invoicing and communication purposes.
        </p>

        <div class="mt-10 space-y-8 border-b border-gray-900/10 pb-12 sm:space-y-0 sm:divide-y sm:divide-gray-900/10 sm:border-t sm:pb-0">
          <!-- Name -->
          <div class="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:py-6">
            <label for="name" class="block text-sm/6 font-medium text-gray-900 sm:pt-1.5">Name *</label>
            <div class="mt-2 sm:col-span-2 sm:mt-0">
              <BaseInput
                id="name"
                v-model="formData.name"
                required
                placeholder="Enter customer name"
                class="w-full"
              />
            </div>
          </div>

          <!-- Email -->
          <div class="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:py-6">
            <label for="email" class="block text-sm/6 font-medium text-gray-900 sm:pt-1.5">Email</label>
            <div class="mt-2 sm:col-span-2 sm:mt-0">
              <BaseInput
                id="email"
                type="email"
                v-model="formData.email"
                placeholder="Enter email address"
                class="w-full"
              />
            </div>
          </div>

          <!-- Phone -->
          <div class="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:py-6">
            <label for="phone" class="block text-sm/6 font-medium text-gray-900 sm:pt-1.5">Phone</label>
            <div class="mt-2 sm:col-span-2 sm:mt-0">
              <BaseInput
                id="phone"
                type="tel"
                v-model="formData.phone"
                placeholder="Enter phone number"
                class="w-full"
              />
            </div>
          </div>

          <!-- Company -->
          <div class="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:py-6">
            <label for="company" class="block text-sm/6 font-medium text-gray-900 sm:pt-1.5">Company</label>
            <div class="mt-2 sm:col-span-2 sm:mt-0">
              <BaseInput
                id="company"
                v-model="formData.company"
                placeholder="Enter company name"
                class="w-full"
              />
            </div>
          </div>

          <!-- Street -->
          <div class="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:py-6">
            <label for="street" class="block text-sm/6 font-medium text-gray-900 sm:pt-1.5">Street</label>
            <div class="mt-2 sm:col-span-2 sm:mt-0">
              <BaseInput
                id="street"
                v-model="formData.street"
                placeholder="Enter street name"
                class="w-full"
              />
            </div>
          </div>

          <!-- House Number -->
          <div class="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:py-6">
            <label for="house_number" class="block text-sm/6 font-medium text-gray-900 sm:pt-1.5">House Number</label>
            <div class="mt-2 sm:col-span-2 sm:mt-0">
              <BaseInput
                id="house_number"
                v-model="formData.house_number"
                placeholder="Enter house number"
                class="w-full"
              />
            </div>
          </div>

          <!-- Postal Code -->
          <div class="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:py-6">
            <label for="postal_code" class="block text-sm/6 font-medium text-gray-900 sm:pt-1.5">Postal Code</label>
            <div class="mt-2 sm:col-span-2 sm:mt-0">
              <BaseInput
                id="postal_code"
                v-model="formData.postal_code"
                placeholder="Enter postal code"
                class="w-full"
              />
            </div>
          </div>

          <!-- City -->
          <div class="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:py-6">
            <label for="city" class="block text-sm/6 font-medium text-gray-900 sm:pt-1.5">City</label>
            <div class="mt-2 sm:col-span-2 sm:mt-0">
              <BaseInput
                id="city"
                v-model="formData.city"
                placeholder="Enter city"
                class="w-full"
              />
            </div>
          </div>

          <!-- Country -->
          <div class="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:py-6">
            <label for="country" class="block text-sm/6 font-medium text-gray-900 sm:pt-1.5">Country</label>
            <div class="mt-2 sm:col-span-2 sm:mt-0">
              <BaseInput
                id="country"
                v-model="formData.country"
                placeholder="Enter country"
                class="w-full"
              />
            </div>
          </div>
        </div>
      </div>

      <div>
        <h2 class="text-base/7 font-semibold text-gray-900">Billing Information</h2>
        <p class="mt-1 max-w-2xl text-sm/6 text-gray-600">
          Configure billing details and preferences for this customer.
        </p>

        <div class="mt-10 space-y-8 border-b border-gray-900/10 pb-12 sm:space-y-0 sm:divide-y sm:divide-gray-900/10 sm:border-t sm:pb-0">
          <!-- VAT ID -->
          <div class="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:py-6">
            <label for="vat_id" class="block text-sm/6 font-medium text-gray-900 sm:pt-1.5">VAT ID</label>
            <div class="mt-2 sm:col-span-2 sm:mt-0">
              <BaseInput
                id="vat_id"
                v-model="formData.vat_id"
                placeholder="Enter VAT ID"
                class="w-full"
              />
            </div>
          </div>

          <!-- Currency -->
          <div class="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:py-6">
            <label for="currency" class="block text-sm/6 font-medium text-gray-900 sm:pt-1.5">Currency *</label>
            <div class="mt-2 sm:col-span-2 sm:mt-0">
              <SelectMenu
                id="currency"
                v-model="selectedCurrency"
                :options="currencies"
                valueKey="value"
                labelKey="label"
                :disabled="loading"
                required
              />
            </div>
          </div>
        </div>
      </div>

      <div>
        <h2 class="text-base/7 font-semibold text-gray-900">Invoice Settings</h2>
        <p class="mt-1 max-w-2xl text-sm/6 text-gray-600">
          Configure invoice preferences for this customer.
        </p>

        <div class="mt-10 space-y-8 border-b border-gray-900/10 pb-12 sm:space-y-0 sm:divide-y sm:divide-gray-900/10 sm:border-t sm:pb-0">
          <!-- Include VAT -->
          <div class="sm:grid sm:grid-cols-3 sm:items-baseline sm:gap-4 sm:py-6">
            <div class="text-sm/6 font-medium text-gray-900">Include VAT</div>
            <div class="mt-1 sm:col-span-2 sm:mt-0">
              <Checkbox
                id="include_vat"
                v-model="formData.include_vat"
                label="Include VAT"
                description="When enabled, VAT will be included in all invoices for this customer."
              />
            </div>
          </div>

          <!-- Include English Translation -->
          <div class="sm:grid sm:grid-cols-3 sm:items-baseline sm:gap-4 sm:py-6">
            <div class="text-sm/6 font-medium text-gray-900">Translation Options</div>
            <div class="mt-1 sm:col-span-2 sm:mt-0">
              <Checkbox
                id="include_english_translation"
                v-model="formData.include_english_translation"
                label="Include English translation"
                description="When enabled, English translations will be included in all documents for this customer."
              />
            </div>
          </div>

          <!-- Include Bar Code -->
          <div class="sm:grid sm:grid-cols-3 sm:items-baseline sm:gap-4 sm:py-6">
            <div class="text-sm/6 font-medium text-gray-900">Bar Code</div>
            <div class="mt-1 sm:col-span-2 sm:mt-0">
              <Checkbox
                id="include_bar_code"
                v-model="formData.include_bar_code"
                label="Include bar code"
                description="When enabled, bar codes will be included in all invoices for this customer."
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Submit Button -->
    <div class="mt-6 flex items-center justify-end gap-x-6">
      <BaseButton 
        type="button" 
        variant="secondary"
        @click="handleCancel"
        :disabled="loading"
      >
        Cancel
      </BaseButton>
      <BaseButton 
        type="submit" 
        variant="primary" 
        :loading="loading"
      >
        Save
      </BaseButton>
    </div>
  </form>
</template>