"use client";
import * as React from "react";

/**
 * Persist qilingan store'lar SSR bilan mos kelishi uchun:
 * birinchi klient renderdan keyin `true` bo'ladi.
 * Auth/sevimlilarga bog'liq UI shu hookдан foydalanadi.
 */
export function useHydrated(): boolean {
  const [hydrated, setHydrated] = React.useState(false);
  React.useEffect(() => setHydrated(true), []);
  return hydrated;
}
