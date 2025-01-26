import { useCustomersStore } from '@/stores/customers'
import { useInvoicesStore } from '@/stores/invoices'
import type { Customer } from '@/types/customer'
import type { Invoice } from '@/types/invoice'

interface RelevantData {
    customers: Customer[]
    invoices: Invoice[]
    summary: string
}

export function useContextRetrieval() {
    const customersStore = useCustomersStore()
    const invoicesStore = useInvoicesStore()

    const searchCustomers = (query: string): Customer[] => {
        const searchTerms = query.toLowerCase().split(' ')
        return customersStore.customers.filter(customer => {
            const searchableText = [
                customer.name,
                customer.email,
                customer.company,
                customer.city,
                customer.address
            ].filter(Boolean).join(' ').toLowerCase()

            return searchTerms.some(term => searchableText.includes(term))
        })
    }

    const searchInvoices = (query: string): Invoice[] => {
        const searchTerms = query.toLowerCase().split(' ')
        return invoicesStore.invoices.filter(invoice => {
            const items = invoice.invoice_items || []
            const itemsText = items.map(item => item.description).join(' ')
            const searchableText = [
                invoice.number,
                invoice.date,
                itemsText,
                invoice.paid ? 'paid' : 'unpaid'
            ].join(' ').toLowerCase()

            return searchTerms.some(term => searchableText.includes(term))
        })
    }

    const getCustomerInvoices = (customerId: string): Invoice[] => {
        return invoicesStore.invoices.filter(invoice => invoice.customer_id === customerId)
    }

    const formatCustomerInfo = (customer: Customer): string => {
        const customerInvoices = getCustomerInvoices(customer.id)
        const totalInvoices = customerInvoices.length
        const paidInvoices = customerInvoices.filter(inv => inv.paid).length
        const unpaidInvoices = totalInvoices - paidInvoices

        return `
Customer: ${customer.name}
${customer.company ? `Company: ${customer.company}` : ''}
${customer.email ? `Email: ${customer.email}` : ''}
${customer.phone ? `Phone: ${customer.phone}` : ''}
${customer.address ? `Address: ${customer.address}` : ''}
${customer.city ? `City: ${customer.city}` : ''}
Currency: ${customer.currency}
VAT ID: ${customer.vat_id || 'Not provided'}
Invoices: ${totalInvoices} total (${paidInvoices} paid, ${unpaidInvoices} unpaid)
`.trim()
    }

    const formatInvoiceInfo = (invoice: Invoice, customer?: Customer): string => {
        const items = invoice.invoice_items || []
        const itemsList = items.map(item => 
            `- ${item.description}: ${item.quantity} x ${item.price}`
        ).join('\n')

        return `
Invoice #${invoice.number}
Date: ${invoice.date}
${invoice.delivery_date ? `Delivery Date: ${invoice.delivery_date}` : ''}
${invoice.due_date ? `Due Date: ${invoice.due_date}` : ''}
Status: ${invoice.paid ? 'Paid' : 'Unpaid'}
Customer: ${customer?.name || 'Unknown'}
Items:
${itemsList}
Subtotal: ${invoice.subtotal}
VAT: ${invoice.vat}
Total: ${invoice.total}
`.trim()
    }

    const retrieveRelevantContext = async (query: string): Promise<RelevantData> => {
        // Ensure data is loaded
        await Promise.all([
            customersStore.fetchCustomers(),
            invoicesStore.fetchInvoices()
        ])

        const relevantCustomers = searchCustomers(query)
        const relevantInvoices = searchInvoices(query)

        // Add invoices for found customers if not already included
        const customerInvoices = relevantCustomers.flatMap(customer => 
            getCustomerInvoices(customer.id)
        )
        const allInvoices = [...new Set([...relevantInvoices, ...customerInvoices])]

        // Get customers for found invoices if not already included
        const invoiceCustomerIds = new Set(allInvoices.map(inv => inv.customer_id))
        const allCustomers = [...new Set([
            ...relevantCustomers,
            ...customersStore.customers.filter(c => invoiceCustomerIds.has(c.id))
        ])]

        // Create a summary of the found data
        const summary = `Found ${allCustomers.length} relevant customers and ${allInvoices.length} relevant invoices.

${allCustomers.map(customer => formatCustomerInfo(customer)).join('\n\n')}

${allInvoices.map(invoice => {
    const customer = allCustomers.find(c => c.id === invoice.customer_id)
    return formatInvoiceInfo(invoice, customer)
}).join('\n\n')}
`

        return {
            customers: allCustomers,
            invoices: allInvoices,
            summary
        }
    }

    return {
        retrieveRelevantContext,
        searchCustomers,
        searchInvoices,
        formatCustomerInfo,
        formatInvoiceInfo
    }
}
