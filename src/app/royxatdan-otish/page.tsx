"use client";
import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, User, Phone, UserPlus, ArrowLeft, Briefcase, Check } from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import { useAuthStore } from "@/lib/store/auth";
import { REGIONS, ROLE_HOME, DIRECTIONS } from "@/lib/constants";
import type { Role } from "@/lib/types";
import { cn } from "@/lib/utils";

const ROLE_OPTIONS: { role: Role; title: string; desc: string; icon: React.ReactNode }[] = [
  { role: "user", title: "Foydalanuvchi", desc: "Xizmatlarni qidirish va buyurtma berish", icon: <User className="size-5" /> },
  { role: "provider", title: "Xizmat ko'rsatuvchi", desc: "Xizmat va jamlanmalarni joylashtirish", icon: <Briefcase className="size-5" /> },
];

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuthStore();
  const [role, setRole] = React.useState<Role>("user");
  const [form, setForm] = React.useState({
    fullName: "",
    email: "",
    phone: "",
    region: REGIONS[0] as string,
    password: "",
    confirm: "",
    directionId: DIRECTIONS[0].id,
  });
  const [error, setError] = React.useState<string | null>(null);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (form.password.length < 6) {
      setError("Parol kamida 6 ta belgidan iborat bo'lishi kerak.");
      return;
    }
    if (form.password !== form.confirm) {
      setError("Parollar mos kelmadi.");
      return;
    }
    const res = register({
      fullName: form.fullName,
      email: form.email,
      phone: form.phone,
      password: form.password,
      role,
      region: form.region,
      providerType: role === "provider" ? "individual" : undefined,
      directionId: role === "provider" ? form.directionId : undefined,
    });
    if (!res.ok) {
      setError(res.error ?? "Ro'yxatdan o'tishda xatolik.");
      return;
    }
    router.push(ROLE_HOME[role]);
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <Link href="/" className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="size-4" /> Bosh sahifa
          </Link>
          <div className="lg:hidden">
            <Logo />
          </div>
          <h1 className="mt-6 font-display text-2xl font-bold tracking-tight">Ro'yxatdan o'tish</h1>
          <p className="mt-1 text-sm text-muted-foreground">Hisob turini tanlang va ma'lumotlarni kiriting.</p>

          {/* Rol tanlash */}
          <div className="mt-5 grid gap-2">
            {ROLE_OPTIONS.map((o) => (
              <button
                key={o.role}
                type="button"
                onClick={() => setRole(o.role)}
                className={cn(
                  "flex items-center gap-3 rounded-xl border p-3 text-left transition-all",
                  role === o.role
                    ? "border-primary bg-primary-50 ring-1 ring-primary"
                    : "border-border bg-surface hover:bg-muted",
                )}
              >
                <span
                  className={cn(
                    "flex size-10 items-center justify-center rounded-lg",
                    role === o.role ? "bg-primary text-white" : "bg-muted text-muted-foreground",
                  )}
                >
                  {o.icon}
                </span>
                <span className="flex-1">
                  <span className="block text-sm font-semibold">{o.title}</span>
                  <span className="block text-xs text-muted-foreground">{o.desc}</span>
                </span>
                {role === o.role && <Check className="size-5 text-primary" />}
              </button>
            ))}
          </div>

          <form onSubmit={onSubmit} className="mt-5 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="fullName">{role === "provider" ? "Nomi" : "F.I.Sh."}</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="fullName" value={form.fullName} onChange={set("fullName")} placeholder={role === "provider" ? "Ism yoki tashkilot nomi" : "Ism Familiya"} className="pl-10" required />
              </div>
            </div>

            {role === "provider" && (
              <div className="space-y-1.5">
                <Label htmlFor="profession">Yo'nalish</Label>
                <Select id="profession" value={form.directionId} onChange={set("directionId")}>
                  {DIRECTIONS.map((d) => (<option key={d.id} value={d.id}>{d.name}</option>))}
                </Select>
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input id="email" type="email" value={form.email} onChange={set("email")} placeholder="email@mail.uz" className="pl-10" required />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="phone">Telefon</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input id="phone" value={form.phone} onChange={set("phone")} placeholder="+998 90 123 45 67" className="pl-10" required />
                </div>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="region">Viloyat</Label>
              <Select id="region" value={form.region} onChange={set("region")}>
                {REGIONS.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </Select>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="password">Parol</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input id="password" type="password" value={form.password} onChange={set("password")} placeholder="••••••••" className="pl-10" required />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="confirm">Parolni tasdiqlang</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input id="confirm" type="password" value={form.confirm} onChange={set("confirm")} placeholder="••••••••" className="pl-10" required />
                </div>
              </div>
            </div>

            {error && (
              <div className="rounded-xl bg-danger-bg px-4 py-3 text-sm font-medium text-danger">{error}</div>
            )}

            <Button type="submit" className="w-full" size="lg">
              <UserPlus /> Ro'yxatdan o'tish
            </Button>
          </form>

          <p className="mt-4 text-center text-sm text-muted-foreground">
            Hisobingiz bormi?{" "}
            <Link href="/kirish" className="font-semibold text-primary hover:underline">
              Tizimga kiring
            </Link>
          </p>
        </div>
      </div>

      {/* O'ng dekorativ panel */}
      <div className="relative hidden overflow-hidden bg-slate-950 lg:block">
        <div className="motif-stars absolute inset-0" />
        <div className="absolute inset-0 bg-gradient-to-br from-secondary/30 via-transparent to-primary/30" />
        <div className="relative flex h-full flex-col justify-between p-12">
          <div className="ml-auto"><Logo variant="light" /></div>
          <div>
            <h2 className="font-display text-4xl font-bold leading-tight text-white">
              Bir necha daqiqada <span className="text-accent">boshlang</span>
            </h2>
            <ul className="mt-6 space-y-3 text-slate-300">
              {["Minglab tasdiqlangan ijrochilar", "Shaffof narxlar va sharhlar", "Xavfsiz va qulay buyurtma", "Daromad statistikasi"].map((t) => (
                <li key={t} className="flex items-center gap-3">
                  <span className="flex size-6 items-center justify-center rounded-full bg-primary/20 text-primary-300">
                    <Check className="size-3.5" />
                  </span>
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <p className="text-sm text-slate-400">© 2026 Madaniy Xizmatlar</p>
        </div>
      </div>
    </div>
  );
}
