-- Remove old policies from company_info table
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.company_info;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.company_info;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON public.company_info;

-- Remove old policies from customers table
DROP POLICY IF EXISTS "Users can delete their own customers" ON public.customers;
DROP POLICY IF EXISTS "Users can insert their own customers" ON public.customers;
DROP POLICY IF EXISTS "Users can update their own customers" ON public.customers;
DROP POLICY IF EXISTS "Users can view their own customers" ON public.customers;

-- Remove old policies from email_templates table
DROP POLICY IF EXISTS "Users can delete their own email templates" ON public.email_templates;
DROP POLICY IF EXISTS "Users can insert their own email templates" ON public.email_templates;
DROP POLICY IF EXISTS "Users can update their own email templates" ON public.email_templates;
DROP POLICY IF EXISTS "Users can view their own email templates" ON public.email_templates;

-- Remove old policies from invoice_items table
-- Note: We need to create new role-based policies for this table as it wasn't included in our initial migration
DROP POLICY IF EXISTS "Users can delete their own invoice items" ON public.invoice_items;
DROP POLICY IF EXISTS "Users can insert their own invoice items" ON public.invoice_items;
DROP POLICY IF EXISTS "Users can update their own invoice items" ON public.invoice_items;
DROP POLICY IF EXISTS "Users can view their own invoice items" ON public.invoice_items;

-- Remove old policies from invoices table
DROP POLICY IF EXISTS "Users can delete their own invoices" ON public.invoices;
DROP POLICY IF EXISTS "Users can insert their own invoices" ON public.invoices;
DROP POLICY IF EXISTS "Users can update their own invoices" ON public.invoices;
DROP POLICY IF EXISTS "Users can view their own invoices" ON public.invoices;

-- Add RLS to invoice_items table
ALTER TABLE IF EXISTS public.invoice_items ENABLE ROW LEVEL SECURITY;

-- Create new policies for invoice_items table based on roles
-- Admins can do everything on invoice_items
CREATE POLICY "Admins can do everything on invoice_items" ON public.invoice_items
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role = 'ADMIN'
    )
  );

-- Users can read, create, update, and delete invoice_items
CREATE POLICY "Users can read invoice_items" ON public.invoice_items
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role = 'USER'
    )
  );

CREATE POLICY "Users can create invoice_items" ON public.invoice_items
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role = 'USER'
    )
  );

CREATE POLICY "Users can update invoice_items" ON public.invoice_items
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role = 'USER'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role = 'USER'
    )
  );

CREATE POLICY "Users can delete invoice_items" ON public.invoice_items
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role = 'USER'
    )
  );

-- Add RLS to documents and chat_histories tables
-- Remove old policies
DROP POLICY IF EXISTS "Authenticated users can perform all operations on documents" ON public.documents;
DROP POLICY IF EXISTS "Authenticated users can perform all operations on chat_historie" ON public.chat_histories;

-- Create new policies for documents table
CREATE POLICY "Admins can do everything on documents" ON public.documents
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role = 'ADMIN'
    )
  );

CREATE POLICY "Users can read documents" ON public.documents
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role = 'USER'
    )
  );

CREATE POLICY "Users can create documents" ON public.documents
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role = 'USER'
    )
  );

CREATE POLICY "Users can update documents" ON public.documents
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role = 'USER'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role = 'USER'
    )
  );

CREATE POLICY "Users can delete documents" ON public.documents
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role = 'USER'
    )
  );

-- Create new policies for chat_histories table
CREATE POLICY "Admins can do everything on chat_histories" ON public.chat_histories
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role = 'ADMIN'
    )
  );

CREATE POLICY "Users can read chat_histories" ON public.chat_histories
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role = 'USER'
    )
  );

CREATE POLICY "Users can create chat_histories" ON public.chat_histories
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role = 'USER'
    )
  );

CREATE POLICY "Users can update chat_histories" ON public.chat_histories
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role = 'USER'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role = 'USER'
    )
  );

CREATE POLICY "Users can delete chat_histories" ON public.chat_histories
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role = 'USER'
    )
  );
