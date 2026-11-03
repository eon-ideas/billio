<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  show: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
}>()

const emit = defineEmits<{
  (e: 'confirm'): void
  (e: 'cancel'): void
  (e: 'update:show', value: boolean): void
}>()

const dialog = ref<HTMLDialogElement | null>(null)

watch(() => props.show, (show) => {
  if (!dialog.value) return
  
  if (show) {
    dialog.value.showModal()
  } else {
    dialog.value.close()
  }
})

const handleConfirm = () => {
  emit('confirm')
  emit('update:show', false)
}

const handleCancel = () => {
  emit('cancel')
  emit('update:show', false)
}

const handleBackdropClick = (e: MouseEvent) => {
  const rect = dialog.value?.getBoundingClientRect()
  if (!rect) return
  
  if (
    e.clientX < rect.left ||
    e.clientX > rect.right ||
    e.clientY < rect.top ||
    e.clientY > rect.bottom
  ) {
    handleCancel()
  }
}
</script>

<template>
  <dialog
    ref="dialog"
    class="p-0 bg-transparent backdrop:bg-black/50"
    @click="handleBackdropClick"
  >
    <div class="w-[28rem] max-w-full bg-white rounded-lg shadow-xl">
      <div class="p-6">
        <h3 class="text-lg font-medium text-gray-900">
          {{ title }}
        </h3>
        <p class="mt-2 text-sm text-gray-500">
          {{ message }}
        </p>
      </div>
      <div class="px-6 py-4 bg-gray-50 flex justify-end space-x-3 rounded-b-lg">
        <button
          type="button"
          class="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          @click="handleCancel"
        >
          {{ cancelLabel || 'Cancel' }}
        </button>
        <button
          type="button"
          class="inline-flex justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          @click="handleConfirm"
        >
          {{ confirmLabel || 'Confirm' }}
        </button>
      </div>
    </div>
  </dialog>
</template>

<style scoped>
dialog::backdrop {
  background: rgba(0, 0, 0, 0.5);
}
</style>
