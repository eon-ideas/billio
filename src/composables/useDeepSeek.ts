import { ref } from 'vue'

interface Message {
  role: 'user' | 'assistant'
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

  const sendMessage = async (messages: Message[]): Promise<string> => {
    if (!apiKey.value) {
      throw new Error('DeepSeek API key is not configured')
    }

    isLoading.value = true
    error.value = null

    try {
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
