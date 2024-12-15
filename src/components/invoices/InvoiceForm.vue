<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import type { InvoiceFormData, InvoiceItemFormData } from '@/types/invoice'
import type { Customer } from '@/types/customer'
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
const customer = ref<Customer | null>(null)

onMounted(async () => {
  customer.value = await customersStore.getCustomerById(props.customerId)
})

const formData = ref<InvoiceFormData>({
  customer_id: props.customerId,
  number: '',
  date: new Date().toISOString().split('T')[0],
  delivery_date: null,
  due_date: null,
  invoice_items: [],
  subtotal: 0,
  vat: 0
})

// Initialize form data when initialData is provided
watch(() => props.initialData, (newData) => {
  if (newData) {
    formData.value = {
      ...newData,
      invoice_items: Array.isArray(newData.invoice_items) ? [...newData.invoice_items] : []
    }
  }
}, { immediate: true })

const addItem = () => {
  if (!formData.value.invoice_items) {
    formData.value.invoice_items = []
  }
  formData.value.invoice_items.push({
    id: crypto.randomUUID(),
    invoice_id: '',
    description: '',
    quantity: 1,
    price: 0
  })
}

const updateItem = (item: InvoiceItemFormData, index: number) => {
  if (!formData.value.invoice_items) {
    formData.value.invoice_items = []
  }
  formData.value.invoice_items[index] = {
    ...formData.value.invoice_items[index],
    ...item
  }
  // Update subtotal when items change
  formData.value.subtotal = subtotal.value
  // Update VAT if customer includes VAT
  if (customer.value && customer.value.include_vat) {
    formData.value.vat = formData.value.subtotal * 0.21
  } else {
    formData.value.vat = 0
  }
}

const removeItem = (index: number) => {
  formData.value.invoice_items?.splice(index, 1)
  // Update totals after removing item
  formData.value.subtotal = subtotal.value
  if (customer.value && customer.value.include_vat) {
    formData.value.vat = formData.value.subtotal * 0.21
  } else {
    formData.value.vat = 0
  }
}

const subtotal = computed(() => {
  if (!formData.value.invoice_items) return 0
  return formData.value.invoice_items.reduce((sum, item) => sum + (item.quantity * item.price), 0)
})

const vatAmount = computed(() => {
  if (customer.value?.include_vat) {
    return subtotal.value * 0.25 // 25% VAT
  }
  return 0
})

const total = computed(() => {
  return formData.value.subtotal + formData.value.vat
})

const formatCurrency = (amount: number) => {
  const currency = customer.value?.currency || 'EUR'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency
  }).format(amount)
}

const handleSubmit = () => {
  emit('submit', { 
    ...formData.value,
    customer_id: props.customerId,
    invoice_items: formData.value.invoice_items || []
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
      <BaseInput
        v-model="formData.delivery_date"
        type="date"
        label="Delivery Date"
        required
      />
      <BaseInput
        v-model="formData.due_date"
        type="date"
        label="Due Date"
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
        <template v-if="formData.invoice_items && formData.invoice_items.length > 0">
          <div v-for="(item, index) in formData.invoice_items" :key="index" class="relative bg-gray-50 rounded-lg p-4">
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
        <div class="text-right space-y-2">
          <div>
            <p class="text-sm text-gray-500">Subtotal</p>
            <p class="text-lg font-medium text-gray-900">{{ formatCurrency(subtotal) }}</p>
          </div>
          <div v-if="customer?.include_vat">
            <p class="text-sm text-gray-500">VAT (25%)</p>
            <p class="text-lg font-medium text-gray-900">{{ formatCurrency(vatAmount) }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-500">Total{{ customer?.include_vat ? ' (including VAT)' : '' }}</p>
            <p class="text-2xl font-bold text-gray-900">{{ formatCurrency(total) }}</p>
          </div>
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