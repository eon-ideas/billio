-- Migration to remove the 'address' field from company_info table
ALTER TABLE public.company_info
DROP COLUMN IF EXISTS address;
