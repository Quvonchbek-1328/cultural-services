"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/auth";
import { useHydrated } from "@/lib/store/hydrated";
import { ROLE_HOME } from "@/lib/constants";
import type { Role } from "@/lib/types";
import { ChevronDown, Check, User, Briefcase, ShieldCheck, Repeat } from "lucide-react";
import { cn } from "@/lib/utils";

interface DemoView {
  email: string;
  label: string;
  role: Role;
  icon: React.ReactNode;
}

const DEMO_VIEWS: DemoView[] = [
  { email: "user@madaniy.uz", label: "Foydalanuvchi", role: "user", icon: <User className="size-4" /> },
  { email: "provider@madaniy.uz", label: "Xizmat ko'rsatuvchi", role: "provider", icon: <Briefcase className="size-4" /> },
  { email: "admin@madaniy.uz", label: "Administrator", role: "admin", icon: <ShieldCheck className="size-4" /> },
];

/** Demo: ko'rinishni almashtirish (qayta kirishsiz). */
export function RoleSwitcher() {
  const router = useRouter();
  const { currentUser, loginDemo } = useAuthStore();
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

  const currentEmail = hydrated ? currentUser?.email : undefined;
  const active = DEMO_VIEWS.find((v) => v.email === currentEmail);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2 text-sm font-medium transition-colors hover:bg-muted"
      >
        <Repeat className="size-4 text-muted-foreground" />
        <span className="hidden sm:inline">{active ? active.label : "Ko'rinish"}</span>
        <ChevronDown className="size-4 text-muted-foreground" />
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-60 overflow-hidden rounded-xl border border-border bg-surface p-1.5 shadow-card">
          <div className="px-2.5 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Ko'rinishni almashtirish (demo)
          </div>
          {DEMO_VIEWS.map((v) => (
            <button
              key={v.email}
              onClick={() => {
                loginDemo(v.email);
                setOpen(false);
                router.push(ROLE_HOME[v.role]);
              }}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left text-sm transition-colors hover:bg-muted",
                currentEmail === v.email && "bg-primary-50",
              )}
            >
              <span className={cn("text-muted-foreground", currentEmail === v.email && "text-primary")}>
                {v.icon}
              </span>
              <span className="flex-1 font-medium">{v.label}</span>
              {currentEmail === v.email && <Check className="size-4 text-primary" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
