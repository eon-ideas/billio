<script setup lang="ts">
import { ref } from 'vue'
import Navigation from '@/components/layout/Navigation.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import { useCompanyStore } from '@/stores/company'

const companyStore = useCompanyStore()
const logoInput = ref<HTMLInputElement | null>(null)

const handleLogoUpload = async (event: Event) => {
  const input = event.target as HTMLInputElement
  if (input.files && input.files[0]) {
    const file = input.files[0]
    await companyStore.updateLogo(file)
  }
}

const handleSubmit = () => {
  // Form submission is handled automatically by v-model
  // You might want to add success notification here
}
</script>

<template>
  <div class="min-h-screen bg-gray-100">
    <Navigation />
    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="px-4 sm:px-0">
        <h1 class="text-2xl font-bold text-gray-900 mb-6">Company Settings</h1>
        
        <div class="bg-white shadow rounded-lg p-6">
          <form @submit.prevent="handleSubmit" class="space-y-6">
            <!-- Logo Upload -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Company Logo
              </label>
              <div class="flex items-center space-x-4">
                <div 
                  class="w-32 h-32 border-2 border-gray-300 border-dashed rounded-lg flex items-center justify-center overflow-hidden"
                  :class="{ 'border-none': companyStore.companyInfo.logoUrl }"
                >
                  <img 
                    v-if="companyStore.companyInfo.logoUrl" 
                    :src="companyStore.companyInfo.logoUrl" 
                    alt="Company logo"
                    class="w-full h-full object-contain"
                  />
                  <span v-else class="text-gray-500 text-sm text-center">
                    No logo uploaded
                  </span>
                </div>
                <div>
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
                  >
                    {{ companyStore.companyInfo.logoUrl ? 'Change Logo' : 'Upload Logo' }}
                  </BaseButton>
                </div>
              </div>
            </div>

            <!-- Company Name -->
            <div>
              <label for="name" class="block text-sm font-medium text-gray-700 mb-1">
                Company Name
              </label>
              <input
                id="name"
                type="text"
                v-model="companyStore.companyInfo.name"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                required
              />
            </div>

            <!-- Company Address -->
            <div>
              <label for="address" class="block text-sm font-medium text-gray-700 mb-1">
                Company Address
              </label>
              <textarea
                id="address"
                v-model="companyStore.companyInfo.address"
                rows="3"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                required
              />
            </div>

            <!-- VAT ID -->
            <div>
              <label for="vatId" class="block text-sm font-medium text-gray-700 mb-1">
                VAT ID
              </label>
              <input
                id="vatId"
                type="text"
                v-model="companyStore.companyInfo.vatId"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                required
              />
            </div>

            <!-- IBAN -->
            <div>
              <label for="iban" class="block text-sm font-medium text-gray-700 mb-1">
                IBAN
              </label>
              <input
                id="iban"
                type="text"
                v-model="companyStore.companyInfo.iban"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                required
              />
            </div>

            <!-- Submit Button -->
            <div class="flex justify-end">
              <BaseButton type="submit">
                Save Changes
              </BaseButton>
            </div>
          </form>
        </div>
      </div>
    </main>
  </div>
</template>
