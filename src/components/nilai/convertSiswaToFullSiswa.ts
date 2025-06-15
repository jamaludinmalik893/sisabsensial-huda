
import type { Siswa as SiswaIndex } from "@/types/index";
import type { Siswa as SiswaNilai } from "@/types/nilai";

// Helper untuk mengkonversi Siswa dari hasil query minimal (nilai.ts) ke full Siswa (index.ts)
export function convertSiswaToFullSiswa(siswa: Partial<SiswaNilai> & { id_siswa: string; nama_lengkap: string; nisn: string }): SiswaIndex {
  return {
    id_siswa: siswa.id_siswa,
    nisn: siswa.nisn,
    nama_lengkap: siswa.nama_lengkap,
    jenis_kelamin: (siswa.jenis_kelamin === "Laki-laki" || siswa.jenis_kelamin === "Perempuan")
      ? siswa.jenis_kelamin
      : "Laki-laki", // default aman
    tanggal_lahir: siswa.tanggal_lahir ?? "",
    tempat_lahir: siswa.tempat_lahir ?? "",
    alamat: siswa.alamat ?? "",
    nomor_telepon: siswa.nomor_telepon ?? "",
    nama_orang_tua: siswa.nama_orang_tua ?? "",
    nomor_telepon_orang_tua: siswa.nomor_telepon_orang_tua ?? "",
    id_kelas: siswa.id_kelas ?? "",
    id_guru_wali: siswa.id_guru_wali ?? "",
    tahun_masuk: siswa.tahun_masuk ?? 0,
    foto_url: siswa.foto_url ?? "",
    created_at: siswa.created_at,
    updated_at: siswa.updated_at,
    kelas: siswa.kelas,
    guru_wali: siswa.guru_wali,
    nomor_telepon_siswa: (siswa as any).nomor_telepon_siswa ?? "",
  };
}
