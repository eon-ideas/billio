-- Update invoice policies to allow users to see all invoices but only modify their own

-- Drop existing policies for invoices
DROP POLICY IF EXISTS "Users can read invoices" ON invoices;
DROP POLICY IF EXISTS "Users can create invoices" ON invoices;
DROP POLICY IF EXISTS "Users can update invoices" ON invoices;
DROP POLICY IF EXISTS "Users can delete invoices" ON invoices;

-- Also drop any policies we might have created in previous fixes
DROP POLICY IF EXISTS "Users can read their invoices" ON invoices;
DROP POLICY IF EXISTS "Users can read all invoices" ON invoices;
DROP POLICY IF EXISTS "Users can create their invoices" ON invoices;
DROP POLICY IF EXISTS "Users can update their invoices" ON invoices;
DROP POLICY IF EXISTS "Users can delete their invoices" ON invoices;

-- Create a new read policy that allows users to see all invoices
CREATE POLICY "Users can read all invoices" 
ON invoices FOR SELECT 
TO authenticated
USING (
  NOT is_admin()
);

-- Create policies that only allow users to modify their own invoices
CREATE POLICY "Users can create their invoices" 
ON invoices FOR INSERT 
TO authenticated
WITH CHECK (
  (NOT is_admin() AND user_id = auth.uid())
);

CREATE POLICY "Users can update their invoices" 
ON invoices FOR UPDATE 
TO authenticated
USING (
  (NOT is_admin() AND user_id = auth.uid())
)
WITH CHECK (
  (NOT is_admin() AND user_id = auth.uid())
);

CREATE POLICY "Users can delete their invoices" 
ON invoices FOR DELETE 
TO authenticated
USING (
  (NOT is_admin() AND user_id = auth.uid())
);
