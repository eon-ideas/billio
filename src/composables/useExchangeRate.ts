import { ref } from 'vue'
import { supabase } from '@/lib/supabase'

export function useExchangeRate() {
  const exchangeRate = ref<number | null>(null)
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
   * Parse a number string that may use comma as decimal separator
   * @param value The string value to parse
   * @returns The parsed float value or NaN if invalid
   */
  const parseNumberString = (value: string | number | null): number => {
    if (value === null) return NaN
    
    const strValue = typeof value === 'string' 
      ? value.replace(',', '.') 
      : value.toString()
    
    return parseFloat(strValue)
  }

  /**
   * Fetch exchange rate for a specific currency and date
   * @param date The date in YYYY-MM-DD format
   * @param currency The currency code (e.g., CHF, USD)
   * @returns The exchange rate value (1 unit of currency in EUR)
   */
  const fetchExchangeRate = async (date: string, currency: string): Promise<number | null> => {
    if (!date || !currency || currency === 'EUR') {
      return null
    }

    const apiUrl = import.meta.env.VITE_BILLIO_API_URL || 'http://localhost:8080'
    isLoading.value = true
    error.value = null
    
    try {
      // Get current session for authentication
      const session = await getSession()
      if (!session) {
        error.value = 'No active session found for exchange rate retrieval'
        return null
      }
      
      // Make API request to get exchange rate
      const response = await fetch(`${apiUrl}/api/currency-exchange-rates?date=${date}&currency=${currency}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch exchange rate: ${response.statusText}`)
      }
      
      const data = await response.json()
      console.log('Exchange rate API response:', data)
      
      // Try to get exchange rate from the main response
      if (data && data.exchange_rate) {
        const exchangeRateValue = parseNumberString(data.exchange_rate)
        
        if (!isNaN(exchangeRateValue) && exchangeRateValue > 0) {
          // Calculate 1/exchange_rate and format to 6 decimal places
          const rate = parseFloat((1 / exchangeRateValue).toFixed(6))
          exchangeRate.value = rate
          return rate
        }
      }
      
      error.value = 'No exchange rate data available for this date and currency'
      return null
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err)
      console.error('Error fetching exchange rate:', err)
      error.value = errorMessage
      return null
    } finally {
      isLoading.value = false
    }
  }

  return {
    exchangeRate,
    isLoading,
    error,
    fetchExchangeRate
  }
}
