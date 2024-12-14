export interface Customer {
  id: string
  created_at?: string
  updated_at?: string
  user_id: string
  name: string
  email: string | null
  phone: string | null
  company: string | null
  city: string | null
  address: string | null
  vat_id: string | null
  currency: string
  include_vat: boolean
}

export type CustomerFormData = Omit<Customer, 'id' | 'created_at' | 'updated_at' | 'user_id'>