
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
  id_jurnal: string;
  id_mapel: string;
  skor: number;
  jenis_nilai: string;
  judul_tugas: string;
  tanggal_tugas_dibuat: string;
  tanggal_nilai: string;
}
