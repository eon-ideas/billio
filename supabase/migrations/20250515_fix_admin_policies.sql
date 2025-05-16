-- Fix RLS policies to properly allow admin access

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can read all invoices" ON invoices;
DROP POLICY IF EXISTS "Users can read invoices" ON invoices;
DROP POLICY IF EXISTS "Users can create invoices" ON invoices;
DROP POLICY IF EXISTS "Users can update invoices" ON invoices;
DROP POLICY IF EXISTS "Users can delete invoices" ON invoices;

-- Create proper admin policies
CREATE POLICY "Admins can view all invoices" 
ON invoices FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() AND ur.role = 'ADMIN'
  )
);

CREATE POLICY "Admins can create invoices" 
ON invoices FOR INSERT 
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() AND ur.role = 'ADMIN'
  )
);

CREATE POLICY "Admins can update invoices" 
ON invoices FOR UPDATE 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() AND ur.role = 'ADMIN'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() AND ur.role = 'ADMIN'
  )
);

CREATE POLICY "Admins can delete invoices" 
ON invoices FOR DELETE 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() AND ur.role = 'ADMIN'
  )
);

-- Fix company settings policies
DROP POLICY IF EXISTS "Admins can do everything on company_info" ON company_info;
DROP POLICY IF EXISTS "Users can read company_info" ON company_info;

CREATE POLICY "Admins can access company_info" 
ON company_info FOR ALL 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() AND ur.role = 'ADMIN'
  )
);
