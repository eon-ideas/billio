-- Ensure both ADMIN and USER roles can see all invoices

-- Remove any existing admin read policy for clarity
DROP POLICY IF EXISTS "Admins can read all invoices" ON invoices;

-- Add explicit read policy for admins
CREATE POLICY "Admins can read all invoices"
ON invoices FOR SELECT
TO authenticated
USING (
  is_admin()
);
