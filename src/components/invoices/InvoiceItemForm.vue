<script setup lang="ts">
import { ref, watch } from 'vue'
import type { InvoiceItemFormData } from '@/types/invoice'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseButton from '@/components/ui/BaseButton.vue'

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

watch(item, (newValue) => {
  emit('update', newValue, props.index)
}, { deep: true })
</script>

<template>
  <div class="flex gap-4 items-end">
    <BaseInput
      v-model="item.description"
      label="Description"
      required
    />
    <BaseInput
      v-model.number="item.quantity"
      type="number"
      label="Quantity"
      required
      class="w-32"
    />
    <BaseInput
      v-model.number="item.price"
      type="number"
      label="Price"
      required
      class="w-32"
    />
    <BaseButton
      @click="emit('remove', index)"
      class="bg-red-600 hover:bg-red-700"
    >
      Remove
    </BaseButton>
  </div>
</template>