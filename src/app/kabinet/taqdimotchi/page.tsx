"use client";
import * as React from "react";
import Link from "next/link";
import {
  LayoutGrid,
  Layers,
  Inbox,
  Pencil,
  Mail,
  Phone,
  MapPin,
  ArrowRight,
  Star,
  Briefcase,
  UserCog,
  Hash,
  CalendarDays,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { useAuthStore } from "@/lib/store/auth";
import { useAppStore } from "@/lib/store/app";
import { REGIONS, PROVIDER_TYPE_LABELS, DIRECTIONS, DIRECTION_MAP } from "@/lib/constants";

export default function TaqdimotchiProfilPage() {
  const currentUser = useAuthStore((s) => s.currentUser);
  const providers = useAppStore((s) => s.providers);
  const services = useAppStore((s) => s.services);
  const packages = useAppStore((s) => s.packages);
  const orders = useAppStore((s) => s.orders);
  const updateProvider = useAppStore((s) => s.updateProvider);
  const updateProfile = useAuthStore((s) => s.updateProfile);

  const me = providers.find((p) => p.id === currentUser?.providerId);

  const [editOpen, setEditOpen] = React.useState(false);
  const [name, setName] = React.useState("");
  const [region, setRegion] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [bio, setBio] = React.useState("");
  const [directionId, setDirectionId] = React.useState(DIRECTIONS[0].id);
  const [responsiblePerson, setResponsiblePerson] = React.useState("");
  const [taxId, setTaxId] = React.useState("");

  if (!currentUser) return null;
  if (!me) {
    return (
      <>
        <PageHeader title="Profil" description="Taqdimotchi profili." />
        <Card><CardContent className="p-8 text-center text-muted-foreground">Profil topilmadi.</CardContent></Card>
      </>
    );
  }

  const isOrg = me.type === "organization";
  const myServices = services.filter((s) => s.providerId === me.id);
  const myPackages = packages.filter((p) => p.providerId === me.id);
  const myOrders = orders.filter((o) => o.providerId === me.id);
  const completed = myOrders.filter((o) => o.status === "completed").length;

  const openEdit = () => {
    setName(me.name);
    setRegion(me.region);
    setPhone(me.phone ?? currentUser.phone);
    setBio(me.bio);
    setDirectionId(me.directionId);
    setResponsiblePerson(me.responsiblePerson ?? "");
    setTaxId(me.taxId ?? "");
    setEditOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProvider(me.id, {
      name: name.trim(),
      region,
      phone: phone.trim(),
      bio: bio.trim(),
      ...(isOrg
        ? { responsiblePerson: responsiblePerson.trim(), taxId: taxId.trim() }
        : { directionId }),
    });
    updateProfile({ fullName: name.trim(), region, phone: phone.trim() });
    setEditOpen(false);
  };

  return (
    <>
      <PageHeader
        eyebrow="Taqdimotchi"
        icons={["User", "Briefcase", "Star"]}
        title="Profil"
        description="Taqdimotchi profilingiz va faoliyatingiz."
        actions={<Button variant="outline" onClick={openEdit}><Pencil className="size-4" /> Tahrirlash</Button>}
      />

      <Card className="mb-6">
        <CardContent className="flex flex-col items-center gap-5 p-6 text-center sm:flex-row sm:items-center sm:p-7 sm:text-left">
          <Avatar src={me.avatar} name={me.name} size={88} ring />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              <h2 className="font-display text-xl font-bold tracking-tight text-foreground">{me.name}</h2>
              <Badge variant={isOrg ? "secondary" : "default"}>{PROVIDER_TYPE_LABELS[me.type]}</Badge>
              {me.verified && <Badge variant="success">Tasdiqlangan</Badge>}
            </div>
            <div className="mt-2 flex flex-col gap-1.5 text-sm text-muted-foreground sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-5">
              <span className="inline-flex items-center justify-center gap-1.5 sm:justify-start"><Mail className="size-4 shrink-0" /> {currentUser.email}</span>
              <span className="inline-flex items-center justify-center gap-1.5 sm:justify-start"><Phone className="size-4 shrink-0" /> {me.phone ?? currentUser.phone}</span>
              <span className="inline-flex items-center justify-center gap-1.5 sm:justify-start"><MapPin className="size-4 shrink-0" /> {me.region}</span>
              <span className="inline-flex items-center justify-center gap-1.5 sm:justify-start"><Star className="size-4 shrink-0 fill-accent text-accent" /> {me.rating.toFixed(1)}</span>
              {!isOrg && (
                <span className="inline-flex items-center justify-center gap-1.5 sm:justify-start"><Briefcase className="size-4 shrink-0" /> {DIRECTION_MAP[me.directionId]?.name}</span>
              )}
              {isOrg && me.responsiblePerson && (
                <span className="inline-flex items-center justify-center gap-1.5 sm:justify-start"><UserCog className="size-4 shrink-0" /> {me.responsiblePerson}</span>
              )}
              {isOrg && me.taxId && (
                <span className="inline-flex items-center justify-center gap-1.5 sm:justify-start"><Hash className="size-4 shrink-0" /> STIR: {me.taxId}</span>
              )}
            </div>
            {me.bio && <p className="mt-2 text-sm text-foreground/80">{me.bio}</p>}
          </div>
        </CardContent>
      </Card>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Xizmatlar" value={myServices.length} icon={LayoutGrid} accent="primary" index={0} />
        <StatCard label="Jamlanmalar" value={myPackages.length} icon={Layers} accent="secondary" index={1} />
        <StatCard label="Buyurtmalar" value={myOrders.length} icon={Inbox} accent="accent" index={2} />
        <StatCard label="Bajarilgan" value={completed} icon={Star} accent="success" index={3} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <QuickLink href="/kabinet/taqdimotchi/xizmatlar" icon={LayoutGrid} title="Xizmatlar" description="Xizmatlaringizni qo'shing va boshqaring." />
        <QuickLink href="/kabinet/taqdimotchi/jamlanmalar" icon={Layers} title="Jamlanmalar" description="Bir nechta xizmatdan to'plam tuzing." />
        <QuickLink href="/kabinet/taqdimotchi/buyurtmalar" icon={Inbox} title="Buyurtmalar" description="Kelgan buyurtmalarni boshqaring." />
        <QuickLink href="/kabinet/taqdimotchi/kalendar" icon={CalendarDays} title="Kalendar" description="Buyurtmalaringiz sanalar bo'yicha." />
      </div>

      <Dialog open={editOpen} onClose={() => setEditOpen(false)} title="Profilni tahrirlash" description="Ma'lumotlaringizni yangilang.">
        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">{isOrg ? "Tashkilot nomi" : "F.I.Sh."}</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          {!isOrg && (
            <div className="space-y-1.5">
              <Label htmlFor="profession">Kasb (yo'nalish)</Label>
              <Select id="profession" value={directionId} onChange={(e) => setDirectionId(e.target.value)}>
                {DIRECTIONS.map((d) => (<option key={d.id} value={d.id}>{d.name}</option>))}
              </Select>
            </div>
          )}
          {isOrg && (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="responsible">Mas'ul shaxs</Label>
                <Input id="responsible" value={responsiblePerson} onChange={(e) => setResponsiblePerson(e.target.value)} placeholder="F.I.Sh." />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="taxid">STIR (ixtiyoriy)</Label>
                <Input id="taxid" value={taxId} onChange={(e) => setTaxId(e.target.value)} placeholder="123456789" />
              </div>
            </>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="phone">Telefon</Label>
            <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+998 90 123 45 67" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="region">Hudud</Label>
            <Select id="region" value={region} onChange={(e) => setRegion(e.target.value)} required>
              {REGIONS.map((r) => (<option key={r} value={r}>{r}</option>))}
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="bio">Bio</Label>
            <Textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} maxLength={300} placeholder="O'zingiz haqingizda qisqacha…" />
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="ghost" onClick={() => setEditOpen(false)}>Bekor qilish</Button>
            <Button type="submit" variant="primary">Saqlash</Button>
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
