
import { useState } from "react";
import type { Siswa as SiswaIndex } from "@/types/index";
import { convertSiswaToFullSiswa } from "./convertSiswaToFullSiswa";

export function useProfilSiswaPopup() {
  const [profilOpen, setProfilOpen] = useState(false);
  const [selectedSiswa, setSelectedSiswa] = useState<SiswaIndex | null>(null);

  // Pastikan data lengkap sebelum buka popup (hindari broken data)
  const openProfil = (siswa: any) => {
    // Paksa konversi ke tipe lengkap
    const safe = convertSiswaToFullSiswa(siswa);
    setSelectedSiswa(safe);
    setProfilOpen(true);
  };
  const closeProfil = () => {
    setProfilOpen(false);
    setSelectedSiswa(null);
  };

  return { profilOpen, selectedSiswa, openProfil, closeProfil };
}
