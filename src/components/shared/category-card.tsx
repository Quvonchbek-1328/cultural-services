"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { DynamicIcon } from "@/lib/icons";
import type { Category } from "@/lib/types";

export function CategoryCard({
  category,
  count,
  index = 0,
}: {
  category: Category;
  count?: number;
  index?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: (index % 8) * 0.05, duration: 0.4 }}
    >
      <Link
        href={`/xizmatlar?kategoriya=${category.id}`}
        className="card-hover group relative flex h-full flex-col items-start gap-4 overflow-hidden rounded-2xl border border-border bg-surface/70 p-6 shadow-soft ring-1 ring-white/5 backdrop-blur"
      >
        {/* subtle glow */}
        <div className="pointer-events-none absolute -right-10 -top-10 size-32 rounded-full bg-primary/10 blur-3xl transition-opacity group-hover:opacity-100 opacity-60" />
        <div
          className={cn(
            "relative flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br ring-1 ring-white/10",
            category.color,
          )}
        >
          <DynamicIcon name={category.icon} className="size-7" />
        </div>
        <div className="relative">
          <h3 className="font-display text-lg font-semibold text-foreground">{category.name}</h3>
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{category.description}</p>
        </div>
        {count !== undefined && (
          <span className="relative mt-auto inline-flex items-center gap-1 rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary">
            {count} ta xizmat
            <ArrowUpRight className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </span>
        )}
      </Link>
    </motion.div>
  );
}
