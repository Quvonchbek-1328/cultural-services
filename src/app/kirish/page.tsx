"use client";
import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, Lock, LogIn, User, Briefcase, ShieldCheck, Landmark, ArrowLeft } from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { useAuthStore } from "@/lib/store/auth";
import { ROLE_HOME } from "@/lib/constants";
import type { Role } from "@/lib/types";

const DEMO: { role: Role; label: string; icon: React.ReactNode; email: string }[] = [
  { role: "user", label: "Foydalanuvchi", icon: <User className="size-4" />, email: "user@madaniy.uz" },
  { role: "provider", label: "Xizmat ko'rsatuvchi", icon: <Briefcase className="size-4" />, email: "provider@madaniy.uz" },
  { role: "ministry", label: "Vazirlik koordinatori", icon: <Landmark className="size-4" />, email: "vazirlik@madaniy.uz" },
  { role: "admin", label: "Administrator", icon: <ShieldCheck className="size-4" />, email: "admin@madaniy.uz" },
];

function LoginInner() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("keyin");
  const { login, loginDemo } = useAuthStore();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);

  function go(role: Role) {
    router.push(next || ROLE_HOME[role]);
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const res = login(email, password);
    if (!res.ok) {
      setError(res.error ?? "Kirishda xatolik.");
      return;
    }
    const role = useAuthStore.getState().currentUser!.role;
    go(role);
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Chap dekorativ panel */}
      <div className="relative hidden overflow-hidden bg-slate-950 lg:block">
        <div className="motif-stars absolute inset-0" />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-transparent to-secondary/30" />
        <div className="relative flex h-full flex-col justify-between p-12">
          <Logo variant="light" />
          <div>
            <h2 className="font-display text-4xl font-bold leading-tight text-white">
              Madaniy xizmatlar <span className="text-accent">yagona</span> platformada
            </h2>
            <p className="mt-4 max-w-md text-slate-300">
              Xonanda, raqs jamoasi, fotograf, ovoz texnikasi va boshqa yuzlab ijrochilarni
              toping yoki o'z xizmatingizni joylashtiring.
            </p>
          </div>
          <p className="text-sm text-slate-400">© 2026 Madaniy Xizmatlar</p>
        </div>
      </div>

      {/* O'ng forma */}
      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <Link href="/" className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="size-4" /> Bosh sahifa
          </Link>
          <div className="lg:hidden">
            <Logo />
          </div>
          <h1 className="mt-6 font-display text-2xl font-bold tracking-tight">Tizimga kirish</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Hisobingizga kiring yoki demo rol orqali sinab ko'ring.
          </p>

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@madaniy.uz"
                  className="pl-10"
                  required
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Parol</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-10"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="rounded-xl bg-danger-bg px-4 py-3 text-sm font-medium text-danger">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" size="lg">
              <LogIn /> Kirish
            </Button>
          </form>

          <p className="mt-4 text-center text-sm text-muted-foreground">
            Hisobingiz yo'qmi?{" "}
            <Link href="/royxatdan-otish" className="font-semibold text-primary hover:underline">
              Ro'yxatdan o'ting
            </Link>
          </p>

          <div className="mt-8">
            <div className="flex items-center gap-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              <span className="h-px flex-1 bg-border" /> Demo kirish <span className="h-px flex-1 bg-border" />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {DEMO.map((d) => (
                <button
                  key={d.email}
                  type="button"
                  onClick={() => {
                    loginDemo(d.email);
                    go(d.role);
                  }}
                  className="flex items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2.5 text-left text-sm font-medium transition-colors hover:border-primary-200 hover:bg-muted"
                >
                  <span className="text-primary">{d.icon}</span>
                  {d.label}
                </button>
              ))}
            </div>
            <p className="mt-3 text-center text-xs text-muted-foreground">
              Demo parol: <span className="font-mono font-semibold">12345678</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <React.Suspense fallback={null}>
      <LoginInner />
    </React.Suspense>
  );
}
