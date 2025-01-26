import {ref} from 'vue'
import {useCustomersStore} from '@/stores/customers'
import {useInvoicesStore} from '@/stores/invoices'

interface Message {
    role: 'user' | 'assistant' | 'system'
    content: string
}

interface DeepSeekResponse {
    choices: {
        message: {
            content: string
        }
    }[]
}

export function useDeepSeek() {
    const isLoading = ref(false)
    const error = ref<string | null>(null)
    const apiKey = ref<string>(import.meta.env.VITE_DEEPSEEK_API_KEY || '')
    const { customers, fetchCustomers } = useCustomersStore()
    const { invoices, fetchInvoices } = useInvoicesStore()

    const getSystemContext = async (): Promise<string> => {
        try {
            await fetchCustomers()
            await fetchInvoices()

            const customerSummary = customers.length > 0
                ? `Current customers: ${customers.length}. Sample customer fields: name, email, phone, company, address, vat_id, currency.`
                : 'No customers in the system yet.'

            const invoiceSummary = invoices.length > 0
                ? `Current invoices: ${invoices.length}. Invoice includes: number, date, delivery_date, due_date, items (description, quantity, price), subtotal, vat, total, paid status.`
                : 'No invoices in the system yet.'

            return `You are an AI assistant for an Invoice Management System. You can help with questions about customers and their invoices.

Key features:
- Customer management: Create, view, and edit customer information
- Invoice creation: Generate and manage invoices for customers
- Payment tracking: Monitor paid/unpaid status of invoices
- VAT handling: Calculate VAT based on customer settings

Current system status:
${customerSummary}
${invoiceSummary}

Please provide clear, concise answers about invoice management, customer information, and payment status. If asked about specific customers or invoices, you can access the data through the system.`
        } catch (e) {
            console.error('Failed to fetch context data:', e)
            return 'You are an AI assistant for an Invoice Management System. You can help with questions about customers and their invoices, including invoice creation, payment tracking, and VAT calculations.'
        }
    }

    const sendMessage = async (messages: Message[]): Promise<string> => {
        if (!apiKey.value) {
            throw new Error('DeepSeek API key is not configured')
        }

        isLoading.value = true
        error.value = null

        try {
            // Add system context as the first message if not present
            if (!messages.some(m => m.role === 'system')) {
                const systemContext = await getSystemContext()
                messages.unshift({role: 'system', content: systemContext})
            }

            const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey.value}`
                },
                body: JSON.stringify({
                    model: 'deepseek-chat',
                    messages,
                    temperature: 0.7,
                    max_tokens: 1000
                })
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error?.message || 'Failed to get response from DeepSeek')
            }

            const data: DeepSeekResponse = await response.json()
            return data.choices[0]?.message?.content || ''
        } catch (e) {
            error.value = e instanceof Error ? e.message : 'An unexpected error occurred'
            throw e
        } finally {
            isLoading.value = false
        }
    }

    const setApiKey = (key: string) => {
        apiKey.value = key
    }

    return {
        sendMessage,
        setApiKey,
        isLoading,
        error
    }
}
