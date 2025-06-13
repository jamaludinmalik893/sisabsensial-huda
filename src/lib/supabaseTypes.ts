
// SQL Schema untuk Supabase Database SMK AL-HUDA

export const createTablesSQL = `
-- Tabel Guru
CREATE TABLE IF NOT EXISTS guru (
    id_guru UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nip VARCHAR(20) UNIQUE NOT NULL,
    nama_lengkap VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    nomor_telepon VARCHAR(15),
    alamat TEXT,
    wali_kelas UUID REFERENCES kelas(id_kelas),
    status VARCHAR(10) CHECK (status IN ('admin', 'guru')) DEFAULT 'guru',
    foto_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabel Kelas
CREATE TABLE IF NOT EXISTS kelas (
    id_kelas UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nama_kelas VARCHAR(50) UNIQUE NOT NULL,
    logo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabel Mata Pelajaran
CREATE TABLE IF NOT EXISTS mata_pelajaran (
    id_mapel UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nama_mapel VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabel Siswa
CREATE TABLE IF NOT EXISTS siswa (
    id_siswa UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nisn VARCHAR(20) UNIQUE NOT NULL,
    nama_lengkap VARCHAR(100) NOT NULL,
    jenis_kelamin VARCHAR(10) CHECK (jenis_kelamin IN ('Laki-laki', 'Perempuan')) NOT NULL,
    tanggal_lahir DATE NOT NULL,
    tempat_lahir VARCHAR(50) NOT NULL,
    alamat TEXT NOT NULL,
    nomor_telepon VARCHAR(15),
    nama_orang_tua VARCHAR(100) NOT NULL,
    nomor_telepon_orang_tua VARCHAR(15),
    id_kelas UUID REFERENCES kelas(id_kelas) ON DELETE SET NULL,
    id_guru_wali UUID REFERENCES guru(id_guru) ON DELETE SET NULL,
    tahun_masuk INTEGER NOT NULL,
    foto_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabel Jurnal Harian
CREATE TABLE IF NOT EXISTS jurnal_harian (
    id_jurnal UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_guru UUID REFERENCES guru(id_guru) ON DELETE CASCADE NOT NULL,
    id_mapel UUID REFERENCES mata_pelajaran(id_mapel) ON DELETE CASCADE NOT NULL,
    id_kelas UUID REFERENCES kelas(id_kelas) ON DELETE CASCADE NOT NULL,
    tanggal_pelajaran DATE NOT NULL,
    waktu_mulai TIME NOT NULL,
    waktu_selesai TIME NOT NULL,
    judul_materi VARCHAR(200) NOT NULL,
    materi_diajarkan TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabel Absensi
CREATE TABLE IF NOT EXISTS absensi (
    id_absensi UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_jurnal UUID REFERENCES jurnal_harian(id_jurnal) ON DELETE CASCADE NOT NULL,
    id_siswa UUID REFERENCES siswa(id_siswa) ON DELETE CASCADE NOT NULL,
    status VARCHAR(10) CHECK (status IN ('Hadir', 'Izin', 'Sakit', 'Alpha')) NOT NULL,
    catatan TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(id_jurnal, id_siswa)
);

-- Tabel Nilai
CREATE TABLE IF NOT EXISTS nilai (
    id_nilai UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_siswa UUID REFERENCES siswa(id_siswa) ON DELETE CASCADE NOT NULL,
    id_mapel UUID REFERENCES mata_pelajaran(id_mapel) ON DELETE CASCADE NOT NULL,
    id_jurnal UUID REFERENCES jurnal_harian(id_jurnal) ON DELETE CASCADE NOT NULL,
    jenis_nilai VARCHAR(50) NOT NULL,
    skor DECIMAL(5,2) NOT NULL CHECK (skor >= 0 AND skor <= 100),
    tanggal_nilai DATE NOT NULL,
    catatan TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes untuk performance
CREATE INDEX IF NOT EXISTS idx_guru_nip ON guru(nip);
CREATE INDEX IF NOT EXISTS idx_guru_email ON guru(email);
CREATE INDEX IF NOT EXISTS idx_siswa_nisn ON siswa(nisn);
CREATE INDEX IF NOT EXISTS idx_siswa_kelas ON siswa(id_kelas);
CREATE INDEX IF NOT EXISTS idx_jurnal_tanggal ON jurnal_harian(tanggal_pelajaran);
CREATE INDEX IF NOT EXISTS idx_absensi_jurnal ON absensi(id_jurnal);
CREATE INDEX IF NOT EXISTS idx_absensi_siswa ON absensi(id_siswa);
CREATE INDEX IF NOT EXISTS idx_nilai_siswa ON nilai(id_siswa);
CREATE INDEX IF NOT EXISTS idx_nilai_mapel ON nilai(id_mapel);

-- Sample Data untuk Testing
-- Data Kelas
INSERT INTO kelas (nama_kelas) VALUES 
('X RPL 1'), ('X RPL 2'), ('XI RPL 1'), ('XI RPL 2'), ('XII RPL 1'), ('XII RPL 2'),
('X TKJ 1'), ('X TKJ 2'), ('XI TKJ 1'), ('XI TKJ 2'), ('XII TKJ 1'), ('XII TKJ 2')
ON CONFLICT (nama_kelas) DO NOTHING;

-- Data Mata Pelajaran
INSERT INTO mata_pelajaran (nama_mapel) VALUES 
('Matematika'), ('Bahasa Indonesia'), ('Bahasa Inggris'), ('Pemrograman Web'),
('Basis Data'), ('Jaringan Komputer'), ('Sistem Operasi'), ('Pemrograman Berorientasi Objek'),
('Desain Grafis'), ('Administrasi Infrastruktur Jaringan')
ON CONFLICT (nama_mapel) DO NOTHING;

-- Data Guru (password: 'admin123' dan 'guru123' - akan di-hash di aplikasi)
INSERT INTO guru (nip, nama_lengkap, email, password, nomor_telepon, status, alamat) VALUES 
('196801011990011001', 'Drs. Ahmad Wijaya, M.Pd', 'ahmad.wijaya@smkalhuda.sch.id', '$2a$10$example', '081234567890', 'admin', 'Jl. Veteran No. 123, Kediri'),
('197205151998022002', 'Sri Mulyati, S.Kom', 'sri.mulyati@smkalhuda.sch.id', '$2a$10$example', '081234567891', 'guru', 'Jl. Hayam Wuruk No. 45, Kediri'),
('198003102005011003', 'Bambang Sutrisno, S.T', 'bambang.sutrisno@smkalhuda.sch.id', '$2a$10$example', '081234567892', 'guru', 'Jl. Brawijaya No. 78, Kediri'),
('198712252010012004', 'Indah Permata, S.Pd', 'indah.permata@smkalhuda.sch.id', '$2a$10$example', '081234567893', 'guru', 'Jl. Diponegoro No. 56, Kediri')
ON CONFLICT (nip) DO NOTHING;

-- Update wali kelas setelah data guru dan kelas ada
UPDATE guru SET wali_kelas = (SELECT id_kelas FROM kelas WHERE nama_kelas = 'X RPL 1' LIMIT 1)
WHERE nip = '197205151998022002';

UPDATE guru SET wali_kelas = (SELECT id_kelas FROM kelas WHERE nama_kelas = 'XI RPL 1' LIMIT 1)
WHERE nip = '198003102005011003';
`;

