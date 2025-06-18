
import React from 'react';
import { SidebarHeader as SidebarHeaderComponent } from '@/components/ui/sidebar';
import { School } from 'lucide-react';

const SidebarHeader: React.FC = () => {
  return (
    <SidebarHeaderComponent className="bg-primary text-white p-6">
      <div className="flex items-center space-x-3 min-w-0">
        <div className="bg-white/20 p-2 rounded-lg flex-shrink-0">
          <School className="h-6 w-6" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="font-bold text-lg truncate">SMK AL-HUDA</h2>
          <p className="text-primary-100 text-sm truncate">Sistem Absensi</p>
        </div>
      </div>
    </SidebarHeaderComponent>
  );
};

export default SidebarHeader;
