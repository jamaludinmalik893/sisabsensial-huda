
-- Add new columns to nilai table for custom task titles and creation date
ALTER TABLE nilai 
ADD COLUMN judul_tugas VARCHAR(200),
ADD COLUMN tanggal_tugas_dibuat DATE DEFAULT CURRENT_DATE;

-- Update existing records to have default task titles based on jenis_nilai
UPDATE nilai 
SET judul_tugas = jenis_nilai || ' - ' || TO_CHAR(tanggal_nilai, 'DD/MM/YYYY'),
    tanggal_tugas_dibuat = tanggal_nilai
WHERE judul_tugas IS NULL;

-- Make judul_tugas not null after setting defaults
ALTER TABLE nilai 
ALTER COLUMN judul_tugas SET NOT NULL;
