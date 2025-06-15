
import React from 'react';
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
  LogOut
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
    },
    {
      title: "Riwayat Absensi",
      url: "riwayat-absensi",
      icon: ClipboardList,
    },
    {
      title: "Nilai",
      url: "nilai",
      icon: FileText,
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
        <div className="flex items-center space-x-3">
          <div className="bg-white/20 p-2 rounded-lg">
            <School className="h-6 w-6" />
          </div>
          <div>
            <h2 className="font-bold text-lg">SMK AL-HUDA</h2>
            <p className="text-primary-100 text-sm">Sistem Absensi</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="bg-primary">
        {/* Menu Utama */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-primary-100 font-semibold">
            Menu Utama
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuUtama.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    onClick={() => onPageChange(item.url)}
                    isActive={currentPage === item.url}
                    className={`text-white hover:bg-primary-600 transition-colors ${
                      currentPage === item.url ? 'bg-primary-700 font-semibold' : ''
                    }`}
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.title}</span>
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
                      onClick={() => onPageChange(item.url)}
                      isActive={currentPage === item.url}
                      className={`text-white hover:bg-primary-600 transition-colors ${
                        currentPage === item.url ? 'bg-primary-700 font-semibold' : ''
                      }`}
                    >
                      <item.icon className="h-5 w-5" />
                      <span>{item.title}</span>
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
                      onClick={() => onPageChange(item.url)}
                      isActive={currentPage === item.url}
                      className={`text-white hover:bg-primary-600 transition-colors ${
                        currentPage === item.url ? 'bg-primary-700 font-semibold' : ''
                      }`}
                    >
                      <item.icon className="h-5 w-5" />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="bg-primary-700 p-4">
        <div className="space-y-3">
          {/* Info User */}
          <div className="text-white">
            <p className="font-medium text-sm">{userSession.guru.nama_lengkap}</p>
            <p className="text-primary-200 text-xs">{userSession.guru.email}</p>
            <p className="text-primary-200 text-xs">
              {getRoleDisplayText()}
            </p>
          </div>
          
          {/* Tombol Logout */}
          <SidebarMenuButton
            onClick={onLogout}
            className="w-full text-white hover:bg-primary-800 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span>Keluar</span>
          </SidebarMenuButton>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
