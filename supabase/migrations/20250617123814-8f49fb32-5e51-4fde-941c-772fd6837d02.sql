
-- Create view for attendance statistics per class
CREATE OR REPLACE VIEW v_statistik_kehadiran_kelas AS
SELECT 
    k.id_kelas,
    k.nama_kelas,
    COUNT(DISTINCT s.id_siswa) as total_siswa,
    COUNT(CASE WHEN a.status = 'Hadir' THEN 1 END) as total_hadir,
    COUNT(CASE WHEN a.status = 'Izin' THEN 1 END) as total_izin,
    COUNT(CASE WHEN a.status = 'Sakit' THEN 1 END) as total_sakit,
    COUNT(CASE WHEN a.status = 'Alpha' THEN 1 END) as total_alpha,
    COUNT(a.id_absensi) as total_pertemuan,
    CASE 
        WHEN COUNT(a.id_absensi) > 0 
        THEN ROUND((COUNT(CASE WHEN a.status = 'Hadir' THEN 1 END) * 100.0 / COUNT(a.id_absensi)), 2)
        ELSE 0 
    END as persentase_hadir
FROM kelas k
LEFT JOIN siswa s ON k.id_kelas = s.id_kelas
LEFT JOIN absensi a ON s.id_siswa = a.id_siswa
LEFT JOIN jurnal_harian jh ON a.id_jurnal = jh.id_jurnal
GROUP BY k.id_kelas, k.nama_kelas;

-- Create view for detailed student attendance statistics
CREATE OR REPLACE VIEW v_statistik_kehadiran_siswa AS
SELECT 
    s.id_siswa,
    s.nama_lengkap,
    s.nisn,
    k.nama_kelas,
    mp.nama_mapel,
    g.id_guru,
    COUNT(CASE WHEN a.status = 'Hadir' THEN 1 END) as total_hadir,
    COUNT(CASE WHEN a.status = 'Izin' THEN 1 END) as total_izin,
    COUNT(CASE WHEN a.status = 'Sakit' THEN 1 END) as total_sakit,
    COUNT(CASE WHEN a.status = 'Alpha' THEN 1 END) as total_alpha,
    COUNT(a.id_absensi) as total_pertemuan,
    CASE 
        WHEN COUNT(a.id_absensi) > 0 
        THEN ROUND((COUNT(CASE WHEN a.status = 'Hadir' THEN 1 END) * 100.0 / COUNT(a.id_absensi)), 2)
        ELSE 0 
    END as persentase_hadir,
    jh.tanggal_pelajaran
FROM siswa s
JOIN kelas k ON s.id_kelas = k.id_kelas
LEFT JOIN absensi a ON s.id_siswa = a.id_siswa
LEFT JOIN jurnal_harian jh ON a.id_jurnal = jh.id_jurnal
LEFT JOIN mata_pelajaran mp ON jh.id_mapel = mp.id_mapel
LEFT JOIN guru g ON jh.id_guru = g.id_guru
GROUP BY s.id_siswa, s.nama_lengkap, s.nisn, k.nama_kelas, mp.nama_mapel, g.id_guru, jh.tanggal_pelajaran;

-- Create view for grade statistics
CREATE OR REPLACE VIEW v_statistik_nilai AS
SELECT 
    s.id_siswa,
    s.nama_lengkap,
    s.nisn,
    k.nama_kelas,
    mp.nama_mapel,
    n.jenis_nilai,
    AVG(n.skor) as rata_rata,
    MIN(n.skor) as nilai_minimum,
    MAX(n.skor) as nilai_maksimum,
    COUNT(n.id_nilai) as jumlah_nilai,
    n.tanggal_nilai
FROM siswa s
JOIN kelas k ON s.id_kelas = k.id_kelas
LEFT JOIN nilai n ON s.id_siswa = n.id_siswa
LEFT JOIN mata_pelajaran mp ON n.id_mapel = mp.id_mapel
GROUP BY s.id_siswa, s.nama_lengkap, s.nisn, k.nama_kelas, mp.nama_mapel, n.jenis_nilai, n.tanggal_nilai;

-- Function to get attendance statistics with filters
CREATE OR REPLACE FUNCTION get_attendance_statistics(
    p_guru_id UUID,
    p_start_date DATE DEFAULT NULL,
    p_end_date DATE DEFAULT NULL,
    p_kelas_id UUID DEFAULT NULL,
    p_mapel_id UUID DEFAULT NULL
)
RETURNS TABLE (
    nama_siswa TEXT,
    nisn TEXT,
    kelas TEXT,
    total_hadir BIGINT,
    total_izin BIGINT,
    total_sakit BIGINT,
    total_alpha BIGINT,
    total_pertemuan BIGINT,
    persentase_hadir NUMERIC
) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.nama_lengkap::TEXT,
        s.nisn::TEXT,
        k.nama_kelas::TEXT,
        COUNT(CASE WHEN a.status = 'Hadir' THEN 1 END),
        COUNT(CASE WHEN a.status = 'Izin' THEN 1 END),
        COUNT(CASE WHEN a.status = 'Sakit' THEN 1 END),
        COUNT(CASE WHEN a.status = 'Alpha' THEN 1 END),
        COUNT(a.id_absensi),
        CASE 
            WHEN COUNT(a.id_absensi) > 0 
            THEN ROUND((COUNT(CASE WHEN a.status = 'Hadir' THEN 1 END) * 100.0 / COUNT(a.id_absensi)), 2)
            ELSE 0 
        END
    FROM siswa s
    JOIN kelas k ON s.id_kelas = k.id_kelas
    LEFT JOIN absensi a ON s.id_siswa = a.id_siswa
    LEFT JOIN jurnal_harian jh ON a.id_jurnal = jh.id_jurnal
    WHERE jh.id_guru = p_guru_id
        AND (p_start_date IS NULL OR jh.tanggal_pelajaran >= p_start_date)
        AND (p_end_date IS NULL OR jh.tanggal_pelajaran <= p_end_date)
        AND (p_kelas_id IS NULL OR k.id_kelas = p_kelas_id)
        AND (p_mapel_id IS NULL OR jh.id_mapel = p_mapel_id)
    GROUP BY s.id_siswa, s.nama_lengkap, s.nisn, k.nama_kelas
    ORDER BY k.nama_kelas, s.nama_lengkap;
