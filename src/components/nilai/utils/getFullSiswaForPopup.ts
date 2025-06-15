
import { convertSiswaToFullSiswa } from "../convertSiswaToFullSiswa";
import type { Siswa as SiswaIndex } from "@/types/index";

/**
 * Utility untuk memastikan data siswa sudah full, sesuai kebutuhan ProfilSiswaPopup.
 * Jika sudah full: return as is, jika belum: convert.
 */
export function getFullSiswaForPopup(siswa: any): SiswaIndex {
  // Cek sudah full (id_siswa, nama_lengkap, nisn, jenis_kelamin, tanggal_lahir sudah ada)
  if (
    siswa &&
    typeof siswa === "object" &&
    "jenis_kelamin" in siswa &&
    "tanggal_lahir" in siswa &&
    "tempat_lahir" in siswa &&
    "alamat" in siswa &&
    "nama_orang_tua" in siswa
  ) {
    // Sudah lengkap
    return siswa as SiswaIndex;
  }
  // Jika belum lengkap, konversi
  return convertSiswaToFullSiswa(siswa);
}
