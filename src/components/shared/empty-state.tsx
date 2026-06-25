"use client";
import * as React from "react";
import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface/60 px-6 py-16 text-center",
        className,
      )}
    >
      <div className="relative mb-5">
        <div className="absolute inset-0 -z-10 rounded-full bg-primary-100 blur-xl opacity-60" />
        <div className="flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-50 to-secondary-50 text-primary">
          <Icon className="size-7" />
        </div>
      </div>
      <h3 className="font-display text-lg font-semibold text-foreground">{title}</h3>
      {description && (
        <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">{description}</p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </motion.div>
  );
}
