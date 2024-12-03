<script setup lang="ts">
import { ref } from 'vue'
import type { CustomerFormData } from '@/types/customer'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseButton from '@/components/ui/BaseButton.vue'

const props = defineProps<{
  initialData?: CustomerFormData
}>()

const emit = defineEmits<{
  (e: 'submit', data: CustomerFormData): void
}>()

const formData = ref<CustomerFormData>(props.initialData ?? {
  name: '',
  city: '',
  address: '',
  vatId: '',
  currency: ''
})

const handleSubmit = () => {
  emit('submit', { ...formData.value })
}
</script>

<template>
  <form @submit.prevent="handleSubmit" class="space-y-6">
    <BaseInput
      v-model="formData.name"
      label="Name"
      placeholder="Enter customer name"
      required
    />
    
    <BaseInput
      v-model="formData.city"
      label="City"
      placeholder="Enter city"
      required
    />
    
    <BaseInput
      v-model="formData.address"
      label="Address"
      placeholder="Enter address"
      required
    />
    
    <BaseInput
      v-model="formData.vatId"
      label="VAT ID"
      placeholder="Enter VAT ID"
      required
    />
    
    <BaseInput
      v-model="formData.currency"
      label="Currency"
      placeholder="Enter currency code"
      required
    />

    <BaseButton type="submit" class="w-full">
      {{ initialData ? 'Update' : 'Add' }} Customer
    </BaseButton>
  </form>
</template>