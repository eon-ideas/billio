<script setup lang="ts">
import LoginForm from '@/components/auth/LoginForm.vue'
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
        <LoginForm />
      </div>
    </div>
  </div>
</template>