-- Row Level Security behaviour test
--
-- Run against a disposable database that has every migration applied, as the postgres user:
--   psql "$DB_URL" -f supabase/tests/rls_policies.sql
-- It inserts fixture users and rows, so never run it against a real project.
-- Prints one PASS/FAIL line per check and a summary.
--
\set ON_ERROR_STOP 0
\pset tuples_only on
\pset format unaligned
SET client_min_messages = warning;

INSERT INTO auth.users (id, instance_id, aud, role, email, created_at) VALUES
  ('aaaaaaaa-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'admin@test', now() - interval '3 days'),
  ('bbbbbbbb-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'b@test', now() - interval '2 days'),
  ('cccccccc-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'c@test', now() - interval '1 day');
DELETE FROM public.user_roles;
INSERT INTO public.user_roles (user_id, role) VALUES
  ('aaaaaaaa-0000-0000-0000-000000000001', 'ADMIN'),
  ('bbbbbbbb-0000-0000-0000-000000000002', 'USER'),
  ('cccccccc-0000-0000-0000-000000000003', 'USER');
INSERT INTO public.company_info (name, vat_id, iban) VALUES ('Co', '1', 'HR00');
INSERT INTO public.customers (id, user_id, name) VALUES
  ('c0000000-0000-0000-0000-00000000000b', 'bbbbbbbb-0000-0000-0000-000000000002', 'B customer'),
  ('c0000000-0000-0000-0000-00000000000c', 'cccccccc-0000-0000-0000-000000000003', 'C customer');
INSERT INTO public.invoices (id, user_id, customer_id, number, date) VALUES
  ('10000000-0000-0000-0000-00000000000c', 'cccccccc-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-00000000000c', 'C-1', now());
INSERT INTO public.invoice_items (invoice_id, description) VALUES ('10000000-0000-0000-0000-00000000000c', 'C item');

CREATE TEMP TABLE results (name text, ok boolean);
GRANT ALL ON results TO authenticated;

-- as user B
BEGIN;
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub":"bbbbbbbb-0000-0000-0000-000000000002","role":"authenticated"}', true);
INSERT INTO results SELECT 'B sees only own customers', (SELECT count(*) FROM customers) = 1;
INSERT INTO results SELECT 'B cannot see C invoices', (SELECT count(*) FROM invoices) = 0;
INSERT INTO results SELECT 'B cannot see C invoice items', (SELECT count(*) FROM invoice_items) = 0;
INSERT INTO results SELECT 'B can read company_info', (SELECT count(*) FROM company_info) = 1;
INSERT INTO results SELECT 'B cannot see user_roles', (SELECT count(*) FROM user_roles) = 0;
WITH u AS (UPDATE customers SET name = 'hacked' WHERE user_id <> auth.uid() RETURNING 1)
  INSERT INTO results SELECT 'B cannot update C customer', (SELECT count(*) FROM u) = 0;
WITH u AS (UPDATE company_info SET name = 'hacked' RETURNING 1)
  INSERT INTO results SELECT 'B cannot update company_info', (SELECT count(*) FROM u) = 0;
WITH u AS (UPDATE customers SET name = 'B renamed' WHERE user_id = auth.uid() RETURNING 1)
  INSERT INTO results SELECT 'B can update own customer', (SELECT count(*) FROM u) = 1;
DO $$ BEGIN
  DELETE FROM user_roles WHERE user_id = auth.uid();
  INSERT INTO user_roles (user_id, role) VALUES (auth.uid(), 'ADMIN');
  INSERT INTO results SELECT 'B cannot self-promote to ADMIN', NOT public.is_admin();
  RAISE EXCEPTION 'undo';
EXCEPTION WHEN OTHERS THEN
  IF SQLERRM <> 'undo' THEN
    INSERT INTO results VALUES ('B cannot self-promote to ADMIN', SQLERRM LIKE 'new row violates row-level security policy%');
  END IF;
END $$;
DO $$ BEGIN
  INSERT INTO invoices (user_id, customer_id, number, date)
    VALUES (auth.uid(), 'c0000000-0000-0000-0000-00000000000c', 'B-on-C', now());
  INSERT INTO results VALUES ('B cannot invoice C customer', false);
EXCEPTION WHEN insufficient_privilege THEN
  INSERT INTO results VALUES ('B cannot invoice C customer', true);
END $$;
DO $$ BEGIN
  INSERT INTO invoices (user_id, customer_id, number, date)
    VALUES (auth.uid(), 'c0000000-0000-0000-0000-00000000000b', 'B-1', now());
  INSERT INTO results VALUES ('B can create own invoice', true);
EXCEPTION WHEN OTHERS THEN
  INSERT INTO results VALUES ('B can create own invoice', false);
END $$;
INSERT INTO results SELECT 'B cannot list user_emails',
  NOT EXISTS (SELECT 1 FROM pg_views WHERE schemaname = 'public' AND viewname = 'user_emails');
COMMIT;

-- as admin
BEGIN;
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub":"aaaaaaaa-0000-0000-0000-000000000001","role":"authenticated"}', true);
INSERT INTO results SELECT 'Admin sees all customers', (SELECT count(*) FROM customers) = 2;
INSERT INTO results SELECT 'Admin sees all invoice items', (SELECT count(*) FROM invoice_items) = 1;
INSERT INTO results SELECT 'Admin sees user_roles', (SELECT count(*) FROM user_roles) = 3;
WITH u AS (UPDATE company_info SET name = 'Co2', invoice_footer = 'Footer' RETURNING 1)
  INSERT INTO results SELECT 'Admin can update company_info', (SELECT count(*) FROM u) = 1;
COMMIT;

SELECT CASE WHEN ok THEN 'PASS ' ELSE 'FAIL ' END || name FROM results;
SELECT count(*) FILTER (WHERE ok) || ' passed / ' || count(*) FILTER (WHERE NOT ok) || ' failed' FROM results;
