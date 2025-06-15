
import type { Siswa as SiswaIndex, Guru, Kelas } from "@/types/index";
import type { Siswa as SiswaNilai } from "@/types/nilai";

// Gunakan placeholder universal bila foto_url kosong
const FALLBACK_FOTO_URL = "/placeholder.svg"; // Sesuaikan dengan file static pada public/placeholder.svg

export function convertSiswaToFullSiswa(
  siswa: Partial<SiswaNilai> & { id_siswa: string; nama_lengkap: string; nisn: string }
): SiswaIndex {
  // DEBUG: log siswa param
  console.log("[DEBUG convertSiswaToFullSiswa] input:", siswa);

  // Pastikan kelas dan guru_wali hanya diassign valid object atau undefined
  const kelas = (siswa as any).kelas && typeof (siswa as any).kelas === "object"
    && !(typeof (siswa as any).kelas._type === "string") // not buggy placeholder object
    ? (siswa as any).kelas
    : undefined;

  const guru_wali = (siswa as any).guru_wali && typeof (siswa as any).guru_wali === "object"
    && !(typeof (siswa as any).guru_wali._type === "string")
    ? (siswa as any).guru_wali
    : undefined;

  const foto_url_raw = (siswa as any).foto_url;
  // Pastikan link string tidak kosong/false/null
  const foto_url =
    typeof foto_url_raw === "string" && foto_url_raw.trim()
      ? foto_url_raw
      : FALLBACK_FOTO_URL;

  const result: SiswaIndex = {
    id_siswa: siswa.id_siswa,
    nisn: siswa.nisn ?? "",
    nama_lengkap: siswa.nama_lengkap ?? "",
    jenis_kelamin:
      (siswa as any).jenis_kelamin === "Laki-laki" || (siswa as any).jenis_kelamin === "Perempuan"
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
    foto_url,
    created_at: (siswa as any).created_at ?? "",
    updated_at: (siswa as any).updated_at ?? "",
    kelas,
    guru_wali,
  };

  // DEBUG: log result
  console.log("[DEBUG convertSiswaToFullSiswa] output:", result);

  return result;
}