END;
$$;

-- Function to get class attendance statistics
CREATE OR REPLACE FUNCTION get_class_attendance_stats(
    p_guru_id UUID,
    p_start_date DATE DEFAULT NULL,
    p_end_date DATE DEFAULT NULL,
    p_kelas_id UUID DEFAULT NULL,
    p_mapel_id UUID DEFAULT NULL
)
RETURNS TABLE (
    nama_kelas TEXT,
    total_hadir BIGINT,
    total_izin BIGINT,
    total_sakit BIGINT,
    total_alpha BIGINT,
    persentase_hadir NUMERIC
) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        k.nama_kelas::TEXT,
        COUNT(CASE WHEN a.status = 'Hadir' THEN 1 END),
        COUNT(CASE WHEN a.status = 'Izin' THEN 1 END),
        COUNT(CASE WHEN a.status = 'Sakit' THEN 1 END),
        COUNT(CASE WHEN a.status = 'Alpha' THEN 1 END),
        CASE 
            WHEN COUNT(a.id_absensi) > 0 
            THEN ROUND((COUNT(CASE WHEN a.status = 'Hadir' THEN 1 END) * 100.0 / COUNT(a.id_absensi)), 2)
            ELSE 0 
        END
    FROM kelas k
    LEFT JOIN siswa s ON k.id_kelas = s.id_kelas
    LEFT JOIN absensi a ON s.id_siswa = a.id_siswa
    LEFT JOIN jurnal_harian jh ON a.id_jurnal = jh.id_jurnal
    WHERE jh.id_guru = p_guru_id
        AND (p_start_date IS NULL OR jh.tanggal_pelajaran >= p_start_date)
        AND (p_end_date IS NULL OR jh.tanggal_pelajaran <= p_end_date)
        AND (p_kelas_id IS NULL OR k.id_kelas = p_kelas_id)
        AND (p_mapel_id IS NULL OR jh.id_mapel = p_mapel_id)
    GROUP BY k.id_kelas, k.nama_kelas
    ORDER BY k.nama_kelas;
END;
$$;

-- Function to get attendance trend data
CREATE OR REPLACE FUNCTION get_attendance_trend(
    p_guru_id UUID,
    p_start_date DATE DEFAULT NULL,
    p_end_date DATE DEFAULT NULL,
    p_period TEXT DEFAULT 'monthly' -- 'daily', 'weekly', 'monthly'
)
RETURNS TABLE (
    periode TEXT,
    persentase_hadir NUMERIC
) 
LANGUAGE plpgsql
AS $$
BEGIN
    IF p_period = 'monthly' THEN
        RETURN QUERY
        SELECT 
            TO_CHAR(jh.tanggal_pelajaran, 'YYYY-MM')::TEXT,
            ROUND((COUNT(CASE WHEN a.status = 'Hadir' THEN 1 END) * 100.0 / COUNT(a.id_absensi)), 2)
        FROM absensi a
        JOIN jurnal_harian jh ON a.id_jurnal = jh.id_jurnal
        WHERE jh.id_guru = p_guru_id
            AND (p_start_date IS NULL OR jh.tanggal_pelajaran >= p_start_date)
            AND (p_end_date IS NULL OR jh.tanggal_pelajaran <= p_end_date)
        GROUP BY TO_CHAR(jh.tanggal_pelajaran, 'YYYY-MM')
        ORDER BY TO_CHAR(jh.tanggal_pelajaran, 'YYYY-MM');
    ELSIF p_period = 'weekly' THEN
        RETURN QUERY
        SELECT 
            TO_CHAR(jh.tanggal_pelajaran, 'YYYY-"W"WW')::TEXT,
            ROUND((COUNT(CASE WHEN a.status = 'Hadir' THEN 1 END) * 100.0 / COUNT(a.id_absensi)), 2)
        FROM absensi a
        JOIN jurnal_harian jh ON a.id_jurnal = jh.id_jurnal
        WHERE jh.id_guru = p_guru_id
            AND (p_start_date IS NULL OR jh.tanggal_pelajaran >= p_start_date)
            AND (p_end_date IS NULL OR jh.tanggal_pelajaran <= p_end_date)
        GROUP BY TO_CHAR(jh.tanggal_pelajaran, 'YYYY-"W"WW')
        ORDER BY TO_CHAR(jh.tanggal_pelajaran, 'YYYY-"W"WW');
    ELSE -- daily
        RETURN QUERY
        SELECT 
            jh.tanggal_pelajaran::TEXT,
            ROUND((COUNT(CASE WHEN a.status = 'Hadir' THEN 1 END) * 100.0 / COUNT(a.id_absensi)), 2)
        FROM absensi a
        JOIN jurnal_harian jh ON a.id_jurnal = jh.id_jurnal
        WHERE jh.id_guru = p_guru_id
            AND (p_start_date IS NULL OR jh.tanggal_pelajaran >= p_start_date)
            AND (p_end_date IS NULL OR jh.tanggal_pelajaran <= p_end_date)
        GROUP BY jh.tanggal_pelajaran
        ORDER BY jh.tanggal_pelajaran;
    END IF;
END;
$$;
