
-- Create storage bucket for PDF uploads
INSERT INTO storage.buckets (id, name, public) VALUES ('study-documents', 'study-documents', false);

-- Users can upload their own documents
CREATE POLICY "Users can upload own documents" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'study-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Users can view their own documents
CREATE POLICY "Users can view own documents" ON storage.objects
FOR SELECT USING (bucket_id = 'study-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Users can delete their own documents
CREATE POLICY "Users can delete own documents" ON storage.objects
FOR DELETE USING (bucket_id = 'study-documents' AND auth.uid()::text = (storage.foldername(name))[1]);
