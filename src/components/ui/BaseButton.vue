<script setup lang="ts">
const props = withDefaults(defineProps<{
  type?: 'button' | 'submit' | 'reset'
  loading?: boolean
}>(), {
  type: 'button',
  loading: false
})
</script>

<template>
  <button
    :type="type"
    :disabled="loading"
    class="flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
  >
    <span v-if="loading" class="mr-2">Loading...</span>
    <slot v-else></slot>
  </button>
</template>