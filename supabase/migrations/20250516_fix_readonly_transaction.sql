-- Fix get_user_role function to not perform INSERT operations during read operations

CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_role text;
  is_first_user boolean;
  user_id uuid;
BEGIN
  -- Get the current user's ID
  user_id := auth.uid();
  
  -- Check if this is the first user in the system (by creation time)
  SELECT EXISTS (
    SELECT 1
    FROM auth.users
    WHERE id = user_id
    AND id IN (SELECT id FROM auth.users ORDER BY created_at LIMIT 1)
  ) INTO is_first_user;
  
  -- If it's the first user, consider them an admin without inserting
  IF is_first_user THEN
    -- Check if they already have a role
    SELECT role INTO user_role
    FROM public.user_roles
    WHERE user_id = auth.uid();
    
    -- Return ADMIN if they're the first user, regardless of DB state
    RETURN COALESCE(user_role, 'ADMIN');
  END IF;
  
  -- Check if user has a role
  SELECT role INTO user_role
  FROM public.user_roles
  WHERE user_id = auth.uid();
  
  -- If no role found, return USER without inserting
  RETURN COALESCE(user_role, 'USER');
END;
$$;

-- Create a separate function to ensure user roles exist
-- This should be called during authentication or user profile updates
CREATE OR REPLACE FUNCTION public.ensure_user_role()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_role text;
  is_first_user boolean;
  user_id uuid;
BEGIN
  -- Get the current user's ID
  user_id := auth.uid();
  
  -- Check if this is the first user in the system (by creation time)
  SELECT EXISTS (
    SELECT 1
    FROM auth.users
    WHERE id = user_id
    AND id IN (SELECT id FROM auth.users ORDER BY created_at LIMIT 1)
  ) INTO is_first_user;
  
  -- If it's the first user, make them an admin
  IF is_first_user THEN
    -- Insert or update user role to ADMIN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (user_id, 'ADMIN')
    ON CONFLICT (user_id) 
    DO UPDATE SET role = 'ADMIN';
    
    RETURN 'ADMIN';
  END IF;
  
  -- Check if user has a role
  SELECT role INTO user_role
  FROM public.user_roles
  WHERE user_id = auth.uid();
  
  -- If no role found, assign USER role
  IF user_role IS NULL THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (auth.uid(), 'USER')
    ON CONFLICT (user_id) 
    DO UPDATE SET role = 'USER';
    
    RETURN 'USER';
  END IF;
  
  -- Return the user's role
  RETURN user_role;
END;
$$;
