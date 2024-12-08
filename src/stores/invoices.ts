import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Invoice, InvoiceFormData, InvoiceItem, InvoiceItemFormData } from '@/types/invoice'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from './auth'

export const useInvoicesStore = defineStore('invoices', () => {
  const invoices = ref<Invoice[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchInvoices = async (customerId?: string) => {
    const auth = useAuthStore()
    if (!auth.user) return

    try {
      loading.value = true
      error.value = null
      
      let query = supabase
        .from('invoices')
        .select(`
          *,
          invoice_items (*)
        `)
        .eq('user_id', auth.user.id)
        .order('date', { ascending: false })

      if (customerId) {
        query = query.eq('customer_id', customerId)
      }

      const { data, error: err } = await query

      if (err) throw err
      
      // Transform the data to match our interface
      invoices.value = data.map((invoice: any) => ({
        ...invoice,
        items: invoice.invoice_items
      }))
    } catch (err: any) {
      error.value = err.message
      console.error('Error fetching invoices:', err)
    } finally {
      loading.value = false
    }
  }

  const addInvoice = async (invoiceData: InvoiceFormData) => {
    const auth = useAuthStore()
    if (!auth.user) return null

    try {
      loading.value = true
      error.value = null

      // Start a Supabase transaction
      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .insert([{
          user_id: auth.user.id,
          customer_id: invoiceData.customer_id,
          number: invoiceData.number,
          date: invoiceData.date,
          total: calculateTotal(invoiceData.items || []),
          paid: false
        }])
        .select()
        .single()

      if (invoiceError) throw invoiceError

      if (invoiceData.items && invoiceData.items.length > 0) {
        const { error: itemsError } = await supabase
          .from('invoice_items')
          .insert(
            invoiceData.items.map(item => ({
              invoice_id: invoice.id,
              description: item.description,
              quantity: item.quantity,
              price: item.price
            }))
          )

        if (itemsError) throw itemsError
      }

      // Fetch the complete invoice with items
      const { data: completeInvoice, error: fetchError } = await supabase
        .from('invoices')
        .select(`
          *,
          invoice_items (*)
        `)
        .eq('id', invoice.id)
        .single()

      if (fetchError) throw fetchError

      const newInvoice = {
        ...completeInvoice,
        items: completeInvoice.invoice_items
      }

      invoices.value.push(newInvoice)
      return newInvoice
    } catch (err: any) {
      error.value = err.message
      console.error('Error adding invoice:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  const updateInvoice = async (id: string, invoiceData: InvoiceFormData) => {
    const auth = useAuthStore()
    if (!auth.user) return null

    try {
      loading.value = true
      error.value = null

      // Update invoice
      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .update({
          customer_id: invoiceData.customer_id,
          number: invoiceData.number,
          date: invoiceData.date,
          total: calculateTotal(invoiceData.items || [])
        })
        .eq('id', id)
        .eq('user_id', auth.user.id)
        .select()
        .single()

      if (invoiceError) throw invoiceError

      // Delete existing items
      const { error: deleteError } = await supabase
        .from('invoice_items')
        .delete()
        .eq('invoice_id', id)

      if (deleteError) throw deleteError

      // Insert new items
      if (invoiceData.items && invoiceData.items.length > 0) {
        const { error: itemsError } = await supabase
          .from('invoice_items')
          .insert(
            invoiceData.items.map(item => ({
              invoice_id: id,
              description: item.description,
              quantity: item.quantity,
              price: item.price
            }))
          )

        if (itemsError) throw itemsError
      }

      // Fetch the complete updated invoice
      const { data: completeInvoice, error: fetchError } = await supabase
        .from('invoices')
        .select(`
          *,
          invoice_items (*)
        `)
        .eq('id', id)
        .single()

      if (fetchError) throw fetchError

      const updatedInvoice = {
        ...completeInvoice,
        items: completeInvoice.invoice_items
      }

      const index = invoices.value.findIndex(i => i.id === id)
      if (index !== -1) {
        invoices.value[index] = updatedInvoice
      }

      return updatedInvoice
    } catch (err: any) {
      error.value = err.message
      console.error('Error updating invoice:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  const toggleInvoicePaid = async (id: string) => {
    const auth = useAuthStore()
    if (!auth.user) return null

    const invoice = invoices.value.find(i => i.id === id)
    if (!invoice) return null

    try {
      loading.value = true
      error.value = null

      const { data, error: err } = await supabase
        .from('invoices')
        .update({ paid: !invoice.paid })
        .eq('id', id)
        .eq('user_id', auth.user.id)
        .select()
        .single()

      if (err) throw err

      const index = invoices.value.findIndex(i => i.id === id)
      if (index !== -1) {
        invoices.value[index] = { ...invoices.value[index], paid: data.paid }
      }

      return data
    } catch (err: any) {
      error.value = err.message
      console.error('Error toggling invoice paid status:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  const deleteInvoice = async (id: string) => {
    const auth = useAuthStore()
    if (!auth.user) return false

    try {
      loading.value = true
      error.value = null

      const { error: err } = await supabase
        .from('invoices')
        .delete()
        .eq('id', id)
        .eq('user_id', auth.user.id)

      if (err) throw err

      invoices.value = invoices.value.filter(invoice => invoice.id !== id)
      return true
    } catch (err: any) {
      error.value = err.message
      console.error('Error deleting invoice:', err)
      return false
    } finally {
      loading.value = false
    }
  }

  const getInvoiceById = async (id: string) => {
    const auth = useAuthStore()
    if (!auth.user) return null

    // First check if we have it in the store
    const existingInvoice = invoices.value.find(i => i.id === id)
    if (existingInvoice) return existingInvoice

    try {
      loading.value = true
      error.value = null

      const { data, error: err } = await supabase
        .from('invoices')
        .select(`
          *,
          invoice_items (*)
        `)
        .eq('id', id)
        .eq('user_id', auth.user.id)
        .single()

      if (err) throw err

      return {
        ...data,
        items: data.invoice_items
      }
    } catch (err: any) {
      error.value = err.message
      console.error('Error fetching invoice:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  const getInvoicesByCustomerId = (customerId: string) => {
    return computed(() => invoices.value.filter(i => i.customer_id === customerId))
  }

  const calculateTotal = (items: InvoiceItemFormData[]) => {
    return items.reduce((sum, item) => sum + (item.quantity * item.price), 0)
  }

  return {
    invoices,
    loading,
    error,
    fetchInvoices,
    addInvoice,
    updateInvoice,
    deleteInvoice,
    getInvoiceById,
    getInvoicesByCustomerId,
    toggleInvoicePaid
  }
})