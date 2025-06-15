
-- Hapus foreign key terkait jurnal_harian jika ada
ALTER TABLE public.nilai DROP CONSTRAINT IF EXISTS nilai_id_jurnal_fkey;

-- Hapus kolom id_jurnal dari tabel nilai
ALTER TABLE public.nilai DROP COLUMN IF EXISTS id_jurnal;
