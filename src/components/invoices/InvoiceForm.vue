<script setup lang="ts">
import { ref, computed } from 'vue'
import type { InvoiceFormData, InvoiceItemFormData } from '@/types/invoice'
import { useCustomersStore } from '@/stores/customers'
import BaseInput from '@/components/ui/BaseInput.vue'
import InvoiceItemForm from './InvoiceItemForm.vue'

const props = defineProps<{
  customerId: string
  initialData?: InvoiceFormData
}>()

const emit = defineEmits<{
  (e: 'submit', data: InvoiceFormData): void
}>()

const customersStore = useCustomersStore()
const customer = computed(() => customersStore.getCustomerById(props.customerId))

const formData = ref<InvoiceFormData>(props.initialData ?? {
  customerId: props.customerId,
  number: '',
  date: new Date().toISOString().split('T')[0],
  items: []
})

const addItem = () => {
  const newItem: InvoiceItemFormData = {
    description: '',
    quantity: 0,
    price: 0
  }
  formData.value.items.push(newItem as any)
}

const updateItem = (index: number, item: InvoiceItemFormData) => {
  formData.value.items[index] = {
    id: formData.value.items[index].id,
    ...item
  }
}

const removeItem = (index: number) => {
  formData.value.items.splice(index, 1)
}

const total = computed(() => {
  return formData.value.items.reduce((sum, item) => sum + (item.quantity * item.price), 0)
})

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: customer.value?.currency || 'USD'
  }).format(amount)
}

const handleSubmit = () => {
  emit('submit', formData.value)
}
</script>

<template>
  <form @submit.prevent="handleSubmit" class="space-y-8">
    <!-- Basic Information -->
    <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
      <BaseInput
        v-model="formData.number"
        label="Invoice Number"
        required
      />
      <BaseInput
        v-model="formData.date"
        type="date"
        label="Invoice Date"
        required
      />
    </div>

    <!-- Items Section -->
    <div class="border-t border-gray-200 pt-6">
      <div class="flex justify-between items-center mb-6">
        <div>
          <h3 class="text-lg font-medium text-gray-900">Invoice Items</h3>
          <p class="mt-1 text-sm text-gray-500">Add or remove items from this invoice</p>
        </div>
        <button
          type="button"
          @click="addItem"
          class="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <svg class="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Add Item
        </button>
      </div>

      <div class="space-y-6">
        <template v-if="formData.items.length > 0">
          <div v-for="(item, index) in formData.items" :key="index" class="relative bg-gray-50 rounded-lg p-4">
            <div class="flex items-start gap-4">
              <div class="flex-grow">
                <InvoiceItemForm
                  :item="item"
                  :index="index"
                  @update="updateItem(index, $event)"
                />
              </div>
              <button
                type="button"
                @click="removeItem(index)"
                class="text-gray-400 hover:text-red-500 transition-colors"
                title="Remove item"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                </svg>
              </button>
            </div>
          </div>
        </template>
        <div v-else class="text-center py-6 bg-gray-50 rounded-lg">
          <svg class="mx-auto h-12 w-12 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900">No items</h3>
          <p class="mt-1 text-sm text-gray-500">Get started by adding a new item to this invoice.</p>
        </div>
      </div>
    </div>

    <!-- Total and Submit -->
    <div class="border-t border-gray-200 pt-6">
      <div class="flex justify-between items-center mb-6">
        <div class="text-lg font-medium text-gray-900">
          Total Amount
          <span class="ml-2 text-2xl font-bold text-blue-600">{{ formatCurrency(total) }}</span>
        </div>
        <button
          type="submit"
          class="inline-flex items-center px-6 py-3 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <svg class="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
          Save Invoice
        </button>
      </div>
    </div>
  </form>
</template>