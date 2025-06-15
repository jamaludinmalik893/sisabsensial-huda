
import type { Siswa as SiswaIndex, Guru, Kelas } from "@/types/index";
import type { Siswa as SiswaNilai } from "@/types/nilai";

// Helper untuk mengkonversi Siswa dari hasil query minimal (nilai.ts) ke full Siswa (index.ts)
export function convertSiswaToFullSiswa(siswa: Partial<SiswaNilai> & { id_siswa: string; nama_lengkap: string; nisn: string }): SiswaIndex {
  return {
    id_siswa: siswa.id_siswa,
    nisn: siswa.nisn ?? "",
    nama_lengkap: siswa.nama_lengkap ?? "",
    jenis_kelamin: siswa.jenis_kelamin === "Laki-laki" || siswa.jenis_kelamin === "Perempuan"
      ? siswa.jenis_kelamin as "Laki-laki" | "Perempuan"
      : "Laki-laki",
    tanggal_lahir: siswa.tanggal_lahir ?? "",
    tempat_lahir: siswa.tempat_lahir ?? "",
    alamat: siswa.alamat ?? "",
    nomor_telepon: siswa.nomor_telepon ?? "",
    nama_orang_tua: siswa.nama_orang_tua ?? "",
    nomor_telepon_orang_tua: siswa.nomor_telepon_orang_tua ?? "",
    id_kelas: (siswa as any).id_kelas ?? "", // fallback for query
    id_guru_wali: (siswa as any).id_guru_wali ?? "",
    tahun_masuk: typeof (siswa as any).tahun_masuk === 'number' ? (siswa as any).tahun_masuk : 0,
    foto_url: siswa.foto_url ?? "",
    created_at: (siswa as any).created_at ?? "",
    updated_at: (siswa as any).updated_at ?? "",
    kelas: (siswa as any).kelas ?? undefined,
    guru_wali: (siswa as any).guru_wali ?? undefined,
    // nomor_telepon_siswa TIDAK ada di tipe index
  };
}
