export interface Customer {
  id: string
  name: string
  email: string
  phone: string
  company?: string
  city?: string
  address?: string
  vatId?: string
  currency?: string
}

export type CustomerFormData = Omit<Customer, 'id'>