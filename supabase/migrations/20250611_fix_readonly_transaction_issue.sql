-- Fix get_user_role function to avoid INSERT operations during read-only transactions
-- This ensures that the function can be used in RLS policies for SELECT queries

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
  
  -- Return NULL if user is not authenticated
  IF current_user_id IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- Check if user has a role in the user_roles table
  SELECT role INTO current_user_role
  FROM public.user_roles
  WHERE user_id = current_user_id;
  
  -- If role found, return it
  IF current_user_role IS NOT NULL THEN
    RETURN current_user_role;
  END IF;
  
  -- Check if this is the first user in the system (by creation time)
  SELECT EXISTS (
    SELECT 1
    FROM auth.users
    WHERE id = current_user_id
    AND id IN (SELECT id FROM auth.users ORDER BY created_at LIMIT 1)
  ) INTO is_first_user;
  
  -- For role checking only (no INSERT), return the appropriate role
  IF is_first_user THEN
    RETURN 'ADMIN';
  ELSE
    RETURN 'USER';
  END IF;
END;
$$;

-- Create a separate function for assigning roles that can be called explicitly
-- when needed, but not during read-only transactions
CREATE OR REPLACE FUNCTION public.assign_user_role()
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
  
  -- Return NULL if user is not authenticated
  IF current_user_id IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- Check if user already has a role
  SELECT role INTO current_user_role
  FROM public.user_roles
  WHERE user_id = current_user_id;
  
  -- If role found, return it without changes
  IF current_user_role IS NOT NULL THEN
    RETURN current_user_role;
  END IF;
  
  -- Check if this is the first user in the system (by creation time)
  SELECT EXISTS (
    SELECT 1
    FROM auth.users
    WHERE id = current_user_id
    AND id IN (SELECT id FROM auth.users ORDER BY created_at LIMIT 1)
  ) INTO is_first_user;
  
  -- Assign the appropriate role
  IF is_first_user THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (current_user_id, 'ADMIN')
    ON CONFLICT (user_id) 
    DO UPDATE SET role = 'ADMIN';
    
    RETURN 'ADMIN';
  ELSE
    INSERT INTO public.user_roles (user_id, role)
    VALUES (current_user_id, 'USER')
    ON CONFLICT (user_id) 
    DO UPDATE SET role = 'USER';
    
    RETURN 'USER';
  END IF;
END;
$$;
