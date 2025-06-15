
-- Add foto column to siswa table if it doesn't exist
ALTER TABLE siswa ADD COLUMN IF NOT EXISTS foto_url TEXT;

-- Create storage bucket for student photos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('student-photos', 'student-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Create policy for student photos bucket
CREATE POLICY "Anyone can view student photos" ON storage.objects
FOR SELECT USING (bucket_id = 'student-photos');

CREATE POLICY "Authenticated users can upload student photos" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'student-photos' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update student photos" ON storage.objects
FOR UPDATE USING (bucket_id = 'student-photos' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete student photos" ON storage.objects
FOR DELETE USING (bucket_id = 'student-photos' AND auth.role() = 'authenticated');
