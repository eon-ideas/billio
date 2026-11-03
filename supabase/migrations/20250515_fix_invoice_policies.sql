-- Fix invoice policies to properly handle admin access

-- Drop existing policies
DROP POLICY IF EXISTS "Admins can view all invoices" ON invoices;
DROP POLICY IF EXISTS "Admins can create invoices" ON invoices;
DROP POLICY IF EXISTS "Admins can update invoices" ON invoices;
DROP POLICY IF EXISTS "Admins can delete invoices" ON invoices;

-- Create new policies with proper admin handling
CREATE POLICY "Admins can view all invoices" 
ON invoices FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() AND ur.role = 'ADMIN'
  )
  OR user_id = auth.uid()
);

CREATE POLICY "Admins can create invoices" 
ON invoices FOR INSERT 
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() AND ur.role = 'ADMIN'
  )
  OR user_id = auth.uid()
);

CREATE POLICY "Admins can update invoices" 
ON invoices FOR UPDATE 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() AND ur.role = 'ADMIN'
  )
  OR user_id = auth.uid()
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() AND ur.role = 'ADMIN'
  )
  OR user_id = auth.uid()
);

CREATE POLICY "Admins can delete invoices" 
ON invoices FOR DELETE 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() AND ur.role = 'ADMIN'
  )
  OR user_id = auth.uid()
);

-- Update invoice_items policies to match
DROP POLICY IF EXISTS "Admins can view invoice_items" ON invoice_items;
DROP POLICY IF EXISTS "Admins can create invoice_items" ON invoice_items;
DROP POLICY IF EXISTS "Admins can update invoice_items" ON invoice_items;
DROP POLICY IF EXISTS "Admins can delete invoice_items" ON invoice_items;

CREATE POLICY "Admins can view invoice_items" 
ON invoice_items FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() AND ur.role = 'ADMIN'
  )
  OR EXISTS (
    SELECT 1 FROM invoices i
    WHERE i.id = invoice_items.invoice_id
    AND i.user_id = auth.uid()
  )
);

CREATE POLICY "Admins can create invoice_items" 
ON invoice_items FOR INSERT 
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() AND ur.role = 'ADMIN'
  )
  OR EXISTS (
    SELECT 1 FROM invoices i
    WHERE i.id = invoice_items.invoice_id
    AND i.user_id = auth.uid()
  )
);

CREATE POLICY "Admins can update invoice_items" 
ON invoice_items FOR UPDATE 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() AND ur.role = 'ADMIN'
  )
  OR EXISTS (
    SELECT 1 FROM invoices i
    WHERE i.id = invoice_items.invoice_id
    AND i.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() AND ur.role = 'ADMIN'
  )
  OR EXISTS (
    SELECT 1 FROM invoices i
    WHERE i.id = invoice_items.invoice_id
    AND i.user_id = auth.uid()
  )
);

CREATE POLICY "Admins can delete invoice_items" 
ON invoice_items FOR DELETE 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() AND ur.role = 'ADMIN'
  )
  OR EXISTS (
    SELECT 1 FROM invoices i
    WHERE i.id = invoice_items.invoice_id
    AND i.user_id = auth.uid()
  )
);
