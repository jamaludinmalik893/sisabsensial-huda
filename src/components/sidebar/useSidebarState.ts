
import { useState, useEffect } from 'react';

export const useSidebarState = (currentPage: string) => {
  const [nilaiOpen, setNilaiOpen] = useState(() => 
    currentPage === "nilai" || currentPage.startsWith("nilai-")
  );
  const [absensiOpen, setAbsensiOpen] = useState(() =>
    currentPage === "absensi" || currentPage === "riwayat-absensi"
  );
  const [waliKelasOpen, setWaliKelasOpen] = useState(() =>
    currentPage === "wali-kelas" || currentPage === "wali-kelas-siswa" || 
    currentPage === "wali-kelas-absen" || currentPage === "wali-kelas-laporan"
  );

  useEffect(() => {
    if (currentPage === "nilai" || currentPage.startsWith("nilai-")) {
      setNilaiOpen(true);
    }
    if (currentPage === "absensi" || currentPage === "riwayat-absensi") {
      setAbsensiOpen(true);
    }
    if (currentPage === "wali-kelas" || currentPage === "wali-kelas-siswa" || 
        currentPage === "wali-kelas-absen" || currentPage === "wali-kelas-laporan") {
      setWaliKelasOpen(true);
    }
  }, [currentPage]);

  const expandedMenus = {
    'Nilai': nilaiOpen,
    'Absensi': absensiOpen,
    'Wali Kelas': waliKelasOpen
  };

  const toggleMenu = (menuTitle: string) => {
    switch (menuTitle) {
      case 'Nilai':
        setNilaiOpen(prev => !prev);
        break;
      case 'Absensi':
        setAbsensiOpen(prev => !prev);
        break;
      case 'Wali Kelas':
        setWaliKelasOpen(prev => !prev);
        break;
    }
  };

  return { expandedMenus, toggleMenu };
};
