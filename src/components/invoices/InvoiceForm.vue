<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
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
const customer = ref(null)

onMounted(async () => {
  customer.value = await customersStore.getCustomerById(props.customerId)
})

const formData = ref<InvoiceFormData>({
  number: '',
  date: new Date().toISOString().split('T')[0],
  items: []
})

// Initialize form data when initialData is provided
watch(() => props.initialData, (newData) => {
  if (newData) {
    formData.value = {
      ...newData,
      items: Array.isArray(newData.items) ? [...newData.items] : []
    }
  }
}, { immediate: true })

const addItem = () => {
  if (!formData.value.items) {
    formData.value.items = []
  }
  formData.value.items.push({
    description: '',
    quantity: 1,
    price: 0
  })
}

const updateItem = (item: InvoiceItemFormData, index: number) => {
  if (!formData.value.items) {
    formData.value.items = []
  }
  // Preserve the id if it exists
  const existingId = formData.value.items[index]?.id
  formData.value.items[index] = {
    ...(existingId ? { id: existingId } : {}),
    ...item
  }
}

const removeItem = (index: number) => {
  if (formData.value.items) {
    formData.value.items.splice(index, 1)
  }
}

const total = computed(() => {
  if (!formData.value.items) return 0
  return formData.value.items.reduce((sum, item) => sum + (item.quantity * item.price), 0)
})

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: customer.value?.currency || 'USD'
  }).format(amount)
}

const handleSubmit = () => {
  emit('submit', { 
    ...formData.value,
    customer_id: props.customerId,
    items: formData.value.items || []
  })
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
        <template v-if="formData.items && formData.items.length > 0">
          <div v-for="(item, index) in formData.items" :key="index" class="relative bg-gray-50 rounded-lg p-4">
            <button
              type="button"
              @click="removeItem(index)"
              class="absolute top-2 right-2 text-gray-400 hover:text-red-500"
            >
              <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <InvoiceItemForm
              :initial-data="item"
              :index="index"
              @update="updateItem"
              @remove="removeItem"
            />
          </div>
        </template>
        <div v-else class="text-center py-6 bg-gray-50 rounded-lg">
          <p class="text-gray-500">No items added yet. Click "Add Item" to start.</p>
        </div>
      </div>

      <!-- Total -->
      <div class="mt-6 flex justify-end">
        <div class="text-right">
          <p class="text-sm text-gray-500">Total Amount</p>
          <p class="text-2xl font-bold text-gray-900">{{ formatCurrency(total) }}</p>
        </div>
      </div>
    </div>

    <!-- Submit Button -->
    <div class="flex justify-end">
      <button
        type="submit"
        class="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        Save Invoice
      </button>
    </div>
  </form>
</template>