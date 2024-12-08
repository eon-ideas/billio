<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useCustomersStore } from '@/stores/customers'
import { useRouter } from 'vue-router'

const props = defineProps<{
  searchQuery: string
}>()

const customersStore = useCustomersStore()
const router = useRouter()

const filteredCustomers = computed(() => {
  if (!props.searchQuery) return customersStore.customers
  
  const query = props.searchQuery.toLowerCase()
  return customersStore.customers.filter(customer => 
    customer.name.toLowerCase().includes(query) ||
    (customer.email?.toLowerCase().includes(query) ?? false) ||
    (customer.company?.toLowerCase().includes(query) ?? false)
  )
})

const handleEdit = (id: string) => {
  router.push(`/customers/${id}/edit`)
}

const handleView = (id: string) => {
  router.push(`/customers/${id}`)
}

const handleViewInvoices = (id: string) => {
  router.push(`/customers/${id}/invoices`)
}

onMounted(async () => {
  await customersStore.fetchCustomers()
})
</script>

<template>
  <div class="overflow-hidden">
    <div v-if="customersStore.loading" class="flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>

    <div v-else-if="customersStore.error" class="p-4 bg-red-50 border border-red-200 rounded-lg">
      <p class="text-sm text-red-600">{{ customersStore.error }}</p>
    </div>

    <div v-else-if="filteredCustomers.length === 0" class="p-8 text-center">
      <p class="text-gray-500">No customers found</p>
    </div>

    <div v-else class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead>
          <tr>
            <th scope="col" class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50/50">
              Customer
            </th>
            <th scope="col" class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50/50">
              Email
            </th>
            <th scope="col" class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50/50">
              Phone
            </th>
            <th scope="col" class="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50/50">
              Actions
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="customer in filteredCustomers" 
              :key="customer.id"
              class="group hover:bg-blue-50/50 transition-colors duration-200"
          >
            <td class="px-6 py-5 whitespace-nowrap">
              <div class="flex items-center">
                <div class="flex-shrink-0 h-10 w-10">
                  <div class="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <span class="text-blue-600 font-medium text-sm">
                      {{ customer.name.charAt(0).toUpperCase() }}
                    </span>
                  </div>
                </div>
                <div class="ml-4">
                  <div class="text-sm font-medium text-gray-900">
                    {{ customer.name }}
                  </div>
                  <div class="text-sm text-gray-500">
                    {{ customer.company }}
                  </div>
                </div>
              </div>
            </td>
            <td class="px-6 py-5 whitespace-nowrap">
              <div class="text-sm text-gray-900">{{ customer.email }}</div>
            </td>
            <td class="px-6 py-5 whitespace-nowrap">
              <div class="text-sm text-gray-900">{{ customer.phone }}</div>
            </td>
            <td class="px-6 py-5 whitespace-nowrap text-right text-sm font-medium">
              <div class="flex items-center justify-end space-x-3">
                <button
                  @click="handleView(customer.id)"
                  class="text-gray-400 hover:text-indigo-600 transition-colors duration-200"
                  title="View Details"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd" />
                  </svg>
                </button>
                <button
                  @click="handleEdit(customer.id)"
                  class="text-gray-400 hover:text-blue-600 transition-colors duration-200"
                  title="Edit"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                </button>
                <button
                  @click="handleViewInvoices(customer.id)"
                  class="text-gray-400 hover:text-green-600 transition-colors duration-200"
                  title="View Invoices"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clip-rule="evenodd" />
                  </svg>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>