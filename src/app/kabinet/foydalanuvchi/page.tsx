"use client";
import * as React from "react";
import Link from "next/link";
import {
  ShoppingBag,
  Heart,
  Star,
  Pencil,
  Mail,
  Phone,
  MapPin,
  ArrowRight,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Dialog } from "@/components/ui/dialog";
import { Input, Label, Select } from "@/components/ui/input";
import { useAuthStore } from "@/lib/store/auth";
import { useAppStore } from "@/lib/store/app";
import { useFavorites } from "@/lib/store/favorites";
import { useHydrated } from "@/lib/store/hydrated";
import { REGIONS } from "@/lib/constants";

export default function ProfilPage() {
  const currentUser = useAuthStore((s) => s.currentUser);
  const updateProfile = useAuthStore((s) => s.updateProfile);
  const orders = useAppStore((s) => s.orders);
  const favIds = useFavorites((s) => s.ids);
  const hydrated = useHydrated();

  const [editOpen, setEditOpen] = React.useState(false);
  const [fullName, setFullName] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [region, setRegion] = React.useState("");

  // DashboardShell auth/rolni kafolatlaydi, lekin store orqali o'qiymiz.
  if (!currentUser) return null;

  const myOrders = orders.filter((o) => o.customerId === currentUser.id);
  const activeOrders = myOrders.filter(
    (o) => o.status === "pending" || o.status === "accepted",
  );

  const openEdit = () => {
    setFullName(currentUser.fullName);
    setPhone(currentUser.phone);
    setRegion(currentUser.region);
    setEditOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({ fullName: fullName.trim(), phone: phone.trim(), region });
    setEditOpen(false);
  };

  return (
    <>
      <PageHeader
        eyebrow="Hisob"
        icons={["User", "ShoppingBag", "Heart"]}
        title="Profil"
        description="Shaxsiy ma'lumotlaringiz va hisob faoliyati."
        actions={
          <Button variant="outline" onClick={openEdit}>
            <Pencil className="size-4" /> Tahrirlash
          </Button>
        }
      />

      {/* Profil kartasi */}
      <Card className="mb-6">
        <CardContent className="flex flex-col items-center gap-5 p-6 text-center sm:flex-row sm:items-center sm:p-7 sm:text-left">
          <Avatar
            src={currentUser.avatar}
            name={currentUser.fullName}
            size={88}
            ring
          />
          <div className="min-w-0 flex-1">
            <h2 className="font-display text-xl font-bold tracking-tight text-foreground">
              {currentUser.fullName}
            </h2>
            <div className="mt-2 flex flex-col gap-1.5 text-sm text-muted-foreground sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-5">
              <span className="inline-flex items-center justify-center gap-1.5 sm:justify-start">
                <Mail className="size-4 shrink-0" /> {currentUser.email}
              </span>
              <span className="inline-flex items-center justify-center gap-1.5 sm:justify-start">
                <Phone className="size-4 shrink-0" /> {currentUser.phone}
              </span>
              <span className="inline-flex items-center justify-center gap-1.5 sm:justify-start">
                <MapPin className="size-4 shrink-0" /> {currentUser.region}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistika */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label="Jami buyurtmalar"
          value={myOrders.length}
          icon={ShoppingBag}
          accent="primary"
          hint="Barcha vaqt davomida"
          index={0}
        />
        <StatCard
          label="Faol buyurtmalar"
          value={activeOrders.length}
          icon={ShoppingBag}
          accent="secondary"
          hint="Kutilmoqda yoki qabul qilingan"
          index={1}
        />
        <StatCard
          label="Sevimlilar"
          value={hydrated ? favIds.length : "—"}
          icon={Heart}
          accent="accent"
          hint="Saqlangan xizmatlar"
          index={2}
        />
      </div>

      {/* Tezkor havolalar */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <QuickLink
          href="/kabinet/foydalanuvchi/buyurtmalar"
          icon={ShoppingBag}
          title="Buyurtmalar"
          description="Buyurtmalaringiz holatini kuzating."
        />
        <QuickLink
          href="/kabinet/foydalanuvchi/sevimlilar"
          icon={Heart}
          title="Sevimlilar"
          description="Saqlangan xizmatlaringiz."
        />
        <QuickLink
          href="/kabinet/foydalanuvchi/sharhlar"
          icon={Star}
          title="Sharhlar"
          description="Qoldirgan sharhlaringiz."
        />
      </div>

      <Card className="mt-4 border-primary-100 bg-primary-50/40">
        <CardContent className="flex flex-col items-start justify-between gap-3 p-5 sm:flex-row sm:items-center">
          <div>
            <h3 className="font-semibold text-foreground">
              Yangi xizmat qidiryapsizmi?
            </h3>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Platformadagi barcha madaniy xizmatlarni ko'rib chiqing.
            </p>
          </div>
          <Button asChild variant="primary">
            <Link href="/xizmatlar">
              Xizmatlarni ko'rish <ArrowRight className="size-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>

      {/* Tahrirlash dialogi */}
      <Dialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title="Profilni tahrirlash"
        description="Ism, telefon va hudud ma'lumotlarini yangilang."
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="fullName">To'liq ism</Label>
            <Input
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="To'liq ismingiz"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="phone">Telefon raqami</Label>
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+998 90 123 45 67"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="region">Hudud</Label>
            <Select
              id="region"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              required
            >
              {REGIONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </Select>
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setEditOpen(false)}
            >
              Bekor qilish
            </Button>
            <Button type="submit" variant="primary">
              Saqlash
            </Button>
          </div>
        </form>
      </Dialog>
    </>
  );
}

function QuickLink({
  href,
  icon: Icon,
  title,
  description,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <Link href={href} className="block">
      <Card className="card-hover h-full transition-shadow hover:shadow-card">
        <CardContent className="flex items-start gap-4 p-5">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary-50 to-secondary-50 text-primary">
            <Icon className="size-5" />
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-foreground">{title}</h3>
            <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
          </div>
          <ArrowRight className="ml-auto size-4 shrink-0 self-center text-muted-foreground" />
        </CardContent>
      </Card>
    </Link>
  );
}
