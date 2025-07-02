
import React from 'react';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem as SidebarMenuItemComponent,
} from '@/components/ui/sidebar';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import { MenuItem } from './types';

interface SidebarMenuItemProps {
  item: MenuItem;
  currentPage: string;
  onPageChange: (page: string) => void;
  isCollapsible?: boolean;
  isOpen?: boolean;
  onToggle?: () => void;
}

const SidebarMenuItem: React.FC<SidebarMenuItemProps> = ({ 
  item, 
  currentPage, 
  onPageChange,
  isCollapsible = false,
  isOpen = false,
  onToggle
}) => {
  const isActive = currentPage === item.url || 
    (item.submenus && item.submenus.some(sub => currentPage === sub.url));

  const handleClick = () => {
    if (isCollapsible && onToggle) {
      onToggle();
    } else {
      onPageChange(item.url);
    }
  };

  if (isCollapsible && item.submenus) {
    return (
      <Collapsible open={isOpen} onOpenChange={onToggle}>
        <SidebarMenuItemComponent>
          <CollapsibleTrigger asChild>
            <SidebarMenuButton
              isActive={isActive}
              className={`text-white hover:bg-primary-600 transition-all duration-300 min-w-0 ${
                isActive ? 'bg-primary-700 font-semibold' : ''
              }`}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              <span className="truncate">{item.title}</span>
              <svg
                className={`ml-auto h-4 w-4 transform transition-transform duration-500 flex-shrink-0 ${
                  isOpen ? "rotate-90" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </SidebarMenuButton>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <SidebarMenu>
              {item.submenus.map((submenu) => (
                <SidebarMenuItemComponent key={submenu.title}>
                  <SidebarMenuButton
                    onClick={() => onPageChange(submenu.url)}
                    isActive={currentPage === submenu.url}
                    className={`ml-7 text-primary-100 hover:bg-primary-800 transition-all duration-300 min-w-0 ${
                      currentPage === submenu.url ? 'bg-primary-800 font-semibold' : ''
                    }`}
                  >
                    <span className="truncate">- {submenu.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItemComponent>
              ))}
            </SidebarMenu>
          </CollapsibleContent>
        </SidebarMenuItemComponent>
      </Collapsible>
    );
  }

  return (
    <SidebarMenuItemComponent>
      <SidebarMenuButton
        onClick={handleClick}
        isActive={isActive}
        className={`text-white hover:bg-primary-600 transition-all duration-300 min-w-0 ${
          isActive ? 'bg-primary-700 font-semibold' : ''
        }`}
      >
        <item.icon className="h-5 w-5 flex-shrink-0" />
        <span className="truncate">{item.title}</span>
      </SidebarMenuButton>
    </SidebarMenuItemComponent>
  );
};

export default SidebarMenuItem;
