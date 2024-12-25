-- Create email templates table
create table public.email_templates (
    id uuid default gen_random_uuid() primary key,
    customer_id uuid references public.customers(id) on delete cascade,
    user_id uuid references auth.users(id) on delete cascade not null,
    subject text not null,
    body text not null,
    recipients text[] not null default '{}',
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add RLS policies
alter table public.email_templates enable row level security;

create policy "Users can view their own email templates"
    on public.email_templates for select
    using (auth.uid() = user_id);

create policy "Users can insert their own email templates"
    on public.email_templates for insert
    with check (auth.uid() = user_id);

create policy "Users can update their own email templates"
    on public.email_templates for update
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

create policy "Users can delete their own email templates"
    on public.email_templates for delete
    using (auth.uid() = user_id);

-- Add updated_at trigger
create trigger email_templates_updated_at
    before update on public.email_templates
    for each row
    execute procedure public.handle_updated_at();
