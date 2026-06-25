"use client";
import * as React from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, ArrowDownRight, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/** Raqamli qiymatlar uchun count-up animatsiyasi (reduced-motion'ga rioya qiladi). */
function AnimatedNumber({ value }: { value: number }) {
  const [display, setDisplay] = React.useState(value);
  React.useEffect(() => {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      setDisplay(value);
      return;
    }
    let raf = 0;
    let startTs = 0;
    const from = 0;
    const dur = 700;
    const tick = (t: number) => {
      if (!startTs) startTs = t;
      const p = Math.min(1, (t - startTs) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(from + (value - from) * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  return <>{display.toLocaleString("ru-RU")}</>;
}

export function StatCard({
  label,
  value,
  icon: Icon,
  trend,
  hint,
  accent = "primary",
  index = 0,
}: {
  label: string;
  value: React.ReactNode;
  icon: LucideIcon;
  trend?: { value: string; up: boolean };
  hint?: string;
  accent?: "primary" | "secondary" | "accent" | "success";
  index?: number;
}) {
  const accents = {
    primary: "from-primary-50 to-primary-100 text-primary",
    secondary: "from-secondary-50 to-secondary-100 text-secondary",
    accent: "from-accent-50 to-accent-100 text-accent-600",
    success: "from-primary-50 to-primary-100 text-success",
  }[accent];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="group rounded-2xl border border-border bg-surface p-5 shadow-soft transition-shadow hover:shadow-card"
    >
      <div className="flex items-start justify-between">
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
        <div
          className={cn(
            "flex size-10 items-center justify-center rounded-xl bg-gradient-to-br",
            accents,
          )}
        >
          <Icon className="size-5" />
        </div>
      </div>
      <div className="mt-3 font-display text-2xl font-bold tracking-tight">
        {typeof value === "number" ? <AnimatedNumber value={value} /> : value}
      </div>
      <div className="mt-2 flex items-center gap-2">
        {trend && (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-xs font-semibold",
              trend.up ? "bg-[var(--color-success-bg)] text-[var(--color-success)]" : "bg-[var(--color-danger-bg)] text-[var(--color-danger)]",
            )}
          >
            {trend.up ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}
            {trend.value}
          </span>
        )}
        {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
      </div>
    </motion.div>
  );
}
