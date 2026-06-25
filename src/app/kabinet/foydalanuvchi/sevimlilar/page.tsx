"use client";
import * as React from "react";
import Link from "next/link";
import { Heart, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { ServiceCard } from "@/components/shared/service-card";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/lib/store/app";
import { useFavorites } from "@/lib/store/favorites";
import { useHydrated } from "@/lib/store/hydrated";
import { isPublic } from "@/lib/status";
import type { Service } from "@/lib/types";

export default function SevimlilarPage() {
  const hydrated = useHydrated();
  const favIds = useFavorites((s) => s.ids);
  const services = useAppStore((s) => s.services);
  const providers = useAppStore((s) => s.providers);

  // Faqat mavjud va tasdiqlangan xizmatlarni saqlangan tartibda chiqaramiz.
  const favServices = React.useMemo(() => {
    const map = new Map(services.map((s) => [s.id, s]));
    return favIds
      .map((id) => map.get(id))
      .filter((s): s is Service => !!s && isPublic(s.status));
  }, [favIds, services]);

  const ownerName = (s: Service) => {
    const p = providers.find((pr) => pr.id === s.providerId);
    if (p?.type === "organization") return { orgName: p.name, providerName: undefined };
    return { orgName: undefined, providerName: p?.name };
  };

  if (!hydrated) {
    return (
      <>
        <PageHeader
          title="Sevimlilar"
          description="Saqlab qo'ygan xizmatlaringiz."
        />
        <div className="flex items-center justify-center gap-3 rounded-2xl border border-dashed border-border bg-surface/60 py-20 text-sm text-muted-foreground">
          <Loader2 className="size-5 animate-spin text-primary" /> Yuklanmoqda…
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader
        eyebrow="Saqlangan"
        icons={["Heart", "Star"]}
        title="Sevimlilar"
        description={
          favServices.length > 0
            ? `${favServices.length} ta saqlangan xizmat.`
            : "Saqlab qo'ygan xizmatlaringiz."
        }
      />

      {favServices.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="Sevimlilar bo'sh"
          description="Yoqqan xizmatlarni yurakcha tugmasi orqali saqlang — ular shu yerda jamlanadi."
          action={
            <Button asChild variant="primary">
              <Link href="/xizmatlar">Xizmatlarni ko'rish</Link>
            </Button>
          }
        />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {favServices.map((s, i) => {
            const { orgName, providerName } = ownerName(s);
            return (
              <ServiceCard
                key={s.id}
                service={s}
                orgName={orgName}
                providerName={providerName}
                index={i}
              />
            );
          })}
        </div>
      )}
    </>
  );
}
