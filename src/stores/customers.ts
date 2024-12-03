import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Customer, CustomerFormData } from '@/types/customer'

export const useCustomersStore = defineStore('customers', () => {
  const customers = ref<Customer[]>([
    {
      id: '1',
      name: 'Acme Corporation',
      city: 'New York',
      address: '123 Business Street',
      vatId: 'US123456789',
      currency: 'USD'
    }
  ])

  const addCustomer = (customerData: CustomerFormData) => {
    const customer: Customer = {
      id: crypto.randomUUID(),
      ...customerData
    }
    customers.value.push(customer)
  }

  const updateCustomer = (id: string, customerData: CustomerFormData) => {
    const index = customers.value.findIndex(c => c.id === id)
    if (index !== -1) {
      customers.value[index] = { id, ...customerData }
    }
  }

  const getCustomerById = (id: string) => {
    return customers.value.find(c => c.id === id)
  }

  return {
    customers,
    addCustomer,
    updateCustomer,
    getCustomerById
  }
})