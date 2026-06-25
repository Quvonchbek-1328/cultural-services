import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { REFERENCE_NOW } from "./mock/rng";

/** Tailwind klasslarini xavfsiz birlashtirish. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** So'mda formatlash. */
export function formatUZS(amount: number, opts?: { compact?: boolean }): string {
  if (opts?.compact && amount >= 1_000_000) {
    return `${(amount / 1_000_000).toFixed(amount % 1_000_000 === 0 ? 0 : 1)} mln so'm`;
  }
  return `${new Intl.NumberFormat("ru-RU").format(Math.round(amount))} so'm`;
}

/** "boshlang'ich 1 200 000 so'm". */
export function formatPriceFrom(amount: number): string {
  return `${formatUZS(amount)} dan`;
}

const UZ_MONTHS = [
  "yan", "fev", "mar", "apr", "may", "iyn",
  "iyl", "avg", "sen", "okt", "noy", "dek",
];

/** "12 avg 2026". */
export function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getUTCDate()} ${UZ_MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

/** "12 avg 2026 · 18:00". */
export function formatDateTime(iso: string, time?: string): string {
  return time ? `${formatDate(iso)} · ${time}` : formatDate(iso);
}

/** Deterministik "vaqt oldin" (REFERENCE_NOW asosida, SSR uchun barqaror). */
export function timeAgo(iso: string): string {
  const diff = REFERENCE_NOW - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "hozirgina";
  if (mins < 60) return `${mins} daqiqa oldin`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} soat oldin`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} kun oldin`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} oy oldin`;
  return `${Math.floor(months / 12)} yil oldin`;
}

/** Ismdan bosh harflar. */
export function initials(name: string): string {
  return name
    .replace(/["']/g, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

export function clamp(n: number, min: number, max: number): number {
  return Math.min(Math.max(n, min), max);
}

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
