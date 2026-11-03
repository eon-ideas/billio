-- Ensure the first user is assigned the ADMIN role

-- Get the first user ID
DO $$
DECLARE
  first_user_id UUID;
BEGIN
  SELECT id INTO first_user_id
  FROM auth.users
  ORDER BY created_at
  LIMIT 1;
  
  -- If no first user exists, return
  IF first_user_id IS NULL THEN
    RETURN;
  END IF;
  
  -- Insert or update the admin role for the first user
  INSERT INTO public.user_roles (user_id, role)
  VALUES (first_user_id, 'ADMIN')
  ON CONFLICT (user_id)
  DO UPDATE SET role = 'ADMIN';
END $$;

-- Create function to get first user's ID
CREATE OR REPLACE FUNCTION public.get_first_user_id()
RETURNS UUID AS $$
DECLARE
  first_user_id UUID;
BEGIN
  SELECT id INTO first_user_id
  FROM auth.users
  ORDER BY created_at
  LIMIT 1;
  
  RETURN first_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to check if user is first user (and therefore admin)
CREATE OR REPLACE FUNCTION public.is_first_user()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN auth.uid() = public.get_first_user_id();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update existing policies to use is_first_user as fallback
CREATE POLICY "Admins can view all invoices" 
ON invoices FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() AND ur.role = 'ADMIN'
  )
  OR public.is_first_user()
);

CREATE POLICY "Admins can create invoices" 
ON invoices FOR INSERT 
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() AND ur.role = 'ADMIN'
  )
  OR public.is_first_user()
);

CREATE POLICY "Admins can update invoices" 
ON invoices FOR UPDATE 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() AND ur.role = 'ADMIN'
  )
  OR public.is_first_user()
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() AND ur.role = 'ADMIN'
  )
  OR public.is_first_user()
);

CREATE POLICY "Admins can delete invoices" 
ON invoices FOR DELETE 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() AND ur.role = 'ADMIN'
  )
  OR public.is_first_user()
);

-- Update company_info policy
CREATE POLICY "Admins can access company_info" 
ON company_info FOR ALL 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() AND ur.role = 'ADMIN'
  )
  OR public.is_first_user()
);
