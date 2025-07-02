<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCustomersStore } from '@/stores/customers'
import { useInvoicesStore } from '@/stores/invoices'
import { useAuthStore } from '@/stores/auth'
import { supabase } from '@/lib/supabase'
import Breadcrumb from '@/components/ui/Breadcrumb.vue'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/vue'
import { 
  EllipsisVerticalIcon, 
  EyeIcon, 
  PencilSquareIcon, 
  TrashIcon,
  UserCircleIcon,
  DocumentDuplicateIcon
} from '@heroicons/vue/20/solid'

const router = useRouter()
const customersStore = useCustomersStore()
const invoicesStore = useInvoicesStore()
const auth = useAuthStore()
const searchQuery = ref('')
const loading = ref(true)
const showDeleteDialog = ref(false)
const invoiceToDelete = ref<string | null>(null)
const invoiceToDeleteNumber = ref('')
const customerMap = ref<Record<string, any>>({})  
const usersMap = ref<Record<string, any>>({})
const avatarLoadErrors = ref<Record<string, boolean>>({})

const loadData = async () => {
  loading.value = true
  await Promise.all([
    customersStore.fetchCustomers(),
    invoicesStore.fetchInvoices()
  ])
  
  // Create a map of customer IDs to customer objects for quick lookup
  customerMap.value = customersStore.customers.reduce((acc, customer) => {
    acc[customer.id] = customer
    return acc
  }, {} as Record<string, any>)
  
  loading.value = false
}

const fetchUsersProfiles = async (userIds: string[]) => {
  if (userIds.length === 0) return
  
  const { data, error } = await supabase.rpc(
    'get_multiple_user_profiles',
    { p_user_ids: userIds }
  )
    
  if (error) {
    console.error('Error fetching user profiles:', error);
    return;
  }
  
  if (data && data.length > 0) {
    data.forEach((u: any) => {
      usersMap.value[u.id] = {
        email: u.email,
        nickname: u.nickname || u.email?.split('@')[0] || 'User',
        avatar_url: u.avatar_url
      };
    })
  }
}

onMounted(async () => {
  await loadData()
  
  // After loading invoices, extract unique user IDs and filter out any null/undefined values
  const userIds = [...new Set(invoicesStore.invoices.map(i => i.user_id).filter(Boolean))]
  if (userIds.length > 0) {
    await fetchUsersProfiles(userIds);
  }
})

const breadcrumbItems = computed(() => [
  { name: 'Invoices' }
])

const invoices = computed(() => {
  const allInvoices = invoicesStore.invoices
  
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    return allInvoices.filter(invoice => 
      invoice.number.toLowerCase().includes(query) ||
      invoice.total.toString().includes(query) ||
      (customerMap.value[invoice.customer_id]?.name || '').toLowerCase().includes(query)
    )
  }
  
  return allInvoices
})

const handleEdit = (customerId: string, id: string) => {
  router.push(`/customers/${customerId}/invoices/${id}/edit`)
}

const handlePreview = (customerId: string, id: string) => {
  router.push(`/customers/${customerId}/invoices/${id}/preview`)
}

const handleTogglePaid = (id: string) => {
  invoicesStore.toggleInvoicePaid(id)
}

const handleUseAsTemplate = async (customerId: string, id: string) => {
  // Get the invoice to duplicate
  const invoice = await invoicesStore.getInvoiceById(id)
  if (!invoice) return
  
  // Navigate to the new invoice form with template data
  router.push({
    path: `/customers/${customerId}/invoices/new`,
    query: {
      template: id,
      number: `${invoice.number} (Copy)`
    }
  })
}

const handleDelete = (id: string, invoiceNumber: string) => {
  invoiceToDelete.value = id
  invoiceToDeleteNumber.value = invoiceNumber
  showDeleteDialog.value = true
}

const confirmDelete = async () => {
  if (invoiceToDelete.value) {
    await invoicesStore.deleteInvoice(invoiceToDelete.value)
    invoiceToDelete.value = null
  }
}

const formatCurrency = (amount: number, currency: string) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(amount)
}

const getCustomerName = (customerId: string) => {
  return customerMap.value[customerId]?.name || 'Unknown Customer'
}

const getCustomerCurrency = (customerId: string) => {
  return customerMap.value[customerId]?.currency || 'USD'
}

