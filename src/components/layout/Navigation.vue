<template>
  <div>
    <TransitionRoot as="template" :show="isMobileOpen">
      <Dialog class="relative z-50 lg:hidden" @close="emit('close')">
        <TransitionChild as="template" enter="transition-opacity ease-linear duration-300" enter-from="opacity-0" enter-to="opacity-100" leave="transition-opacity ease-linear duration-300" leave-from="opacity-100" leave-to="opacity-0">
          <div class="fixed inset-0 bg-gray-900/80" />
        </TransitionChild>

        <div class="fixed inset-0 flex">
          <TransitionChild as="template" enter="transition ease-in-out duration-300 transform" enter-from="-translate-x-full" enter-to="translate-x-0" leave="transition ease-in-out duration-300 transform" leave-from="translate-x-0" leave-to="-translate-x-full">
            <DialogPanel class="relative mr-16 flex w-full max-w-xs flex-1">
              <TransitionChild as="template" enter="ease-in-out duration-300" enter-from="opacity-0" enter-to="opacity-100" leave="ease-in-out duration-300" leave-from="opacity-100" leave-to="opacity-0">
                <div class="absolute top-0 left-full flex w-16 justify-center pt-5">
                  <button type="button" class="-m-2.5 p-2.5" @click="emit('close')">
                    <span class="sr-only">Close sidebar</span>
                    <XMarkIcon class="size-6 text-white" aria-hidden="true" />
                  </button>
                </div>
              </TransitionChild>
              <!-- Sidebar component -->
              <div class="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-4">
                <div class="flex h-16 shrink-0 items-center">
                  <img class="h-16 w-auto" src="@/assets/logo.png" alt="Invoice Master" />
                </div>
                <nav class="flex flex-1 flex-col">
                  <ul role="list" class="flex flex-1 flex-col gap-y-7">
                    <li>
                      <ul role="list" class="-mx-2 space-y-1">
                        <li v-for="item in navigation" :key="item.name">
                          <router-link :to="item.href" :class="[$route.path.startsWith(item.href) ? 'bg-gray-50 text-primary' : 'text-gray-700 hover:bg-gray-50 hover:text-primary', 'group flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold']" @click="emit('close')">
                            <component :is="item.icon" :class="[$route.path.startsWith(item.href) ? 'text-primary' : 'text-gray-400 group-hover:text-primary', 'size-6 shrink-0']" aria-hidden="true" />
                            {{ item.name }}
                          </router-link>
                        </li>
                      </ul>
                    </li>
                    <!-- Recent Customers -->
                    <li v-if="topCustomers.length > 0">
                      <div class="text-xs/6 font-semibold text-gray-400">Recent Customers</div>
                      <ul role="list" class="-mx-2 mt-2 space-y-1">
                        <li v-for="customer in topCustomers" :key="customer.id">
                          <router-link :to="`/customers/${customer.id}/invoices`" :class="[$route.path.includes(`/customers/${customer.id}`) ? 'bg-gray-50 text-primary' : 'text-gray-700 hover:bg-gray-50 hover:text-primary', 'group flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold']" @click="emit('close')">
                            <span class="flex size-6 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-white text-[0.625rem] font-medium" :class="[$route.path.includes(`/customers/${customer.id}`) ? 'text-primary border-primary/30' : 'text-gray-400 group-hover:border-primary group-hover:text-primary']">
                              {{ customer.name.charAt(0) }}
                            </span>
                            <span class="truncate">{{ customer.name }}</span>
                          </router-link>
                        </li>
                      </ul>
                    </li>
                    <li class="mt-auto">
                      <router-link to="/company-settings" :class="[$route.path.startsWith('/company-settings') ? 'bg-gray-50 text-primary' : 'text-gray-700 hover:bg-gray-50 hover:text-primary', 'group -mx-2 flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold']" @click="emit('close')">
                        <Cog6ToothIcon :class="[$route.path.startsWith('/company-settings') ? 'text-primary' : 'text-gray-400 group-hover:text-primary', 'size-6 shrink-0']" aria-hidden="true" />
                        Settings
                      </router-link>
                    </li>
                  </ul>
                </nav>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </Dialog>
    </TransitionRoot>

    <!-- Static sidebar for desktop -->
    <div class="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
      <div class="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white px-6 pb-4">
        <div class="flex h-16 shrink-0 items-center">
          <img class="h-16 w-auto" src="@/assets/logo.png" alt="Invoice Master" />
        </div>
        <nav class="flex flex-1 flex-col">
          <ul role="list" class="flex flex-1 flex-col gap-y-7">
            <li>
              <ul role="list" class="-mx-2 space-y-1">
                <li v-for="item in navigation" :key="item.name">
                  <router-link :to="item.href" :class="[$route.path.startsWith(item.href) ? 'bg-gray-50 text-primary' : 'text-gray-700 hover:bg-gray-50 hover:text-primary', 'group flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold']">
                    <component :is="item.icon" :class="[$route.path.startsWith(item.href) ? 'text-primary' : 'text-gray-400 group-hover:text-primary', 'size-6 shrink-0']" aria-hidden="true" />
                    {{ item.name }}
                  </router-link>
                </li>
              </ul>
            </li>
            <!-- Recent Customers -->
            <li v-if="topCustomers.length > 0">
              <div class="text-xs/6 font-semibold text-gray-400">Recent Customers</div>
              <ul role="list" class="-mx-2 mt-2 space-y-1">
                <li v-for="customer in topCustomers" :key="customer.id">
                  <router-link :to="`/customers/${customer.id}/invoices`" :class="[$route.path.includes(`/customers/${customer.id}`) ? 'bg-gray-50 text-primary' : 'text-gray-700 hover:bg-gray-50 hover:text-primary', 'group flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold']">
                    <span class="flex size-6 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-white text-[0.625rem] font-medium" :class="[$route.path.includes(`/customers/${customer.id}`) ? 'text-primary border-primary/30' : 'text-gray-400 group-hover:border-primary group-hover:text-primary']">
                      {{ customer.name.charAt(0) }}
                    </span>
                    <span class="truncate">{{ customer.name }}</span>
                  </router-link>
                </li>
              </ul>
            </li>
            <li class="mt-auto">
              <router-link to="/company-settings" :class="[$route.path.startsWith('/company-settings') ? 'bg-gray-50 text-primary' : 'text-gray-700 hover:bg-gray-50 hover:text-primary', 'group -mx-2 flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold']">
                <Cog6ToothIcon :class="[$route.path.startsWith('/company-settings') ? 'text-primary' : 'text-gray-400 group-hover:text-primary', 'size-6 shrink-0']" aria-hidden="true" />
                Settings
              </router-link>
            </li>
          </ul>
        </nav>
      </div>
    </div>

    <div class="lg:pl-72">
      <div class="fixed top-0 right-0 left-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:left-72 lg:px-8">
        <button type="button" class="-m-2.5 p-2.5 text-gray-700 lg:hidden" @click="emit('open')">
          <span class="sr-only">Open sidebar</span>
          <Bars3Icon class="size-6" aria-hidden="true" />
        </button>

        <!-- Separator -->
        <div class="h-6 w-px bg-gray-200 lg:hidden" aria-hidden="true" />

        <div class="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
          <form class="grid flex-1 grid-cols-1" action="#" method="GET">
            <input type="search" name="search" aria-label="Search" class="col-start-1 row-start-1 block size-full bg-white pl-8 text-base text-gray-900 outline-hidden placeholder:text-gray-400 sm:text-sm/6" placeholder="Search" />
            <MagnifyingGlassIcon class="pointer-events-none col-start-1 row-start-1 size-5 self-center text-gray-400" aria-hidden="true" />
          </form>
          <div class="flex items-center gap-x-4 lg:gap-x-6">
            <button type="button" class="-m-2.5 p-2.5 text-gray-400 hover:text-gray-500">
              <span class="sr-only">View notifications</span>
              <BellIcon class="size-6" aria-hidden="true" />
            </button>

            <!-- Separator -->
            <div class="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-200" aria-hidden="true" />

            <!-- Profile dropdown -->
            <Menu as="div" class="relative">
              <MenuButton class="-m-1.5 flex items-center p-1.5">
                <span class="sr-only">Open user menu</span>
                <img class="size-8 rounded-full bg-gray-50" :src="userPhotoUrl" :alt="auth.user?.email" />
                <span class="hidden lg:flex lg:items-center">
                  <span class="ml-4 text-sm/6 font-semibold text-gray-900" aria-hidden="true">{{ auth.user?.email }}</span>
                  <ChevronDownIcon class="ml-2 size-5 text-gray-400" aria-hidden="true" />
                </span>
              </MenuButton>
              <transition enter-active-class="transition ease-out duration-100" enter-from-class="transform opacity-0 scale-95" enter-to-class="transform opacity-100 scale-100" leave-active-class="transition ease-in duration-75" leave-from-class="transform opacity-100 scale-100" leave-to-class="transform opacity-0 scale-95">
                <MenuItems class="absolute right-0 z-10 mt-2.5 w-32 origin-top-right rounded-md bg-white py-2 ring-1 shadow-lg ring-gray-900/5 focus:outline-hidden">
                  <MenuItem v-for="item in userNavigation" :key="item.name" v-slot="{ active }">
                    <a :href="item.href" :class="[active ? 'bg-gray-50 outline-hidden' : '', 'block px-3 py-1 text-sm/6 text-gray-900']" @click="item.onClick">{{ item.name }}</a>
                  </MenuItem>
                </MenuItems>
              </transition>
            </Menu>
          </div>
        </div>
      </div>

      <main class="pt-16 pb-4">
        <div class="px-4 sm:px-6 lg:px-8">
          <slot></slot>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useCustomersStore } from '@/stores/customers'
import {
  Dialog,
  DialogPanel,
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  TransitionChild,
  TransitionRoot,
} from '@headlessui/vue'
import {
  Bars3Icon,
  BellIcon,
  Cog6ToothIcon,
  HomeIcon,
  UsersIcon,
  XMarkIcon,
} from '@heroicons/vue/24/outline'
import { ChevronDownIcon, MagnifyingGlassIcon } from '@heroicons/vue/20/solid'

defineProps<{
  isMobileOpen: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'open'): void
}>()

const auth = useAuthStore()
const customersStore = useCustomersStore()

onMounted(() => {
  customersStore.fetchCustomers()
})

const userPhotoUrl = computed(() => {
  return '/img/user-avatar.jpg'
})

const topCustomers = computed(() => {
  return customersStore.customers.slice(0, 5)
})

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon, current: false },
  { name: 'Customers', href: '/customers', icon: UsersIcon, current: false },
]

const userNavigation = [
  { name: 'Your profile', href: '/profile' },
  { name: 'Sign out', href: '#', onClick: () => auth.logout() },
]
</script>