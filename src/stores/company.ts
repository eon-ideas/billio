import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { CompanyInfo } from '@/types/company'

export const useCompanyStore = defineStore('company', () => {
  const companyInfo = ref<CompanyInfo>({
    name: '',
    address: '',
    vatId: '',
    iban: '',
    logoUrl: null
  })

  const updateCompanyInfo = (info: Partial<CompanyInfo>) => {
    companyInfo.value = {
      ...companyInfo.value,
      ...info
    }
  }

  const updateLogo = async (file: File) => {
    try {
      // In a real application, you would upload this to a server
      // For now, we'll create a local URL
      const url = URL.createObjectURL(file)
      companyInfo.value.logoUrl = url
      return url
    } catch (error) {
      console.error('Error updating logo:', error)
      return null
    }
  }

  return {
    companyInfo,
    updateCompanyInfo,
    updateLogo
  }
})
