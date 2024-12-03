<script setup lang="ts">
import { ref } from 'vue'
import { useLogin } from '@/composables/useLogin'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseButton from '@/components/ui/BaseButton.vue'

const email = ref('')
const password = ref('')
const { login, loading, error } = useLogin()

const handleSubmit = async () => {
  await login(email.value, password.value)
}
</script>

<template>
  <form @submit.prevent="handleSubmit" class="space-y-6">
    <BaseInput
      v-model="email"
      type="email"
      label="Email"
      placeholder="Enter your email"
      required
    />
    
    <BaseInput
      v-model="password"
      type="password"
      label="Password"
      placeholder="Enter your password"
      required
    />

    <div v-if="error" class="text-red-500 text-sm">
      {{ error }}
    </div>

    <BaseButton
      type="submit"
      :loading="loading"
      class="w-full"
    >
      Sign In
    </BaseButton>
  </form>
</template>