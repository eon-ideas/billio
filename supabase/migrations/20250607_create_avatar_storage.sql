-- Create a storage bucket for user avatars
INSERT INTO storage.buckets (id, name, public)
VALUES ('user-avatars', 'user-avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Set up security policies for the user-avatars bucket
INSERT INTO storage.policies (name, definition, bucket_id)
VALUES (
  'Avatar images are publicly accessible',
  '(bucket_id = ''user-avatars'' AND auth.role() = ''authenticated'')::boolean',
  'user-avatars'
) ON CONFLICT (name, bucket_id) DO NOTHING;

-- Allow users to upload their own avatars
INSERT INTO storage.policies (name, definition, bucket_id)
VALUES (
  'Users can upload avatars',
  '(bucket_id = ''user-avatars'' AND auth.uid() = auth.uid())::boolean',
  'user-avatars'
) ON CONFLICT (name, bucket_id) DO NOTHING;

-- Allow authenticated users to update their own avatars
INSERT INTO storage.policies (name, definition, bucket_id)
VALUES (
  'Users can update their own avatars',
  '(bucket_id = ''user-avatars'' AND auth.uid() = auth.uid())::boolean',
  'user-avatars'
) ON CONFLICT (name, bucket_id) DO NOTHING;
