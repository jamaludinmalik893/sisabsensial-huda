
-- Add semester enum type
CREATE TYPE semester_type AS ENUM ('Ganjil', 'Genap');

-- Add semester columns to existing tables
ALTER TABLE jurnal_harian ADD COLUMN semester semester_type;
ALTER TABLE nilai ADD COLUMN semester semester_type;
ALTER TABLE absensi ADD COLUMN semester semester_type;

-- Create function to determine semester based on date
CREATE OR REPLACE FUNCTION get_semester_from_date(input_date DATE)
RETURNS semester_type AS $$
BEGIN
    IF EXTRACT(MONTH FROM input_date) BETWEEN 7 AND 12 THEN
        RETURN 'Ganjil'::semester_type;
    ELSE
        RETURN 'Genap'::semester_type;
    END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Create function to auto-set semester on insert/update
CREATE OR REPLACE FUNCTION set_semester_from_date()
RETURNS TRIGGER AS $$
BEGIN
    -- For jurnal_harian
    IF TG_TABLE_NAME = 'jurnal_harian' THEN
        NEW.semester = get_semester_from_date(NEW.tanggal_pelajaran);
    END IF;
    
    -- For nilai
    IF TG_TABLE_NAME = 'nilai' THEN
        NEW.semester = get_semester_from_date(NEW.tanggal_nilai);
    END IF;
    
    -- For absensi (get date from related jurnal)
    IF TG_TABLE_NAME = 'absensi' THEN
        SELECT get_semester_from_date(jh.tanggal_pelajaran) INTO NEW.semester
        FROM jurnal_harian jh 
        WHERE jh.id_jurnal = NEW.id_jurnal;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER set_semester_jurnal
    BEFORE INSERT OR UPDATE ON jurnal_harian
    FOR EACH ROW
    EXECUTE FUNCTION set_semester_from_date();

CREATE TRIGGER set_semester_nilai
    BEFORE INSERT OR UPDATE ON nilai
    FOR EACH ROW
    EXECUTE FUNCTION set_semester_from_date();

CREATE TRIGGER set_semester_absensi
    BEFORE INSERT OR UPDATE ON absensi
    FOR EACH ROW
    EXECUTE FUNCTION set_semester_from_date();

-- Update existing data with semesters
UPDATE jurnal_harian SET semester = get_semester_from_date(tanggal_pelajaran);
UPDATE nilai SET semester = get_semester_from_date(tanggal_nilai);
UPDATE absensi SET semester = (
    SELECT get_semester_from_date(jh.tanggal_pelajaran)
    FROM jurnal_harian jh
    WHERE jh.id_jurnal = absensi.id_jurnal
);

-- Update attendance statistics function to include semester
CREATE OR REPLACE FUNCTION public.get_attendance_statistics(
    p_guru_id uuid, 
    p_start_date date DEFAULT NULL::date, 
    p_end_date date DEFAULT NULL::date, 
    p_kelas_id uuid DEFAULT NULL::uuid, 
    p_mapel_id uuid DEFAULT NULL::uuid,
    p_semester semester_type DEFAULT NULL::semester_type
)
RETURNS TABLE(nama_siswa text, nisn text, kelas text, total_hadir bigint, total_izin bigint, total_sakit bigint, total_alpha bigint, total_pertemuan bigint, persentase_hadir numeric)
LANGUAGE plpgsql
AS $function$
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
        AND (p_semester IS NULL OR jh.semester = p_semester)
    GROUP BY s.id_siswa, s.nama_lengkap, s.nisn, k.nama_kelas
    ORDER BY k.nama_kelas, s.nama_lengkap;
END;
$function$;

-- Update class attendance statistics function to include semester
CREATE OR REPLACE FUNCTION public.get_class_attendance_stats(
    p_guru_id uuid, 
    p_start_date date DEFAULT NULL::date, 
    p_end_date date DEFAULT NULL::date, 
    p_kelas_id uuid DEFAULT NULL::uuid, 
    p_mapel_id uuid DEFAULT NULL::uuid,
    p_semester semester_type DEFAULT NULL::semester_type
)
RETURNS TABLE(nama_kelas text, total_hadir bigint, total_izin bigint, total_sakit bigint, total_alpha bigint, persentase_hadir numeric)
LANGUAGE plpgsql
AS $function$
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
        AND (p_semester IS NULL OR jh.semester = p_semester)
    GROUP BY k.id_kelas, k.nama_kelas
    ORDER BY k.nama_kelas;
END;
$function$;

-- Update attendance trend function to include semester
CREATE OR REPLACE FUNCTION public.get_attendance_trend(
    p_guru_id uuid, 
    p_start_date date DEFAULT NULL::date, 
    p_end_date date DEFAULT NULL::date, 
    p_period text DEFAULT 'monthly'::text,
    p_semester semester_type DEFAULT NULL::semester_type
)
RETURNS TABLE(periode text, persentase_hadir numeric)
LANGUAGE plpgsql
AS $function$
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
            AND (p_semester IS NULL OR jh.semester = p_semester)
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
            AND (p_semester IS NULL OR jh.semester = p_semester)
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
            AND (p_semester IS NULL OR jh.semester = p_semester)
        GROUP BY jh.tanggal_pelajaran
        ORDER BY jh.tanggal_pelajaran;
    END IF;
END;
$function$;
