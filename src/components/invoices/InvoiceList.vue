<script setup lang="ts">
import { computed } from 'vue'
import { useInvoicesStore } from '@/stores/invoices'
import { useCustomersStore } from '@/stores/customers'
import BaseButton from '@/components/ui/BaseButton.vue'
import { useRouter } from 'vue-router'

const props = defineProps<{
  customerId: string
}>()

const router = useRouter()
const invoicesStore = useInvoicesStore()
const customersStore = useCustomersStore()

const customer = computed(() => customersStore.getCustomerById(props.customerId))
const invoices = computed(() => invoicesStore.getInvoicesByCustomerId(props.customerId).value)

const handleEdit = (id: string) => {
  router.push(`/customers/${props.customerId}/invoices/${id}/edit`)
}

const handlePreview = (id: string) => {
  router.push(`/customers/${props.customerId}/invoices/${id}/preview`)
}
</script>

<template>
  <div class="overflow-x-auto">
    <table class="min-w-full divide-y divide-gray-200">
      <thead class="bg-gray-50">
        <tr>
          <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Number</th>
          <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
          <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
          <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
          <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
        </tr>
      </thead>
      <tbody class="bg-white divide-y divide-gray-200">
        <tr v-for="invoice in invoices" :key="invoice.id">
          <td class="px-6 py-4 whitespace-nowrap">{{ invoice.number }}</td>
          <td class="px-6 py-4 whitespace-nowrap">{{ new Date(invoice.date).toLocaleDateString() }}</td>
          <td class="px-6 py-4 whitespace-nowrap">{{ invoice.items.length }}</td>
          <td class="px-6 py-4 whitespace-nowrap">
            {{ invoice.total.toFixed(2) }} {{ customer?.currency }}
          </td>
          <td class="px-6 py-4 whitespace-nowrap space-x-2">
            <BaseButton @click="handleEdit(invoice.id)">
              Edit
            </BaseButton>
            <BaseButton @click="handlePreview(invoice.id)">
              Preview
            </BaseButton>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>