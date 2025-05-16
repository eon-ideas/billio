-- Optimize RLS policies for customers table to improve performance

-- Drop existing policies
DROP POLICY IF EXISTS "Users can insert their own customers" ON customers;
DROP POLICY IF EXISTS "Users can update their own customers" ON customers;
DROP POLICY IF EXISTS "Users can delete their own customers" ON customers;

-- Create optimized policies with subqueries
CREATE POLICY "Users can insert their own customers" 
ON customers FOR INSERT 
TO authenticated
WITH CHECK (
  user_id = (SELECT auth.uid())
);

CREATE POLICY "Users can update their own customers" 
ON customers FOR UPDATE 
TO authenticated
USING (
  user_id = (SELECT auth.uid())
)
WITH CHECK (
  user_id = (SELECT auth.uid())
);

CREATE POLICY "Users can delete their own customers" 
ON customers FOR DELETE 
TO authenticated
USING (
  user_id = (SELECT auth.uid())
);
