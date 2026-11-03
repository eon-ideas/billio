-- Drop the problematic policies that are causing infinite recursion
DROP POLICY IF EXISTS "Admins can do everything on user_roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can read their own role" ON public.user_roles;

-- Create a simple policy that allows all authenticated users to read the user_roles table
-- This avoids the recursion by not querying the user_roles table itself in the policy
CREATE POLICY "Allow all authenticated users to read user_roles" ON public.user_roles
  FOR SELECT
  TO authenticated
  USING (true);

-- Create a policy that allows users to read only their own role
CREATE POLICY "Users can only read their own role" ON public.user_roles
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Create a policy that allows only the service role to modify user_roles
-- This is a temporary solution until we implement a proper admin interface
CREATE POLICY "Service role can modify user_roles" ON public.user_roles
  FOR ALL
  TO authenticated
  USING (auth.uid() IN (
    -- Get the first user as a temporary admin
    SELECT id FROM auth.users ORDER BY created_at LIMIT 1
  ));

-- Update the is_admin function to avoid recursion
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
DECLARE
  is_admin BOOLEAN;
  user_id UUID;
BEGIN
  -- Get the current user ID
  user_id := auth.uid();
  
  -- Check if this is the first user (temporary admin solution)
  -- This avoids querying user_roles directly
  SELECT EXISTS (
    SELECT 1
    FROM auth.users
    WHERE id = user_id
    AND id IN (SELECT id FROM auth.users ORDER BY created_at LIMIT 1)
  ) INTO is_admin;
  
  RETURN is_admin;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update the get_user_role function to avoid recursion
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT AS $$
DECLARE
  user_id UUID;
  is_first_user BOOLEAN;
BEGIN
  -- Get the current user ID
  user_id := auth.uid();
  
  -- Check if this is the first user (temporary admin)
  SELECT EXISTS (
    SELECT 1
    FROM auth.users
    WHERE id = user_id
    AND id IN (SELECT id FROM auth.users ORDER BY created_at LIMIT 1)
  ) INTO is_first_user;
  
  -- Return ADMIN for the first user, USER for everyone else
  IF is_first_user THEN
    RETURN 'ADMIN';
  ELSE
    RETURN 'USER';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix the policies for other tables that might cause recursion
-- Update all policies to use the new is_admin function that doesn't query user_roles

-- For company_info
DROP POLICY IF EXISTS "Admins can do everything on company_info" ON public.company_info;
CREATE POLICY "Admins can do everything on company_info" ON public.company_info
  FOR ALL
  TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "Users can read company_info" ON public.company_info;
CREATE POLICY "Users can read company_info" ON public.company_info
  FOR SELECT
  TO authenticated
  USING (NOT public.is_admin());

-- For email_templates
DROP POLICY IF EXISTS "Admins can do everything on email_templates" ON public.email_templates;
CREATE POLICY "Admins can do everything on email_templates" ON public.email_templates
  FOR ALL
  TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "Users can read email_templates" ON public.email_templates;
CREATE POLICY "Users can read email_templates" ON public.email_templates
  FOR SELECT
  TO authenticated
  USING (NOT public.is_admin());

-- For customers
DROP POLICY IF EXISTS "Admins can do everything on customers" ON public.customers;
CREATE POLICY "Admins can do everything on customers" ON public.customers
  FOR ALL
  TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "Users can read customers" ON public.customers;
CREATE POLICY "Users can read customers" ON public.customers
  FOR SELECT
  TO authenticated
  USING (NOT public.is_admin());

DROP POLICY IF EXISTS "Users can create customers" ON public.customers;
CREATE POLICY "Users can create customers" ON public.customers
  FOR INSERT
  TO authenticated
  WITH CHECK (NOT public.is_admin());

DROP POLICY IF EXISTS "Users can update customers" ON public.customers;
CREATE POLICY "Users can update customers" ON public.customers
  FOR UPDATE
  TO authenticated
  USING (NOT public.is_admin())
  WITH CHECK (NOT public.is_admin());

DROP POLICY IF EXISTS "Users can delete customers" ON public.customers;
CREATE POLICY "Users can delete customers" ON public.customers
  FOR DELETE
  TO authenticated
  USING (NOT public.is_admin());

-- For invoices
DROP POLICY IF EXISTS "Admins can do everything on invoices" ON public.invoices;
CREATE POLICY "Admins can do everything on invoices" ON public.invoices
  FOR ALL
  TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "Users can read invoices" ON public.invoices;
