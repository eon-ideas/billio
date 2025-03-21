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
        class="w-full rounded-md border border-stroke bg-transparent py-3 px-5 text-dark outline-none transition focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
      />
    </div>
  </div>
</template>