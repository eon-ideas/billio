-- Create customers table
create table customers (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  email text,
  phone text,
  company text,
  city text,
  address text,
  vat_id text,
  currency text default 'EUR'
);

-- Create invoices table
create table invoices (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  customer_id uuid references customers(id) on delete cascade not null,
  number text not null,
  date date not null,
  total numeric(10,2) not null default 0,
  paid boolean not null default false
);

-- Create invoice items table
create table invoice_items (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  invoice_id uuid references invoices(id) on delete cascade not null,
  description text not null,
  quantity numeric(10,2) not null default 0,
  price numeric(10,2) not null default 0
);

-- Add RLS policies
alter table customers enable row level security;
alter table invoices enable row level security;
alter table invoice_items enable row level security;

-- Customers policies
create policy "Users can view their own customers"
  on customers for select
  using (auth.uid() = user_id);

create policy "Users can insert their own customers"
  on customers for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own customers"
  on customers for update
  using (auth.uid() = user_id);

create policy "Users can delete their own customers"
  on customers for delete
  using (auth.uid() = user_id);

-- Invoices policies
create policy "Users can view their own invoices"
  on invoices for select
  using (auth.uid() = user_id);

create policy "Users can insert their own invoices"
  on invoices for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own invoices"
  on invoices for update
  using (auth.uid() = user_id);

create policy "Users can delete their own invoices"
  on invoices for delete
  using (auth.uid() = user_id);

-- Invoice items policies
create policy "Users can view their own invoice items"
  on invoice_items for select
  using (exists (
    select 1 from invoices
    where invoices.id = invoice_items.invoice_id
    and invoices.user_id = auth.uid()
  ));

create policy "Users can insert their own invoice items"
  on invoice_items for insert
  with check (exists (
    select 1 from invoices
    where invoices.id = invoice_items.invoice_id
    and invoices.user_id = auth.uid()
  ));

create policy "Users can update their own invoice items"
  on invoice_items for update
  using (exists (
    select 1 from invoices
    where invoices.id = invoice_items.invoice_id
    and invoices.user_id = auth.uid()
  ));

create policy "Users can delete their own invoice items"
  on invoice_items for delete
  using (exists (
    select 1 from invoices
    where invoices.id = invoice_items.invoice_id
    and invoices.user_id = auth.uid()
  ));

-- Create functions to update timestamps
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- Create triggers for updating timestamps
create trigger update_customers_updated_at
  before update on customers
  for each row
  execute function update_updated_at_column();

create trigger update_invoices_updated_at
  before update on invoices
  for each row
  execute function update_updated_at_column();

create trigger update_invoice_items_updated_at
  before update on invoice_items
  for each row
  execute function update_updated_at_column();
