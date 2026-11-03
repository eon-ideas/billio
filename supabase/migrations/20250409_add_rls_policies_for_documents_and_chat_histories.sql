-- Enable Row Level Security for documents table
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users to perform all operations on documents
CREATE POLICY "Authenticated users can perform all operations on documents" 
ON public.documents
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Revoke access from anon users for documents
REVOKE ALL ON TABLE public.documents FROM anon;

-- Enable Row Level Security for chat_histories table
ALTER TABLE public.chat_histories ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users to perform all operations on chat_histories
CREATE POLICY "Authenticated users can perform all operations on chat_histories" 
ON public.chat_histories
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Revoke access from anon users for chat_histories
REVOKE ALL ON TABLE public.chat_histories FROM anon;
