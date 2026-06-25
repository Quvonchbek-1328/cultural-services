"use client";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Notification, Role } from "../types";

function uid(): string {
  return `ntf-${Date.now().toString(36)}-${Math.floor(Math.random() * 100000)}`;
}

/** Qabul qiluvchi — aniq hisob (id), provider profili yoki rol bo'yicha. */
export interface Recipient {
  id?: string;
  providerId?: string;
  role?: Role;
}

/** Bildirishnoma shu qabul qiluvchiga tegishlimi (hisob / provider / rol mosligi). */
function matches(n: Notification, r: Recipient): boolean {
  if (n.recipientId && r.id && n.recipientId === r.id) return true;
  if (n.recipientProviderId && r.providerId && n.recipientProviderId === r.providerId) return true;
  if (n.recipientRole && r.role && n.recipientRole === r.role) return true;
  return false;
}

interface NotifState {
  items: Notification[];
  notify: (n: Omit<Notification, "id" | "read" | "createdAt">) => void;
  markRead: (id: string) => void;
  markAllRead: (r: Recipient) => void;
  forRecipient: (r: Recipient) => Notification[];
  unreadCount: (r: Recipient) => number;
}

export const useNotifications = create<NotifState>()(
  persist(
    (set, get) => ({
      items: [],
      notify: (n) =>
        set((s) => ({
          items: [{ ...n, id: uid(), read: false, createdAt: new Date().toISOString() }, ...s.items].slice(0, 200),
        })),
      markRead: (id) => set((s) => ({ items: s.items.map((n) => (n.id === id ? { ...n, read: true } : n)) })),
      markAllRead: (r) =>
        set((s) => ({ items: s.items.map((n) => (matches(n, r) ? { ...n, read: true } : n)) })),
      forRecipient: (r) => get().items.filter((n) => matches(n, r)),
      unreadCount: (r) => get().items.filter((n) => matches(n, r) && !n.read).length,
    }),
    { name: "mx-notif-v1", storage: createJSONStorage(() => localStorage) },
  ),
);
