<template>
  <div class="text-center">
    <svg 
      v-if="icon === 'folder-plus'" 
      class="mx-auto size-12 text-gray-400" 
      fill="none" 
      viewBox="0 0 24 24" 
      stroke="currentColor" 
      aria-hidden="true"
    >
      <path 
        vector-effect="non-scaling-stroke" 
        stroke-linecap="round" 
        stroke-linejoin="round" 
        stroke-width="2" 
        d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" 
      />
    </svg>
    <svg 
      v-else-if="icon === 'document'" 
      class="mx-auto size-12 text-gray-400" 
      fill="none" 
      viewBox="0 0 24 24" 
      stroke="currentColor" 
      aria-hidden="true"
    >
      <path 
        vector-effect="non-scaling-stroke" 
        stroke-linecap="round" 
        stroke-linejoin="round" 
        stroke-width="2" 
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
      />
    </svg>
    <svg 
      v-else-if="icon === 'search'" 
      class="mx-auto size-12 text-gray-400" 
      fill="none" 
      viewBox="0 0 24 24" 
      stroke="currentColor" 
      aria-hidden="true"
    >
      <path 
        vector-effect="non-scaling-stroke" 
        stroke-linecap="round" 
        stroke-linejoin="round" 
        stroke-width="2" 
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
      />
    </svg>
    <svg 
      v-else-if="icon === 'user'" 
      class="mx-auto size-12 text-gray-400" 
      fill="none" 
      viewBox="0 0 24 24" 
      stroke="currentColor" 
      aria-hidden="true"
    >
      <path 
        vector-effect="non-scaling-stroke" 
        stroke-linecap="round" 
        stroke-linejoin="round" 
        stroke-width="2" 
        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" 
      />
    </svg>
    <component 
      v-else-if="customIcon" 
      :is="customIcon" 
      class="mx-auto size-12 text-gray-400" 
      aria-hidden="true" 
    />
    <h3 v-if="title" class="mt-2 text-sm font-semibold text-gray-900">{{ title }}</h3>
    <p v-if="description" class="mt-1 text-sm text-gray-500">{{ description }}</p>
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
defineProps({
  /**
   * The title text to display
   */
  title: {
    type: String,
    default: ''
  },
  /**
   * The description text to display
   */
  description: {
    type: String,
    default: ''
  },
  /**
   * Predefined icon to use
   * Options: 'folder-plus', 'document', 'search', 'user'
   */
  icon: {
    type: String,
    default: 'folder-plus',
    validator: (value: string) => ['folder-plus', 'document', 'search', 'user', ''].includes(value)
  },
  /**
   * Custom icon component (from Heroicons or other icon library)
   * This will override the predefined icon if both are provided
   */
  customIcon: {
    type: Object,
    default: null
  }
})
</script>
