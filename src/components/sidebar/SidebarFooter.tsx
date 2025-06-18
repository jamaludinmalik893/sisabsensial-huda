
import React from 'react';
import { SidebarFooter as SidebarFooterComponent, SidebarMenuButton } from '@/components/ui/sidebar';
import { LogOut } from 'lucide-react';
import { UserSession } from '@/types';

interface SidebarFooterProps {
  userSession: UserSession;
  onLogout: () => void;
}

const SidebarFooter: React.FC<SidebarFooterProps> = ({ userSession, onLogout }) => {
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
    <SidebarFooterComponent className="bg-primary-700 p-4">
      <div className="space-y-3 min-w-0">
        <div className="text-white min-w-0">
          <p className="font-medium text-sm truncate">{userSession.guru.nama_lengkap}</p>
          <p className="text-primary-200 text-xs truncate">{userSession.guru.email}</p>
          <p className="text-primary-200 text-xs truncate">
            {getRoleDisplayText()}
          </p>
        </div>
        
        <SidebarMenuButton
          onClick={onLogout}
          className="w-full text-white hover:bg-primary-800 transition-colors min-w-0"
        >
          <LogOut className="h-4 w-4 flex-shrink-0" />
          <span className="truncate">Keluar</span>
        </SidebarMenuButton>
      </div>
    </SidebarFooterComponent>
  );
};

export default SidebarFooter;
