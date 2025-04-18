<script setup lang="ts">
import type { CompanyInfo } from '@/types/company'

defineProps<{
  companyInfo: CompanyInfo
}>()
</script>

<template>
  <div>
    <!-- Company Information Section -->
    <div class="mb-10">
      <div class="px-4 sm:px-0">
        <h3 class="text-base/7 font-semibold text-gray-900">Company Information</h3>
        <p class="mt-1 max-w-2xl text-sm/6 text-gray-500">Basic information about your company.</p>
      </div>
      <div class="mt-6 border-t border-gray-100">
        <dl class="divide-y divide-gray-100">
          <!-- Logo -->
          <div class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
            <dt class="text-sm/6 font-medium text-gray-900">Logo</dt>
            <dd class="mt-1 text-sm/6 text-gray-700 sm:col-span-2 sm:mt-0">
              <div
                class="w-16 h-16 rounded-full flex items-center justify-center overflow-hidden bg-gray-50"
                :class="{ 'border-dashed border-gray-300': !companyInfo.logoUrl, 'border-transparent': companyInfo.logoUrl }"
              >
                <img
                  v-if="companyInfo.logoUrl"
                  :src="companyInfo.logoUrl"
                  alt="Company logo"
                  class="w-full h-full object-contain"
                />
                <div v-else class="text-center px-2">
                  <svg xmlns="http://www.w3.org/2000/svg" class="mx-auto h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
            </dd>
          </div>
          
          <div class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
            <dt class="text-sm/6 font-medium text-gray-900">Company Name</dt>
            <dd class="mt-1 text-sm/6 text-gray-700 sm:col-span-2 sm:mt-0">{{ companyInfo.name || 'Not provided' }}</dd>
          </div>
          
          <div class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
            <dt class="text-sm/6 font-medium text-gray-900">Street</dt>
            <dd class="mt-1 text-sm/6 text-gray-700 sm:col-span-2 sm:mt-0">{{ companyInfo.street || 'Not provided' }}</dd>
          </div>
          
          <div class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
            <dt class="text-sm/6 font-medium text-gray-900">House Number</dt>
            <dd class="mt-1 text-sm/6 text-gray-700 sm:col-span-2 sm:mt-0">{{ companyInfo.houseNumber || 'Not provided' }}</dd>
          </div>
          
          <div class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
            <dt class="text-sm/6 font-medium text-gray-900">Postal Code</dt>
            <dd class="mt-1 text-sm/6 text-gray-700 sm:col-span-2 sm:mt-0">{{ companyInfo.postalCode || 'Not provided' }}</dd>
          </div>
          
          <div class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
            <dt class="text-sm/6 font-medium text-gray-900">City</dt>
            <dd class="mt-1 text-sm/6 text-gray-700 sm:col-span-2 sm:mt-0">{{ companyInfo.city || 'Not provided' }}</dd>
          </div>
        </dl>
      </div>
    </div>
    
    <!-- Billing Information Section -->
    <div class="mb-10">
      <div class="px-4 sm:px-0">
        <h3 class="text-base/7 font-semibold text-gray-900">Billing Information</h3>
        <p class="mt-1 max-w-2xl text-sm/6 text-gray-500">Tax and financial details used on your invoices.</p>
      </div>
      <div class="mt-6 border-t border-gray-100">
        <dl class="divide-y divide-gray-100">
          <div class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
            <dt class="text-sm/6 font-medium text-gray-900">VAT ID</dt>
            <dd class="mt-1 text-sm/6 text-gray-700 sm:col-span-2 sm:mt-0">{{ companyInfo.vatId || 'Not provided' }}</dd>
          </div>
          
          <div class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
            <dt class="text-sm/6 font-medium text-gray-900">Personal ID Number (OIB)</dt>
            <dd class="mt-1 text-sm/6 text-gray-700 sm:col-span-2 sm:mt-0">{{ companyInfo.pinId || 'Not provided' }}</dd>
          </div>
          
          <div class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
            <dt class="text-sm/6 font-medium text-gray-900">IBAN</dt>
            <dd class="mt-1 text-sm/6 text-gray-700 sm:col-span-2 sm:mt-0">{{ companyInfo.iban || 'Not provided' }}</dd>
          </div>
        </dl>
      </div>
    </div>
    
    <!-- Contact Information Section -->
    <div>
      <div class="px-4 sm:px-0">
        <h3 class="text-base/7 font-semibold text-gray-900">Contact Information</h3>
        <p class="mt-1 max-w-2xl text-sm/6 text-gray-500">How customers can reach your company.</p>
      </div>
      <div class="mt-6 border-t border-gray-100">
        <dl class="divide-y divide-gray-100">
          <div class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
            <dt class="text-sm/6 font-medium text-gray-900">Email</dt>
            <dd class="mt-1 text-sm/6 text-gray-700 sm:col-span-2 sm:mt-0">{{ companyInfo.email || 'Not provided' }}</dd>
          </div>
          
          <div class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
            <dt class="text-sm/6 font-medium text-gray-900">Phone</dt>
            <dd class="mt-1 text-sm/6 text-gray-700 sm:col-span-2 sm:mt-0">{{ companyInfo.phone || 'Not provided' }}</dd>
          </div>
          
          <div class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
            <dt class="text-sm/6 font-medium text-gray-900">Website</dt>
            <dd class="mt-1 text-sm/6 text-gray-700 sm:col-span-2 sm:mt-0">{{ companyInfo.web || 'Not provided' }}</dd>
          </div>
        </dl>
      </div>
    </div>
  </div>
</template>
