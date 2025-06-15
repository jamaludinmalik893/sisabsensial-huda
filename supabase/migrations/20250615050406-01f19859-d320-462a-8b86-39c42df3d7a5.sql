
-- Update storage policies for student-photos bucket
-- First, drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view student photos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload student photos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update student photos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete student photos" ON storage.objects;

-- Create new policies with correct conditions
CREATE POLICY "Public can view student photos" ON storage.objects
FOR SELECT USING (bucket_id = 'student-photos');

CREATE POLICY "Anyone can upload student photos" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'student-photos');

CREATE POLICY "Anyone can update student photos" ON storage.objects
FOR UPDATE USING (bucket_id = 'student-photos');

CREATE POLICY "Anyone can delete student photos" ON storage.objects
FOR DELETE USING (bucket_id = 'student-photos');
