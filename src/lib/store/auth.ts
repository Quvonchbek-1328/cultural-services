"use client";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { accounts as seedAccounts } from "../mock";
import { isoDate } from "../mock/rng";
import { useAppStore } from "./app";
import type { Account, AccountStatus, ProviderType, Role } from "../types";

export interface RegisterInput {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  role: Role;
  region: string;
  /** role === "provider" bo'lsa: individual yoki tashkilot */
  providerType?: ProviderType;
  /** individual uchun kasb (yo'nalish id) */
  directionId?: string;
  /** tashkilot uchun mas'ul shaxs */
  responsiblePerson?: string;
  /** tashkilot uchun STIR (ixtiyoriy) */
  taxId?: string;
}

interface AuthState {
  currentUser: Account | null;
  accounts: Account[];

  login: (email: string, password: string) => { ok: boolean; error?: string };
  loginDemo: (email: string) => void;
  register: (input: RegisterInput) => { ok: boolean; error?: string };
  logout: () => void;
  updateProfile: (patch: Partial<Account>) => void;
  setAccountStatus: (id: string, status: AccountStatus) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      accounts: seedAccounts,

      login: (email, password) => {
        const acc = get().accounts.find(
          (a) => a.email.toLowerCase() === email.trim().toLowerCase(),
        );
        if (!acc) return { ok: false, error: "Bunday email topilmadi." };
        if (acc.password !== password) return { ok: false, error: "Parol noto'g'ri." };
        if (acc.status === "blocked") return { ok: false, error: "Hisob bloklangan." };
        set({ currentUser: acc });
        return { ok: true };
      },

      // Demo: email bo'yicha tezkor kirish
      loginDemo: (email) => {
        const acc = get().accounts.find(
          (a) => a.email.toLowerCase() === email.trim().toLowerCase(),
        );
        if (acc) set({ currentUser: acc });
      },

      register: (input) => {
        const exists = get().accounts.some(
          (a) => a.email.toLowerCase() === input.email.trim().toLowerCase(),
        );
        if (exists) return { ok: false, error: "Bu email allaqachon ro'yxatdan o'tgan." };

        const id = `acc-new-${get().accounts.length + 1}`;
        const acc: Account = {
          id,
          fullName: input.fullName,
          email: input.email.trim(),
          phone: input.phone,
          password: input.password,
          role: input.role,
          region: input.region,
          status: "active",
          createdAt: isoDate(0),
        };

        // Xizmat taqdimotchisi uchun profil yaratamiz (individual yoki tashkilot)
        if (input.role === "provider") {
          acc.providerId = useAppStore.getState().addProvider({
            name: input.fullName,
            region: input.region,
            type: input.providerType ?? "individual",
            email: input.email,
            phone: input.phone,
            directionId: input.directionId,
            responsiblePerson: input.responsiblePerson,
            taxId: input.taxId,
          });
        }

        set((s) => ({ accounts: [acc, ...s.accounts], currentUser: acc }));
        return { ok: true };
      },

      logout: () => set({ currentUser: null }),

      updateProfile: (patch) =>
        set((s) => {
          if (!s.currentUser) return {};
          const updated = { ...s.currentUser, ...patch };
          return {
            currentUser: updated,
            accounts: s.accounts.map((a) => (a.id === updated.id ? updated : a)),
          };
        }),

      setAccountStatus: (id, status) =>
        set((s) => ({
          accounts: s.accounts.map((a) => (a.id === id ? { ...a, status } : a)),
          currentUser:
            s.currentUser?.id === id ? { ...s.currentUser, status } : s.currentUser,
        })),
    }),
    {
      name: "mx-auth-v2",
      storage: createJSONStorage(() => localStorage),
      // accounts ro'yxati seed bilan birga kelsin — faqat sessiyani saqlaymiz
      partialize: (s) => ({ currentUser: s.currentUser }),
    },
  ),
);
