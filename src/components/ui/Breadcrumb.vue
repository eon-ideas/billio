<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'

interface BreadcrumbItem {
  name: string
  to?: string
  icon?: string
}

const props = withDefaults(defineProps<{
  items?: BreadcrumbItem[]
  showHomeIcon?: boolean
}>(), {
  items: () => [],
  showHomeIcon: true
})

const lastIndex = computed(() => (props.items?.length ?? 1) - 1)

const validItems = computed(() => 
  props.items?.filter(item => item && item.name) ?? []
)

const getItemClasses = (isLast: boolean) => ({
  'text-gray-500': isLast,
  'hover:text-blue-600 text-gray-600': !isLast,
  'text-sm font-medium transition-colors duration-200': true
})
</script>

<template>
  <nav class="flex items-center py-3 mb-4" aria-label="Breadcrumb">
    <ol role="list" class="flex items-center space-x-1 sm:space-x-2">
      <!-- Home Icon -->
      <li v-if="showHomeIcon">
        <div>
          <RouterLink 
            to="/" 
            class="text-gray-400 hover:text-blue-600 transition-colors duration-200 flex items-center"
          >
            <svg 
              class="h-5 w-5 flex-shrink-0" 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 20 20" 
              fill="currentColor" 
              aria-hidden="true"
            >
              <path fill-rule="evenodd" d="M9.293 2.293a1 1 0 011.414 0l7 7A1 1 0 0117 11h-1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-3a1 1 0 00-1-1H9a1 1 0 00-1 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-6H3a1 1 0 01-.707-1.707l7-7z" clip-rule="evenodd" />
            </svg>
            <span class="sr-only">Home</span>
          </RouterLink>
        </div>
      </li>

      <!-- Breadcrumb Items -->
      <template v-if="validItems.length > 0">
        <li 
          v-for="(item, index) in validItems" 
          :key="item.name"
          class="flex items-center"
        >
          <!-- Separator -->
          <svg 
            class="h-5 w-5 flex-shrink-0 text-gray-300" 
            xmlns="http://www.w3.org/2000/svg" 
            fill="currentColor" 
            viewBox="0 0 20 20" 
            aria-hidden="true"
          >
            <path d="M5.555 17.776l8-16 .894.448-8 16-.894-.448z" />
          </svg>

          <!-- Item Content -->
          <div class="flex items-center ml-1 sm:ml-2">
            <!-- Custom Icon (if provided) -->
            <component
              v-if="item.icon"
              :is="item.icon"
              class="h-4 w-4 mr-1"
            />

            <!-- Link or Text -->
            <template v-if="index === lastIndex">
              <span 
                :class="getItemClasses(true)"
                aria-current="page"
              >{{ item.name }}</span>
            </template>
            <template v-else-if="item.to">
              <RouterLink
                :to="item.to"
                :class="getItemClasses(false)"
              >{{ item.name }}</RouterLink>
            </template>
            <template v-else>
              <span :class="getItemClasses(false)">{{ item.name }}</span>
            </template>
          </div>
        </li>
      </template>
    </ol>
  </nav>
</template>

<style scoped>
.router-link-active {
  @apply text-blue-600;
}
</style>
