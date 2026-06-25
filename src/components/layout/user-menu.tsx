"use client";
import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, LayoutDashboard, ChevronDown, Heart } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/lib/store/auth";
import { useHydrated } from "@/lib/store/hydrated";
import { ROLE_LABELS, ROLE_HOME } from "@/lib/constants";

export function UserMenu() {
  const router = useRouter();
  const { currentUser, logout } = useAuthStore();
  const hydrated = useHydrated();
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  // SSR / hidratsiyadan oldin: kirish tugmalarini ko'rsatamiz (barqaror)
  if (!hydrated || !currentUser) {
    return (
      <div className="flex items-center gap-2">
        <Button asChild variant="ghost" size="sm">
          <Link href="/kirish">Kirish</Link>
        </Button>
        <Button asChild size="sm">
          <Link href="/royxatdan-otish">Ro'yxatdan o'tish</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-xl border border-border bg-surface px-2 py-1.5 text-sm font-medium transition-colors hover:bg-muted"
      >
        <Avatar src={currentUser.avatar} name={currentUser.fullName} size={28} />
        <span className="hidden max-w-[120px] truncate sm:inline">{currentUser.fullName}</span>
        <ChevronDown className="size-4 text-muted-foreground" />
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-xl border border-border bg-surface p-1.5 shadow-card">
          <div className="px-2.5 py-2">
            <div className="truncate text-sm font-semibold">{currentUser.fullName}</div>
            <div className="text-xs text-muted-foreground">{ROLE_LABELS[currentUser.role]}</div>
          </div>
          <div className="my-1 h-px bg-border" />
          <Link
            href={ROLE_HOME[currentUser.role]}
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm transition-colors hover:bg-muted"
          >
            <LayoutDashboard className="size-4 text-muted-foreground" /> Kabinet
          </Link>
          {currentUser.role === "user" && (
            <Link
              href="/kabinet/foydalanuvchi/sevimlilar"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm transition-colors hover:bg-muted"
            >
              <Heart className="size-4 text-muted-foreground" /> Sevimlilar
            </Link>
          )}
          <div className="my-1 h-px bg-border" />
          <button
            onClick={() => {
              logout();
              setOpen(false);
              router.push("/");
            }}
            className="flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left text-sm text-danger transition-colors hover:bg-danger-bg"
          >
            <LogOut className="size-4" /> Chiqish
          </button>
        </div>
      )}
    </div>
  );
}
