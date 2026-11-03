-- Add new fields to company_info table
alter table public.company_info
add column if not exists pin_id text,
add column if not exists web text,
add column if not exists email text,
add column if not exists phone text;
