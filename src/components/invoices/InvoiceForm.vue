<script setup lang="ts">
import { ref, computed } from 'vue'
import type { InvoiceFormData, InvoiceItemFormData } from '@/types/invoice'
import { useCustomersStore } from '@/stores/customers'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
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
  formData.value.items.push(newItem as any) // Type assertion needed here due to the form data structure
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

const handleSubmit = () => {
  emit('submit', formData.value)
}
</script>

<template>
  <form @submit.prevent="handleSubmit" class="space-y-6">
    <div class="grid grid-cols-2 gap-6">
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

    <div class="border-t pt-6">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-medium">Items</h3>
        <BaseButton @click="addItem" type="button">
          Add Item
        </BaseButton>
      </div>

      <div class="space-y-4">
        <div v-for="(item, index) in formData.items" :key="index" class="space-y-4">
          <div class="flex items-start gap-4">
            <div class="flex-grow">
              <InvoiceItemForm
                :item="item"
                :index="index"
                @update="updateItem(index, $event)"
              />
            </div>
            <div class="pt-8">
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
        </div>
      </div>
    </div>

    <div class="border-t pt-6">
      <div class="text-right">
        <p class="text-lg font-medium">
          Total ({{ customer?.currency }}): {{ total.toFixed(2) }}
        </p>
      </div>
    </div>

    <BaseButton type="submit" class="w-full">
      {{ initialData ? 'Update' : 'Create' }} Invoice
    </BaseButton>
  </form>
</template>