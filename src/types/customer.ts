export interface Customer {
  id: string
  created_at?: string
  updated_at?: string
  user_id: string
  name: string
  email: string | null
  phone: string | null
  company: string | null
  // Address fields (structured like CompanyInfo)
  street: string | null
  house_number: string | null
  postal_code: string | null
  city: string | null
  country: string | null
  // Legacy field - kept for backward compatibility
  address: string | null
  vat_id: string | null
  currency: string
  include_vat: boolean
  include_english_translation: boolean
  include_bar_code: boolean
}

export type CustomerFormData = Omit<Customer, 'id' | 'created_at' | 'updated_at' | 'user_id'>