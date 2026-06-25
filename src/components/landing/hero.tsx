"use client";
import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight, Plus } from "lucide-react";
import { SearchBar } from "@/components/shared/search-bar";
import { Button } from "@/components/ui/button";
import { CATEGORIES } from "@/lib/constants";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="motif-grid absolute inset-0 opacity-70" />
      <div className="absolute -top-32 left-1/2 -z-10 h-72 w-[42rem] -translate-x-1/2 rounded-full bg-primary-100/60 blur-3xl" />
      <div className="absolute right-0 top-24 -z-10 h-64 w-64 rounded-full bg-secondary-100/40 blur-3xl" />
      <div className="container-page relative py-16 sm:py-24">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto max-w-3xl text-center"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-primary-200 bg-primary-50 px-4 py-1.5 text-sm font-medium text-primary">
            <Sparkles className="size-4" /> O'zbekistondagi madaniy xizmatlar platformasi
          </span>
          <h1 className="mt-6 font-display text-4xl font-bold leading-[1.1] tracking-tight text-foreground sm:text-6xl">
            Madaniy va tadbir xizmatlarini <span className="text-gradient-brand">bir joyda</span> toping
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground">
            Boshlovchi, san'atkor, texnik ta'minot va boshqa xizmatlarni tez va ishonchli buyurtma qiling.
          </p>

          <div className="mx-auto mt-8 max-w-2xl">
            <SearchBar big />
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg">
              <Link href="/xizmatlar">Xizmat topish <ArrowRight /></Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/royxatdan-otish">Xizmat qo'shish <Plus /></Link>
            </Button>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            <span className="text-sm text-muted-foreground">Mashhur:</span>
            {CATEGORIES.slice(0, 5).map((c) => (
              <Link
                key={c.id}
                href={`/xizmatlar?kategoriya=${c.id}`}
                className="rounded-full border border-border bg-surface px-3 py-1 text-sm text-foreground transition-colors hover:border-primary-200 hover:text-primary"
              >
                {c.name}
              </Link>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
