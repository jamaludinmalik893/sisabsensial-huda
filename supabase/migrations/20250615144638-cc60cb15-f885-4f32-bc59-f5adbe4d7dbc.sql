
DO $$
DECLARE
  kelas_id UUID;
  guru_id UUID;
  idx INT := 1;
  siswa_nama TEXT[];
  siswa_nama_item TEXT;
BEGIN
  -- Cari id kelas X TITL, buat jika belum ada
  SELECT id_kelas INTO kelas_id FROM kelas WHERE LOWER(nama_kelas) = 'x titl' LIMIT 1;
  IF kelas_id IS NULL THEN
    INSERT INTO kelas (nama_kelas) VALUES ('X TITL') RETURNING id_kelas INTO kelas_id;
  END IF;

  -- Ambil guru pertama untuk wali kelas (jika tidak ada, buat field kosong)
  SELECT id_guru INTO guru_id FROM guru ORDER BY created_at LIMIT 1;
  IF guru_id IS NULL THEN
    -- skip if benar2 tidak ada guru
    guru_id := NULL;
  END IF;

  siswa_nama := ARRAY[
    'ACHMAD GILANG PRATAMA',
    'ACHMAD KHOIRUL AKBAR ATOILLAH',
    'AFANO ICHSAN',
    'BAGUS AQBAR RAMADHANI RAMADHANI',
    'DAFFA SATRIO RADITHYA ARDHAN',
    'DENDRA AFGAN AFFIRMANDIKA',
    'FAREL ADITYA PRATAMA',
    'IFFAT AZKA MUZAFFAR',
    'IQBAL AULIYA QOTHRUNNADA',
    'MOCH. ABI FARKHAN',
    'MOCH. RAMA SANDI PRATAMA',
    'MOCHAMMAD YUSRIL RAMADANI',
    'MOH. RIFKI TRI BEKTI',
    'MUHAMAD SURYA WIJAYA',
    'MUHAMMAD EKA SATRIA',
    'MUHAMMAD HAYKAL RAMADHAN',
    'RAFI ACHMAD PRASETYO',
    'RAGA PUTRA ARYESWARA',
    'RAYHAN BINTANG PRATAMA',
    'REXYAMADA PUTRA DWINKIE PRASADEWA',
    'WILIAM JANSON',
    'ZULFIQAR HAFIDUN ALIM',
    'ACHMAD GILANG PRATAMA',
    'ACHMAD KHOIRUL AKBAR ATOILLAH',
    'AFANO ICHSAN',
    'BAGUS AQBAR RAMADHANI RAMADHANI',
    'DAFFA SATRIO RADITHYA ARDHAN',
    'DENDRA AFGAN AFFIRMANDIKA',
    'FAREL ADITYA PRATAMA',
    'IFFAT AZKA MUZAFFAR',
    'IQBAL AULIYA QOTHRUNNADA',
    'MOCH. ABI FARKHAN',
    'MOCH. RAMA SANDI PRATAMA',
    'MOCHAMMAD YUSRIL RAMADANI',
    'MOH. RIFKI TRI BEKTI',
    'MUHAMAD SURYA WIJAYA',
    'MUHAMMAD EKA SATRIA',
    'MUHAMMAD HAYKAL RAMADHAN',
    'RAFI ACHMAD PRASETYO',
    'RAGA PUTRA ARYESWARA',
    'RAYHAN BINTANG PRATAMA',
    'REXYAMADA PUTRA DWINKIE PRASADEWA',
    'WILIAM JANSON',
    'ZULFIQAR HAFIDUN ALIM'
  ];

  FOREACH siswa_nama_item IN ARRAY siswa_nama LOOP
    INSERT INTO siswa (
      nisn,
      nama_lengkap,
      jenis_kelamin,
      tanggal_lahir,
      tempat_lahir,
      alamat,
      nomor_telepon,
      nomor_telepon_siswa,
      nama_orang_tua,
      nomor_telepon_orang_tua,
      id_kelas,
      id_guru_wali,
      tahun_masuk,
      foto_url
    )
    VALUES (
      lpad((9000000000 + idx)::text, 10, '0'),
      siswa_nama_item,
      CASE WHEN idx % 2 = 1 THEN 'Laki-laki' ELSE 'Perempuan' END,
      '2007-07-01'::date + (idx * interval '10 days'),
      'Kediri',
      'Jl. Siswa TITL No. ' || idx || ', Kediri',
      '08122233' || lpad(idx::text, 3, '0'),
      '08223344' || lpad(idx::text, 3, '0'),
      'Ortu ' || siswa_nama_item,
      '08125566' || lpad(idx::text, 3, '0'),
      kelas_id,
      guru_id,
      2024,
      NULL
    )
    ON CONFLICT (nisn) DO NOTHING;
    idx := idx + 1;
  END LOOP;
END
$$;
