export interface EmailTemplate {
  id: string
  customer_id: string
  user_id: string
  subject: string
  body: string
  recipients: string[]
  created_at: string
  updated_at: string
}

export type NewEmailTemplate = Omit<EmailTemplate, 'id' | 'created_at' | 'updated_at'>
