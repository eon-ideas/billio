<script setup lang="ts">
import BaseButton from './BaseButton.vue'

const emit = defineEmits(['click'])

defineProps({
  title: {
    type: String,
    required: true
  },
  subtitle: {
    type: String,
    default: ''
  },
  showAddButton: {
    type: Boolean,
    default: false
  },
  addButtonText: {
    type: String,
    default: 'Add New'
  },
  addButtonLink: {
    type: String,
    default: ''
  }
})

const handleAddButtonClick = () => {
  emit('click')
}
</script>

<template>
  <div class="mb-6">
    <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 class="text-3xl font-bold text-gray-900">
          {{ title }}
        </h2>
        <p v-if="subtitle" class="mt-1 text-sm font-medium text-gray-600">
          {{ subtitle }}
        </p>
      </div>

      <div v-if="showAddButton" class="flex-shrink-0">
        <router-link v-if="addButtonLink" :to="addButtonLink">
          <BaseButton variant="primary" size="sm" class="flex items-center gap-2 whitespace-nowrap">
            <svg class="fill-current" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 7H9V1C9 0.4 8.6 0 8 0C7.4 0 7 0.4 7 1V7H1C0.4 7 0 7.4 0 8C0 8.6 0.4 9 1 9H7V15C7 15.6 7.4 16 8 16C8.6 16 9 15.6 9 15V9H15C15.6 9 16 8.6 16 8C16 7.4 15.6 7 15 7Z" />
            </svg>
            {{ addButtonText }}
          </BaseButton>
        </router-link>

        <BaseButton 
          v-else
          variant="primary" 
          size="sm" 
          class="flex items-center gap-2 whitespace-nowrap"
          @click="handleAddButtonClick"
        >
          <svg class="fill-current" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 7H9V1C9 0.4 8.6 0 8 0C7.4 0 7 0.4 7 1V7H1C0.4 7 0 7.4 0 8C0 8.6 0.4 9 1 9H7V15C7 15.6 7.4 16 8 16C8.6 16 9 15.6 9 15V9H15C15.6 9 16 8.6 16 8C16 7.4 15.6 7 15 7Z" />
          </svg>
          {{ addButtonText }}
        </BaseButton>
      </div>
    </div>
  </div>
</template>
