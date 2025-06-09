-- Create users_metadata table to store profile information
CREATE TABLE IF NOT EXISTS public.users_metadata (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nickname TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add Row Level Security policies
ALTER TABLE public.users_metadata ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to read their own metadata
CREATE POLICY "Users can read their own metadata" ON public.users_metadata
  FOR SELECT USING (auth.uid() = id);

-- Create policy to allow users to update their own metadata
CREATE POLICY "Users can update their own metadata" ON public.users_metadata
  FOR UPDATE USING (auth.uid() = id);

-- Create policy to allow users to insert their own metadata
CREATE POLICY "Users can insert their own metadata" ON public.users_metadata
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create policy to allow admins to access all user metadata
CREATE POLICY "Admins can do anything with user metadata" ON public.users_metadata
  USING (EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'ADMIN'
  ));

-- Create function to get user profile information
CREATE OR REPLACE FUNCTION public.get_user_profile()
RETURNS JSON AS $$
DECLARE
  user_id UUID;
  user_metadata RECORD;
  user_role TEXT;
BEGIN
  user_id := auth.uid();
  
  IF user_id IS NULL THEN
    RETURN NULL;
  END IF;
  
  SELECT * INTO user_metadata FROM public.users_metadata WHERE id = user_id;
  SELECT role INTO user_role FROM public.user_roles WHERE user_id = auth.uid();
  
  IF user_metadata IS NULL THEN
    -- Create default metadata if it doesn't exist
    INSERT INTO public.users_metadata (id, nickname) 
    VALUES (user_id, (SELECT email FROM auth.users WHERE id = user_id))
    RETURNING * INTO user_metadata;
  END IF;
  
  RETURN json_build_object(
    'id', user_id,
    'nickname', user_metadata.nickname,
    'avatar_url', user_metadata.avatar_url,
    'role', user_role,
    'email', (SELECT email FROM auth.users WHERE id = user_id)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update user profile
CREATE OR REPLACE FUNCTION public.update_user_profile(
  p_nickname TEXT,
  p_avatar_url TEXT
)
RETURNS JSON AS $$
DECLARE
  user_id UUID;
  updated_metadata RECORD;
BEGIN
  user_id := auth.uid();
  
  IF user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  
  UPDATE public.users_metadata 
  SET 
    nickname = COALESCE(p_nickname, nickname),
    avatar_url = COALESCE(p_avatar_url, avatar_url),
    updated_at = NOW()
  WHERE id = user_id
  RETURNING * INTO updated_metadata;
  
  -- If no rows were updated, insert a new row
  IF NOT FOUND THEN
    INSERT INTO public.users_metadata (id, nickname, avatar_url)
    VALUES (user_id, p_nickname, p_avatar_url)
    RETURNING * INTO updated_metadata;
  END IF;
  
  RETURN json_build_object(
    'id', user_id,
    'nickname', updated_metadata.nickname,
    'avatar_url', updated_metadata.avatar_url,
    'updated_at', updated_metadata.updated_at
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
