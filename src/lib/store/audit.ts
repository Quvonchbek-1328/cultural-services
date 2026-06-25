"use client";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { AuditEntry, AuditEntityType } from "../types";

function uid(): string {
  return `aud-${Date.now().toString(36)}-${Math.floor(Math.random() * 100000)}`;
}

interface AuditState {
  entries: AuditEntry[];
  /** Yangi audit yozuvi qo'shadi (eng so'nggi 500 saqlanadi). */
  log: (e: Omit<AuditEntry, "id" | "createdAt">) => void;
  /** Berilgan obyekt (xizmat/jamlanma) bo'yicha yozuvlar — vaqt tartibida. */
  entriesFor: (type: AuditEntityType, id: string) => AuditEntry[];
}

export const useAudit = create<AuditState>()(
  persist(
    (set, get) => ({
      entries: [],
      log: (e) =>
        set((s) => ({
          entries: [{ ...e, id: uid(), createdAt: new Date().toISOString() }, ...s.entries].slice(0, 500),
        })),
      entriesFor: (type, id) =>
        get()
          .entries.filter((x) => x.entityType === type && x.entityId === id)
          .sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
    }),
    { name: "mx-audit-v1", storage: createJSONStorage(() => localStorage) },
  ),
);
