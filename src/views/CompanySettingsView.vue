<script setup lang="ts">
import { ref } from 'vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import Breadcrumb from '@/components/ui/Breadcrumb.vue'
import { useCompanyStore } from '@/stores/company'

const companyStore = useCompanyStore()
const logoInput = ref<HTMLInputElement | null>(null)
const showSuccessMessage = ref(false)
const errorMessage = ref('')

const breadcrumbItems = [
  {
    name: 'Company Information',
  }
]

const handleLogoUpload = async (event: Event) => {
  const input = event.target as HTMLInputElement
  if (input.files && input.files[0]) {
    const file = input.files[0]
    try {
      await companyStore.updateLogo(file)
      showSuccessMessage.value = true
      setTimeout(() => {
        showSuccessMessage.value = false
      }, 3000)
    } catch (error) {
      console.error('Error uploading logo:', error)
      errorMessage.value = 'Failed to upload logo. Please try again.'
      setTimeout(() => {
        errorMessage.value = ''
      }, 3000)
    }
  }
}

const handleSubmit = async () => {
  try {
    await companyStore.updateCompanyInfo(companyStore.companyInfo)
    showSuccessMessage.value = true
    setTimeout(() => {
      showSuccessMessage.value = false
    }, 3000)
  } catch (error) {
    console.error('Error saving company info:', error)
    errorMessage.value = 'Failed to save company information. Please try again.'
    setTimeout(() => {
      errorMessage.value = ''
    }, 3000)
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Success Message -->
    <div
      v-if="showSuccessMessage"
      class="fixed top-4 right-4 bg-green-50 text-green-800 px-4 py-3 rounded-lg shadow-lg flex items-center space-x-2 z-50 transition-all duration-300"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
      </svg>
      <span>Changes saved successfully!</span>
    </div>

    <!-- Error Message -->
    <div
      v-if="errorMessage"
      class="fixed top-4 right-4 bg-red-50 text-red-800 px-4 py-3 rounded-lg shadow-lg flex items-center space-x-2 z-50 transition-all duration-300"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
      </svg>
      <span>{{ errorMessage }}</span>
    </div>

    <main class="max-w-5xl mx-auto py-6 px-4 sm:py-8 sm:px-6 lg:px-8">
      <div class="mb-6 sm:mb-8">
        <Breadcrumb :items="breadcrumbItems" class="hidden sm:block" />
        <h1 class="text-2xl sm:text-3xl font-bold text-gray-900 mt-2">Company Settings</h1>
        <p class="mt-2 text-sm text-gray-600">
          Manage your company's information and branding.
        </p>
      </div>
      
      <div class="bg-white shadow-sm rounded-lg overflow-hidden">
        <form @submit.prevent="handleSubmit" class="divide-y divide-gray-200">
          <!-- Logo Section -->
          <div class="p-4 sm:p-6 space-y-4">
            <h2 class="text-lg font-medium text-gray-900">Company Logo</h2>
            <p class="text-sm text-gray-500">
              This will be displayed on your invoices and customer portal.
            </p>
            <div class="flex flex-col sm:flex-row sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
              <div 
                class="w-32 h-32 sm:w-40 sm:h-40 border-2 rounded-lg flex items-center justify-center overflow-hidden bg-gray-50 mx-auto sm:mx-0"
                :class="{ 'border-dashed border-gray-300': !companyStore.companyInfo.logoUrl, 'border-transparent': companyStore.companyInfo.logoUrl }"
              >
                <img 
                  v-if="companyStore.companyInfo.logoUrl" 
                  :src="companyStore.companyInfo.logoUrl" 
                  alt="Company logo"
                  class="w-full h-full object-contain"
                />
                <div v-else class="text-center px-4">
                  <svg xmlns="http://www.w3.org/2000/svg" class="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p class="mt-2 text-sm text-gray-500">No logo uploaded</p>
                </div>
              </div>
              <div class="space-y-2 w-full sm:w-auto">
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
                  class="w-full sm:w-auto"
                  :disabled="companyStore.isLoading"
                >
                  <template v-if="companyStore.isLoading">
                    <svg class="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Uploading...
                  </template>
                  <template v-else>
                    {{ companyStore.companyInfo.logoUrl ? 'Change Logo' : 'Upload Logo' }}
                  </template>
                </BaseButton>
                <p class="text-xs text-gray-500">
                  Recommended: Square image, at least 400x400px
                </p>
              </div>
            </div>
          </div>

          <!-- Company Information Section -->
          <div class="p-4 sm:p-6 space-y-6">
            <h2 class="text-lg font-medium text-gray-900">Company Information</h2>
            <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <!-- Company Name -->
              <div>
                <label for="name" class="block text-sm font-medium text-gray-700">
                  Company Name
                </label>
                <input
                  id="name"
                  type="text"
                  v-model="companyStore.companyInfo.name"
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  :disabled="companyStore.isLoading"
                  required
                />
              </div>

              <!-- VAT ID -->
              <div>
                <label for="vatId" class="block text-sm font-medium text-gray-700">
                  VAT ID
                </label>
                <input
                  id="vatId"
                  type="text"
                  v-model="companyStore.companyInfo.vatId"
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  :disabled="companyStore.isLoading"
                  required
                />
              </div>

              <!-- Company Address -->
              <div class="sm:col-span-2">
                <label for="address" class="block text-sm font-medium text-gray-700">
                  Company Address
                </label>
                <textarea
                  id="address"
                  v-model="companyStore.companyInfo.address"
                  rows="3"
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  :disabled="companyStore.isLoading"
                  required
                />
              </div>

              <!-- IBAN -->
              <div class="sm:col-span-2">
                <label for="iban" class="block text-sm font-medium text-gray-700">
                  IBAN
                </label>
                <input
                  id="iban"
                  type="text"
                  v-model="companyStore.companyInfo.iban"
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm font-mono"
                  :disabled="companyStore.isLoading"
                  required
                />
                <p class="mt-1 text-xs text-gray-500">
                  This will be displayed on your invoices for receiving payments.
                </p>
              </div>
            </div>
          </div>

          <!-- Submit Button -->
          <div class="px-4 py-4 bg-gray-50 flex justify-end">
            <BaseButton 
              type="submit"
              :disabled="companyStore.isLoading"
              class="w-full sm:w-auto"
            >
              <template v-if="companyStore.isLoading">
                <svg class="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </template>
              <template v-else>
                Save Changes
              </template>
            </BaseButton>
          </div>
        </form>
      </div>
    </main>
  </div>
</template>
