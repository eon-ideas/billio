<script setup lang="ts">
defineProps<{
  modelValue: string | number | null
  label?: string
  type?: string
  placeholder?: string
  required?: boolean
}>()

defineEmits<{
  (e: 'update:modelValue', value: string | number | null): void
}>()
</script>

<template>
  <div class="space-y-2">
    <label v-if="label" class="block text-sm font-medium text-gray-700">
      {{ label }}
    </label>
    <input
      :type="type || 'text'"
      :value="modelValue"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      :placeholder="placeholder"
      :required="required"
      class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
    />
  </div>
</template>