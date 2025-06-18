
import React from 'react';
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
} from '@/components/ui/sidebar';
import { MenuItem } from './types';
import SidebarMenuItem from './SidebarMenuItem';

interface SidebarMenuGroupProps {
  title: string;
  items: MenuItem[];
  currentPage: string;
  onPageChange: (page: string) => void;
  expandedMenus?: Record<string, boolean>;
  onToggleMenu?: (menuTitle: string) => void;
}

const SidebarMenuGroup: React.FC<SidebarMenuGroupProps> = ({
  title,
  items,
  currentPage,
  onPageChange,
  expandedMenus = {},
  onToggleMenu
}) => {
  return (
    <SidebarGroup>
      <SidebarGroupLabel className="text-primary-100 font-semibold">
        {title}
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem
              key={item.title}
              item={item}
              currentPage={currentPage}
              onPageChange={onPageChange}
              isCollapsible={!!item.submenus}
              isOpen={expandedMenus[item.title] || false}
              onToggle={() => onToggleMenu?.(item.title)}
            />
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
};

export default SidebarMenuGroup;
