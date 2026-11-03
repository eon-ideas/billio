<script setup lang="ts">
import { ref, computed } from 'vue'
import { useCompanyStore } from '@/stores/company'
import { useAuthStore } from '@/stores/auth'
import CompanySettingsForm from '@/components/company/CompanySettingsForm.vue'
import CompanySettingsReadOnly from '@/components/company/CompanySettingsReadOnly.vue'

const companyStore = useCompanyStore()
const authStore = useAuthStore()
const showSuccessMessage = ref(false)
const errorMessage = ref('')

// Check if user is admin
const isAdmin = computed(() => authStore.isAdmin())

// Tabs for settings
const allTabs = [
  { name: 'Company Settings', href: '#', current: true },
  { name: 'Invoice Settings', href: '#', current: false, adminOnly: true },
  { name: 'User Profile', href: '#', current: false, adminOnly: true },
  { name: 'Team Members', href: '#', current: false, adminOnly: true },
  { name: 'Billing', href: '#', current: false, adminOnly: true },
]

// Filter tabs based on user role
const tabs = computed(() => {
  return allTabs.filter(tab => !tab.adminOnly || isAdmin.value)
})

const handleLogoUpload = async (file: File) => {
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

const handleSubmit = async (data: any) => {
  try {
    await companyStore.updateCompanyInfo(data)
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

const handleCancel = () => {
  // Reset form data to original values
  companyStore.loadCompanyInfo()
}
</script>

<template>
  <div>
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

    <!-- View-only notification for non-admin users -->
    <div
      v-if="!isAdmin"
      class="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6"
    >
      <div class="flex">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="ml-3">
          <p class="text-sm text-yellow-700">
            You are in view-only mode. Contact an administrator to make changes to company settings.
          </p>
        </div>
      </div>
    </div>

    <!-- Content area -->
    <div class="lg:px-8">
      <div class="mx-auto flex flex-col lg:max-w-4xl">
        <main class="flex-1">
          <div class="relative mx-auto max-w-4xl">
            <div class="pt-10 pb-16">
              <div class="px-4 sm:px-6 lg:px-0">
                <h1 class="text-3xl font-bold tracking-tight text-gray-900">Settings</h1>
              </div>
              <div class="px-4 sm:px-6 lg:px-0">
                <div class="py-6">
                  <!-- Tabs -->
                  <div class="grid grid-cols-1 lg:hidden">
                    <!-- Mobile tabs dropdown -->
                    <select aria-label="Select a tab" class="col-start-1 row-start-1 w-full appearance-none rounded-md bg-white py-2 pr-8 pl-3 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6">
                      <option v-for="tab in tabs" :key="tab.name" :selected="tab.current">{{ tab.name }}</option>
                    </select>
                    <svg xmlns="http://www.w3.org/2000/svg" class="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end fill-gray-500" aria-hidden="true" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                    </svg>
                  </div>
                  <div class="hidden lg:block">
                    <div class="border-b border-gray-200">
                      <nav class="-mb-px flex space-x-8">
                        <a v-for="tab in tabs" :key="tab.name" :href="tab.href" :class="[tab.current ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700', 'border-b-2 px-1 py-4 text-sm font-medium whitespace-nowrap']">{{ tab.name }}</a>
                      </nav>
                    </div>
                  </div>

                  <!-- Conditional rendering based on user role -->
                  <div v-if="isAdmin">
                    <CompanySettingsForm 
                      :initial-data="companyStore.companyInfo" 
                      :is-loading="companyStore.isLoading"
                      @submit="handleSubmit"
                      @cancel="handleCancel"
                      @logo-upload="handleLogoUpload"
                    />
                  </div>
                  <div v-else>
                    <CompanySettingsReadOnly :company-info="companyStore.companyInfo" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  </div>
</template>
