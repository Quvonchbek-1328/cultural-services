"use client";
import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, ArrowLeft, Menu } from "lucide-react";
import { DynamicIcon } from "@/lib/icons";
import { Logo } from "@/components/shared/logo";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { NotificationBell } from "@/components/shared/notification-bell";
import { RoleSwitcher } from "./role-switcher";
import { DASHBOARD_NAV } from "./dashboard-nav";
import { useAuthStore } from "@/lib/store/auth";
import { useHydrated } from "@/lib/store/hydrated";
import { ROLE_LABELS, ROLE_HOME } from "@/lib/constants";
import type { Role } from "@/lib/types";
import { cn } from "@/lib/utils";

export function DashboardShell({ role, children }: { role: Role; children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser } = useAuthStore();
  const hydrated = useHydrated();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const sections = DASHBOARD_NAV[role];

  // Auth guard
  React.useEffect(() => {
    if (!hydrated) return;
    if (!currentUser) {
      router.replace(`/kirish?keyin=${encodeURIComponent(pathname)}`);
    } else if (currentUser.role !== role) {
      router.replace(ROLE_HOME[currentUser.role]);
    }
  }, [hydrated, currentUser, role, router, pathname]);

  const isActive = (href: string) =>
    pathname === href || (href !== ROLE_HOME[role] && pathname.startsWith(href));

  if (!hydrated || !currentUser || currentUser.role !== role) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="size-7 animate-spin text-primary" />
          <span className="text-sm">Yuklanmoqda…</span>
        </div>
      </div>
    );
  }

  const SidebarBody = (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center px-5">
        <Logo />
      </div>
      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-4">
        {sections.map((section, si) => (
          <div key={si}>
            {section.title && (
              <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                {section.title}
              </div>
            )}
            <div className="space-y-1">
              {section.items.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                      active
                        ? "bg-primary text-white shadow-soft"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    <DynamicIcon name={item.icon} fallback="Circle" className="size-[18px] shrink-0" />
                    <span className="flex-1">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-border p-3">
        <Link
          href="/"
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <ArrowLeft className="size-[18px]" /> Saytga qaytish
        </Link>
        <div className="mt-2 flex items-center gap-3 rounded-xl bg-muted/50 px-3 py-2.5">
          <Avatar src={currentUser.avatar} name={currentUser.fullName} size={36} />
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-semibold">{currentUser.fullName}</div>
            <div className="truncate text-xs text-muted-foreground">{ROLE_LABELS[role]}</div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-border bg-surface lg:block">
        {SidebarBody}
      </aside>

      <AnimatePresence>
        {mobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: "spring", duration: 0.35 }}
              className="absolute inset-y-0 left-0 w-72 border-r border-border bg-surface"
            >
              {SidebarBody}
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border bg-surface/90 px-4 backdrop-blur sm:px-6">
          <button
            onClick={() => setMobileOpen(true)}
            className="flex size-10 items-center justify-center rounded-lg border border-border lg:hidden"
            aria-label="Menyu"
          >
            <Menu className="size-5" />
          </button>
          <div className="hidden items-center gap-2 text-sm text-muted-foreground sm:flex">
            <Badge variant="default">{ROLE_LABELS[role]}</Badge>
            <span className="text-muted-foreground/60">kabineti</span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <NotificationBell />
            <RoleSwitcher />
          </div>
        </header>
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{children}</div>
      </div>
    </div>
  );
}
