<script setup lang="ts">
import { useCustomersStore } from '@/stores/customers'
import BaseButton from '@/components/ui/BaseButton.vue'
import { useRouter } from 'vue-router'

const customersStore = useCustomersStore()
const router = useRouter()

const handleEdit = (id: string) => {
  router.push(`/customers/${id}/edit`)
}

const handleViewInvoices = (id: string) => {
  router.push(`/customers/${id}/invoices`)
}
</script>

<template>
  <div class="overflow-x-auto">
    <table class="min-w-full divide-y divide-gray-200">
      <thead class="bg-gray-50">
        <tr>
          <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
          <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">City</th>
          <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
          <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">VAT ID</th>
          <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Currency</th>
          <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
        </tr>
      </thead>
      <tbody class="bg-white divide-y divide-gray-200">
        <tr v-for="customer in customersStore.customers" :key="customer.id">
          <td class="px-6 py-4 whitespace-nowrap">{{ customer.name }}</td>
          <td class="px-6 py-4 whitespace-nowrap">{{ customer.city }}</td>
          <td class="px-6 py-4 whitespace-nowrap">{{ customer.address }}</td>
          <td class="px-6 py-4 whitespace-nowrap">{{ customer.vatId }}</td>
          <td class="px-6 py-4 whitespace-nowrap">{{ customer.currency }}</td>
          <td class="px-6 py-4 whitespace-nowrap">
            <div class="flex space-x-2">
              <BaseButton @click="handleEdit(customer.id)">
                Edit
              </BaseButton>
              <BaseButton @click="handleViewInvoices(customer.id)">
                Invoices
              </BaseButton>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>