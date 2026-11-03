<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseButton from '@/components/ui/BaseButton.vue'

const auth = useAuthStore()

const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)
const rememberMe = ref(false)

const handleLogin = async () => {
  if (!email.value || !password.value) {
    error.value = 'Please fill in all fields'
    return
  }

  try {
    loading.value = true
    error.value = ''
    await auth.login(email.value, password.value, rememberMe.value)
  } catch (e: any) {
    error.value = e.message || 'An error occurred during login'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="flex min-h-full flex-1">
    <div class="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
      <div class="mx-auto w-full max-w-sm lg:w-96">
        <div>
          <img class="h-25 w-auto" src="@/assets/logo.png" alt="Invoice Master" />
        </div>

        <div class="mt-10">
          <div>
            <form @submit.prevent="handleLogin" class="space-y-6">
              <BaseInput
                v-model="email"
                label="Email address"
                type="email"
                id="email"
                name="email"
                autocomplete="email"
                required
              />

              <BaseInput
                v-model="password"
                label="Password"
                type="password"
                id="password"
                name="password"
                autocomplete="current-password"
                required
              />

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

              <div class="flex items-center justify-between">
                <div class="flex items-center">
                  <input 
                    id="remember-me" 
                    name="remember-me" 
                    type="checkbox"
                    v-model="rememberMe"
                    class="h-5 w-5 rounded border-stroke bg-transparent text-primary focus:border-primary focus:ring-primary dark:border-strokedark dark:bg-form-input" 
                  />
                  <label for="remember-me" class="ml-2.5 text-sm font-medium text-dark">Remember me</label>
                </div>

                <div class="text-sm">
                  <a href="#" class="text-primary hover:underline">Forgot password?</a>
                </div>
              </div>

              <BaseButton 
                type="submit" 
                :loading="loading"
                size="lg"
              >
                Sign in
              </BaseButton>
            </form>
          </div>


        </div>
      </div>
    </div>
    <div class="relative hidden w-0 flex-1 lg:block">
      <img class="absolute inset-0 size-full object-cover" src="/img/login-background.jpg" alt="Login background" />
    </div>
  </div>
</template>