-- Add subtotal and vat columns to invoices table
ALTER TABLE invoices 
  ADD COLUMN subtotal numeric(10,2) NOT NULL DEFAULT 0,
  ADD COLUMN vat numeric(10,2) NOT NULL DEFAULT 0;

-- Update existing invoices to set subtotal equal to total since they were created without VAT
UPDATE invoices SET subtotal = total WHERE subtotal = 0;
