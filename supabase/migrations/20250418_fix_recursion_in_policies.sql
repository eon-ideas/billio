-- Drop the problematic policy that's causing infinite recursion
DROP POLICY IF EXISTS "Admins can do everything on user_roles" ON public.user_roles;

-- Create a new policy for user_roles that doesn't cause recursion
-- Allow all authenticated users to read the user_roles table
CREATE POLICY "Allow all authenticated users to read user_roles" ON public.user_roles
  FOR SELECT
  TO authenticated
  USING (true);

-- Only allow the user to read their own role
CREATE POLICY "Users can only read their own role" ON public.user_roles
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Only allow users with the 'ADMIN' role in the session claims to modify user_roles
-- This avoids the recursion by not querying the user_roles table itself
CREATE OR REPLACE FUNCTION public.is_admin_from_claims()
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if the user has an admin claim in their JWT
  RETURN current_setting('request.jwt.claims', true)::json->>'role' = 'ADMIN';
EXCEPTION
  WHEN OTHERS THEN
    RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger function to set role claim when role changes
CREATE OR REPLACE FUNCTION public.set_role_claim()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the user's JWT claims with their role
  PERFORM set_claim(NEW.user_id, 'role', NEW.role);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger to update claims when role changes
DROP TRIGGER IF EXISTS on_role_update ON public.user_roles;
CREATE TRIGGER on_role_update
  AFTER INSERT OR UPDATE ON public.user_roles
  FOR EACH ROW EXECUTE FUNCTION public.set_role_claim();

-- Update existing users' claims with their roles
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN SELECT user_id, role FROM public.user_roles
  LOOP
    PERFORM set_claim(r.user_id, 'role', r.role);
  END LOOP;
END $$;

-- Create new admin policy using the function instead of querying user_roles
CREATE POLICY "Admins can modify user_roles" ON public.user_roles
  FOR ALL
  TO authenticated
  USING (public.is_admin_from_claims());

-- Update the is_admin function to use claims instead of querying user_roles
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN public.is_admin_from_claims();
EXCEPTION
  WHEN OTHERS THEN
    RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update the get_user_role function to use claims if possible
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT AS $$
DECLARE
  role_from_claims TEXT;
  user_role TEXT;
BEGIN
  -- Try to get role from claims first (faster and avoids recursion)
  BEGIN
    role_from_claims := current_setting('request.jwt.claims', true)::json->>'role';
    IF role_from_claims IS NOT NULL THEN
      RETURN role_from_claims;
    END IF;
  EXCEPTION
    WHEN OTHERS THEN
      -- If getting from claims fails, fall back to database query
      NULL;
  END;
  
  -- Fall back to database query
  SELECT role INTO user_role
  FROM public.user_roles
  WHERE user_id = auth.uid();
  
  RETURN user_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
