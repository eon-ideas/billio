-- Function to get multiple user profiles by their IDs
CREATE OR REPLACE FUNCTION public.get_multiple_user_profiles(p_user_ids UUID[])
RETURNS SETOF JSON AS $$
DECLARE
  user_id UUID;
  result JSON;
  current_user_id UUID;
BEGIN
  -- Check if user is authenticated
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  
  -- Loop through each user ID
  FOREACH user_id IN ARRAY p_user_ids LOOP
    -- Get user metadata
    SELECT json_build_object(
      'id', um.id,
      'nickname', um.nickname,
      'avatar_url', um.avatar_url,
      'email', u.email
    ) INTO result
    FROM public.users_metadata um
    JOIN auth.users u ON u.id = um.id
    WHERE um.id = user_id;
    
    -- If no metadata found, create a basic profile with just the email
    IF result IS NULL THEN
      SELECT json_build_object(
        'id', u.id,
        'nickname', u.email,
        'avatar_url', NULL,
        'email', u.email
      ) INTO result
      FROM auth.users u
      WHERE u.id = user_id;
    END IF;
    
    -- Return the result if not null
    IF result IS NOT NULL THEN
      RETURN NEXT result;
    END IF;
  END LOOP;
  
  RETURN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create policy to allow all authenticated users to read user metadata
-- This is needed for displaying avatars and nicknames in the UI
CREATE POLICY "All authenticated users can read user metadata" ON public.users_metadata
  FOR SELECT USING (auth.role() = 'authenticated');
