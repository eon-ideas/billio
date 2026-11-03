-- Remove all existing policies and replace with simple auth-based policies
-- This migration simplifies access control to allow any authenticated user to access all tables

-- Drop existing policies on invoices
DROP POLICY IF EXISTS "Users can view their own invoices" ON public.invoices;
DROP POLICY IF EXISTS "Users can create their own invoices" ON public.invoices;
DROP POLICY IF EXISTS "Users can update their own invoices" ON public.invoices;
DROP POLICY IF EXISTS "Users can delete their own invoices" ON public.invoices;
DROP POLICY IF EXISTS "Admins can manage all invoices" ON public.invoices;

-- Drop existing policies on customers
DROP POLICY IF EXISTS "Users can view their own customers" ON public.customers;
DROP POLICY IF EXISTS "Users can create their own customers" ON public.customers;
DROP POLICY IF EXISTS "Users can update their own customers" ON public.customers;
DROP POLICY IF EXISTS "Users can delete their own customers" ON public.customers;
DROP POLICY IF EXISTS "Admins can manage all customers" ON public.customers;

-- Drop existing policies on invoice_items
DROP POLICY IF EXISTS "Users can view their own invoice items" ON public.invoice_items;
DROP POLICY IF EXISTS "Users can create their own invoice items" ON public.invoice_items;
DROP POLICY IF EXISTS "Users can update their own invoice items" ON public.invoice_items;
DROP POLICY IF EXISTS "Users can delete their own invoice items" ON public.invoice_items;
DROP POLICY IF EXISTS "Admins can manage all invoice items" ON public.invoice_items;

-- Drop existing policies on company_info
DROP POLICY IF EXISTS "Users can view company info" ON public.company_info;
DROP POLICY IF EXISTS "Admins can manage company info" ON public.company_info;

-- Drop existing policies on email_templates
DROP POLICY IF EXISTS "Users can view email templates" ON public.email_templates;
DROP POLICY IF EXISTS "Admins can manage email templates" ON public.email_templates;

-- Drop existing policies on user_roles
DROP POLICY IF EXISTS "Users can view their own role" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;

-- Create new simplified policies for invoices
CREATE POLICY "Authenticated users can access invoices" 
ON public.invoices
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- Create new simplified policies for customers
CREATE POLICY "Authenticated users can access customers" 
ON public.customers
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- Create new simplified policies for invoice_items
CREATE POLICY "Authenticated users can access invoice_items" 
ON public.invoice_items
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- Create new simplified policies for company_info
CREATE POLICY "Authenticated users can access company_info" 
ON public.company_info
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- Create new simplified policies for email_templates
CREATE POLICY "Authenticated users can access email_templates" 
ON public.email_templates
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- Create new simplified policies for user_roles
CREATE POLICY "Authenticated users can access user_roles" 
ON public.user_roles
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');
