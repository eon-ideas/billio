-- Fix get_user_role function to properly return the user's role from the user_roles table
-- Fixing the ambiguous column reference issue

CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_user_role text;
  is_first_user boolean;
  current_user_id uuid;
BEGIN
  -- Get the current user's ID
  current_user_id := auth.uid();
  
  -- Check if this is the first user in the system (by creation time)
  SELECT EXISTS (
    SELECT 1
    FROM auth.users
    WHERE id = current_user_id
    AND id IN (SELECT id FROM auth.users ORDER BY created_at LIMIT 1)
  ) INTO is_first_user;
  
  -- If it's the first user, make them an admin
  IF is_first_user THEN
    -- Insert or update user role to ADMIN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (current_user_id, 'ADMIN')
    ON CONFLICT (user_id) 
    DO UPDATE SET role = 'ADMIN';
    
    RETURN 'ADMIN';
  END IF;
  
  -- Check if user has a role
  SELECT role INTO current_user_role
  FROM public.user_roles
  WHERE user_id = current_user_id;
  
  -- If no role found, assign USER role
  IF current_user_role IS NULL THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (current_user_id, 'USER')
    ON CONFLICT (user_id) 
    DO UPDATE SET role = 'USER';
    
    RETURN 'USER';
  END IF;
  
  -- Return the user's role
  RETURN current_user_role;
END;
$$;
