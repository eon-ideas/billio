-- Legal footer printed at the bottom of every invoice (previously hardcoded in InvoicePreview.vue)
alter table public.company_info
add column if not exists invoice_footer text;
