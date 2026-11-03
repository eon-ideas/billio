-- Restore role-based Row Level Security
--
-- Earlier migrations (20250515_simplify_auth_policies, 20250515_fix_rls_policies) granted every
-- authenticated user full access to all tables, including user_roles, which let any user make
-- themselves ADMIN. Policies are OR-ed, so the stricter policies added later had no effect.
--
-- This migration drops every policy on the application tables and recreates the intended model:
--   ADMIN: full CRUD on all tables
--   USER:  read company_info and email_templates;
--          CRUD on their own customers, invoices and invoice_items;
--          no direct access to user_roles (roles are read through get_user_role())

-- Read-only admin check, safe to call inside policies (get_user_role() may write a role row,
-- which fails in read-only transactions)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'ADMIN'
  );
$$;

ALTER FUNCTION public.get_user_role() SET search_path = public;

-- Drop every existing policy on the application tables
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN
    SELECT policyname, tablename
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename IN (
        'company_info', 'customers', 'invoices', 'invoice_items', 'email_templates', 'user_roles'
      )
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', pol.policyname, pol.tablename);
  END LOOP;
END $$;

ALTER TABLE public.company_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Admins: full access everywhere
CREATE POLICY "Admins have full access to company_info" ON public.company_info
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admins have full access to customers" ON public.customers
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admins have full access to invoices" ON public.invoices
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admins have full access to invoice_items" ON public.invoice_items
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admins have full access to email_templates" ON public.email_templates
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admins have full access to user_roles" ON public.user_roles
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Users: read shared company data
CREATE POLICY "Users can read company_info" ON public.company_info
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can read email_templates" ON public.email_templates
  FOR SELECT TO authenticated USING (true);

-- Users: CRUD on records they created
CREATE POLICY "Users manage their own customers" ON public.customers
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users manage their own invoices" ON public.invoices
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.customers c
      WHERE c.id = customer_id AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "Users manage items of their own invoices" ON public.invoice_items
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.invoices i
    WHERE i.id = invoice_id AND i.user_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.invoices i
    WHERE i.id = invoice_id AND i.user_id = auth.uid()
  ));

-- Remove helpers that exposed every user's email address (unused by the app)
DROP VIEW IF EXISTS public.user_emails;
DROP FUNCTION IF EXISTS public.get_multiple_user_profiles(UUID[]);

-- Leftovers from the removed support chat: drop allow-all policies (RLS stays on, so access is denied)
DO $$
BEGIN
  IF to_regclass('public.documents') IS NOT NULL THEN
    DROP POLICY IF EXISTS "Authenticated users can perform all operations on documents"
      ON public.documents;
  END IF;
  IF to_regclass('public.chat_histories') IS NOT NULL THEN
    DROP POLICY IF EXISTS "Authenticated users can perform all operations on chat_histories"
      ON public.chat_histories;
  END IF;
END $$;

-- Storage: only admins may change the company logo; users may only write their own avatar
DROP POLICY IF EXISTS "Authenticated users can upload files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update files" ON storage.objects;

CREATE POLICY "Admins manage company logos" ON storage.objects
  FOR ALL TO authenticated
  USING (
    bucket_id = 'public'
    AND (storage.foldername(name))[1] = 'company-logos'
    AND public.is_admin()
  )
  WITH CHECK (
    bucket_id = 'public'
    AND (storage.foldername(name))[1] = 'company-logos'
    AND public.is_admin()
  );

CREATE POLICY "Users manage their own avatar" ON storage.objects
  FOR ALL TO authenticated
  USING (
    bucket_id = 'public'
    AND (storage.foldername(name))[1] = 'user-avatars'
    AND storage.filename(name) LIKE auth.uid()::text || '-%'
  )
  WITH CHECK (
    bucket_id = 'public'
    AND (storage.foldername(name))[1] = 'user-avatars'
    AND storage.filename(name) LIKE auth.uid()::text || '-%'
  );
