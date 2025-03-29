<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useCustomersStore } from '@/stores/customers'
import { useRouter } from 'vue-router'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/vue'
import { EllipsisHorizontalIcon } from '@heroicons/vue/20/solid'
import EmptyState from '@/components/ui/EmptyState.vue'

const props = defineProps<{
  searchQuery: string
}>()

const customersStore = useCustomersStore()
const router = useRouter()
const showDeleteDialog = ref(false)
const customerToDelete = ref<{ id: string, name: string } | null>(null)

const filteredCustomers = computed(() => {
  if (!props.searchQuery) return customersStore.customers
  
  const query = props.searchQuery.toLowerCase()
  return customersStore.customers.filter(customer => 
    customer.name.toLowerCase().includes(query) ||
    (customer.email?.toLowerCase().includes(query) ?? false) ||
    (customer.company?.toLowerCase().includes(query) ?? false)
  )
})

const handleEdit = (id: string) => {
  router.push(`/customers/${id}/edit`)
}

const handleView = (id: string) => {
  router.push(`/customers/${id}`)
}

const handleViewInvoices = (id: string) => {
  router.push(`/customers/${id}/invoices`)
}

const handleDelete = async () => {
  if (!customerToDelete.value) return
  
  const success = await customersStore.deleteCustomer(customerToDelete.value.id)
  if (success) {
    customerToDelete.value = null
  }
}

const handleDeleteClick = (customer: { id: string, name: string }) => {
  customerToDelete.value = customer
  showDeleteDialog.value = true
}

const handleCardClick = (id: string, event: MouseEvent) => {
  // Make sure we're not clicking on the menu or its children
  const target = event.target as HTMLElement;
  const isMenuClick = target.closest('.customer-menu');
  if (!isMenuClick) {
    handleView(id);
  }
}

onMounted(async () => {
  await customersStore.fetchCustomers()
})
</script>

<template>
  <div class="overflow-hidden">
    <ConfirmDialog
      v-model:show="showDeleteDialog"
      title="Delete Customer"
      :message="customerToDelete ? `Are you sure you want to delete ${customerToDelete.name}? This will also delete all related invoices.` : ''"
      confirm-label="Delete"
      @confirm="handleDelete"
    />
    <div v-if="customersStore.loading" class="flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>

    <div v-else-if="customersStore.error" class="p-4 bg-red-50 border border-red-200 rounded-lg">
      <p class="text-sm text-red-600">{{ customersStore.error }}</p>
    </div>

    <div v-else-if="filteredCustomers.length === 0" class="p-8 text-center">
      <EmptyState
        title="No customers found"
        description="Add a customer to get started."
        icon="folder-plus"
      />
    </div>

    <div v-else>
      <ul role="list" class="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:gap-x-8">
        <li v-for="customer in filteredCustomers" 
            :key="customer.id" 
            @click="(event) => handleCardClick(customer.id, event)"
            class="overflow-hidden rounded-xl border border-gray-200 hover:border-blue-300 transition-colors duration-200 cursor-pointer min-w-[280px]">
          <div class="flex items-center gap-x-4 border-b border-gray-900/5 bg-gray-50 p-6">
            <div class="h-10 w-10 flex-shrink-0 rounded-full bg-blue-100 flex items-center justify-center">
              <span class="text-blue-600 font-medium text-sm">
                {{ customer.name.charAt(0).toUpperCase() }}
              </span>
            </div>
            <div class="min-w-0 flex-1">
              <div class="text-sm font-medium text-gray-900 truncate">{{ customer.name }}</div>
              <div class="text-xs text-gray-500 truncate">{{ customer.company }}</div>
            </div>
            <Menu as="div" class="relative flex-shrink-0 ml-auto customer-menu">
              <MenuButton class="-m-2.5 block p-2.5 text-gray-400 hover:text-gray-500">
                <span class="sr-only">Open options</span>
                <EllipsisHorizontalIcon class="h-5 w-5" aria-hidden="true" />
              </MenuButton>
              <transition 
                enter-active-class="transition ease-out duration-100" 
                enter-from-class="transform opacity-0 scale-95" 
                enter-to-class="transform opacity-100 scale-100" 
                leave-active-class="transition ease-in duration-75" 
                leave-from-class="transform opacity-100 scale-100" 
                leave-to-class="transform opacity-0 scale-95"
              >
                <MenuItems class="absolute right-0 z-10 mt-0.5 w-32 origin-top-right rounded-md bg-white py-2 shadow-lg ring-1 ring-gray-900/5 focus:outline-none">
                  <MenuItem v-slot="{ active }">
                    <button 
                      @click="handleView(customer.id)"
                      :class="[active ? 'bg-gray-50' : '', 'block w-full text-left px-3 py-1 text-sm text-gray-900']"
                    >
                      View
                      <span class="sr-only">, {{ customer.name }}</span>
                    </button>
                  </MenuItem>
                  <MenuItem v-slot="{ active }">
                    <button 
                      @click="handleEdit(customer.id)"
                      :class="[active ? 'bg-gray-50' : '', 'block w-full text-left px-3 py-1 text-sm text-gray-900']"
                    >
                      Edit
                      <span class="sr-only">, {{ customer.name }}</span>
                    </button>
                  </MenuItem>
                  <MenuItem v-slot="{ active }">
                    <button 
                      @click="handleViewInvoices(customer.id)"
                      :class="[active ? 'bg-gray-50' : '', 'block w-full text-left px-3 py-1 text-sm text-gray-900']"
                    >
                      Invoices
                      <span class="sr-only">, {{ customer.name }}</span>
                    </button>
                  </MenuItem>
                  <MenuItem v-slot="{ active }">
                    <button 
                      @click="handleDeleteClick({ id: customer.id, name: customer.name })"
                      :class="[active ? 'bg-gray-50' : '', 'block w-full text-left px-3 py-1 text-sm text-red-600']"
                    >
                      Delete
                      <span class="sr-only">, {{ customer.name }}</span>
                    </button>
                  </MenuItem>
                </MenuItems>
              </transition>
            </Menu>
          </div>
          <dl class="-my-3 divide-y divide-gray-100 px-6 py-4 text-sm">
            <div class="flex justify-between gap-x-4 py-3">
              <dt class="text-gray-500 flex-shrink-0">Email</dt>
              <dd class="text-gray-700 truncate ml-2 text-right">{{ customer.email || 'N/A' }}</dd>
            </div>
            <div class="flex justify-between gap-x-4 py-3">
              <dt class="text-gray-500 flex-shrink-0">Phone</dt>
              <dd class="text-gray-700 truncate ml-2 text-right">{{ customer.phone || 'N/A' }}</dd>
            </div>
          </dl>
        </li>
      </ul>
    </div>
  </div>
</template>