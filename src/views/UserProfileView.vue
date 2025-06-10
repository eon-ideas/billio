<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import BaseInput from '@/components/ui/BaseInput.vue'

const authStore = useAuthStore()
const nickname = ref('')
const avatarFile = ref<File | null>(null)
const avatarPreview = ref<string | null>(null)
const isSubmitting = ref(false)
const showSuccessMessage = ref(false)
const errorMessage = ref('')

// Create computed property for profile data
const profile = computed(() => authStore.userProfile)
const isAdmin = computed(() => authStore.isAdmin())

// Initialize form with current profile data
onMounted(async () => {
  if (!authStore.userProfile) {
    try {
      await authStore.fetchUserProfile()
    } catch (error) {
      console.error('Error fetching profile:', error)
      errorMessage.value = 'Failed to load profile data. Please try again.'
    }
  }
  
  // Set initial nickname from profile
  if (authStore.userProfile) {
    nickname.value = authStore.userProfile.nickname || ''
  }
})

// Handle file selection for avatar
const handleAvatarChange = (event: Event) => {
  const input = event.target as HTMLInputElement
  
  if (input.files && input.files.length > 0) {
    const file = input.files[0]
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      errorMessage.value = 'Please select a valid image file.'
      setTimeout(() => {
        errorMessage.value = ''
      }, 3000)
      return
    }
    
    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      errorMessage.value = 'Image must be less than 2MB.'
      setTimeout(() => {
        errorMessage.value = ''
      }, 3000)
      return
    }
    
    avatarFile.value = file
    
    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      avatarPreview.value = e.target?.result as string
    }
    reader.readAsDataURL(file)
  }
}

// Handle form submission
const handleSubmit = async () => {
  if (isSubmitting.value) return
  isSubmitting.value = true
  errorMessage.value = ''
  
  try {
    // Update nickname
    if (nickname.value) {
      await authStore.updateUserProfile(nickname.value)
    }
    
    // Upload avatar if selected
    if (avatarFile.value) {
      await authStore.uploadAvatar(avatarFile.value)
      // Clear file input after successful upload
      avatarFile.value = null
    }
    
    // Show success message
    showSuccessMessage.value = true
    setTimeout(() => {
      showSuccessMessage.value = false
    }, 3000)
  } catch (error) {
    console.error('Profile update error:', error)
    errorMessage.value = 'Failed to update profile. Please try again.'
    setTimeout(() => {
      errorMessage.value = ''
    }, 3000)
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="lg:px-8">
    <div class="mx-auto flex flex-col lg:max-w-4xl">
      <main class="flex-1">
        <div class="relative mx-auto max-w-4xl">
          <div class="pt-10 pb-16">
            <div class="px-4 sm:px-6 lg:px-0">
              <h1 class="text-3xl font-bold tracking-tight text-gray-900">User Profile</h1>
            </div>
            
            <!-- Success Message -->
            <div
              v-if="showSuccessMessage"
              class="fixed top-4 right-4 bg-green-50 text-green-800 px-4 py-3 rounded-lg shadow-lg flex items-center space-x-2 z-50 transition-all duration-300"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
              <span>Profile updated successfully!</span>
            </div>

            <!-- Error Message -->
            <div
              v-if="errorMessage"
              class="fixed top-4 right-4 bg-red-50 text-red-800 px-4 py-3 rounded-lg shadow-lg flex items-center space-x-2 z-50 transition-all duration-300"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
              <span>{{ errorMessage }}</span>
            </div>
            
            <div class="px-4 sm:px-6 lg:px-0">
              <div class="py-6">
                <!-- Profile Form -->
                <div class="bg-white shadow sm:rounded-lg">
                  <div class="px-4 py-5 sm:p-6">
                    <div v-if="authStore.isProfileLoading" class="flex justify-center py-8">
                      <svg class="animate-spin h-8 w-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </div>
                    
                    <form v-else @submit.prevent="handleSubmit" class="space-y-8">
                      <!-- User Role Badge -->
                      <div class="flex items-center space-x-2">
                        <span class="text-sm text-gray-500">Your role:</span>
                        <span 
                          v-if="isAdmin" 
                          class="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-purple-100 text-purple-800"
                        >
                          ADMIN
                        </span>
                        <span v-else 
                          class="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-blue-100 text-blue-800"
                        >
                          USER
                        </span>
                      </div>

                      <!-- Email -->
                      <div class="px-0 py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                        <dt class="text-sm font-medium text-gray-900">Email Address</dt>
                        <dd class="mt-1 text-sm text-gray-700 sm:col-span-2 sm:mt-0">{{ profile?.email || 'Not available' }}</dd>
                      </div>
                      
                      <!-- Nickname -->
                      <div>
                        <BaseInput
                          v-model="nickname"
                          label="Display Name"
                          id="nickname"
                          name="nickname"
                          placeholder="Your display name"
                        />
                      </div>
                      
                      <!-- Avatar -->
                      <div>
                        <label class="block text-sm font-medium text-gray-700">Profile Picture</label>
                        <div class="mt-2 flex items-center space-x-5">
                          <!-- Avatar preview -->
                          <div class="flex-shrink-0">
                            <div v-if="avatarPreview || profile?.avatar_url" class="relative h-16 w-16 rounded-full overflow-hidden">
                              <img 
                                :src="avatarPreview || profile?.avatar_url" 
                                alt="Avatar preview" 
                                class="h-full w-full object-cover" 
                              />
                            </div>
                            <div v-else class="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center text-gray-400">
                              <svg class="h-8 w-8" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                            </div>
                          </div>
                          
                          <!-- Upload button -->
                          <label 
                            for="avatar-upload" 
                            class="cursor-pointer ml-5 rounded-md border border-gray-300 bg-white py-2 px-3 text-sm font-medium leading-4 text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                          >
                            Change
                          </label>
                          <input 
                            id="avatar-upload" 
                            name="avatar-upload" 
                            type="file" 
                            class="sr-only" 
                            accept="image/*"
                            @change="handleAvatarChange" 
                          />
                        </div>
                        <p class="mt-2 text-sm text-gray-500">
                          JPG, PNG or GIF up to 2MB
                        </p>
                      </div>
                      
                      <!-- Submit Button -->
                      <div class="flex justify-end">
                        <button 
                          type="submit" 
                          class="ml-3 inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2" 
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
                          {{ isSubmitting ? 'Saving...' : 'Save' }}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>
