
export interface StatistikKehadiran {
  nama_siswa: string;
  nisn: string;
  kelas: string;
  total_hadir: number;
  total_izin: number;
  total_sakit: number;
  total_alpha: number;
  total_pertemuan: number;
  persentase_hadir: number;
}

export interface StatistikKelas {
  nama_kelas: string;
  total_hadir: number;
  total_izin: number;
  total_sakit: number;
  total_alpha: number;
  persentase_hadir: number;
}

export interface TrendKehadiran {
  periode: string;
  persentase_hadir: number;
}

export interface StatistikOverview {
  total_siswa: number;
  rata_rata_kehadiran: number;
  kehadiran_tertinggi: number;
  siswa_alpha_tinggi: number;
}

export interface StatistikNilai {
  nama_siswa: string;
  nisn: string;
  kelas: string;
  rata_rata_nilai: number;
  nilai_tertinggi: number;
  nilai_terendah: number;
  jumlah_tugas: number;
  tugas_selesai: number;
  ranking: number;
}

export interface LaporanFilters {
  tanggalMulai: string;
  tanggalAkhir: string;
  kelas: string;
  mapel: string;
}
