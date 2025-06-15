
-- Menambahkan kolom nomor_telepon_siswa ke tabel siswa
ALTER TABLE siswa ADD COLUMN nomor_telepon_siswa VARCHAR(15);

-- Menambahkan index untuk performa pencarian
CREATE INDEX IF NOT EXISTS idx_siswa_telepon ON siswa(nomor_telepon_siswa);

-- Update beberapa data sample untuk testing dengan pendekatan yang berbeda
WITH numbered_siswa AS (
  SELECT id_siswa, ROW_NUMBER() OVER() as rn
  FROM siswa 
  WHERE nomor_telepon_siswa IS NULL 
  LIMIT 10
)
UPDATE siswa 
SET nomor_telepon_siswa = '0812345678' || LPAD(numbered_siswa.rn::text, 2, '0')
FROM numbered_siswa
WHERE siswa.id_siswa = numbered_siswa.id_siswa;
