-- Create a public view to expose user_id and email from auth.users
create or replace view public.user_emails as
select id, email from auth.users;

-- Grant select on the view to authenticated users
grant select on public.user_emails to authenticated;
