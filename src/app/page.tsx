import Link from "next/link";
import { ArrowRight, CalendarDays, MapPin, Quote, Layers } from "lucide-react";
import { SiteShell } from "@/components/layout/site-shell";
import { Hero } from "@/components/landing/hero";
import { StatsBand } from "@/components/landing/stats-band";
import { Advantages } from "@/components/landing/advantages";
import { SectionHeading } from "@/components/shared/page-header";
import { CategoryCard } from "@/components/shared/category-card";
import { ServiceCard } from "@/components/shared/service-card";
import { PackageCard } from "@/components/shared/package-card";
import { Stars } from "@/components/shared/rating-badge";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CATEGORIES, REGIONS, DIRECTION_MAP } from "@/lib/constants";
import { services, providerMap, packages, orders } from "@/lib/mock";
import { testimonials, upcomingEvents, howItWorks } from "@/lib/mock/content";
import { DynamicIcon } from "@/lib/icons";
import { formatDate } from "@/lib/utils";
import { isPublic } from "@/lib/status";

export default function HomePage() {
  const approved = services.filter((s) => isPublic(s.status));
  const featured = [...approved]
    .sort((a, b) => Number(b.featured) - Number(a.featured) || b.rating - a.rating)
    .slice(0, 8);

  const approvedPackages = packages
    .filter((p) => isPublic(p.status))
    .sort((a, b) => Number(b.featured) - Number(a.featured) || b.rating - a.rating)
    .slice(0, 4);

  const ownerName = (s: (typeof services)[number]) => {
    const p = providerMap[s.providerId];
    if (!p) return {};
    return p.type === "organization" ? { orgName: p.name } : { providerName: p.name };
  };

  const countInCategory = (categoryId: string) =>
    approved.filter((s) => DIRECTION_MAP[s.directionId]?.categoryId === categoryId).length;

  return (
    <SiteShell>
      <Hero />

      <StatsBand
        services={approved.length}
        providers={Object.keys(providerMap).length}
        orders={orders.length}
        regions={REGIONS.length}
      />

      {/* Kategoriyalar */}
      <section id="kategoriyalar" className="container-page py-16">
        <SectionHeading
          eyebrow="Kategoriyalar"
          title="Kerakli xizmat turini tanlang"
          description="Tadbiringiz uchun mos professional ijrochilarni kategoriyalar bo'yicha toping."
        />
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORIES.map((c, i) => (
            <CategoryCard key={c.id} category={c} count={countInCategory(c.id)} index={i} />
          ))}
        </div>
      </section>

      {/* Tavsiya etilgan xizmatlar */}
      <section className="bg-muted/40 py-16">
        <div className="container-page">
          <div className="flex items-end justify-between gap-4">
            <SectionHeading
              eyebrow="Tavsiya etilgan"
              title="Eng yaxshi xizmatlar"
              description="Yuqori reytingli va tasdiqlangan ijrochilar."
            />
            <Button asChild variant="outline" className="hidden shrink-0 sm:flex">
              <Link href="/xizmatlar">Barchasi <ArrowRight /></Link>
            </Button>
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((s, i) => (
              <ServiceCard key={s.id} service={s} index={i} {...ownerName(s)} />
            ))}
          </div>
        </div>
      </section>

      {/* Jamlanmalar */}
      {approvedPackages.length > 0 && (
        <section className="container-page py-16">
          <div className="flex items-end justify-between gap-4">
            <SectionHeading
              eyebrow="Jamlanmalar"
              title="Tayyor to'plamlar"
              description="Bir nechta xizmat yagona, qulay paketda — to'y va tadbirlar uchun."
            />
            <Button asChild variant="outline" className="hidden shrink-0 sm:flex">
              <Link href="/jamlanmalar">Barchasi <ArrowRight /></Link>
            </Button>
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {approvedPackages.map((p, i) => (
              <PackageCard key={p.id} pkg={p} index={i} providerName={providerMap[p.providerId]?.name} />
            ))}
          </div>
          <div className="mt-8 text-center sm:hidden">
            <Button asChild variant="outline"><Link href="/jamlanmalar">Barcha jamlanmalar <Layers /></Link></Button>
          </div>
        </section>
      )}

      {/* Platforma afzalliklari */}
      <Advantages />

      {/* Yaqinlashayotgan tadbirlar */}
      <section id="tadbirlar" className="bg-muted/40 py-16">
        <div className="container-page">
          <SectionHeading
            eyebrow="Tadbirlar"
            title="Yaqinlashayotgan tadbirlar"
            description="Mamlakat bo'ylab bo'lib o'tadigan madaniy tadbirlar."
          />
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {upcomingEvents.map((e) => (
              <div key={e.id} className="card-hover overflow-hidden rounded-2xl border border-border bg-surface shadow-soft">
                <div className="relative aspect-[16/10] overflow-hidden">
                  <img src={e.image} alt={e.title} className="h-full w-full object-cover" loading="lazy" />
                  <Badge className="absolute left-3 top-3 bg-surface/90 backdrop-blur" variant="accent">{e.category}</Badge>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-foreground">{e.title}</h3>
                  <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                    <p className="flex items-center gap-1.5"><CalendarDays className="size-4" /> {formatDate(e.date)}</p>
                    <p className="flex items-center gap-1.5"><MapPin className="size-4" /> {e.region}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Qanday ishlaydi */}
      <section id="qanday-ishlaydi" className="bg-slate-950 py-20 text-white">
        <div className="container-page">
          <div className="mx-auto max-w-2xl text-center">
            <span className="inline-block rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary-300">
              Qanday ishlaydi
            </span>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">To'rt oddiy qadam</h2>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {howItWorks.map((step, i) => (
              <div key={step.title} className="relative rounded-2xl border border-white/10 bg-white/5 p-6">
                <div className="flex size-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary">
                  <DynamicIcon name={step.icon} className="size-6" />
                </div>
                <div className="mt-4 text-sm font-semibold text-primary-300">0{i + 1}</div>
                <h3 className="mt-1 font-display text-lg font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm text-slate-400">{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Foydalanuvchi fikrlari */}
      <section className="container-page py-16">
        <SectionHeading eyebrow="Fikrlar" title="Foydalanuvchilar nima deydi" align="center" />
        <div className="mx-auto mt-10 grid max-w-6xl gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {testimonials.map((t) => (
            <div key={t.id} className="flex flex-col rounded-2xl border border-border bg-surface p-5 shadow-soft">
              <Quote className="size-7 text-primary-200" />
              <p className="mt-3 flex-1 text-sm leading-relaxed text-foreground/80">{t.text}</p>
              <div className="mt-4 flex items-center gap-3 border-t border-border pt-4">
                <Avatar src={t.avatar} name={t.name} size={40} />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold">{t.name}</div>
                  <div className="text-xs text-muted-foreground">{t.role}</div>
                </div>
                <Stars rating={t.rating} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container-page pb-20">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-secondary px-6 py-14 text-center text-white sm:px-12">
          <div className="motif-stars absolute inset-0 opacity-30" />
          <div className="relative mx-auto max-w-2xl">
            <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
              Xizmat ko'rsatasizmi? Bizga qo'shiling
            </h2>
            <p className="mt-3 text-white/90">
              O'z xizmatingiz va jamlanmalaringizni joylashtiring, yangi mijozlarga ega bo'ling.
              Ro'yxatdan o'tish bepul.
            </p>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
              <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90">
                <Link href="/royxatdan-otish">Taqdimotchi bo'lish <ArrowRight /></Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white/40 bg-transparent text-white hover:bg-white/10">
                <Link href="/xizmatlar">Xizmatlarni ko'rish</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
