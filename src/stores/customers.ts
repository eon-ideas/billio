import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Customer, CustomerFormData } from '@/types/customer'

export const useCustomersStore = defineStore('customers', () => {
  const customers = ref<Customer[]>([
    {
      id: '1',
      name: 'Acme Corp',
      email: 'contact@acme.com',
      phone: '+1 234 567 890',
      company: 'Acme Corporation',
      city: 'San Francisco',
      address: '123 Market St',
      vatId: 'US123456789',
      currency: 'USD'
    }
  ])

  const addCustomer = (customer: CustomerFormData) => {
    const newCustomer: Customer = {
      id: crypto.randomUUID(),
      ...customer
    }
    customers.value.push(newCustomer)
  }

  const updateCustomer = (id: string, customer: CustomerFormData) => {
    const index = customers.value.findIndex(c => c.id === id)
    if (index !== -1) {
      customers.value[index] = { ...customers.value[index], ...customer }
    }
  }

  const deleteCustomer = (id: string) => {
    customers.value = customers.value.filter(customer => customer.id !== id)
  }

  const getCustomerById = (id: string) => {
    return customers.value.find(customer => customer.id === id)
  }

  return {
    customers,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    getCustomerById
  }
})