-- Create company_info table
create table if not exists public.company_info (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  address text not null,
  vat_id text not null,
  iban text not null,
  logo_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create RLS policies
alter table public.company_info enable row level security;

-- Only allow one company info record
create policy "Enable read access for authenticated users"
  on public.company_info
  for select
  to authenticated
  using (true);

create policy "Enable insert for authenticated users"
  on public.company_info
  for insert
  to authenticated
  with check (
    not exists (
      select 1 from public.company_info
    )
  );

create policy "Enable update for authenticated users"
  on public.company_info
  for update
  to authenticated
  using (true)
  with check (true);

-- Create trigger to update updated_at
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger company_info_updated_at
  before update on public.company_info
  for each row
  execute procedure public.handle_updated_at();
