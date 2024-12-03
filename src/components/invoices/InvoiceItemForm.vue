<script setup lang="ts">
import { ref, watch, computed } from 'vue'
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

const item = ref<InvoiceItemFormData>(props.initialData ?? {
  description: '',
  quantity: 1,
  price: 0
})

const total = computed(() => {
  return item.value.quantity * item.value.price
})

const updateField = (field: keyof InvoiceItemFormData, value: string | number) => {
  item.value = {
    ...item.value,
    [field]: field === 'description' ? value : Number(value)
  }
  emit('update', item.value, props.index)
}

watch(item, (newValue) => {
  emit('update', newValue, props.index)
}, { deep: true })
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
        label="Quantity"
        @update:modelValue="updateField('quantity', $event)"
        required
      />
    </div>
    <div>
      <BaseInput
        v-model="item.price"
        type="number"
        label="Price"
        @update:modelValue="updateField('price', $event)"
        required
      />
    </div>
    <div class="sm:col-span-4">
      <p class="text-sm text-gray-500">Total: {{ total }}</p>
    </div>
  </div>
</template>