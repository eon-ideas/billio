<script setup lang="ts">
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useInvoicesStore } from '@/stores/invoices'
import Navigation from '@/components/layout/Navigation.vue'
import InvoicePreview from '@/components/invoices/InvoicePreview.vue'

const router = useRouter()
const route = useRoute()
const invoicesStore = useInvoicesStore()

const invoiceId = route.params.id as string
const invoice = computed(() => invoicesStore.getInvoiceById(invoiceId))

if (!invoice.value) {
  router.push('/customers')
}
</script>

<template>
  <div class="min-h-screen bg-gray-100">
    <Navigation />
    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="print-area">
        <InvoicePreview
          v-if="invoice"
          :invoice="invoice"
        />
      </div>
    </main>
  </div>
</template>