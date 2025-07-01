
-- Add jam_pelajaran column to jurnal_harian table
ALTER TABLE jurnal_harian ADD COLUMN jam_pelajaran INTEGER;

-- Update existing records to have lesson hours based on waktu_mulai
UPDATE jurnal_harian 
SET jam_pelajaran = CASE 
    WHEN waktu_mulai >= '07:00' AND waktu_mulai < '07:45' THEN 1
    WHEN waktu_mulai >= '07:45' AND waktu_mulai < '08:30' THEN 2
    WHEN waktu_mulai >= '08:30' AND waktu_mulai < '09:15' THEN 3
    WHEN waktu_mulai >= '09:15' AND waktu_mulai < '10:00' THEN 4
    WHEN waktu_mulai >= '10:15' AND waktu_mulai < '11:00' THEN 5
    WHEN waktu_mulai >= '11:00' AND waktu_mulai < '11:45' THEN 6
    WHEN waktu_mulai >= '11:45' AND waktu_mulai < '12:30' THEN 7
    WHEN waktu_mulai >= '12:30' AND waktu_mulai < '13:15' THEN 8
    WHEN waktu_mulai >= '13:15' AND waktu_mulai < '14:00' THEN 9
    WHEN waktu_mulai >= '14:00' AND waktu_mulai < '14:45' THEN 10
    WHEN waktu_mulai >= '14:45' AND waktu_mulai < '15:30' THEN 11
    WHEN waktu_mulai >= '15:30' AND waktu_mulai < '16:15' THEN 12
    ELSE 1
END;

-- Add constraint to ensure jam_pelajaran is between 1-12
ALTER TABLE jurnal_harian ADD CONSTRAINT check_jam_pelajaran CHECK (jam_pelajaran >= 1 AND jam_pelajaran <= 12);