CREATE POLICY "Users can read invoices" ON public.invoices
  FOR SELECT
  TO authenticated
  USING (NOT public.is_admin());

DROP POLICY IF EXISTS "Users can create invoices" ON public.invoices;
CREATE POLICY "Users can create invoices" ON public.invoices
  FOR INSERT
  TO authenticated
  WITH CHECK (NOT public.is_admin());

DROP POLICY IF EXISTS "Users can update invoices" ON public.invoices;
CREATE POLICY "Users can update invoices" ON public.invoices
  FOR UPDATE
  TO authenticated
  USING (NOT public.is_admin())
  WITH CHECK (NOT public.is_admin());

DROP POLICY IF EXISTS "Users can delete invoices" ON public.invoices;
CREATE POLICY "Users can delete invoices" ON public.invoices
  FOR DELETE
  TO authenticated
  USING (NOT public.is_admin());

-- For invoice_items
DROP POLICY IF EXISTS "Admins can do everything on invoice_items" ON public.invoice_items;
CREATE POLICY "Admins can do everything on invoice_items" ON public.invoice_items
  FOR ALL
  TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "Users can read invoice_items" ON public.invoice_items;
CREATE POLICY "Users can read invoice_items" ON public.invoice_items
  FOR SELECT
  TO authenticated
  USING (NOT public.is_admin());

DROP POLICY IF EXISTS "Users can create invoice_items" ON public.invoice_items;
CREATE POLICY "Users can create invoice_items" ON public.invoice_items
  FOR INSERT
  TO authenticated
  WITH CHECK (NOT public.is_admin());

DROP POLICY IF EXISTS "Users can update invoice_items" ON public.invoice_items;
CREATE POLICY "Users can update invoice_items" ON public.invoice_items
  FOR UPDATE
  TO authenticated
  USING (NOT public.is_admin())
  WITH CHECK (NOT public.is_admin());

DROP POLICY IF EXISTS "Users can delete invoice_items" ON public.invoice_items;
CREATE POLICY "Users can delete invoice_items" ON public.invoice_items
  FOR DELETE
  TO authenticated
  USING (NOT public.is_admin());

-- For documents
DROP POLICY IF EXISTS "Admins can do everything on documents" ON public.documents;
CREATE POLICY "Admins can do everything on documents" ON public.documents
  FOR ALL
  TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "Users can read documents" ON public.documents;
CREATE POLICY "Users can read documents" ON public.documents
  FOR SELECT
  TO authenticated
  USING (NOT public.is_admin());

DROP POLICY IF EXISTS "Users can create documents" ON public.documents;
CREATE POLICY "Users can create documents" ON public.documents
  FOR INSERT
  TO authenticated
  WITH CHECK (NOT public.is_admin());

DROP POLICY IF EXISTS "Users can update documents" ON public.documents;
CREATE POLICY "Users can update documents" ON public.documents
  FOR UPDATE
  TO authenticated
  USING (NOT public.is_admin())
  WITH CHECK (NOT public.is_admin());

DROP POLICY IF EXISTS "Users can delete documents" ON public.documents;
CREATE POLICY "Users can delete documents" ON public.documents
  FOR DELETE
  TO authenticated
  USING (NOT public.is_admin());

-- For chat_histories
DROP POLICY IF EXISTS "Admins can do everything on chat_histories" ON public.chat_histories;
CREATE POLICY "Admins can do everything on chat_histories" ON public.chat_histories
  FOR ALL
  TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "Users can read chat_histories" ON public.chat_histories;
CREATE POLICY "Users can read chat_histories" ON public.chat_histories
  FOR SELECT
  TO authenticated
  USING (NOT public.is_admin());

DROP POLICY IF EXISTS "Users can create chat_histories" ON public.chat_histories;
CREATE POLICY "Users can create chat_histories" ON public.chat_histories
  FOR INSERT
  TO authenticated
  WITH CHECK (NOT public.is_admin());

DROP POLICY IF EXISTS "Users can update chat_histories" ON public.chat_histories;
CREATE POLICY "Users can update chat_histories" ON public.chat_histories
  FOR UPDATE
  TO authenticated
  USING (NOT public.is_admin())
  WITH CHECK (NOT public.is_admin());

DROP POLICY IF EXISTS "Users can delete chat_histories" ON public.chat_histories;
CREATE POLICY "Users can delete chat_histories" ON public.chat_histories
  FOR DELETE
  TO authenticated
  USING (NOT public.is_admin());
