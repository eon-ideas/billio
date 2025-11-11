<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import BaseInput from '@/components/ui/BaseInput.vue'

const authStore = useAuthStore()

const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const isSubmitting = ref(false)
const showSuccessMessage = ref(false)
const errorMessage = ref('')

// Password validation
const validatePassword = (): string | null => {
  if (!newPassword.value || newPassword.value.length < 6) {
    return 'Password must be at least 6 characters long.'
  }

  if (newPassword.value !== confirmPassword.value) {
    return 'New passwords do not match.'
  }

  if (newPassword.value === currentPassword.value) {
    return 'New password must be different from current password.'
  }

  return null
}

// Handle password change
const handlePasswordChange = async () => {
  if (isSubmitting.value) return

  errorMessage.value = ''

  // Validate password
  const validationError = validatePassword()
  if (validationError) {
    errorMessage.value = validationError
    setTimeout(() => {
      errorMessage.value = ''
    }, 3000)
    return
  }

  isSubmitting.value = true

  try {
    await authStore.changePassword(currentPassword.value, newPassword.value)

    // Clear form
    currentPassword.value = ''
    newPassword.value = ''
    confirmPassword.value = ''

    // Show success message
    showSuccessMessage.value = true
    setTimeout(() => {
      showSuccessMessage.value = false
    }, 3000)
  } catch (error: any) {
    console.error('Password change error:', error)

    // Handle specific error messages
    if (error?.message?.includes('Current password is incorrect')) {
      errorMessage.value = 'Current password is incorrect. Please try again.'
    } else if (error?.message?.includes('New password should be different')) {
      errorMessage.value = 'New password must be different from your current password.'
    } else if (error?.message?.includes('password')) {
      errorMessage.value = 'Failed to change password. Please verify your current password.'
    } else {
      errorMessage.value = 'Failed to change password. Please try again.'
    }

    setTimeout(() => {
      errorMessage.value = ''
    }, 5000)
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="bg-white shadow sm:rounded-lg">
    <div class="px-4 py-5 sm:p-6">
      <h3 class="text-lg font-medium leading-6 text-gray-900 mb-4">Change Password</h3>

      <!-- Success Message -->
      <div
        v-if="showSuccessMessage"
        class="mb-4 bg-green-50 text-green-800 px-4 py-3 rounded-lg flex items-center space-x-2"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
        </svg>
        <span>Password changed successfully!</span>
      </div>

      <!-- Error Message -->
      <div
        v-if="errorMessage"
        class="mb-4 bg-red-50 text-red-800 px-4 py-3 rounded-lg flex items-center space-x-2"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
        </svg>
        <span>{{ errorMessage }}</span>
      </div>

      <form @submit.prevent="handlePasswordChange" class="space-y-6">
        <!-- Current Password -->
        <div>
          <BaseInput
            v-model="currentPassword"
            type="password"
            label="Current Password"
            id="current-password"
            name="current-password"
            placeholder="Enter your current password"
            required
            autocomplete="current-password"
          />
        </div>

        <!-- New Password -->
        <div>
          <BaseInput
            v-model="newPassword"
            type="password"
            label="New Password"
            id="new-password"
            name="new-password"
            placeholder="Enter your new password (min. 6 characters)"
            required
            autocomplete="new-password"
          />
        </div>

        <!-- Confirm New Password -->
        <div>
          <BaseInput
            v-model="confirmPassword"
            type="password"
            label="Confirm New Password"
            id="confirm-password"
            name="confirm-password"
            placeholder="Confirm your new password"
            required
            autocomplete="new-password"
          />
        </div>

        <!-- Password Requirements -->
        <div class="text-sm text-gray-500">
          <p class="font-medium mb-1">Password requirements:</p>
          <ul class="list-disc list-inside space-y-1">
            <li>At least 6 characters long</li>
            <li>Must be different from current password</li>
          </ul>
        </div>

        <!-- Submit Button -->
        <div class="flex justify-end">
          <button
            type="submit"
            class="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="isSubmitting"
          >
            <svg
              v-if="isSubmitting"
              class="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {{ isSubmitting ? 'Changing Password...' : 'Change Password' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