// Handle avatar image loading error
const handleAvatarError = async (userId: string) => {
  try {
    console.log('Avatar failed to load in invoice list, attempting to refresh URL for user:', userId)
    avatarLoadErrors.value[userId] = true
    
    // Get a fresh session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError || !session) {
      console.error('No valid session for refreshing avatar URL')
      return
    }
    
    // Get the user's avatar URL path
    if (usersMap.value[userId]?.avatar_url) {
      const avatarUrl = usersMap.value[userId].avatar_url
      const urlParts = avatarUrl.split('/')
      
      // Extract the file path without the bucket prefix
      let filePath = ''
      const objectIndex = urlParts.findIndex((part: string) => part === 'object')
      if (objectIndex !== -1 && urlParts.length > objectIndex + 2) {
        // Skip 'object' and bucket name to get the actual file path
        filePath = urlParts.slice(objectIndex + 2).join('/')
      }
      
      if (!filePath) {
        console.error('Could not extract file path from avatar URL:', avatarUrl)
        return
      }
      
      // Get available buckets
      const { data: buckets } = await supabase.storage.listBuckets()
      console.log('Available buckets for avatar refresh:', buckets?.map(b => b.name))
      
      // Use the first available bucket or default to 'public'
      const bucketName = buckets && buckets.length > 0 ? buckets[0].name : 'public'
      console.log('Using bucket for avatar refresh:', bucketName)
      
      // Create a new signed URL with 30-day expiry
      const { data, error: signedUrlError } = await supabase
        .storage
        .from(bucketName)
        .createSignedUrl(filePath, 60 * 60 * 24 * 30) // 30 days expiry
      
      if (signedUrlError || !data) {
        console.error('Error creating signed URL for avatar refresh:', signedUrlError)
        return
      }
      
      // Update the avatar URL in the users map
      usersMap.value[userId].avatar_url = data.signedUrl
      console.log('Avatar URL refreshed for user:', userId)
      
      // Reset the error flag to try again with the new URL
      avatarLoadErrors.value[userId] = false
    }
  } catch (error) {
    console.error('Avatar loading error in invoice list:', error)
  }
}
</script>

