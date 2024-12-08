-- Create bucket for company logos if it doesn't exist
insert into storage.buckets (id, name, public)
values ('public', 'public', true)
on conflict (id) do nothing;

-- Set up storage policies for the public bucket
create policy "Public Access"
  on storage.objects
  for select
  to public
  using (bucket_id = 'public');

create policy "Authenticated users can upload files"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'public' AND
    (storage.foldername(name))[1] = 'company-logos'
  );

create policy "Authenticated users can update files"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'public' AND
    (storage.foldername(name))[1] = 'company-logos'
  );
