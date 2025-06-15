
import type { Siswa as SiswaIndex, Guru, Kelas } from "@/types/index";
import type { Siswa as SiswaNilai } from "@/types/nilai";

// Helper untuk mengkonversi Siswa dari hasil query minimal (nilai.ts) ke full Siswa (index.ts)
export function convertSiswaToFullSiswa(
  siswa: Partial<SiswaNilai> & { id_siswa: string; nama_lengkap: string; nisn: string }
): SiswaIndex {
  return {
    id_siswa: siswa.id_siswa,
    nisn: siswa.nisn ?? "",
    nama_lengkap: siswa.nama_lengkap ?? "",
    jenis_kelamin: ((siswa as any).jenis_kelamin === "Laki-laki" || (siswa as any).jenis_kelamin === "Perempuan")
      ? (siswa as any).jenis_kelamin
      : "Laki-laki",
    tanggal_lahir: (siswa as any).tanggal_lahir ?? "",
    tempat_lahir: (siswa as any).tempat_lahir ?? "",
    alamat: (siswa as any).alamat ?? "",
    nomor_telepon: (siswa as any).nomor_telepon ?? "",
    nama_orang_tua: (siswa as any).nama_orang_tua ?? "",
    nomor_telepon_orang_tua: (siswa as any).nomor_telepon_orang_tua ?? "",
    id_kelas: (siswa as any).id_kelas ?? "",
    id_guru_wali: (siswa as any).id_guru_wali ?? "",
    tahun_masuk: typeof (siswa as any).tahun_masuk === "number" ? (siswa as any).tahun_masuk : 0,
    foto_url: (siswa as any).foto_url ?? "",
    created_at: (siswa as any).created_at ?? "",
    updated_at: (siswa as any).updated_at ?? "",
    kelas: (siswa as any).kelas ?? undefined,
    guru_wali: (siswa as any).guru_wali ?? undefined,
  };
}
