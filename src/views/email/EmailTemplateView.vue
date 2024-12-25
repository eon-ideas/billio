<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useEmailTemplatesStore } from '@/stores/emailTemplates'
import type { NewEmailTemplate } from '@/types/emailTemplate'
import Breadcrumb from '@/components/ui/Breadcrumb.vue'

const route = useRoute()
const customerId = route.params.customerId as string
const emailTemplatesStore = useEmailTemplatesStore()

const emailTemplate = ref<NewEmailTemplate>({
  customer_id: customerId,
  subject: '',
  body: '',
  recipients: []
})

const recipientInput = ref('')
const isSaving = ref(false)
const saveError = ref('')

onMounted(async () => {
  const template = await emailTemplatesStore.getEmailTemplate(customerId)
  if (template) {
    emailTemplate.value = {
      customer_id: template.customer_id,
      subject: template.subject,
      body: template.body,
      recipients: template.recipients
    }
  }
})

const addRecipient = () => {
  if (recipientInput.value && !emailTemplate.value.recipients.includes(recipientInput.value)) {
    emailTemplate.value.recipients.push(recipientInput.value)
    recipientInput.value = ''
  }
}

const removeRecipient = (email: string) => {
  emailTemplate.value.recipients = emailTemplate.value.recipients.filter(r => r !== email)
}

const saveTemplate = async () => {
  try {
    isSaving.value = true
    saveError.value = ''
    await emailTemplatesStore.saveEmailTemplate(emailTemplate.value)
  } catch (error: any) {
    saveError.value = error.message
  } finally {
    isSaving.value = false
  }
}

const breadcrumbItems = [
  { name: 'Customers', to: '/customers' },
  { name: 'Customer', to: `/customers/${customerId}` },
  { name: 'Email Template' }
]
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <main class="py-6 px-4 sm:px-6 lg:px-8">
      <Breadcrumb :items="breadcrumbItems" />

      <div class="mb-8">
        <div class="sm:flex sm:items-center sm:justify-between">
          <div>
            <h1 class="text-2xl font-bold text-gray-900">Email Template</h1>
            <p class="mt-1 text-sm text-gray-500">
              Configure the email template for sending invoices
            </p>
          </div>
        </div>
      </div>

      <div class="bg-white shadow-sm rounded-lg border border-gray-200">
        <div class="px-4 py-5 sm:p-6">
          <form @submit.prevent="saveTemplate" class="space-y-6">
            <!-- Subject -->
            <div>
              <label for="subject" class="block text-sm font-medium text-gray-700">Subject</label>
              <input
                type="text"
                id="subject"
                v-model="emailTemplate.subject"
                class="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Invoice for [Invoice Number]"
                required
              >
            </div>

            <!-- Body -->
            <div>
              <label for="body" class="block text-sm font-medium text-gray-700">Body</label>
              <textarea
                id="body"
                v-model="emailTemplate.body"
                rows="6"
                class="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Dear [Customer Name],&#10;&#10;Please find attached the invoice [Invoice Number].&#10;&#10;Best regards,"
                required
              ></textarea>
            </div>

            <!-- Recipients -->
            <div>
              <label class="block text-sm font-medium text-gray-700">Recipients</label>
              <div class="mt-1 flex rounded-lg shadow-sm">
                <input
                  type="email"
                  v-model="recipientInput"
                  @keyup.enter.prevent="addRecipient"
                  class="flex-1 rounded-l-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Enter email address"
                >
                <button
                  type="button"
                  @click="addRecipient"
                  class="inline-flex items-center px-4 py-2 border border-l-0 border-gray-300 rounded-r-lg bg-gray-50 text-gray-700 hover:bg-gray-100"
                >
                  Add
                </button>
              </div>
              
              <!-- Recipients List -->
              <div class="mt-2 flex flex-wrap gap-2">
                <div
                  v-for="recipient in emailTemplate.recipients"
                  :key="recipient"
                  class="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-700"
                >
                  {{ recipient }}
                  <button
                    type="button"
                    @click="removeRecipient(recipient)"
                    class="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </div>
              </div>
            </div>

            <!-- Error Message -->
            <div v-if="saveError" class="text-sm text-red-600">
              {{ saveError }}
            </div>

            <!-- Save Button -->
            <div class="pt-4">
              <button
                type="submit"
                class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                :disabled="isSaving"
              >
                <svg
                  v-if="isSaving"
                  class="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {{ isSaving ? 'Saving...' : 'Save Template' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  </div>
</template>
