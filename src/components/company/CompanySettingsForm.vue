<script setup lang="ts">
import { ref, watch } from 'vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import type { CompanyInfo } from '@/types/company'
import { useCompanyStore } from '@/stores/company'

const props = defineProps<{
  initialData?: CompanyInfo
  isLoading?: boolean
}>()

const emit = defineEmits<{
  (e: 'submit', data: CompanyInfo): void
  (e: 'cancel'): void
  (e: 'logoUpload', file: File): void
}>()

const logoInput = ref<HTMLInputElement | null>(null)
const error = ref<string | null>(null)
const logoLoadFailed = ref(false)

// Handle logo image loading error
const handleLogoError = async () => {
  try {
    // Get the company store to refresh the logo URL
    const companyStore = useCompanyStore()
    await companyStore.refreshLogoUrl()
    
    // Reset the failed flag to try again with the new URL
    logoLoadFailed.value = false
  } catch (err) {
    console.error('Logo loading error:', err)
    logoLoadFailed.value = true
  }
}

const formData = ref<CompanyInfo>(props.initialData || {
  name: '',
  street: '',
  houseNumber: '',
  postalCode: '',
  city: '',
  vatId: '',
  iban: '',
  logoUrl: null,
  pinId: '',
  web: '',
  email: '',
  phone: ''
})

// Update formData when initialData changes
watch(() => props.initialData, (newData) => {
  if (newData) {
    formData.value = { ...newData }
  }
}, { deep: true })

const handleSubmit = async () => {
  try {
    error.value = null
    emit('submit', formData.value)
  } catch (err: any) {
    error.value = err.message
  }
}

const handleCancel = () => {
  emit('cancel')
}

