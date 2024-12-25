import { defineStore } from 'pinia'
import { supabase } from '@/lib/supabase'
import type { EmailTemplate, NewEmailTemplate } from '@/types/emailTemplate'

export const useEmailTemplatesStore = defineStore('emailTemplates', {
  state: () => ({
    emailTemplate: null as EmailTemplate | null,
    loading: false,
    error: null as string | null
  }),

  actions: {
    async getEmailTemplate(customerId: string) {
      try {
        this.loading = true
        this.error = null

        const { data, error } = await supabase
          .from('email_templates')
          .select('*')
          .eq('customer_id', customerId)
          .single()

        if (error) throw error

        this.emailTemplate = data
        return data
      } catch (error: any) {
        this.error = error.message
        return null
      } finally {
        this.loading = false
      }
    },

    async saveEmailTemplate(template: Omit<NewEmailTemplate, 'user_id'>) {
      try {
        this.loading = true
        this.error = null

        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser()

        if (userError) throw userError
        if (!user) throw new Error('No authenticated user')

        // Check if template already exists for this customer
        const { data: existing } = await supabase
          .from('email_templates')
          .select('id')
          .eq('customer_id', template.customer_id)
          .single()

        let result

        if (existing) {
          // Update existing template
          result = await supabase
            .from('email_templates')
            .update({
              subject: template.subject,
              body: template.body,
              recipients: template.recipients
            })
            .eq('id', existing.id)
            .select()
            .single()
        } else {
          // Create new template
          result = await supabase
            .from('email_templates')
            .insert({
              ...template,
              user_id: user.id
            })
            .select()
            .single()
        }

        if (result.error) throw result.error

        this.emailTemplate = result.data
        return result.data
      } catch (error: any) {
        this.error = error.message
        return null
      } finally {
        this.loading = false
      }
    }
  }
})
