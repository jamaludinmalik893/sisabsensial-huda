// Types untuk sistem sekolah SMK AL-HUDA
export interface Guru {
  id_guru: string;
  nip: string;
  nama_lengkap: string;
  email: string;
  password?: string;
  nomor_telepon?: string;
  alamat?: string;
  wali_kelas?: string;
  status: string; // Changed from union type to string to match database
  foto_url?: string;
  created_at?: string;
  updated_at?: string;
  // New fields for multiple roles
  roles?: ('admin' | 'guru' | 'wali_kelas')[];
}

export interface GuruRole {
  id: string;
  id_guru: string;
  role: 'admin' | 'guru' | 'wali_kelas';
  created_at: string;
}

// Simple role interface for query results
export interface SimpleGuruRole {
  role: 'admin' | 'guru' | 'wali_kelas';
}

export interface Siswa {
  id_siswa: string;
  nisn: string;
  nama_lengkap: string;
  jenis_kelamin: 'Laki-laki' | 'Perempuan';
  tanggal_lahir: string;
  tempat_lahir: string;
  alamat: string;
  nomor_telepon?: string;
  nama_orang_tua: string;
  nomor_telepon_orang_tua?: string;
  id_kelas: string;
  id_guru_wali: string;
  tahun_masuk: number;
  foto_url?: string;
  created_at?: string;
  updated_at?: string;
  // Relasi
  kelas?: Kelas;
  guru_wali?: Guru;
}

export interface Kelas {
  id_kelas: string;
  nama_kelas: string;
  logo_url?: string;
  created_at?: string;
  updated_at?: string;
  // Relasi
  siswa?: Siswa[];
  jumlah_siswa?: number;
}

export interface MataPelajaran {
  id_mapel: string;
  nama_mapel: string;
  created_at?: string;
  updated_at?: string;
}

export interface JurnalHarian {
  id_jurnal: string;
  id_guru: string;
  id_mapel: string;
  id_kelas: string;
  tanggal_pelajaran: string;
  waktu_mulai: string;
  waktu_selesai: string;
  judul_materi: string;
  materi_diajarkan: string;
  created_at?: string;
  updated_at?: string;
  // Relasi
  guru?: Guru;
  mata_pelajaran?: MataPelajaran;
  kelas?: Kelas;
  absensi?: Absensi[];
  nilai?: Nilai[];
}

export interface Absensi {
  id_absensi: string;
  id_jurnal: string;
  id_siswa: string;
  status: 'Hadir' | 'Izin' | 'Sakit' | 'Alpha';
  catatan?: string;
  created_at?: string;
  updated_at?: string;
  // Relasi
  jurnal?: JurnalHarian;
  siswa?: Siswa;
}

export interface Nilai {
  id_nilai: string;
  id_siswa: string;
  id_mapel: string;
  id_jurnal: string;
  jenis_nilai: string;
  skor: number;
  tanggal_nilai: string;
  catatan?: string;
  created_at?: string;
  updated_at?: string;
  // Relasi
  siswa?: Siswa;
  mata_pelajaran?: MataPelajaran;
  jurnal?: JurnalHarian;
}

// Types untuk statistik dashboard
export interface StatistikDashboard {
  total_siswa: number;
  total_guru: number;
  total_kelas: number;
  kehadiran_hari_ini: {
    hadir: number;
    izin: number;
    sakit: number;
    alpha: number;
  };
  jurnal_hari_ini: number;
}

// Types untuk filter dan pencarian
export interface FilterAbsensi {
  tanggal_mulai?: string;
  tanggal_akhir?: string;
  id_kelas?: string;
  id_mapel?: string;
  status?: string;
}

export interface FilterNilai {
  id_kelas?: string;
  id_mapel?: string;
  jenis_nilai?: string;
  tanggal_mulai?: string;
  tanggal_akhir?: string;
}

// Types untuk view mode
export type ViewMode = 'list' | 'grid';

// Types untuk session/auth - updated to support multiple roles
export interface UserSession {
  guru: Guru;
  isAdmin: boolean;
  isGuru: boolean;
  isWaliKelas: boolean;
  kelasWali?: Kelas;
  roles: ('admin' | 'guru' | 'wali_kelas')[];
}
