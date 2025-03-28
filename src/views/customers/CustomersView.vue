<script setup lang="ts">
import { ref } from 'vue'
import CustomerList from '@/components/customers/CustomerList.vue'
import PageTitle from '@/components/ui/PageTitle.vue'

const searchQuery = ref('')

const handleSearch = (event: Event) => {
  const target = event.target as HTMLInputElement
  searchQuery.value = target.value.toLowerCase()
}
</script>

<template>
  <div class="min-h-screen">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <PageTitle 
        title="Customers" 
        subtitle="Manage your customer relationships" 
        showAddButton 
        addButtonText="Add Customer" 
        addButtonLink="/customers/new"
      />

      <!-- Search -->
      <div class="mt-6">
        <div class="relative">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg class="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
            </svg>
          </div>
          <input
            type="text"
            name="search"
            id="search"
            v-model="searchQuery"
            class="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-shadow duration-200"
            placeholder="Search by name, email, or company..."
            @input="handleSearch"
          />
        </div>
      </div>

      <!-- Customer List -->
      <div class="mt-8">
        <CustomerList :search-query="searchQuery" />
      </div>
    </div>
  </div>
</template>