export const sampleDataSQL = `
-- Sample Data Siswa (akan dijalankan setelah tabel utama)
INSERT INTO siswa (nisn, nama_lengkap, jenis_kelamin, tanggal_lahir, tempat_lahir, alamat, nama_orang_tua, nomor_telepon_orang_tua, id_kelas, id_guru_wali, tahun_masuk) 
SELECT 
    '0123456789' || LPAD(generate_series::text, 2, '0') as nisn,
    CASE 
        WHEN generate_series % 4 = 1 THEN 'Ahmad Rizki Pratama'
        WHEN generate_series % 4 = 2 THEN 'Siti Nurhaliza'
        WHEN generate_series % 4 = 3 THEN 'Budi Santoso'
        ELSE 'Dewi Sartika'
    END as nama_lengkap,
    CASE WHEN generate_series % 2 = 1 THEN 'Laki-laki' ELSE 'Perempuan' END as jenis_kelamin,
    '2006-01-01'::date + (generate_series || ' days')::interval as tanggal_lahir,
    'Kediri' as tempat_lahir,
    'Jl. Contoh No. ' || generate_series || ', Kediri' as alamat,
    'Orang Tua ' || generate_series as nama_orang_tua,
    '0812345678' || LPAD(generate_series::text, 2, '0') as nomor_telepon_orang_tua,
    (SELECT id_kelas FROM kelas WHERE nama_kelas = 'X RPL 1' LIMIT 1) as id_kelas,
    (SELECT id_guru FROM guru WHERE nip = '197205151998022002' LIMIT 1) as id_guru_wali,
    2024 as tahun_masuk
FROM generate_series(1, 20)
ON CONFLICT (nisn) DO NOTHING;
`;
