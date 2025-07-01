
export interface Siswa {
  id_siswa: string;
  nisn: string;
  nama_lengkap: string;
  jenis_kelamin: 'Laki-laki' | 'Perempuan';
  tanggal_lahir: string;
  tempat_lahir: string;
  alamat: string;
  nomor_telepon?: string;
  nomor_telepon_siswa?: string;
  nama_orang_tua: string;
  nomor_telepon_orang_tua?: string;
  id_kelas: string;
  id_guru_wali: string;
  tahun_masuk: number;
  foto_url?: string;
  created_at?: string;
  updated_at?: string;
  kelas?: {
    id_kelas: string;
    nama_kelas: string;
  };
  guru_wali?: {
    id_guru: string;
    nip: string;
    nama_lengkap: string;
    email: string;
    status: string;
    roles?: ('admin' | 'guru' | 'wali_kelas')[];
  };
}

export interface MataPelajaran {
  id_mapel: string;
  nama_mapel: string;
}

export interface Kelas {
  id_kelas: string;
  nama_kelas: string;
}

export interface Nilai {
  id_nilai: string;
  skor: number;
  jenis_nilai: string;
  catatan?: string;
  judul_tugas: string;
  tanggal_tugas_dibuat: string;
  tanggal_nilai: string;
  semester?: 'Ganjil' | 'Genap';
  siswa?: Siswa;
  mata_pelajaran?: MataPelajaran;
}

export interface BulkNilaiEntry {
  skor: string;
  catatan: string;
}

export interface BulkNilaiData {
  id_siswa: string;
  skor: number;
  catatan?: string;
}

export interface NilaiContextType {
  siswa: Siswa[];
  mataPelajaran: MataPelajaran[];
  kelas: Kelas[];
  nilai: Nilai[];
  loading: boolean;
  convertedBulkValues: Array<{
    key?: string;
    skor?: string;
    catatan?: string;
  }>;
  loadSiswaByKelas: (kelasId: string) => Promise<void>;
  handleBulkValueChange: (siswaId: string, entry: BulkNilaiEntry) => void;
  handleBulkSubmit: () => Promise<void>;
  updateNilai: (nilaiId: string, newSkor: number, newCatatan?: string) => Promise<void>;
  deleteNilai: (nilaiId: string) => Promise<void>;
}
