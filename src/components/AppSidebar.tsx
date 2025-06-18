
import React from 'react';
import {
  Sidebar,
  SidebarContent,
  useSidebar,
} from '@/components/ui/sidebar';
import { UserSession } from '@/types';
import { menuUtama, menuLaporan, menuAdministrasi, menuWaliKelas } from './sidebar/menuData';
import SidebarMenuGroup from './sidebar/SidebarMenuGroup';
import SidebarHeader from './sidebar/SidebarHeader';
import SidebarFooter from './sidebar/SidebarFooter';
import { useSidebarState } from './sidebar/useSidebarState';

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
  const { expandedMenus, toggleMenu } = useSidebarState(currentPage);

  const handlePageChange = (page: string) => {
    onPageChange(page);
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  const handleLogout = () => {
    onLogout();
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  return (
    <Sidebar className="border-r border-gray-200">
      <SidebarHeader />

      <SidebarContent className="bg-primary overflow-y-auto overflow-x-hidden">
        <SidebarMenuGroup
          title="Menu Utama"
          items={menuUtama}
          currentPage={currentPage}
          onPageChange={handlePageChange}
          expandedMenus={expandedMenus}
          onToggleMenu={toggleMenu}
        />

        <SidebarMenuGroup
          title="Laporan"
          items={menuLaporan}
          currentPage={currentPage}
          onPageChange={handlePageChange}
        />

        {userSession.isAdmin && (
          <SidebarMenuGroup
            title="Administrasi"
            items={menuAdministrasi}
            currentPage={currentPage}
            onPageChange={handlePageChange}
          />
        )}

        {userSession.isWaliKelas && (
          <SidebarMenuGroup
            title="Wali Kelas"
            items={menuWaliKelas}
            currentPage={currentPage}
            onPageChange={handlePageChange}
            expandedMenus={expandedMenus}
            onToggleMenu={toggleMenu}
          />
        )}
      </SidebarContent>

      <SidebarFooter userSession={userSession} onLogout={handleLogout} />
    </Sidebar>
  );
};

export default AppSidebar;
