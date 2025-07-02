
-- Modify the PresensiTable to use jam_pelajaran instead of waktu_mulai/waktu_selesai for absensi mapping
-- Update the status_absensi mapping to use jp_X format instead of jam_X format
-- This will make the absensi mapping consistent with jam_pelajaran

-- First, let's ensure we have the jam_pelajaran column properly set up
-- (This should already exist from previous migration)

-- Update the absensi table to better support jam_pelajaran based tracking
ALTER TABLE absensi ADD COLUMN IF NOT EXISTS jam_pelajaran INTEGER;

-- Update existing absensi records to have jam_pelajaran from their related jurnal
UPDATE absensi 
SET jam_pelajaran = jh.jam_pelajaran
FROM jurnal_harian jh 
WHERE absensi.id_jurnal = jh.id_jurnal 
AND absensi.jam_pelajaran IS NULL;

-- Create a trigger to automatically set jam_pelajaran when inserting absensi
CREATE OR REPLACE FUNCTION set_absensi_jam_pelajaran()
RETURNS TRIGGER AS $$
BEGIN
    -- Get jam_pelajaran from related jurnal_harian
    SELECT jam_pelajaran INTO NEW.jam_pelajaran
    FROM jurnal_harian 
    WHERE id_jurnal = NEW.id_jurnal;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for absensi
DROP TRIGGER IF EXISTS trigger_set_absensi_jam_pelajaran ON absensi;
CREATE TRIGGER trigger_set_absensi_jam_pelajaran
    BEFORE INSERT OR UPDATE ON absensi
    FOR EACH ROW
    EXECUTE FUNCTION set_absensi_jam_pelajaran();