const handleLogoUpload = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (input.files && input.files[0]) {
    const file = input.files[0]
    emit('logoUpload', file)
  }
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
      <!-- Company Information Section -->
      <div>
        <h2 class="text-base/7 font-semibold text-gray-900">Company Information</h2>
        <p class="mt-1 max-w-2xl text-sm/6 text-gray-600">
          Basic information about your company.
        </p>

        <div class="mt-10 space-y-8 border-b border-gray-900/10 pb-12 sm:space-y-0 sm:divide-y sm:divide-gray-900/10 sm:border-t sm:pb-0">
          <!-- Logo -->
          <div class="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:py-6">
            <label class="block text-sm/6 font-medium text-gray-900 sm:pt-1.5">Logo</label>
            <div class="mt-2 sm:col-span-2 sm:mt-0">
              <div class="flex items-center">
                <div
                  class="w-16 h-16 rounded-full flex items-center justify-center overflow-hidden bg-gray-50"
                  :class="{ 'border-dashed border-gray-300': !formData.logoUrl, 'border-transparent': formData.logoUrl }"
                >
                  <img
                    v-if="formData.logoUrl && !logoLoadFailed"
                    :src="formData.logoUrl"
                    alt="Company logo"
                    class="w-full h-full object-contain"
                    @error="handleLogoError"
                  />
                  <div v-else class="text-center px-2">
                    <svg xmlns="http://www.w3.org/2000/svg" class="mx-auto h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
                <div class="ml-4">
                  <input
                    type="file"
                    ref="logoInput"
                    @change="handleLogoUpload"
                    accept="image/*"
                    class="hidden"
                  />
                  <BaseButton
                    type="button"
                    @click="logoInput?.click()"
                    class="text-sm py-2 px-3"
                    size="sm"
                    variant="secondary"
                    :disabled="isLoading"
                  >
                    <template v-if="isLoading">
                      <svg class="animate-spin -ml-1 mr-2 h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Uploading...
                    </template>
                    <template v-else>
                      {{ formData.logoUrl ? 'Change' : 'Upload' }}
                    </template>
                  </BaseButton>
                </div>
              </div>
            </div>
          </div>

          <!-- Company Name -->
          <div class="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:py-6">
            <label for="name" class="block text-sm/6 font-medium text-gray-900 sm:pt-1.5">Company Name *</label>
            <div class="mt-2 sm:col-span-2 sm:mt-0">
              <BaseInput
                id="name"
                v-model="formData.name"
                required
                placeholder="Enter company name"
                :disabled="isLoading"
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
                :disabled="isLoading"
                class="w-full"
              />
            </div>
          </div>

          <!-- House Number -->
          <div class="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:py-6">
            <label for="houseNumber" class="block text-sm/6 font-medium text-gray-900 sm:pt-1.5">House Number</label>
            <div class="mt-2 sm:col-span-2 sm:mt-0">
              <BaseInput
                id="houseNumber"
                v-model="formData.houseNumber"
                placeholder="Enter house/building number"
                :disabled="isLoading"
                class="w-full"
              />
            </div>
          </div>

          <!-- Postal Code -->
          <div class="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:py-6">
            <label for="postalCode" class="block text-sm/6 font-medium text-gray-900 sm:pt-1.5">Postal Code</label>
            <div class="mt-2 sm:col-span-2 sm:mt-0">
              <BaseInput
                id="postalCode"
                v-model="formData.postalCode"
                placeholder="Enter postal/ZIP code"
                :disabled="isLoading"
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
                placeholder="Enter city name"
                :disabled="isLoading"
                class="w-full"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Billing Information Section -->
      <div>
        <h2 class="text-base/7 font-semibold text-gray-900">Billing Information</h2>
        <p class="mt-1 max-w-2xl text-sm/6 text-gray-600">
          Tax and financial details used on your invoices.
        </p>

        <div class="mt-10 space-y-8 border-b border-gray-900/10 pb-12 sm:space-y-0 sm:divide-y sm:divide-gray-900/10 sm:border-t sm:pb-0">
          <!-- VAT ID -->
          <div class="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:py-6">
            <label for="vatId" class="block text-sm/6 font-medium text-gray-900 sm:pt-1.5">VAT ID *</label>
            <div class="mt-2 sm:col-span-2 sm:mt-0">
              <BaseInput
                id="vatId"
                v-model="formData.vatId"
                required
                placeholder="Enter VAT ID"
                :disabled="isLoading"
                class="w-full"
              />
            </div>
          </div>

          <!-- PIN ID (OIB) -->
          <div class="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:py-6">
            <label for="pinId" class="block text-sm/6 font-medium text-gray-900 sm:pt-1.5">Personal ID Number (OIB)</label>
            <div class="mt-2 sm:col-span-2 sm:mt-0">
              <BaseInput
                id="pinId"
                v-model="formData.pinId"
                placeholder="Enter personal ID number"
                :disabled="isLoading"
                class="w-full"
              />
            </div>
          </div>

          <!-- IBAN -->
          <div class="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:py-6">
            <label for="iban" class="block text-sm/6 font-medium text-gray-900 sm:pt-1.5">IBAN *</label>
            <div class="mt-2 sm:col-span-2 sm:mt-0">
              <BaseInput
                id="iban"
                v-model="formData.iban"
                required
                placeholder="Enter IBAN"
                :disabled="isLoading"
                class="w-full"
              />
              <p class="mt-1 text-xs text-gray-500">
                This will be displayed on your invoices for receiving payments.
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Contact Information Section -->
      <div>
        <h2 class="text-base/7 font-semibold text-gray-900">Contact Information</h2>
        <p class="mt-1 max-w-2xl text-sm/6 text-gray-600">
          How customers can reach your company.
        </p>

        <div class="mt-10 space-y-8 border-b border-gray-900/10 pb-12 sm:space-y-0 sm:divide-y sm:divide-gray-900/10 sm:border-t sm:pb-0">
          <!-- Email -->
          <div class="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:py-6">
            <label for="email" class="block text-sm/6 font-medium text-gray-900 sm:pt-1.5">Email</label>
            <div class="mt-2 sm:col-span-2 sm:mt-0">
              <BaseInput
                id="email"
                type="email"
                v-model="formData.email"
                placeholder="Enter email address"
                :disabled="isLoading"
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
                :disabled="isLoading"
                class="w-full"
              />
            </div>
          </div>

          <!-- Website -->
          <div class="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:py-6">
            <label for="web" class="block text-sm/6 font-medium text-gray-900 sm:pt-1.5">Website</label>
            <div class="mt-2 sm:col-span-2 sm:mt-0">
              <BaseInput
                id="web"
                type="url"
                v-model="formData.web"
                placeholder="https://example.com"
                :disabled="isLoading"
                class="w-full"
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
        :disabled="isLoading"
      >
        Cancel
      </BaseButton>
      <BaseButton 
        type="submit" 
        variant="primary" 
        :loading="isLoading"
      >
        Save
      </BaseButton>
    </div>
  </form>
</template>
