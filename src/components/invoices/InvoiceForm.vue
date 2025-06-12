<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import type { InvoiceFormData, InvoiceItemFormData } from '@/types/invoice'
import type { Customer } from '@/types/customer'
import { useCustomersStore } from '@/stores/customers'
import { useInvoicesStore } from '@/stores/invoices'
import { useExchangeRate } from '@/composables/useExchangeRate'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import InvoiceItemForm from './InvoiceItemForm.vue'

const props = defineProps<{
  customerId: string
  initialData?: InvoiceFormData
}>()

const emit = defineEmits<{
  (e: 'submit', data: InvoiceFormData): void
  (e: 'cancel'): void
}>()

const customersStore = useCustomersStore()
const invoicesStore = useInvoicesStore()
const customer = ref<Customer | null>(null)
const { fetchExchangeRate, isLoading: fetchingExchangeRate, error: exchangeRateError } = useExchangeRate()
const loadingLatestNumber = ref(false)
const latestNumberNotification = ref<string | null>(null)

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
  vat: 0,
  currency_exchange_rate: null
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

// Track the initial date to detect changes
const initialDate = ref<string | null>(null)

// Fetch exchange rate only when creating a new invoice or when the date changes
watch([() => formData.value.date, () => customer.value], async ([date, currentCustomer]) => {
  // Only fetch if we have a customer with non-EUR currency and a date
  if (currentCustomer && currentCustomer.currency !== 'EUR' && date) {
    // For new invoices (no initialData) or when date changes from its initial value
    const isNewInvoice = !props.initialData
    const dateChanged = initialDate.value !== null && date !== initialDate.value
    
    // If it's a new invoice or the date has changed, fetch the exchange rate
    if (isNewInvoice || dateChanged) {
      const rate = await fetchExchangeRate(date, currentCustomer.currency)
      if (rate !== null) {
        formData.value.currency_exchange_rate = rate
      }
    }
  }
}, { immediate: true })

// Set initial date when initialData is loaded
watch(() => props.initialData, (newData) => {
  if (newData && newData.date) {
    initialDate.value = newData.date
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
  return subtotal.value + vatAmount.value
})

const formatCurrency = (amount: number) => {
  const currency = customer.value?.currency || 'EUR'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency
  }).format(amount)
}

const exchangeRateLabel = computed(() => {
  if (!customer.value) return 'Exchange Rate'
  return `Exchange Rate (1${customer.value.currency} = X EUR)`
})

const loadLatestInvoiceNumber = async () => {
  loadingLatestNumber.value = true
  latestNumberNotification.value = null
  
  try {
    const latestNumber = await invoicesStore.getLatestInvoiceNumber()
    
    if (latestNumber) {
      formData.value.number = latestNumber
      latestNumberNotification.value = `Latest invoice number "${latestNumber}" loaded. Please modify it (e.g., increment) before saving.`
    } else {
      latestNumberNotification.value = 'No previous invoices found. Please enter a new invoice number.'
    }
  } catch (error) {
    console.error('Error loading latest invoice number:', error)
    latestNumberNotification.value = 'Failed to load latest invoice number.'
  } finally {
    loadingLatestNumber.value = false
  }
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
      <div class="space-y-2">
        <BaseInput
          v-model="formData.number"
          label="Invoice Number"
          required
        />
        <div class="flex items-center">
          <BaseButton 
            type="button" 
            variant="secondary" 
            size="sm" 
            @click="loadLatestInvoiceNumber"
            :disabled="loadingLatestNumber"
            class="text-xs"
          >
            <span v-if="loadingLatestNumber">Loading...</span>
            <span v-else>Load Latest Invoice Number</span>
          </BaseButton>
        </div>
        <div v-if="latestNumberNotification" class="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-700">
          {{ latestNumberNotification }}
        </div>
      </div>
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
      <div v-if="customer && customer.currency !== 'EUR'" class="col-span-1">
        <label class="mb-2.5 block text-sm font-medium text-dark">{{ exchangeRateLabel }}</label>
        <div class="relative">
          <input
            v-model.number="formData.currency_exchange_rate"
            type="number"
            step="0.000001"
            placeholder="e.g. 1.064736"
            class="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 outline-none focus:border-primary focus-visible:shadow-none"
            :class="{ 'opacity-50': fetchingExchangeRate }"
            required
            :disabled="fetchingExchangeRate"
          />
          <div v-if="fetchingExchangeRate" class="absolute right-3 top-1/2 -translate-y-1/2">
            <div class="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
          </div>
        </div>
        <p v-if="exchangeRateError" class="mt-1 text-sm text-red-600">{{ exchangeRateError }}</p>
        <p v-else class="mt-1 text-xs text-gray-500">Auto-populated from Billio currency exchange API</p>
      </div>
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
    <div class="flex justify-end space-x-4">
      <BaseButton 
        type="button" 
        variant="secondary" 
        size="md" 
        @click="emit('cancel')"
      >
        Cancel
      </BaseButton>
      <BaseButton 
        type="submit" 
        variant="primary" 
        size="md"
      >
        Save Invoice
      </BaseButton>
    </div>
  </form>
</template>