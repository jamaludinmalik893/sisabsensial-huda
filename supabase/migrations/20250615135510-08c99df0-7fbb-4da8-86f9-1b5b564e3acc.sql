
-- 1. Buat storage bucket untuk foto profil jika belum ada
INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-photos', 'profile-photos', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Tambah kolom foto_url ke tabel guru jika belum ada
ALTER TABLE guru ADD COLUMN IF NOT EXISTS foto_url TEXT;

-- 3. Kebijakan bucket (public GET, hanya owner boleh upload), contoh paling longgar:
CREATE POLICY "Anyone can view profile photos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'profile-photos');

CREATE POLICY "Anyone can upload profile photos"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'profile-photos');

CREATE POLICY "Anyone can update profile photos"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'profile-photos');

CREATE POLICY "Anyone can delete profile photos"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'profile-photos');

-- 4. (Optional) RLS: Enable user self-update di tabel guru/siswa jika ingin benar-benar aman,
--    berikut hanyalah contoh, sesuaikan dengan strategi login produksi Anda.
-- (Note: Autentikasi penuh dengan ‘auth.uid()’ perlu implementasi penuh Supabase Auth)
-- ALTER TABLE guru ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE siswa ENABLE ROW LEVEL SECURITY;

-- CREATE POLICY "Guru can update self" ON guru
-- FOR UPDATE USING (auth.uid() = id_guru);
-- CREATE POLICY "Siswa can update self" ON siswa
-- FOR UPDATE USING (auth.uid() = id_siswa);

