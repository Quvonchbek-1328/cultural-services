import type { Role } from "@/lib/types";

export interface NavItem {
  label: string;
  href: string;
  icon: string; // lucide ikonka nomi
}

export interface NavSection {
  title?: string;
  items: NavItem[];
}

export const DASHBOARD_NAV: Record<Role, NavSection[]> = {
  user: [
    {
      items: [
        { label: "Profil", href: "/kabinet/foydalanuvchi", icon: "User" },
        { label: "Buyurtmalar", href: "/kabinet/foydalanuvchi/buyurtmalar", icon: "ShoppingBag" },
        { label: "Sevimlilar", href: "/kabinet/foydalanuvchi/sevimlilar", icon: "Heart" },
        { label: "Sharhlarim", href: "/kabinet/foydalanuvchi/sharhlar", icon: "Star" },
      ],
    },
  ],
  provider: [
    {
      items: [
        { label: "Profil", href: "/kabinet/taqdimotchi", icon: "User" },
        { label: "Xizmatlar", href: "/kabinet/taqdimotchi/xizmatlar", icon: "LayoutGrid" },
        { label: "Jamlanmalar", href: "/kabinet/taqdimotchi/jamlanmalar", icon: "Layers" },
        { label: "Buyurtmalar", href: "/kabinet/taqdimotchi/buyurtmalar", icon: "Inbox" },
        { label: "Kalendar", href: "/kabinet/taqdimotchi/kalendar", icon: "CalendarDays" },
      ],
    },
  ],
  ministry: [
    {
      title: "Kelishuv navbati",
      items: [
        { label: "Kelishuvga yuborilgan xizmatlar", href: "/vazirlik", icon: "ClipboardCheck" },
        { label: "Jamlanmalar", href: "/vazirlik/jamlanmalar", icon: "Layers" },
      ],
    },
    {
      title: "Boshqaruv",
      items: [
        { label: "Foydalanuvchilar", href: "/vazirlik/foydalanuvchilar", icon: "Users" },
        { label: "Taqdimotchilar", href: "/vazirlik/tashkilotlar", icon: "Building2" },
        { label: "Sharhlar", href: "/vazirlik/sharhlar", icon: "MessageSquare" },
        { label: "Kategoriyalar", href: "/vazirlik/kategoriyalar", icon: "FolderTree" },
        { label: "Statistika", href: "/vazirlik/statistika", icon: "BarChart3" },
      ],
    },
  ],
  admin: [
    {
      items: [
        { label: "Boshqaruv paneli", href: "/admin", icon: "LayoutDashboard" },
        { label: "Foydalanuvchilar", href: "/admin/foydalanuvchilar", icon: "Users" },
        { label: "Taqdimotchilar", href: "/admin/tashkilotlar", icon: "Building2" },
        { label: "Xizmatlar navbati", href: "/admin/xizmatlar", icon: "ClipboardCheck" },
        { label: "Jamlanmalar navbati", href: "/admin/jamlanmalar", icon: "Layers" },
        { label: "Sharhlar", href: "/admin/sharhlar", icon: "MessageSquare" },
        { label: "Kategoriyalar", href: "/admin/kategoriyalar", icon: "FolderTree" },
        { label: "Statistika", href: "/admin/statistika", icon: "BarChart3" },
      ],
    },
  ],
};
