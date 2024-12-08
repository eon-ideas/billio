<script setup lang="ts">
import { computed, ref } from 'vue'
import { useInvoicesStore } from '@/stores/invoices'
import { useCustomersStore } from '@/stores/customers'
import { useRouter } from 'vue-router'

const props = defineProps<{
  customerId: string
  searchQuery?: string
}>()

const router = useRouter()
const invoicesStore = useInvoicesStore()
const customersStore = useCustomersStore()
const showDeleteModal = ref(false)
const invoiceToDelete = ref<string | null>(null)

const customer = computed(() => customersStore.getCustomerById(props.customerId))
const invoices = computed(() => {
  const allInvoices = invoicesStore.invoices
  let filteredInvoices = allInvoices.filter(i => i.customer_id === props.customerId)
  
  if (props.searchQuery) {
    const query = props.searchQuery.toLowerCase()
    filteredInvoices = filteredInvoices.filter(invoice => 
      invoice.number.toLowerCase().includes(query) ||
      invoice.total.toString().includes(query)
    )
  }
  
  return filteredInvoices
})

const handleEdit = (id: string) => {
  router.push(`/customers/${props.customerId}/invoices/${id}/edit`)
}

const handlePreview = (id: string) => {
  router.push(`/customers/${props.customerId}/invoices/${id}/preview`)
}

const handleTogglePaid = (id: string) => {
  invoicesStore.toggleInvoicePaid(id)
}

const handleDelete = (id: string) => {
  invoiceToDelete.value = id
  showDeleteModal.value = true
}

const confirmDelete = async () => {
  if (invoiceToDelete.value) {
    await invoicesStore.deleteInvoice(invoiceToDelete.value)
    showDeleteModal.value = false
    invoiceToDelete.value = null
  }
}

const formatCurrency = (amount: number, currency: string) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(amount)
}
</script>

<template>
  <div class="overflow-x-auto">
    <table class="min-w-full divide-y divide-gray-200">
      <thead class="bg-gray-50">
        <tr>
          <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Number</th>
          <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
          <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
          <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
          <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
          <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
        </tr>
      </thead>
      <tbody class="bg-white divide-y divide-gray-200">
        <tr v-for="invoice in invoices" 
            :key="invoice.id"
            class="hover:bg-gray-50 transition-colors"
        >
          <td class="px-6 py-4 whitespace-nowrap">
            <button
              @click="handlePreview(invoice.id)"
              class="text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors"
            >
              {{ invoice.number }}
            </button>
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
            {{ new Date(invoice.date).toLocaleDateString() }}
          </td>
          <td class="px-6 py-4 whitespace-nowrap">
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {{ invoice.items.length }}
            </span>
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
            {{ formatCurrency(invoice.total, customer?.currency || 'USD') }}
          </td>
          <td class="px-6 py-4 whitespace-nowrap">
            <button
              @click="handleTogglePaid(invoice.id)"
              :class="[
                'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors',
                invoice.paid 
                  ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                  : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
              ]"
            >
              <span class="flex items-center">
                <span class="h-2 w-2 mr-1.5 rounded-full" :class="[
                  invoice.paid ? 'bg-green-400' : 'bg-yellow-400'
                ]"></span>
                {{ invoice.paid ? 'Paid' : 'Unpaid' }}
              </span>
            </button>
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-sm">
            <div class="flex items-center space-x-3">
              <button
                @click="handlePreview(invoice.id)"
                class="text-blue-600 hover:text-blue-900"
              >
                View
              </button>
              <button
                @click="handleEdit(invoice.id)"
                class="text-gray-600 hover:text-gray-900"
              >
                Edit
              </button>
              <button
                @click="handleDelete(invoice.id)"
                class="text-red-600 hover:text-red-900"
              >
                Delete
              </button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- Delete Confirmation Modal -->
  <div v-if="showDeleteModal" class="fixed z-10 inset-0 overflow-y-auto">
    <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
      <div class="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
        <div>
          <div class="mt-3 text-center sm:mt-5">
            <h3 class="text-lg leading-6 font-medium text-gray-900">Delete Invoice</h3>
            <div class="mt-2">
              <p class="text-sm text-gray-500">Are you sure you want to delete this invoice? This action cannot be undone.</p>
            </div>
          </div>
        </div>
        <div class="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
          <button
            @click="confirmDelete"
            class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:col-start-2 sm:text-sm"
          >
            Delete
          </button>
          <button
            @click="showDeleteModal = false"
            class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:col-start-1 sm:text-sm"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  </div>
</template>