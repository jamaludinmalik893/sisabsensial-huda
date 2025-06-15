export interface Nilai {
  id_nilai: string;
  skor: number;
  jenis_nilai: string;
  catatan?: string;
  judul_tugas: string;
  tanggal_tugas_dibuat: string;
  tanggal_nilai: string;
  siswa: {
    id_siswa: string;
    nama_lengkap: string;
    nisn: string;
    jenis_kelamin: string;
    tanggal_lahir: string;
    tempat_lahir: string;
    alamat: string;
    nomor_telepon?: string;
    nama_orang_tua: string;
    nomor_telepon_orang_tua?: string;
    tahun_masuk: number;
    foto_url?: string;
    kelas?: {
      nama_kelas: string;
    };
    guru_wali?: {
      nama_lengkap: string;
    };
  };
  mata_pelajaran: {
    nama_mapel: string;
  };
}

export interface Siswa {
  id_siswa: string;
  nama_lengkap: string;
  nisn: string;
}

export interface MataPelajaran {
  id_mapel: string;
  nama_mapel: string;
}

export interface Kelas {
  id_kelas: string;
  nama_kelas: string;
}

export interface BulkNilaiData {
  id_siswa: string;
  id_jurnal?: string; // Ubah jadi optional agar tidak error di bulk entry tanpa jurnal
  id_mapel: string;
  skor: number;
  jenis_nilai: string;
  judul_tugas: string;
  tanggal_tugas_dibuat: string;
  tanggal_nilai: string;
}
