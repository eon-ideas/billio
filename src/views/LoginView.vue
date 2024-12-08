<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const auth = useAuthStore()
const router = useRouter()

const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

const handleLogin = async () => {
  if (!email.value || !password.value) {
    error.value = 'Please fill in all fields'
    return
  }

  try {
    loading.value = true
    error.value = ''
    await auth.login(email.value, password.value)
  } catch (e: any) {
    error.value = e.message || 'An error occurred during login'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex bg-gray-50">
    <!-- Left side - Decorative -->
    <div class="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-indigo-900 p-12 relative overflow-hidden">
      <div class="relative z-10 flex flex-col justify-between h-full text-white">
        <div>
          <h1 class="text-4xl font-bold mb-4">Invoice Master</h1>
          <p class="text-lg text-blue-100">Streamline your invoicing process with our powerful and intuitive platform.</p>
        </div>
        <div class="space-y-6">
          <div class="flex items-center space-x-3">
            <div class="p-2 bg-white/10 rounded-lg">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span class="text-blue-100">Easy invoice generation</span>
          </div>
          <div class="flex items-center space-x-3">
            <div class="p-2 bg-white/10 rounded-lg">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span class="text-blue-100">Payment tracking</span>
          </div>
          <div class="flex items-center space-x-3">
            <div class="p-2 bg-white/10 rounded-lg">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <span class="text-blue-100">Insightful reports</span>
          </div>
        </div>
      </div>
      <!-- Decorative circles -->
      <div class="absolute -bottom-32 -right-32 h-64 w-64 rounded-full bg-blue-500 opacity-20"></div>
      <div class="absolute -top-32 -left-32 h-64 w-64 rounded-full bg-indigo-500 opacity-20"></div>
    </div>

    <!-- Right side - Login form -->
    <div class="w-full lg:w-1/2 flex items-center justify-center p-8">
      <div class="max-w-md w-full">
        <div class="text-center mb-10">
          <h2 class="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h2>
          <p class="text-gray-600">Sign in to continue to your account</p>
        </div>

        <form @submit.prevent="handleLogin" class="space-y-6">
          <div class="space-y-4">
            <div>
              <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
              <div class="mt-1 relative">
                <input
                  id="email"
                  type="email"
                  v-model="email"
                  required
                  class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-150 ease-in-out"
                  :class="{ 'border-red-300': error }"
                  placeholder="Enter your email"
                />
                <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <svg v-if="error" class="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div>
              <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
              <div class="mt-1 relative">
                <input
                  id="password"
                  type="password"
                  v-model="password"
                  required
                  class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-150 ease-in-out"
                  :class="{ 'border-red-300': error }"
                  placeholder="Enter your password"
                />
                <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <svg v-if="error" class="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div v-if="error" class="rounded-md bg-red-50 p-4">
            <div class="flex">
              <div class="flex-shrink-0">
                <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                </svg>
              </div>
              <div class="ml-3">
                <p class="text-sm text-red-700">{{ error }}</p>
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              :disabled="loading"
              class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg
                v-if="loading"
                class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
              {{ loading ? 'Signing in...' : 'Sign in' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.from-blue-600 {
  --tw-gradient-from: #2563eb;
  --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to, rgb(37 99 235 / 0));
}

.to-indigo-900 {
  --tw-gradient-to: #312e81;
}
</style>