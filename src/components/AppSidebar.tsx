
import React, { useState } from 'react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { 
  Home, 
  Calendar, 
  ClipboardList, 
  FileText, 
  BookOpen,
  Users,
  Settings,
  User,
  School,
  GraduationCap,
  LogOut,
  BarChart3
} from 'lucide-react';
import { UserSession } from '@/types';

interface AppSidebarProps {
  currentPage: string;
  onPageChange: (page: string) => void;
  userSession: UserSession;
  onLogout: () => void;
}

const AppSidebar: React.FC<AppSidebarProps> = ({ 
  currentPage, 
  onPageChange, 
  userSession,
  onLogout 
}) => {
  const { isMobile, setOpenMobile } = useSidebar();
  
  // Expand/collapse state for submenus
  const [nilaiOpen, setNilaiOpen] = useState(() => currentPage === "nilai" || currentPage.startsWith("nilai-"));
  const [absensiOpen, setAbsensiOpen] = useState(() =>
    currentPage === "absensi" || currentPage === "riwayat-absensi"
  );
  const [waliKelasOpen, setWaliKelasOpen] = useState(() =>
    currentPage === "wali-kelas" || currentPage === "wali-kelas-siswa" || 
    currentPage === "wali-kelas-absen" || currentPage === "wali-kelas-laporan"
  );

  // Expand/collapse logic based on currentPage
  React.useEffect(() => {
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

  // Helper function to handle page change and close mobile sidebar
  const handlePageChange = (page: string) => {
    onPageChange(page);
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  // Helper function to handle logout and close mobile sidebar
  const handleLogout = () => {
    onLogout();
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  const menuUtama = [
    {
      title: "Beranda",
      url: "beranda",
      icon: Home,
    },
    {
      title: "Absensi",
      url: "absensi",
      icon: Calendar,
      submenus: [
        {
          title: "Absensi Harian",
          url: "absensi",
        },
        {
          title: "Riwayat Absensi",
          url: "riwayat-absensi",
        },
      ],
    },
    {
      title: "Nilai",
      url: "nilai",
      icon: FileText,
      submenus: [
        {
          title: "Rekapitulasi Nilai",
          url: "nilai-rekapitulasi",
        },
        {
          title: "Entry Nilai",
          url: "nilai-entry",
        },
      ],
    },
    {
      title: "Jurnal",
      url: "jurnal",
      icon: BookOpen,
    },
    {
      title: "Profil Siswa",
      url: "profil-siswa",
      icon: Users,
    },
  ];

  const menuLaporan = [
    {
      title: "Laporan Akademik",
      url: "laporan",
      icon: BarChart3,
    },
  ];

  const menuAdministrasi = [
    {
      title: "Siswa",
      url: "admin-siswa",
      icon: GraduationCap,
    },
    {
      title: "Guru",
      url: "admin-guru",
      icon: User,
    },
    {
      title: "Kelas",
      url: "admin-kelas",
      icon: School,
    },
    {
      title: "Mata Pelajaran",
      url: "admin-mapel",
      icon: BookOpen,
    },
  ];

  const menuWaliKelas = [
    {
      title: "Wali Kelas",
      url: "wali-kelas",
      icon: Users,
      submenus: [
        {
          title: "Siswa",
          url: "wali-kelas-siswa",
        },
        {
          title: "Absen Harian",
          url: "wali-kelas-absen",
        },
        {
          title: "Laporan Akademik",
          url: "wali-kelas-laporan",
        },
      ],
    },
  ];

  // Helper function to get role display text
  const getRoleDisplayText = () => {
    const roleTexts = [];
    if (userSession.isAdmin) roleTexts.push('Administrator');
    if (userSession.isGuru) roleTexts.push('Guru');
    if (userSession.isWaliKelas && userSession.kelasWali) {
      roleTexts.push(`Wali ${userSession.kelasWali.nama_kelas}`);
    } else if (userSession.isWaliKelas) {
      roleTexts.push('Wali Kelas');
    }
    return roleTexts.join(' • ');
  };

  return (
    <Sidebar className="border-r border-gray-200">
      <SidebarHeader className="bg-primary text-white p-6">
        <div className="flex items-center space-x-3 min-w-0">
          <div className="bg-white/20 p-2 rounded-lg flex-shrink-0">
            <School className="h-6 w-6" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="font-bold text-lg truncate">SMK AL-HUDA</h2>
            <p className="text-primary-100 text-sm truncate">Sistem Absensi</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="bg-primary overflow-y-auto overflow-x-hidden">
        {/* Menu Utama */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-primary-100 font-semibold">
            Menu Utama
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuUtama.map((item) =>
                item.title === "Nilai" ? (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      onClick={() => setNilaiOpen((prev) => !prev)}
                      isActive={
                        currentPage === item.url ||
                        currentPage.startsWith("nilai-")
                      }
                      className={`flex items-center text-white hover:bg-primary-600 transition-colors min-w-0 ${
                        currentPage === item.url ||
                        currentPage.startsWith("nilai-")
                          ? 'bg-primary-700 font-semibold'
                          : ''
                      }`}
                    >
                      <item.icon className="h-5 w-5 flex-shrink-0" />
                      <span className="truncate">{item.title}</span>
                      <svg
                        className={`ml-auto h-4 w-4 transform duration-150 flex-shrink-0 ${nilaiOpen ? "rotate-90" : ""}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </SidebarMenuButton>
                    {nilaiOpen && (
                      <SidebarMenu>
                        {item.submenus?.map((submenu) => (
                          <SidebarMenuItem key={submenu.title}>
                            <SidebarMenuButton
                              onClick={() => handlePageChange(submenu.url)}
                              isActive={currentPage === submenu.url}
                              className={`ml-7 text-primary-100 hover:bg-primary-800 transition-colors min-w-0 ${
                                currentPage === submenu.url ? 'bg-primary-800 font-semibold' : ''
                              }`}
                            >
                              <span className="truncate">- {submenu.title}</span>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        ))}
                      </SidebarMenu>
                    )}
                  </SidebarMenuItem>
                ) : item.title === "Absensi" ? (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      onClick={() => setAbsensiOpen((prev) => !prev)}
                      isActive={
                        currentPage === "absensi" || currentPage === "riwayat-absensi"
                      }
                      className={`flex items-center text-white hover:bg-primary-600 transition-colors min-w-0 ${
                        currentPage === "absensi" || currentPage === "riwayat-absensi"
                          ? 'bg-primary-700 font-semibold'
                          : ''
                      }`}
                    >
                      <item.icon className="h-5 w-5 flex-shrink-0" />
                      <span className="truncate">{item.title}</span>
                      <svg
                        className={`ml-auto h-4 w-4 transform duration-150 flex-shrink-0 ${absensiOpen ? "rotate-90" : ""}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </SidebarMenuButton>
                    {absensiOpen && (
                      <SidebarMenu>
                        {item.submenus?.map((submenu) => (
                          <SidebarMenuItem key={submenu.title}>
                            <SidebarMenuButton
                              onClick={() => handlePageChange(submenu.url)}
                              isActive={currentPage === submenu.url}
                              className={`ml-7 text-primary-100 hover:bg-primary-800 transition-colors min-w-0 ${
                                currentPage === submenu.url ? 'bg-primary-800 font-semibold' : ''
                              }`}
                            >
                              <span className="truncate">- {submenu.title}</span>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        ))}
                      </SidebarMenu>
                    )}
                  </SidebarMenuItem>
                ) : (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      onClick={() => handlePageChange(item.url)}
                      isActive={currentPage === item.url}
                      className={`text-white hover:bg-primary-600 transition-colors min-w-0 ${currentPage === item.url ? 'bg-primary-700 font-semibold' : ''}`}
                    >
                      <item.icon className="h-5 w-5 flex-shrink-0" />
                      <span className="truncate">{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Menu Laporan */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-primary-100 font-semibold">
            Laporan
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuLaporan.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    onClick={() => handlePageChange(item.url)}
                    isActive={currentPage === item.url}
                    className={`text-white hover:bg-primary-600 transition-colors min-w-0 ${
                      currentPage === item.url ? 'bg-primary-700 font-semibold' : ''
                    }`}
                  >
                    <item.icon className="h-5 w-5 flex-shrink-0" />
                    <span className="truncate">{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Menu Administrasi - Hanya untuk Admin */}
        {userSession.isAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-primary-100 font-semibold">
              Administrasi
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {menuAdministrasi.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      onClick={() => handlePageChange(item.url)}
                      isActive={currentPage === item.url}
                      className={`text-white hover:bg-primary-600 transition-colors min-w-0 ${
                        currentPage === item.url ? 'bg-primary-700 font-semibold' : ''
                      }`}
                    >
                      <item.icon className="h-5 w-5 flex-shrink-0" />
                      <span className="truncate">{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Menu Wali Kelas - Hanya untuk Wali Kelas */}
        {userSession.isWaliKelas && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-primary-100 font-semibold">
              Wali Kelas
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {menuWaliKelas.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      onClick={() => setWaliKelasOpen((prev) => !prev)}
                      isActive={
                        currentPage === "wali-kelas" || currentPage === "wali-kelas-siswa" || 
                        currentPage === "wali-kelas-absen" || currentPage === "wali-kelas-laporan"
                      }
                      className={`flex items-center text-white hover:bg-primary-600 transition-colors min-w-0 ${
                        currentPage === "wali-kelas" || currentPage === "wali-kelas-siswa" || 
                        currentPage === "wali-kelas-absen" || currentPage === "wali-kelas-laporan"
                          ? 'bg-primary-700 font-semibold'
                          : ''
                      }`}
                    >
                      <item.icon className="h-5 w-5 flex-shrink-0" />
                      <span className="truncate">{item.title}</span>
                      <svg
                        className={`ml-auto h-4 w-4 transform duration-150 flex-shrink-0 ${waliKelasOpen ? "rotate-90" : ""}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </SidebarMenuButton>
                    {waliKelasOpen && (
                      <SidebarMenu>
                        {item.submenus?.map((submenu) => (
                          <SidebarMenuItem key={submenu.title}>
                            <SidebarMenuButton
                              onClick={() => handlePageChange(submenu.url)}
                              isActive={currentPage === submenu.url}
                              className={`ml-7 text-primary-100 hover:bg-primary-800 transition-colors min-w-0 ${
                                currentPage === submenu.url ? 'bg-primary-800 font-semibold' : ''
                              }`}
                            >
                              <span className="truncate">- {submenu.title}</span>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        ))}
                      </SidebarMenu>
                    )}
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="bg-primary-700 p-4">
        <div className="space-y-3 min-w-0">
          {/* Info User */}
          <div className="text-white min-w-0">
            <p className="font-medium text-sm truncate">{userSession.guru.nama_lengkap}</p>
            <p className="text-primary-200 text-xs truncate">{userSession.guru.email}</p>
            <p className="text-primary-200 text-xs truncate">
              {getRoleDisplayText()}
            </p>
          </div>
          
          {/* Tombol Logout */}
          <SidebarMenuButton
            onClick={handleLogout}
            className="w-full text-white hover:bg-primary-800 transition-colors min-w-0"
          >
            <LogOut className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">Keluar</span>
          </SidebarMenuButton>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
