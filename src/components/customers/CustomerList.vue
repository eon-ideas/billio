<script setup lang="ts">
import { computed } from 'vue'
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
    customer.email.toLowerCase().includes(query)
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
</script>

<template>
  <div class="overflow-hidden">
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead>
          <tr class="bg-gray-50">
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Customer
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Email
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Phone
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="customer in filteredCustomers" 
              :key="customer.id"
              class="hover:bg-gray-50 transition-colors"
          >
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="flex items-center">
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
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm text-gray-900">{{ customer.email }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm text-gray-900">{{ customer.phone }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
              <button
                @click="handleView(customer.id)"
                class="text-indigo-600 hover:text-indigo-900 transition-colors"
              >
                View
              </button>
              <button
                @click="handleEdit(customer.id)"
                class="text-blue-600 hover:text-blue-900 transition-colors"
              >
                Edit
              </button>
              <button
                @click="handleViewInvoices(customer.id)"
                class="text-green-600 hover:text-green-900 transition-colors"
              >
                Invoices
              </button>
            </td>
          </tr>
          <tr v-if="filteredCustomers.length === 0">
            <td colspan="4" class="px-6 py-12 text-center">
              <div class="text-gray-500">
                <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <h3 class="mt-2 text-sm font-medium text-gray-900">No customers found</h3>
                <p class="mt-1 text-sm text-gray-500">
                  {{ searchQuery ? 'Try adjusting your search terms' : 'Get started by adding a new customer' }}
                </p>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>