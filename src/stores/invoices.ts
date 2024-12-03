import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Invoice, InvoiceFormData } from '@/types/invoice'
import { useCustomersStore } from './customers'

export const useInvoicesStore = defineStore('invoices', () => {
  const invoices = ref<Invoice[]>([
    {
      id: '1',
      customerId: '1',
      number: 'INV-001',
      date: '2024-02-20',
      items: [
        {
          id: '1',
          description: 'Web Development Services',
          quantity: 1,
          price: 1500
        },
        {
          id: '2',
          description: 'UI/UX Design',
          quantity: 2,
          price: 750
        }
      ],
      total: 3000
    }
  ])

  const customersStore = useCustomersStore()

  const addInvoice = (invoiceData: InvoiceFormData) => {
    const total = calculateTotal(invoiceData.items)
    const invoice: Invoice = {
      id: crypto.randomUUID(),
      ...invoiceData,
      total
    }
    invoices.value.push(invoice)
    return invoice
  }

  const updateInvoice = (id: string, invoiceData: InvoiceFormData) => {
    const index = invoices.value.findIndex(i => i.id === id)
    if (index !== -1) {
      const total = calculateTotal(invoiceData.items)
      invoices.value[index] = { id, ...invoiceData, total }
      return invoices.value[index]
    }
    return null
  }

  const getInvoiceById = (id: string) => {
    return invoices.value.find(i => i.id === id)
  }

  const getInvoicesByCustomerId = (customerId: string) => {
    return computed(() => invoices.value.filter(i => i.customerId === customerId))
  }

  const calculateTotal = (items: InvoiceFormData['items']) => {
    return items.reduce((sum, item) => sum + (item.quantity * item.price), 0)
  }

  return {
    invoices,
    addInvoice,
    updateInvoice,
    getInvoiceById,
    getInvoicesByCustomerId
  }
})