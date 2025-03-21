<script setup lang="ts">
const props = withDefaults(defineProps<{
  type?: 'button' | 'submit' | 'reset'
  loading?: boolean
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning'
  size?: 'sm' | 'md' | 'lg'
}>(), {
  type: 'button',
  loading: false,
  variant: 'primary',
  size: 'md'
})

const getButtonClasses = () => {
  const baseClasses = 'inline-flex items-center justify-center gap-2.5 rounded-md font-medium text-white hover:bg-opacity-90 w-full'
  
  // Size classes
  const sizeClasses = {
    sm: 'py-2 px-6 text-sm',
    md: 'py-3 px-8 text-base',
    lg: 'py-4 px-10 text-base lg:px-8 xl:px-10'
  }
  
  // Variant classes
  const variantClasses = {
    primary: 'bg-primary',
    secondary: 'bg-secondary',
    danger: 'bg-danger',
    success: 'bg-success',
    warning: 'bg-warning'
  }
  
  return `${baseClasses} ${sizeClasses[props.size]} ${variantClasses[props.variant]}`
}
</script>

<template>
  <button
    :type="props.type"
    :disabled="props.loading"
    :class="[getButtonClasses(), props.loading ? 'opacity-75 cursor-wait' : '']"
  >
    <svg
      v-if="props.loading"
      class="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        class="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        stroke-width="4"
      ></circle>
      <path
        class="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
    <slot v-if="!props.loading"></slot>
    <span v-else>Loading...</span>
  </button>
</template>