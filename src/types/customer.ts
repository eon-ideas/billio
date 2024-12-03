export interface Customer {
  id: string
  name: string
  city: string
  address: string
  vatId: string
  currency: string
}

export type CustomerFormData = Omit<Customer, 'id'>