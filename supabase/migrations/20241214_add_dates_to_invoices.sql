-- Add delivery_date and due_date columns to invoices table
ALTER TABLE invoices 
  ADD COLUMN delivery_date date,
  ADD COLUMN due_date date;
