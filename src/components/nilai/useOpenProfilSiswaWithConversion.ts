
import { useProfilSiswaPopup } from "./useProfilSiswaPopup";
import { getFullSiswaForPopup } from "./utils/getFullSiswaForPopup";
import type { Siswa as SiswaIndex } from "@/types/index";

// Hook adapter agar pipeline open profil selalu dapat data Siswa yang sudah 'full'
export function useOpenProfilSiswaWithConversion() {
  const {
    profilOpen,
    selectedSiswa,
    openProfil,
    closeProfil
  } = useProfilSiswaPopup();

  // Adapter: pastikan data selalu sudah 'full' (sama seperti di rekapitulasi)
  const openProfilWithFullData = (siswa: any) => {
    const full = getFullSiswaForPopup(siswa);
    console.log("[DEBUG useOpenProfilSiswaWithConversion] openProfilWithFullData: siswa input", siswa);
    console.log("[DEBUG useOpenProfilSiswaWithConversion] openProfilWithFullData: siswa full", full);
    openProfil(full);
  };

  return {
    profilOpen,
    selectedSiswa,
    openProfil: openProfilWithFullData,
    closeProfil,
  };
}
