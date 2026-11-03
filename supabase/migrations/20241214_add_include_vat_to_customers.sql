-- Add include_vat column to customers table
ALTER TABLE customers ADD COLUMN include_vat boolean NOT NULL DEFAULT false;

-- Update existing rows to have include_vat set to false
UPDATE customers SET include_vat = false WHERE include_vat IS NULL;
