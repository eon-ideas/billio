<script setup lang="ts">
import { ref, watch } from 'vue'
import type { InvoiceItemFormData } from '@/types/invoice'
import BaseInput from '@/components/ui/BaseInput.vue'

const props = defineProps<{
  initialData?: InvoiceItemFormData
  index: number
}>()

const emit = defineEmits<{
  (e: 'update', data: InvoiceItemFormData, index: number): void
  (e: 'remove', index: number): void
}>()

const item = ref<InvoiceItemFormData>({
  description: '',
  quantity: 1,
  price: 0,
  ...props.initialData
})

// Watch for changes in initialData
watch(() => props.initialData, (newData) => {
  if (newData) {
    item.value = { ...newData }
  }
}, { deep: true })

const updateField = (field: keyof InvoiceItemFormData, value: string | number) => {
  const newValue = field === 'description' ? value : Number(value)
  item.value = {
    ...item.value,
    [field]: newValue
  }
  emit('update', item.value, props.index)
}
</script>

<template>
  <div class="grid grid-cols-1 gap-4 sm:grid-cols-4">
    <div class="sm:col-span-2">
      <BaseInput
        v-model="item.description"
        label="Description"
        @update:modelValue="updateField('description', $event)"
        required
      />
    </div>
    <div>
      <BaseInput
        v-model="item.quantity"
        type="number"
        min="1"
        step="1"
        label="Quantity"
        @update:modelValue="updateField('quantity', $event)"
        required
      />
    </div>
    <div>
      <BaseInput
        v-model="item.price"
        type="number"
        min="0"
        step="0.01"
        label="Price"
        @update:modelValue="updateField('price', $event)"
        required
      />
    </div>
    <div class="sm:col-span-4">
      <p class="text-sm text-gray-500">
        Total: {{ new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(item.quantity * item.price) }}
      </p>
    </div>
  </div>
</template>