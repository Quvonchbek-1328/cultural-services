"use client";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { COMPARE_MAX } from "../constants";
import type { CompareItem, ItemKind } from "../types";

const key = (kind: ItemKind, id: string) => `${kind}:${id}`;

interface CompareState {
  items: CompareItem[];
  toggle: (kind: ItemKind, id: string) => void;
  has: (kind: ItemKind, id: string) => boolean;
  remove: (kind: ItemKind, id: string) => void;
  clear: () => void;
  /** chegaraga yetgan va bu element yo'q bo'lsa true */
  isFull: (kind: ItemKind, id: string) => boolean;
}

export const useCompare = create<CompareState>()(
  persist(
    (set, get) => ({
      items: [],
      toggle: (kind, id) =>
        set((s) => {
          const exists = s.items.some((i) => key(i.kind, i.id) === key(kind, id));
          if (exists) {
            return { items: s.items.filter((i) => key(i.kind, i.id) !== key(kind, id)) };
          }
          if (s.items.length >= COMPARE_MAX) return s; // chegara
          return { items: [...s.items, { kind, id }] };
        }),
      has: (kind, id) => get().items.some((i) => key(i.kind, i.id) === key(kind, id)),
      remove: (kind, id) =>
        set((s) => ({ items: s.items.filter((i) => key(i.kind, i.id) !== key(kind, id)) })),
      clear: () => set({ items: [] }),
      isFull: (kind, id) =>
        get().items.length >= COMPARE_MAX &&
        !get().items.some((i) => key(i.kind, i.id) === key(kind, id)),
    }),
    { name: "mx-compare", storage: createJSONStorage(() => localStorage) },
  ),
);
