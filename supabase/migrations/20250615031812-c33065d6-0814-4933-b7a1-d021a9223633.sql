
-- Membuat tabel relasi guru dengan mata pelajaran untuk mendukung team teaching
CREATE TABLE IF NOT EXISTS guru_mata_pelajaran (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_guru UUID REFERENCES guru(id_guru) ON DELETE CASCADE NOT NULL,
    id_mapel UUID REFERENCES mata_pelajaran(id_mapel) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(id_guru, id_mapel)
);

-- Index untuk performance
CREATE INDEX IF NOT EXISTS idx_guru_mata_pelajaran_guru ON guru_mata_pelajaran(id_guru);
CREATE INDEX IF NOT EXISTS idx_guru_mata_pelajaran_mapel ON guru_mata_pelajaran(id_mapel);

-- Sample data untuk testing - assign mata pelajaran ke guru yang sudah ada
INSERT INTO guru_mata_pelajaran (id_guru, id_mapel)
SELECT 
    g.id_guru,
    mp.id_mapel
FROM guru g
CROSS JOIN mata_pelajaran mp
WHERE g.nip = '197205151998022002' -- Sri Mulyati
AND mp.nama_mapel IN ('Pemrograman Web', 'Basis Data', 'Pemrograman Berorientasi Objek')
ON CONFLICT (id_guru, id_mapel) DO NOTHING;

INSERT INTO guru_mata_pelajaran (id_guru, id_mapel)
SELECT 
    g.id_guru,
    mp.id_mapel
FROM guru g
CROSS JOIN mata_pelajaran mp
WHERE g.nip = '198003102005011003' -- Bambang Sutrisno
AND mp.nama_mapel IN ('Jaringan Komputer', 'Sistem Operasi', 'Administrasi Infrastruktur Jaringan')
ON CONFLICT (id_guru, id_mapel) DO NOTHING;

INSERT INTO guru_mata_pelajaran (id_guru, id_mapel)
SELECT 
    g.id_guru,
    mp.id_mapel
FROM guru g
CROSS JOIN mata_pelajaran mp
WHERE g.nip = '198712252010012004' -- Indah Permata
AND mp.nama_mapel IN ('Desain Grafis', 'Matematika', 'Bahasa Indonesia')
ON CONFLICT (id_guru, id_mapel) DO NOTHING;

-- Admin bisa mengajar semua mata pelajaran
INSERT INTO guru_mata_pelajaran (id_guru, id_mapel)
SELECT 
    g.id_guru,
    mp.id_mapel
FROM guru g
CROSS JOIN mata_pelajaran mp
WHERE g.nip = '196801011990011001' -- Ahmad Wijaya (Admin)
ON CONFLICT (id_guru, id_mapel) DO NOTHING;
