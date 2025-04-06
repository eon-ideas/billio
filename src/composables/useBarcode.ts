import { ref } from 'vue'
import { supabase } from '@/lib/supabase'

export interface PaymentData {
  amount: number
  recipientName: string
  recipientAddress: {
    street: string
    houseNumber: string
    city: {
      name: string
      postalCode: string
    }
  }
  iban: string
  model: string
  callNumber: string
  description: string
}

export function useBarcode() {
  const barcodeUrl = ref<string | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  /**
   * Get the current Supabase session
   * @returns The current session or null if not logged in
   */
  const getSession = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    return session
  }

  /**
   * Fetch a barcode image for an invoice
   * @param invoiceId The UUID of the invoice
   * @param paymentData The payment data for generating the barcode
   * @returns The URL of the barcode image
   */
  const fetchBarcode = async (invoiceId: string, paymentData: PaymentData): Promise<string | null> => {
    if (!invoiceId) {
      error.value = 'Invoice ID is required'
      return null
    }

    const apiUrl = import.meta.env.VITE_BILLIO_API_URL
    if (!apiUrl) {
      error.value = 'API URL is not configured'
      return null
    }

    isLoading.value = true
    error.value = null
    
    try {
      // Get current session for authentication
      const session = await getSession()
      if (!session) {
        error.value = 'No active session found for barcode generation'
        return null
      }
      
      // First try to get an existing barcode with a GET request
      try {
        const getResponse = await fetch(`${apiUrl}/invoices/${invoiceId}/2d-barcode.png`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${session.access_token}`
          }
        })
        
        if (getResponse.ok) {
          // Convert the response to a blob and create a URL
          const blob = await getResponse.blob()
          const url = URL.createObjectURL(blob)
          barcodeUrl.value = url
          return url
        }
        // If GET fails, continue to POST request
      } catch (getError) {
        console.log('GET request failed, trying POST:', getError)
      }
      
      // Make API request to generate barcode with authorization header
      const response = await fetch(`${apiUrl}/invoices/${invoiceId}/2d-barcode.png`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify(paymentData),
        credentials: 'include'
      })

      if (response.ok) {
        // Convert the response to a blob and create a URL
        const blob = await response.blob()
        const url = URL.createObjectURL(blob)
        barcodeUrl.value = url
        return url
      } else {
        const errorText = await response.text()
        console.error('Failed to generate barcode:', errorText)
        error.value = `Failed to generate barcode: ${errorText || response.statusText}`
        return null
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err)
      console.error('Error generating barcode:', err)
      error.value = `Error generating barcode: ${errorMessage}`
      return null
    } finally {
      isLoading.value = false
    }
  }

  return {
    barcodeUrl,
    isLoading,
    error,
    fetchBarcode
  }
}
