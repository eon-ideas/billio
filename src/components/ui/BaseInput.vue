<script setup lang="ts">
defineProps<{
  modelValue: string | number | null
  label?: string
  type?: string
  placeholder?: string
  required?: boolean
  id?: string
  name?: string
  autocomplete?: string
}>()

defineEmits<{
  (e: 'update:modelValue', value: string | number | null): void
}>()
</script>

<template>
  <div>
    <label v-if="label" :for="id" class="mb-2.5 block text-sm font-medium text-dark">
      {{ label }}
    </label>
    <div class="relative">
      <input
        :type="type || 'text'"
        :value="modelValue"
        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
        :placeholder="placeholder"
        :required="required"
        :id="id"
        :name="name"
        :autocomplete="autocomplete"
        class="w-full rounded-md border border-gray-300 bg-white py-3 px-5 text-gray-700 outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus-visible:shadow-none"
      />
    </div>
  </div>
</template>