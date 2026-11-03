import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Customer, CustomerFormData } from '@/types/customer'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from './auth'

export const useCustomersStore = defineStore('customers', () => {
  const customers = ref<Customer[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchCustomers = async () => {
    const auth = useAuthStore()
    if (!auth.user) return

    try {
      loading.value = true
      error.value = null
      
      const { data, error: err } = await supabase
        .from('customers')
        .select('*')
        .order('name')

      if (err) throw err
      
      customers.value = data
    } catch (err: any) {
      error.value = err.message
      console.error('Error fetching customers:', err)
    } finally {
      loading.value = false
    }
  }

  const addCustomer = async (customer: CustomerFormData) => {
    const auth = useAuthStore()
    if (!auth.user) return null

    try {
      loading.value = true
      error.value = null

      const { data, error: err } = await supabase
        .from('customers')
        .insert([{ ...customer, user_id: auth.user.id }])
        .select()
        .single()

      if (err) throw err

      customers.value.push(data)
      return data
    } catch (err: any) {
      error.value = err.message
      console.error('Error adding customer:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  const updateCustomer = async (id: string, customer: CustomerFormData) => {
    const auth = useAuthStore()
    if (!auth.user) return null

    try {
      loading.value = true
      error.value = null

      const { data, error: err } = await supabase
        .from('customers')
        .update(customer)
        .eq('id', id)
        .eq('user_id', auth.user.id)
        .select()
        .single()

      if (err) throw err

      const index = customers.value.findIndex(c => c.id === id)
      if (index !== -1) {
        customers.value[index] = data
      }
      return data
    } catch (err: any) {
      error.value = err.message
      console.error('Error updating customer:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  const deleteCustomer = async (id: string) => {
    const auth = useAuthStore()
    if (!auth.user) return false

    try {
      loading.value = true
      error.value = null

      const { error: err } = await supabase
        .from('customers')
        .delete()
        .eq('id', id)
        .eq('user_id', auth.user.id)

      if (err) throw err

      customers.value = customers.value.filter(customer => customer.id !== id)
      return true
    } catch (err: any) {
      error.value = err.message
      console.error('Error deleting customer:', err)
      return false
    } finally {
      loading.value = false
    }
  }

  const getCustomerById = async (id: string) : Promise<Customer | null> => {
    const auth = useAuthStore()
    if (!auth.user) return null

    // First check if we have it in the store
    const existingCustomer = customers.value.find(c => c.id === id)
    if (existingCustomer) return existingCustomer

    try {
      loading.value = true
      error.value = null

      const { data, error: err } = await supabase
        .from('customers')
        .select('*')
        .eq('id', id)
        .eq('user_id', auth.user.id)
        .single()

      if (err) throw err

      return data
    } catch (err: any) {
      error.value = err.message
      console.error('Error fetching customer:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  return {
    customers,
    loading,
    error,
    fetchCustomers,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    getCustomerById
  }
})