<template>
  <Breadcrumb :items="breadcrumbItems" class="hidden sm:block mb-10" />
  <div class="px-4 sm:px-6 lg:px-8">
    <div class="sm:flex sm:items-center">
      <div class="sm:flex-auto">
        <h1 class="text-3xl font-semibold text-gray-900">All Invoices</h1>
        <p class="mt-2 text-sm text-gray-600">A list of all invoices across all customers</p>
      </div>
    </div>
    
    <!-- Search -->
    <div class="mt-6">
      <div class="relative">
        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg class="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          v-model="searchQuery"
          type="search"
          class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          placeholder="Search invoices by number, customer, or amount..."
        >
      </div>
    </div>
    
    <!-- Invoice Table -->
    <div class="-mx-4 mt-8 sm:-mx-0">
      <table class="min-w-full divide-y divide-gray-300">
        <thead>
          <tr>
            <th scope="col" class="py-3.5 pr-3 pl-4 text-left text-sm font-semibold text-gray-900 sm:pl-0">Number</th>
            <th scope="col" class="hidden px-3 py-3.5 text-left text-sm font-semibold text-gray-900 lg:table-cell">Date</th>
            <th scope="col" class="hidden px-3 py-3.5 text-left text-sm font-semibold text-gray-900 sm:table-cell">Customer</th>
            <th scope="col" class="hidden px-3 py-3.5 text-left text-sm font-semibold text-gray-900 sm:table-cell">Items</th>
            <th scope="col" class="hidden px-3 py-3.5 text-left text-sm font-semibold text-gray-900 sm:table-cell">Total</th>
            <th scope="col" class="hidden px-3 py-3.5 text-left text-sm font-semibold text-gray-900 sm:table-cell">Status</th>
            <th scope="col" class="hidden px-3 py-3.5 text-left text-sm font-semibold text-gray-900 sm:table-cell">Created/Updated By</th>
            <th scope="col" class="relative py-3.5 pr-4 pl-3 sm:pr-0">
              <span class="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200 bg-white">
          <tr v-if="loading" class="bg-white">
            <td colspan="8" class="py-10 text-center text-sm text-gray-500">
              Loading invoices...
            </td>
          </tr>
          <tr v-else-if="invoices.length === 0" class="bg-white">
            <td colspan="8" class="py-10 text-center text-sm text-gray-500">
              No invoices found.
            </td>
          </tr>
          <tr 
            v-for="invoice in invoices" 
            :key="invoice.id" 
            class="hover:bg-gray-50 transition-colors"
          >
            <td 
              class="w-full max-w-0 py-4 pr-3 pl-4 text-sm font-medium text-gray-900 sm:w-auto sm:max-w-none sm:pl-0 cursor-pointer"
              @click="handlePreview(invoice.customer_id, invoice.id)"
            >
              <div class="text-sm font-medium text-gray-900 hover:text-indigo-600 transition-colors">
                {{ invoice.number }}
              </div>
              <dl class="font-normal sm:hidden">
                <dt class="sr-only">Date</dt>
                <dd class="mt-1 truncate text-gray-700">{{ new Date(invoice.date).toLocaleDateString() }}</dd>
                
                <dt class="sr-only">Customer</dt>
                <dd class="mt-1 truncate text-gray-700">{{ getCustomerName(invoice.customer_id) }}</dd>
                
                <dt class="sr-only">Items</dt>
                <dd class="mt-1 truncate text-gray-500">
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {{ invoice.invoice_items?.length || 0 }} items
                  </span>
                </dd>
                
                <dt class="sr-only">Total</dt>
                <dd class="mt-1 truncate text-gray-900 font-medium">
                  {{ formatCurrency(invoice.total, getCustomerCurrency(invoice.customer_id)) }}
                </dd>
                
                <dt class="sr-only">Status</dt>
                <dd class="mt-1">
                  <span
                    :class="[
                      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                      invoice.paid 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    ]"
                  >
                    <span class="h-1.5 w-1.5 mr-1.5 rounded-full" :class="[
                      invoice.paid ? 'bg-green-400' : 'bg-yellow-400'
                    ]"></span>
                    {{ invoice.paid ? 'Paid' : 'Unpaid' }}
                  </span>
                </dd>
              </dl>
            </td>
            <td class="hidden px-3 py-4 text-sm text-gray-500 lg:table-cell">
              {{ new Date(invoice.date).toLocaleDateString() }}
            </td>
            <td class="hidden px-3 py-4 text-sm text-gray-500 sm:table-cell">
              <router-link 
                :to="`/customers/${invoice.customer_id}/invoices`" 
                class="text-indigo-600 hover:text-indigo-900"
              >
                {{ getCustomerName(invoice.customer_id) }}
              </router-link>
            </td>
            <td class="hidden px-3 py-4 text-sm text-gray-500 sm:table-cell">
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {{ invoice.invoice_items?.length || 0 }}
              </span>
            </td>
            <td class="hidden px-3 py-4 text-sm font-medium text-gray-900 sm:table-cell">
              {{ formatCurrency(invoice.total, getCustomerCurrency(invoice.customer_id)) }}
            </td>
            <td class="hidden px-3 py-4 text-sm text-gray-500 sm:table-cell">
              <span
                :class="[
                  'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                  invoice.paid 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                ]"
              >
                <span class="flex items-center">
                  <span class="h-2 w-2 mr-1.5 rounded-full" :class="[
                    invoice.paid ? 'bg-green-400' : 'bg-yellow-400'
                  ]"></span>
                  {{ invoice.paid ? 'Paid' : 'Unpaid' }}
                </span>
              </span>
            </td>
            <td class="hidden px-3 py-4 text-xs text-gray-500 sm:table-cell">
              <div class="flex items-start">
                <div class="relative group">
                  <div v-if="usersMap[invoice.user_id]?.avatar_url && !avatarLoadErrors[invoice.user_id]" class="h-8 w-8 rounded-full overflow-hidden mr-2">
                    <img 
                      :src="usersMap[invoice.user_id].avatar_url" 
                      :alt="usersMap[invoice.user_id].nickname" 
                      class="h-full w-full object-cover"
                      @error="handleAvatarError(invoice.user_id)"
                    />
                  </div>
                  <div v-else class="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center mr-2">
                    <UserCircleIcon class="h-6 w-6 text-indigo-500" />
                  </div>
                  <!-- Tooltip -->
                  <div class="absolute z-10 invisible group-hover:visible bg-gray-800 text-white text-xs rounded py-1 px-2 -mt-1 left-10 whitespace-nowrap">
                    {{ usersMap[invoice.user_id]?.nickname || 'Unknown User' }}
                  </div>
                </div>
                <div>
                  <span class="text-[10px] text-gray-400">Created: {{ invoice.created_at ? new Date(invoice.created_at).toLocaleString() : '-' }}</span>
                  <br/>
                  <span class="text-[10px] text-gray-400">Updated: {{ invoice.updated_at ? new Date(invoice.updated_at).toLocaleString() : '-' }}</span>
                </div>
              </div>
            </td>
            <td class="py-4 pr-4 pl-3 text-right text-sm font-medium sm:pr-0">
              <Menu as="div" class="relative inline-block text-left" @click.stop>
                <div>
                  <MenuButton 
                    class="inline-flex justify-center rounded-md bg-white p-2 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    @click.stop
                  >
                    <span class="sr-only">Open options</span>
                    <EllipsisVerticalIcon class="h-5 w-5" aria-hidden="true" />
                  </MenuButton>
                </div>

                <transition 
                  enter-active-class="transition ease-out duration-100" 
                  enter-from-class="transform opacity-0 scale-95" 
                  enter-to-class="transform opacity-100 scale-100" 
                  leave-active-class="transition ease-in duration-75" 
                  leave-from-class="transform opacity-100 scale-100" 
                  leave-to-class="transform opacity-0 scale-95"
                >
                  <MenuItems class="absolute right-0 z-10 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <div class="py-1">
                      <MenuItem v-slot="{ active }">
                        <button
                          @click.stop="handlePreview(invoice.customer_id, invoice.id)"
                          class="w-full flex items-center px-4 py-2 text-sm"
                          :class="[active ? 'bg-gray-100 text-gray-900' : 'text-gray-700']"
                        >
                          <EyeIcon class="mr-3 h-5 w-5 text-gray-400" aria-hidden="true" />
                          View
                        </button>
                      </MenuItem>
                      <MenuItem v-if="auth.isAdmin() || invoice.user_id === auth.user?.id" v-slot="{ active }">
                        <button
                          @click="handleEdit(invoice.customer_id, invoice.id)"
                          class="w-full flex items-center px-4 py-2 text-sm"
                          :class="[active ? 'bg-gray-100 text-gray-900' : 'text-gray-700']"
                        >
                          <PencilSquareIcon class="mr-3 h-5 w-5 text-gray-400" aria-hidden="true" />
                          Edit
                        </button>
                      </MenuItem>
                      <MenuItem v-slot="{ active }">
                        <button
                          @click.stop="handleUseAsTemplate(invoice.customer_id, invoice.id)"
                          class="w-full flex items-center px-4 py-2 text-sm"
                          :class="[active ? 'bg-gray-100 text-gray-900' : 'text-gray-700']"
                        >
                          <DocumentDuplicateIcon class="mr-3 h-5 w-5 text-gray-400" aria-hidden="true" />
                          Use as a template
                        </button>
                      </MenuItem>
                      <MenuItem v-if="auth.isAdmin() || invoice.user_id === auth.user?.id" v-slot="{ active }">
                        <button
                          @click.stop="handleDelete(invoice.id, invoice.number)"
                          class="w-full flex items-center px-4 py-2 text-sm"
                          :class="[active ? 'bg-gray-100 text-gray-900' : 'text-gray-700']"
                        >
                          <TrashIcon class="mr-3 h-5 w-5 text-gray-400" aria-hidden="true" />
                          Delete
                        </button>
                      </MenuItem>
                      <MenuItem v-slot="{ active }">
                        <button
                          @click.stop="handleTogglePaid(invoice.id)"
                          class="w-full flex items-center px-4 py-2 text-sm"
                          :class="[active ? 'bg-gray-100 text-gray-900' : 'text-gray-700']"
                        >
                          <span class="mr-3 h-5 w-5 text-gray-400 flex items-center justify-center">
                            <span class="h-3 w-3 rounded-full" :class="[
                              invoice.paid ? 'bg-yellow-400' : 'bg-green-400'
                            ]"></span>
                          </span>
                          {{ invoice.paid ? 'Mark as unpaid' : 'Mark as paid' }}
                        </button>
                      </MenuItem>
                    </div>
                  </MenuItems>
                </transition>
              </Menu>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
  
  <!-- Delete Confirmation Dialog -->
  <ConfirmDialog
    v-model:show="showDeleteDialog"
    title="Delete Invoice"
    :message="`Are you sure you want to delete invoice ${invoiceToDeleteNumber}? This action cannot be undone.`"
    confirm-label="Delete"
    cancel-label="Cancel"
    @confirm="confirmDelete"
  />
</template>
