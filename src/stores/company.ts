import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import type { CompanyInfo } from '@/types/company'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from './auth'

export const useCompanyStore = defineStore('company', () => {
  const authStore = useAuthStore()
  const companyInfo = ref<CompanyInfo>({
    name: '',
    street: '',
    houseNumber: '',
    postalCode: '',
    city: '',
    vatId: '',
    iban: '',
    logoUrl: null,
    pinId: '',
    web: '',
    email: '',
    phone: ''
  })
  const isLoading = ref(false)

  const loadCompanyInfo = async () => {
    if (!authStore.isAuthenticated) {
      console.warn('Cannot load company info: User not authenticated')
      return
    }

    try {
      isLoading.value = true
      console.log('Loading company info...')

      const { data, error } = await supabase
        .from('company_info')
        .select('*')
        .single()

      console.log('Company data from DB:', data)
      console.log('Error from DB:', error)

      if (error && error.code !== 'PGRST116') throw error // PGRST116 is "Results contain 0 rows"

      if (data) {
        companyInfo.value = {
          name: data.name || 'Company Name',
          street: data.street || '',
          houseNumber: data.house_number || '',
          postalCode: data.postal_code || '',
          city: data.city || '',
          vatId: data.vat_id || '',
          iban: data.iban || '',
          logoUrl: data.logo_url,
          pinId: data.pin_id || '',
          web: data.web || '',
          email: data.email || '',
          phone: data.phone || ''
        }

        console.log('Company info loaded:', companyInfo.value)
      } else {
        console.warn('No company data found, creating initial record')
        await ensureCompanyRecord()
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
      console.log('Ensuring company record exists...')
      const { data, error } = await supabase
        .from('company_info')
        .select('*')
        .maybeSingle()

      console.log('Company record check:', data, error)

      if (!data) {
        console.log('No company record found, creating one with default values')
        // No record exists, create initial record with default values
        const { data: insertData, error: insertError } = await supabase
          .from('company_info')
          .insert({
            name: 'Company Name',
            street: 'Default Street',
            house_number: '1',
            postal_code: '10000',
            city: 'Default City',
            vat_id: 'VAT12345678',
            iban: 'HR1234567890123456789',
            logo_url: null,
            pin_id: 'PIN12345678',
            web: 'example.com',
            email: 'info@example.com',
            phone: '+385 1 234 5678'
          })
          .select()
          .single()
        if (insertError) {
          console.error('Error creating company record:', insertError)
          throw insertError
        }

        console.log('Created company record:', insertData)

        // Update the local companyInfo with the newly created record
        if (insertData) {
          companyInfo.value = {
            name: insertData.name,
            street: insertData.street,
            houseNumber: insertData.house_number,
            postalCode: insertData.postal_code,
            city: insertData.city,
            vatId: insertData.vat_id,
            iban: insertData.iban,
            logoUrl: insertData.logo_url,
            pinId: insertData.pin_id,
            web: insertData.web,
            email: insertData.email,
            phone: insertData.phone
          }
        }
      } else if (error) {
        console.error('Error checking company record:', error)
        throw error
      } else {
        console.log('Company record already exists')
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
      console.log('Updating company info with:', info)

      // Get the current record ID
      const { data: currentRecord, error: fetchError } = await supabase
        .from('company_info')
        .select('id')
        .single()

      console.log('Current record check:', currentRecord, fetchError)

      // Handle case where no record exists (PGRST116)
      if (fetchError && fetchError.code === 'PGRST116') {
        console.log('No company record found, creating initial record')
        // Create initial record with default values for missing fields
        const { data: insertData, error: insertError } = await supabase
          .from('company_info')
          .insert({
            name: info.name || 'Company Name',
            street: info.street || 'Default Street',
            house_number: info.houseNumber || '1',
            postal_code: info.postalCode || '10000',
            city: info.city || 'Default City',
            vat_id: info.vatId || 'VAT12345678',
            iban: info.iban || 'HR1234567890123456789',
            logo_url: info.logoUrl || null,
            pin_id: info.pinId || 'PIN12345678',
            web: info.web || 'example.com',
            email: info.email || 'info@example.com',
            phone: info.phone || '+385 1 234 5678'
          })
          .select()
          .single()

        if (insertError) {
          console.error('Error creating company record:', insertError)
          throw insertError
        }

        console.log('Created company record:', insertData)

        // Update local companyInfo with the newly created record
        if (insertData) {
          companyInfo.value = {
            name: insertData.name,
            street: insertData.street,
            houseNumber: insertData.house_number,
            postalCode: insertData.postal_code,
            city: insertData.city,
            vatId: insertData.vat_id,
            iban: insertData.iban,
            logoUrl: insertData.logo_url,
            pinId: insertData.pin_id,
            web: insertData.web,
            email: insertData.email,
            phone: insertData.phone
          }
        }

        return
      } else if (fetchError) {
        // This is some other error, not just "no records found"
        console.error('Error fetching company record:', fetchError)
        throw fetchError
      }

      if (currentRecord) {
        console.log('Updating existing company record')
        // Update existing record, ensuring we have default values for empty fields
        const updatedInfo = {
          name: info.name || companyInfo.value.name || 'Company Name',
          street: info.street || companyInfo.value.street || 'Default Street',
          house_number: info.houseNumber || companyInfo.value.houseNumber || '1',
          postal_code: info.postalCode || companyInfo.value.postalCode || '10000',
          city: info.city || companyInfo.value.city || 'Default City',
          vat_id: info.vatId || companyInfo.value.vatId || 'VAT12345678',
          iban: info.iban || companyInfo.value.iban || 'HR1234567890123456789',
          logo_url: info.logoUrl || companyInfo.value.logoUrl,
          pin_id: info.pinId || companyInfo.value.pinId || 'PIN12345678',
          web: info.web || companyInfo.value.web || 'example.com',
          email: info.email || companyInfo.value.email || 'info@example.com',
          phone: info.phone || companyInfo.value.phone || '+385 1 234 5678'
        }

        const { data: updateData, error: updateError } = await supabase
          .from('company_info')
          .update(updatedInfo)
          .eq('id', currentRecord.id)
          .select()
          .single()

        if (updateError) {
          console.error('Error updating company record:', updateError)
          throw updateError
        }

        console.log('Updated company record:', updateData)

        // Update local companyInfo with the updated record
        if (updateData) {
          companyInfo.value = {
            name: updateData.name,
            street: updateData.street,
            houseNumber: updateData.house_number,
            postalCode: updateData.postal_code,
            city: updateData.city,
            vatId: updateData.vat_id,
            iban: updateData.iban,
            logoUrl: updateData.logo_url,
            pinId: updateData.pin_id,
            web: updateData.web,
            email: updateData.email,
            phone: updateData.phone
          }
        }
      } else {
        console.warn('No current record found but no PGRST116 error either')
        // Ensure we have a company record
        await ensureCompanyRecord()
      }
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
          street: '',
          houseNumber: '',
          postalCode: '',
          city: '',
          vatId: '',
          iban: '',
          logoUrl: null,
          pinId: '',
          web: '',
          email: '',
          phone: ''
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
