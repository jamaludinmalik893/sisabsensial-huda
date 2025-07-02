
import { useState, useEffect } from 'react';

export const useSidebarState = (currentPage: string) => {
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(() => {
    // Determine which submenu should be open based on current page
    if (currentPage === "nilai" || currentPage.startsWith("nilai-")) {
      return 'Nilai';
    }
    if (currentPage === "absensi" || currentPage === "riwayat-absensi") {
      return 'Absensi';
    }
    if (currentPage === "wali-kelas" || currentPage === "wali-kelas-siswa" || 
        currentPage === "wali-kelas-absen" || currentPage === "wali-kelas-laporan") {
      return 'Wali Kelas';
    }
    return null;
  });

  useEffect(() => {
    // Update open submenu based on current page
    if (currentPage === "nilai" || currentPage.startsWith("nilai-")) {
      setOpenSubmenu('Nilai');
    } else if (currentPage === "absensi" || currentPage === "riwayat-absensi") {
      setOpenSubmenu('Absensi');
    } else if (currentPage === "wali-kelas" || currentPage === "wali-kelas-siswa" || 
               currentPage === "wali-kelas-absen" || currentPage === "wali-kelas-laporan") {
      setOpenSubmenu('Wali Kelas');
    }
  }, [currentPage]);

  const expandedMenus = {
    'Nilai': openSubmenu === 'Nilai',
    'Absensi': openSubmenu === 'Absensi',
    'Wali Kelas': openSubmenu === 'Wali Kelas'
  };

  const toggleMenu = (menuTitle: string) => {
    // If the clicked menu is already open, close it; otherwise, open it and close others
    setOpenSubmenu(prevOpen => prevOpen === menuTitle ? null : menuTitle);
  };

  return { expandedMenus, toggleMenu };
};
