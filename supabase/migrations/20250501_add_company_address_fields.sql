-- Add new address fields to company_info table
alter table public.company_info
add column if not exists street text,
add column if not exists house_number text,
add column if not exists postal_code text,
add column if not exists city text;
