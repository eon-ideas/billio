-- Fix is_admin function to ensure it always returns a value

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Simply check if the user's role is ADMIN
  RETURN (public.get_user_role() = 'ADMIN');
END;
$$;
