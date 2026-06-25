"use client";
import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Layers, Handshake, Star, MapPin, ChevronDown, Plus, X } from "lucide-react";
import { DynamicIcon } from "@/lib/icons";
import { DIRECTION_MAP } from "@/lib/constants";
import { priceInRegion } from "@/lib/pricing";
import { formatUZS, cn } from "@/lib/utils";
import type { Service, Provider } from "@/lib/types";

/** Tanlangan hudud bo'yicha xizmat narxi (negotiable -> undefined). */
function chipPrice(svc: Service, region: string) {
  return svc.priceType === "negotiable" ? undefined : priceInRegion(svc.regionPrices, region);
}

/**
 * Tadbir jamlanma konstruktori. Xizmatlar yo'nalish (kategoriya) bo'yicha
 * bloklarga guruhlanadi; har blokda bir nechta taqdimotchi chip sifatida
 * ko'rsatiladi va faqat bittasi tanlanadi. Asosiy yo'nalish doimo tanlangan.
 */
export function PackageBuilder({
  baseDirId,
  directionOrder,
  servicesByDirection,
  providersById,
  region,
  regionOptions,
  onRegionChange,
  selection,
  onSelect,
  discount,
  selectedCount,
}: {
  baseDirId: string;
  directionOrder: string[];
  servicesByDirection: Record<string, Service[]>;
  providersById: Record<string, Provider>;
  region: string;
  regionOptions: string[];
  onRegionChange: (region: string) => void;
  selection: Record<string, string>;
  onSelect: (dirId: string, serviceId: string | null) => void;
  discount: { qualifies: boolean; original: number; saved: number; final: number; rate: number };
  selectedCount: number;
}) {
  // Qaysi bloklar ochiq (chiplar ko'rinadi). Asosiy blok birinchi.
  const [open, setOpen] = React.useState<Record<string, boolean>>({});

  const toggleOpen = (dir: string) => setOpen((o) => ({ ...o, [dir]: !o[dir] }));

  const ProviderChip = ({ svc, dir }: { svc: Service; dir: string }) => {
    const prov = providersById[svc.providerId];
    const price = chipPrice(svc, region);
    const available = svc.priceType === "negotiable" || price !== undefined;
    const picked = selection[dir] === svc.id;
    const isBase = dir === baseDirId;
    return (
      <motion.button
        type="button"
        whileTap={available ? { scale: 0.97 } : undefined}
        disabled={!available}
        onClick={() => {
          if (!available) return;
          // Asosiy yo'nalishni bo'shatib bo'lmaydi; qo'shimchani qayta bosish -> olib tashlash
          if (picked && !isBase) onSelect(dir, null);
          else onSelect(dir, svc.id);
          if (!picked) setOpen((o) => ({ ...o, [dir]: false }));
        }}
        className={cn(
          "flex items-center gap-3 rounded-xl border p-2.5 text-left transition-all",
          picked
            ? "border-secondary bg-secondary-50 ring-1 ring-secondary/50"
            : "border-border bg-surface/60 hover:border-secondary/40 hover:bg-surface",
          !available && "cursor-not-allowed opacity-40",
        )}
      >
        <span className="relative">
          <img src={prov?.avatar} alt="" className="size-10 shrink-0 rounded-lg object-cover" />
          {picked && (
            <span className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-secondary text-white">
              <Check className="size-2.5" />
            </span>
          )}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold text-foreground">{prov?.name ?? svc.title}</span>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Star className="size-3 fill-accent text-accent" /> {(prov?.rating ?? svc.rating).toFixed(1)}
          </span>
        </span>
        <span className="shrink-0 text-right text-sm font-bold">
          {svc.priceType === "negotiable" ? (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground">
              <Handshake className="size-3.5" /> Kelishiladi
            </span>
          ) : available ? (
            <span className={cn("font-display", picked ? "text-secondary" : "text-primary")}>{formatUZS(price ?? 0)}</span>
          ) : (
            <span className="text-xs text-muted-foreground">Bu hududda yo'q</span>
          )}
        </span>
      </motion.button>
    );
  };

  const Block = ({ dir }: { dir: string }) => {
    const meta = DIRECTION_MAP[dir];
    const options = (servicesByDirection[dir] ?? []).slice(0, 6); // ponytail: kategoriyaga 6 ta chip, kerak bo'lsa "ko'proq" tugmasi
    const isBase = dir === baseDirId;
    const selSvc = selection[dir] ? options.find((s) => s.id === selection[dir]) : undefined;
    const selProv = selSvc ? providersById[selSvc.providerId] : undefined;
    const selPrice = selSvc ? chipPrice(selSvc, region) : undefined;
    const isOpen = open[dir] || (!isBase && !selSvc); // tanlanmagan ixtiyoriy blok ochiq, asosiy yopiq boshlaydi
    if (!options.length) return null;

    return (
      <div
        className={cn(
          "rounded-2xl border p-4 transition-colors",
          selSvc ? "border-secondary/40 bg-secondary-50/30" : "border-border bg-surface/40",
        )}
      >
        <div className="flex items-center gap-3">
          <span
            className={cn(
              "flex size-10 shrink-0 items-center justify-center rounded-xl",
              selSvc ? "bg-secondary/15 text-secondary" : "bg-white/[0.04] text-muted-foreground",
            )}
          >
            <DynamicIcon name={meta?.icon ?? "Sparkles"} className="size-5" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                {isBase ? "Asosiy xizmat" : "Qo'shimcha xizmat"}
              </span>
            </div>
            <div className="truncate font-display text-base font-semibold text-foreground">{meta?.name}</div>
            {meta?.description && <div className="line-clamp-1 text-xs text-muted-foreground">{meta.description}</div>}
          </div>
          {/* Tanlangan -> narx + O'zgartirish; tanlanmagan -> Qo'shish/Yopish */}
          {selSvc && !isOpen ? (
            <div className="flex items-center gap-2">
              <span className="text-right">
                {selPrice !== undefined ? (
                  <span className="font-display text-sm font-bold text-secondary">{formatUZS(selPrice)}</span>
                ) : (
                  <span className="text-xs text-muted-foreground">Kelishiladi</span>
                )}
              </span>
              <button
                type="button"
                onClick={() => toggleOpen(dir)}
                className="rounded-lg border border-border px-2.5 py-1.5 text-xs font-semibold text-foreground transition-colors hover:bg-muted"
              >
                O'zgartirish
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => toggleOpen(dir)}
              className={cn(
                "inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-colors",
                isOpen ? "border-secondary/50 text-secondary" : "border-border text-foreground hover:bg-muted",
              )}
            >
              {isOpen ? <ChevronDown className="size-3.5" /> : <Plus className="size-3.5" />}
              {isOpen ? "Yopish" : "Qo'shish"}
            </button>
          )}
        </div>

        {/* Tanlangan provayder qisqacha (yopiq holatda) */}
        {selSvc && selProv && !isOpen && (
          <div className="mt-3 flex items-center gap-3 rounded-xl bg-white/[0.03] p-2.5">
            <img src={selProv.avatar} alt="" className="size-9 rounded-lg object-cover" />
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold text-foreground">{selProv.name}</div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Star className="size-3 fill-accent text-accent" /> {selProv.rating.toFixed(1)}
              </div>
            </div>
            {!isBase && (
              <button
                type="button"
                onClick={() => onSelect(dir, null)}
                className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:text-danger"
              >
                <X className="size-3.5" /> Olib tashlash
              </button>
            )}
          </div>
        )}

        {/* Provayder chiplari (ochiq holatda) */}
        <AnimatePresence initial={false}>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.22 }}
              className="overflow-hidden"
            >
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {options.map((svc) => (
                  <ProviderChip key={svc.id} svc={svc} dir={dir} />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <section className="rounded-3xl border border-border bg-surface/50 p-5 shadow-card backdrop-blur sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Layers className="size-5 text-secondary" />
          <h2 className="font-display text-2xl font-bold tracking-tight">Jamlanma konstruktori</h2>
        </div>
        {/* Hudud tanlovchi (dropdown) */}
        <label className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface/60 px-3 py-2 text-sm">
          <MapPin className="size-4 text-secondary" />
          <span className="text-muted-foreground">Hudud</span>
          <select
            value={region}
            onChange={(e) => onRegionChange(e.target.value)}
            className="bg-transparent font-semibold text-foreground outline-none [&>option]:text-black"
          >
            {regionOptions.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </label>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        Tadbiringiz uchun xizmatlarni tanlang — har bir yo'nalishda taqdimotchini almashtiring, narx avtomatik yangilanadi.
      </p>

      <div className="mt-5 space-y-3">
        {directionOrder.map((dir) => (
          <Block key={dir} dir={dir} />
        ))}
      </div>

      {/* Narx kalkulyatori */}
      <div className="mt-5 rounded-2xl border border-border bg-white/[0.03] p-4">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Asl narx</span>
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={discount.original}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.22 }}
              className={cn("font-display font-semibold", discount.qualifies && "text-muted-foreground line-through")}
            >
              {formatUZS(discount.original)}
            </motion.span>
          </AnimatePresence>
        </div>
        <AnimatePresence initial={false}>
          {discount.qualifies && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.22 }}
              className="overflow-hidden"
            >
              <div className="mt-2 flex items-center justify-between text-sm font-medium text-secondary">
                <span>Jamlanma chegirmasi</span>
                <span className="font-display">-{formatUZS(discount.saved)}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div className="mt-3 flex items-end justify-between border-t border-border pt-3">
          <div>
            <div className="text-sm text-muted-foreground">Yakuniy narx</div>
            <div className="text-xs text-muted-foreground">{selectedCount} ta xizmat tanlandi</div>
          </div>
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div
              key={discount.final}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="text-right"
            >
              <span className="font-display text-2xl font-bold text-secondary">{formatUZS(discount.final)}</span>
              {discount.qualifies && (
                <div className="text-xs font-semibold text-secondary">
                  Siz {Math.round(discount.rate * 100)}% tejaysiz
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
