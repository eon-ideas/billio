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
alter table if exists public.company_info enable row level security;

-- Only allow one company info record
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_policies WHERE tablename = 'company_info' AND policyname = 'Enable read access for authenticated users'
  ) THEN
    create policy "Enable read access for authenticated users"
      on public.company_info
      for select
      to authenticated
      using (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_policies WHERE tablename = 'company_info' AND policyname = 'Enable insert for authenticated users'
  ) THEN
    create policy "Enable insert for authenticated users"
      on public.company_info
      for insert
      to authenticated
      with check (
        not exists (
          select 1 from public.company_info
        )
      );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_policies WHERE tablename = 'company_info' AND policyname = 'Enable update for authenticated users'
  ) THEN
    create policy "Enable update for authenticated users"
      on public.company_info
      for update
      to authenticated
      using (true)
      with check (true);
  END IF;
END $$;

-- Create trigger to update updated_at
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_proc WHERE proname = 'handle_updated_at'
  ) THEN
    execute $func$
    create or replace function public.handle_updated_at()
    returns trigger as $trig$
    begin
      new.updated_at = now();
      return new;
    end;
    $trig$ language plpgsql;
    $func$;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_trigger WHERE tgname = 'company_info_updated_at'
  ) THEN
    create trigger company_info_updated_at
      before update on public.company_info
      for each row
      execute procedure public.handle_updated_at();
  END IF;
END $$;
