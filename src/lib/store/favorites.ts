"use client";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface FavState {
  ids: string[];
  toggle: (serviceId: string) => void;
  has: (serviceId: string) => boolean;
  clear: () => void;
}

export const useFavorites = create<FavState>()(
  persist(
    (set, get) => ({
      ids: [],
      toggle: (serviceId) =>
        set((s) => ({
          ids: s.ids.includes(serviceId)
            ? s.ids.filter((id) => id !== serviceId)
            : [serviceId, ...s.ids],
        })),
      has: (serviceId) => get().ids.includes(serviceId),
      clear: () => set({ ids: [] }),
    }),
    { name: "mx-favorites", storage: createJSONStorage(() => localStorage) },
  ),
);
