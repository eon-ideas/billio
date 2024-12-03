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
  formData.value.items.push({
    description: '',
    quantity: 1,
    price: 0
  })
}

const updateItem = (item: InvoiceItemFormData, index: number) => {
  formData.value.items[index] = item
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
        <InvoiceItemForm
          v-for="(item, index) in formData.items"
          :key="index"
          :initial-data="item"
          :index="index"
          @update="updateItem"
          @remove="removeItem"
        />
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