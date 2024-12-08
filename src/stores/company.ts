import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import type { CompanyInfo } from '@/types/company'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from './auth'

export const useCompanyStore = defineStore('company', () => {
  const authStore = useAuthStore()
  const companyInfo = ref<CompanyInfo>({
    name: '',
    address: '',
    vatId: '',
    iban: '',
    logoUrl: null
  })
  const isLoading = ref(false)

  const loadCompanyInfo = async () => {
    if (!authStore.isAuthenticated) {
      console.warn('Cannot load company info: User not authenticated')
      return
    }

    try {
      isLoading.value = true
      const { data, error } = await supabase
        .from('company_info')
        .select('*')
        .single()

      if (error && error.code !== 'PGRST116') throw error // PGRST116 is "Results contain 0 rows"

      if (data) {
        companyInfo.value = {
          name: data.name,
          address: data.address,
          vatId: data.vat_id,
          iban: data.iban,
          logoUrl: data.logo_url
        }
      }
    } catch (error) {
      console.error('Error loading company info:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  const ensureCompanyRecord = async () => {
    try {
      const { data, error } = await supabase
        .from('company_info')
        .select('*')
        .maybeSingle()

      if (!data) {
        // No record exists, create initial record
        const { error: insertError } = await supabase
          .from('company_info')
          .insert({
            name: '',
            address: '',
            vat_id: '',
            iban: '',
            logo_url: null
          })
        if (insertError) throw insertError
      } else if (error) {
        throw error
      }
    } catch (error) {
      console.error('Error ensuring company record:', error)
      throw error
    }
  }

  const updateCompanyInfo = async (info: Partial<CompanyInfo>) => {
    if (!authStore.isAuthenticated) {
      console.warn('Cannot update company info: User not authenticated')
      return
    }

    try {
      isLoading.value = true
      
      // Get the current record ID
      const { data: currentRecord, error: fetchError } = await supabase
        .from('company_info')
        .select('id')
        .single()

      if (fetchError) throw fetchError

      if (!currentRecord) {
        // Create initial record if none exists
        const { error: insertError } = await supabase
          .from('company_info')
          .insert({
            name: info.name || '',
            address: info.address || '',
            vat_id: info.vatId || '',
            iban: info.iban || '',
            logo_url: info.logoUrl || null
          })
          .select()
          .single()

        if (insertError) throw insertError
      } else {
        // Update existing record
        const updatedInfo = {
          name: info.name || companyInfo.value.name,
          address: info.address || companyInfo.value.address,
          vat_id: info.vatId || companyInfo.value.vatId,
          iban: info.iban || companyInfo.value.iban,
          logo_url: info.logoUrl || companyInfo.value.logoUrl
        }

        const { error: updateError } = await supabase
          .from('company_info')
          .update(updatedInfo)
          .eq('id', currentRecord.id)

        if (updateError) throw updateError
      }

      // Reload company info to ensure we have the latest data
      await loadCompanyInfo()
    } catch (error) {
      console.error('Error updating company info:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  const updateLogo = async (file: File) => {
    if (!authStore.isAuthenticated) {
      console.warn('Cannot update logo: User not authenticated')
      return
    }

    try {
      isLoading.value = true
      
      // Ensure we have a company record
      await ensureCompanyRecord()

      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}.${fileExt}`
      const filePath = `company-logos/${fileName}`

      // Upload file to Supabase Storage
      const { error: uploadError } = await supabase
        .storage
        .from('public')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase
        .storage
        .from('public')
        .getPublicUrl(filePath)

      // Update company info with new logo URL
      const { error } = await supabase
        .from('company_info')
        .update({ logo_url: publicUrl })
        .eq('id', (await supabase.from('company_info').select('id').single()).data?.id)

      if (error) throw error

      companyInfo.value = {
        ...companyInfo.value,
        logoUrl: publicUrl
      }
      
      return publicUrl
    } catch (error) {
      console.error('Error updating logo:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  // Initialize company info when auth state changes
  watch(
    () => authStore.isAuthenticated,
    async (isAuthenticated) => {
      if (isAuthenticated) {
        await loadCompanyInfo()
      } else {
        // Reset company info when user logs out
        companyInfo.value = {
          name: '',
          address: '',
          vatId: '',
          iban: '',
          logoUrl: null
        }
      }
    },
    { immediate: true }
  )

  return {
    companyInfo,
    isLoading,
    updateCompanyInfo,
    updateLogo,
    loadCompanyInfo
  }
})
