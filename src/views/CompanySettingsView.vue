<script setup lang="ts">
import { ref } from 'vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import { useCompanyStore } from '@/stores/company'

const companyStore = useCompanyStore()
const logoInput = ref<HTMLInputElement | null>(null)
const showSuccessMessage = ref(false)
const errorMessage = ref('')
const sidebarOpen = ref(false)

// Tabs for settings
const tabs = [
  { name: 'Company Settings', href: '#', current: true },
  { name: 'Invoice Settings', href: '#', current: false },
  { name: 'User Profile', href: '#', current: false },
  { name: 'Team Members', href: '#', current: false },
  { name: 'Billing', href: '#', current: false },
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

                  <!-- Company Information Section -->
                  <div class="mt-10 divide-y divide-gray-200">
                    <div class="space-y-1">
                      <h3 class="text-lg/6 font-medium text-gray-900">Company Information</h3>
                      <p class="max-w-2xl text-sm text-gray-500">Basic information about your company.</p>
                    </div>
                    <div class="mt-6">
                      <dl class="divide-y divide-gray-200">
                        <!-- Company Logo -->
                        <div class="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:pt-5">
                          <dt class="text-sm font-medium text-gray-500">Logo</dt>
                          <dd class="mt-1 flex text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                            <span class="grow">
                              <div 
                                class="w-16 h-16 rounded-full flex items-center justify-center overflow-hidden bg-gray-50"
                                :class="{ 'border-dashed border-gray-300': !companyStore.companyInfo.logoUrl, 'border-transparent': companyStore.companyInfo.logoUrl }"
                              >
                                <img 
                                  v-if="companyStore.companyInfo.logoUrl" 
                                  :src="companyStore.companyInfo.logoUrl" 
                                  alt="Company logo"
                                  class="w-full h-full object-contain"
                                />
                                <div v-else class="text-center px-2">
                                  <svg xmlns="http://www.w3.org/2000/svg" class="mx-auto h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                </div>
                              </div>
                            </span>
                            <span class="ml-4 flex shrink-0 items-start space-x-4">
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
                                :disabled="companyStore.isLoading"
                              >
                                <template v-if="companyStore.isLoading">
                                  <svg class="animate-spin -ml-1 mr-2 h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                  </svg>
                                  Uploading...
                                </template>
                                <template v-else>
                                  {{ companyStore.companyInfo.logoUrl ? 'Change' : 'Upload' }}
                                </template>
                              </BaseButton>
                            </span>
                          </dd>
                        </div>
                        
                        <!-- Company Name -->
                        <div class="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5">
                          <dt class="text-sm font-medium text-gray-500">Company Name</dt>
                          <dd class="mt-1 flex text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                            <BaseInput
                              id="name"
                              type="text"
                              v-model="companyStore.companyInfo.name"
                              :disabled="companyStore.isLoading"
                              required
                              class="grow"
                            />
                          </dd>
                        </div>
                        
                        <!-- Company Address -->
                        <div class="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5">
                          <dt class="text-sm font-medium text-gray-500">Company Address</dt>
                          <dd class="mt-1 flex text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                            <textarea
                              id="address"
                              v-model="companyStore.companyInfo.address"
                              rows="3"
                              class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                              :disabled="companyStore.isLoading"
                              required
                            />
                          </dd>
                        </div>
                      </dl>
                    </div>
                  </div>
                  
                  <!-- Billing Information Section -->
                  <div class="mt-10 divide-y divide-gray-200">
                    <div class="space-y-1">
                      <h3 class="text-lg/6 font-medium text-gray-900">Billing Information</h3>
                      <p class="max-w-2xl text-sm text-gray-500">Tax and financial details used on your invoices.</p>
                    </div>
                    <div class="mt-6">
                      <dl class="divide-y divide-gray-200">
                        <!-- VAT ID -->
                        <div class="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5">
                          <dt class="text-sm font-medium text-gray-500">VAT ID</dt>
                          <dd class="mt-1 flex text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                            <BaseInput
                              id="vatId"
                              type="text"
                              v-model="companyStore.companyInfo.vatId"
                              :disabled="companyStore.isLoading"
                              required
                              class="grow"
                            />
                          </dd>
                        </div>
                        
                        <!-- PIN ID (OIB) -->
                        <div class="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5">
                          <dt class="text-sm font-medium text-gray-500">Personal ID Number (OIB)</dt>
                          <dd class="mt-1 flex text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                            <BaseInput
                              id="pinId"
                              type="text"
                              v-model="companyStore.companyInfo.pinId"
                              :disabled="companyStore.isLoading"
                              class="grow"
                            />
                          </dd>
                        </div>
                        
                        <!-- IBAN -->
                        <div class="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5">
                          <dt class="text-sm font-medium text-gray-500">IBAN</dt>
                          <dd class="mt-1 flex text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                            <div class="w-full">
                              <BaseInput
                                id="iban"
                                type="text"
                                v-model="companyStore.companyInfo.iban"
                                :disabled="companyStore.isLoading"
                                required
                                class="grow"
                              />
                              <p class="mt-1 text-xs text-gray-500">
                                This will be displayed on your invoices for receiving payments.
                              </p>
                            </div>
                          </dd>
                        </div>
                      </dl>
                    </div>
                  </div>
                  
                  <!-- Contact Information Section -->
                  <div class="mt-10 divide-y divide-gray-200">
                    <div class="space-y-1">
                      <h3 class="text-lg/6 font-medium text-gray-900">Contact Information</h3>
                      <p class="max-w-2xl text-sm text-gray-500">How customers can reach your company.</p>
                    </div>
                    <div class="mt-6">
                      <dl class="divide-y divide-gray-200">
                        <!-- Email -->
                        <div class="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5">
                          <dt class="text-sm font-medium text-gray-500">Email</dt>
                          <dd class="mt-1 flex text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                            <BaseInput
                              id="email"
                              type="email"
                              v-model="companyStore.companyInfo.email"
                              :disabled="companyStore.isLoading"
                              class="grow"
                            />
                          </dd>
                        </div>
                        
                        <!-- Phone -->
                        <div class="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5">
                          <dt class="text-sm font-medium text-gray-500">Phone</dt>
                          <dd class="mt-1 flex text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                            <BaseInput
                              id="phone"
                              type="tel"
                              v-model="companyStore.companyInfo.phone"
                              :disabled="companyStore.isLoading"
                              class="grow"
                            />
                          </dd>
                        </div>
                        
                        <!-- Website -->
                        <div class="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5">
                          <dt class="text-sm font-medium text-gray-500">Website</dt>
                          <dd class="mt-1 flex text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                            <BaseInput
                              id="web"
                              type="url"
                              v-model="companyStore.companyInfo.web"
                              :disabled="companyStore.isLoading"
                              class="grow"
                              placeholder="https://example.com"
                            />
                          </dd>
                        </div>
                      </dl>
                    </div>
                  </div>

                  <!-- Submit Button -->
                  <div class="mt-6 pt-6 border-t border-gray-200">
                    <div class="flex justify-end">
                      <BaseButton 
                        type="button"
                        @click="handleSubmit"
                        :disabled="companyStore.isLoading"
                        class="w-auto"
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
