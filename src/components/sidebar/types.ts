
export interface MenuItem {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
  submenus?: SubMenuItem[];
}

export interface SubMenuItem {
  title: string;
  url: string;
}
