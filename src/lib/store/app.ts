"use client";
import { create } from "zustand";
import {
  providers as seedProviders,
  services as seedServices,
  packages as seedPackages,
  reviews as seedReviews,
  orders as seedOrders,
} from "../mock";
import { CATEGORIES, DIRECTIONS } from "../constants";
import { isoDate } from "../mock/rng";
import { normalizeDiscount, type DiscountType } from "../discount";
import { useAudit } from "./audit";
import { useNotifications } from "./notifications";
import type {
  Category,
  Direction,
  Order,
  OrderStatus,
  PriceType,
  Provider,
  ProviderType,
  RegionPrice,
  Review,
  Role,
  Service,
  ServicePackage,
  ServiceStatus,
  AuditEntityType,
  Notification,
  ItemKind,
} from "../types";

/** Audit/bildirishnoma uchun amalni bajargan shaxs. */
export interface Actor {
  name: string;
  role: Role;
}

type NotifInput = Omit<Notification, "id" | "read" | "createdAt">;
type SetFn = (partial: AppStatePatch | ((s: AppState) => AppStatePatch)) => void;
type AppStatePatch = Partial<AppState>;

/**
 * Xizmat/jamlanma holatini o'zgartiradi, audit yozadi va bildirishnoma yuboradi.
 * Bitta joy — har bir bosqich (submit/admin/ministry) shuni chaqiradi (clean + DRY).
 */
function transition(
  get: () => AppState,
  set: SetFn,
  kind: AuditEntityType,
  id: string,
  next: ServiceStatus,
  reason: string | undefined,
  actor: Actor,
  action: string,
  buildNotif: (e: { title: string; providerId: string }) => NotifInput | null,
) {
  const entity =
    kind === "service" ? get().services.find((x) => x.id === id) : get().packages.find((x) => x.id === id);
  if (!entity) return;

  if (kind === "service")
    set((s) => ({ services: s.services.map((x) => (x.id === id ? { ...x, status: next, rejectionReason: reason } : x)) }));
  else
    set((s) => ({ packages: s.packages.map((x) => (x.id === id ? { ...x, status: next, rejectionReason: reason } : x)) }));

  useAudit.getState().log({
    entityType: kind,
    entityId: id,
    actorRole: actor.role,
    actorName: actor.name,
    action,
    note: reason,
  });

  const n = buildNotif({ title: entity.title, providerId: entity.providerId });
  if (n) useNotifications.getState().notify(n);

  // Nashr etilganda tizim yozuvi (spec: "Tizim — Portalga joylashtirildi").
  if (next === "PUBLISHED") {
    useAudit.getState().log({
      entityType: kind,
      entityId: id,
      actorRole: "system",
      actorName: "Tizim",
      action: "Portalga joylashtirildi",
    });
  }
}

function uid(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.floor(Math.random() * 10000)}`;
}

export interface NewServiceInput {
  title: string;
  directionId: string;
  region: string;
  district: string;
  description: string;
  regionPrices: RegionPrice[];
  priceType: PriceType;
  images?: string[];
  providerId: string;
  performerId: string;
}

export interface NewPackageInput {
  title: string;
  providerId: string;
  performerId?: string;
  serviceIds: string[];
  description: string;
  images?: string[];
  discountType?: DiscountType;
  discountValue?: number;
}

export interface NewOrderInput {
  kind: ItemKind;
  serviceId: string;
  serviceTitle: string;
  packageId?: string;
  bundleServiceIds?: string[];
  customerId: string;
  customerName: string;
  customerPhone: string;
  providerId: string;
  eventDate: string;
  region: string;
  address: string;
  note: string;
  amount: number;
  priceType: PriceType;
  negotiated?: boolean;
}

export interface NewReviewInput {
  serviceId: string;
  providerId: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  rating: number;
  text: string;
}

interface AppState {
  providers: Provider[];
  services: Service[];
  packages: ServicePackage[];
  reviews: Review[];
  orders: Order[];
  categories: Category[];
  directions: Direction[];

  /* --- Xizmatlar (ikki bosqichli tasdiqlash) --- */
  addService: (input: NewServiceInput) => Service;
  submitService: (id: string, actor: Actor) => void;
  adminApproveService: (id: string, actor: Actor) => void;
  adminRejectService: (id: string, reason: string, actor: Actor) => void;
  ministryApproveService: (id: string, actor: Actor) => void;
  ministryRejectService: (id: string, reason: string, actor: Actor) => void;
  updateService: (id: string, patch: Partial<Service>) => void;
  deleteService: (id: string) => void;

  /* --- Jamlanmalar (ikki bosqichli tasdiqlash) --- */
  addPackage: (input: NewPackageInput) => ServicePackage;
  submitPackage: (id: string, actor: Actor) => void;
  adminApprovePackage: (id: string, actor: Actor) => void;
  adminRejectPackage: (id: string, reason: string, actor: Actor) => void;
  ministryApprovePackage: (id: string, actor: Actor) => void;
  ministryRejectPackage: (id: string, reason: string, actor: Actor) => void;
  updatePackage: (id: string, patch: Partial<ServicePackage>) => void;
  deletePackage: (id: string) => void;

  /* --- Buyurtmalar --- */
  createOrder: (input: NewOrderInput) => Order;
  setOrderStatus: (id: string, status: OrderStatus, reason?: string) => void;

  /* --- Sharhlar --- */
  addReview: (input: NewReviewInput) => Review;
  setReviewStatus: (id: string, status: Review["status"]) => void;

  /* --- Kategoriyalar / Yo'nalishlar --- */
  addCategory: (c: Omit<Category, "id">) => void;
  updateCategory: (id: string, patch: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  addDirection: (d: Omit<Direction, "id">) => void;
  updateDirection: (id: string, patch: Partial<Direction>) => void;
  deleteDirection: (id: string) => void;

  /* --- Profillar --- */
  addProvider: (p: Partial<Provider> & { name: string; region: string; type: ProviderType }) => string;
  updateProvider: (id: string, patch: Partial<Provider>) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  providers: seedProviders,
  services: seedServices,
  packages: seedPackages,
  reviews: seedReviews,
  orders: seedOrders,
  categories: CATEGORIES,
  directions: DIRECTIONS,

  addService: (input) => {
    const svc: Service = {
      id: uid("s"),
      title: input.title,
      directionId: input.directionId,
      providerId: input.providerId,
      performerId: input.performerId,
      region: input.region,
      district: input.district,
      description: input.description,
      images: input.images?.length
        ? input.images
        : [`https://picsum.photos/seed/cs-new-${Math.floor(Math.random() * 999)}/800/600`],
      regionPrices: input.regionPrices,
      priceType: input.priceType,
      rating: 0,
      reviewCount: 0,
      status: "DRAFT",
      featured: false,
      createdAt: isoDate(0),
    };
    set((s) => ({ services: [svc, ...s.services] }));
    return svc;
  },

  submitService: (id, actor) =>
    transition(get, set, "service", id, "PENDING_ADMIN_REVIEW", undefined, actor, "Tasdiqlashga yubordi", (e) => ({
      recipientRole: "admin",
      kind: "info",
      title: "Yangi xizmat tekshiruvga",
      message: `"${e.title}" xizmati tasdiqlashga yuborildi.`,
      link: "/admin/xizmatlar",
    })),

  adminApproveService: (id, actor) =>
    transition(get, set, "service", id, "PENDING_MINISTRY_APPROVAL", undefined, actor, "Tasdiqladi", (e) => ({
      recipientRole: "ministry",
      kind: "info",
      title: "Kelishuvga yangi xizmat",
      message: `"${e.title}" admin tomonidan tasdiqlandi va kelishuvga yuborildi.`,
      link: "/vazirlik/xizmatlar",
    })),

  adminRejectService: (id, reason, actor) =>
    transition(get, set, "service", id, "ADMIN_REJECTED", reason, actor, "Rad etdi", (e) => ({
      recipientProviderId: e.providerId,
      kind: "danger",
      title: "Xizmat rad etildi",
      message: `"${e.title}" admin tomonidan rad etildi: ${reason}`,
      link: "/kabinet/taqdimotchi/xizmatlar",
    })),

  ministryApproveService: (id, actor) =>
    transition(get, set, "service", id, "PUBLISHED", undefined, actor, "Kelishildi", (e) => ({
      recipientProviderId: e.providerId,
      kind: "success",
      title: "Xizmatingiz e'lon qilindi",
      message: `Sizning "${e.title}" xizmatingiz muvaffaqiyatli e'lon qilindi.`,
      link: "/kabinet/taqdimotchi/xizmatlar",
    })),

  ministryRejectService: (id, reason, actor) =>
    transition(get, set, "service", id, "MINISTRY_REJECTED", reason, actor, "Rad etdi", (e) => ({
      recipientProviderId: e.providerId,
      kind: "danger",
      title: "Xizmat kelishuvda rad etildi",
      message: `"${e.title}" vazirlik koordinatori tomonidan rad etildi: ${reason}`,
      link: "/kabinet/taqdimotchi/xizmatlar",
    })),

  updateService: (id, patch) =>
    set((s) => ({
      services: s.services.map((sv) => (sv.id === id ? { ...sv, ...patch } : sv)),
    })),

  deleteService: (id) =>
    set((s) => ({
      services: s.services.filter((sv) => sv.id !== id),
      // o'chirilgan xizmatni jamlanmalardan ham chiqaramiz
      packages: s.packages.map((p) =>
        p.serviceIds.includes(id) ? { ...p, serviceIds: p.serviceIds.filter((x) => x !== id) } : p,
      ),
    })),

  addPackage: (input) => {
    // "Frontend hisob-kitobiga ishonmaslik": chegirma qiymati shu yerda normallashtiriladi.
    const discount = normalizeDiscount({ type: input.discountType, value: input.discountValue });
    const pkg: ServicePackage = {
      id: uid("pkg"),
      title: input.title,
      providerId: input.providerId,
      performerId: input.performerId,
      serviceIds: input.serviceIds,
      description: input.description,
      images: input.images?.length ? input.images : [],
      discountType: discount.type,
      discountValue: discount.value,
      rating: 0,
      reviewCount: 0,
      status: "DRAFT",
      featured: false,
      createdAt: isoDate(0),
    };
    set((s) => ({ packages: [pkg, ...s.packages] }));
    return pkg;
  },

  submitPackage: (id, actor) =>
    transition(get, set, "package", id, "PENDING_ADMIN_REVIEW", undefined, actor, "Tasdiqlashga yubordi", (e) => ({
      recipientRole: "admin",
      kind: "info",
      title: "Yangi jamlanma tekshiruvga",
      message: `"${e.title}" jamlanmasi tasdiqlashga yuborildi.`,
      link: "/admin/jamlanmalar",
    })),

  adminApprovePackage: (id, actor) =>
    transition(get, set, "package", id, "PENDING_MINISTRY_APPROVAL", undefined, actor, "Tasdiqladi", (e) => ({
      recipientRole: "ministry",
      kind: "info",
      title: "Kelishuvga yangi jamlanma",
      message: `"${e.title}" admin tomonidan tasdiqlandi va kelishuvga yuborildi.`,
      link: "/vazirlik/jamlanmalar",
    })),

  adminRejectPackage: (id, reason, actor) =>
    transition(get, set, "package", id, "ADMIN_REJECTED", reason, actor, "Rad etdi", (e) => ({
      recipientProviderId: e.providerId,
      kind: "danger",
      title: "Jamlanma rad etildi",
      message: `"${e.title}" admin tomonidan rad etildi: ${reason}`,
      link: "/kabinet/taqdimotchi/jamlanmalar",
    })),

  ministryApprovePackage: (id, actor) =>
    transition(get, set, "package", id, "PUBLISHED", undefined, actor, "Kelishildi", (e) => ({
      recipientProviderId: e.providerId,
      kind: "success",
      title: "Jamlanmangiz e'lon qilindi",
      message: `Sizning "${e.title}" jamlanmangiz muvaffaqiyatli e'lon qilindi.`,
      link: "/kabinet/taqdimotchi/jamlanmalar",
    })),

  ministryRejectPackage: (id, reason, actor) =>
    transition(get, set, "package", id, "MINISTRY_REJECTED", reason, actor, "Rad etdi", (e) => ({
      recipientProviderId: e.providerId,
      kind: "danger",
      title: "Jamlanma kelishuvda rad etildi",
      message: `"${e.title}" vazirlik koordinatori tomonidan rad etildi: ${reason}`,
      link: "/kabinet/taqdimotchi/jamlanmalar",
    })),

  updatePackage: (id, patch) =>
    set((s) => ({
      packages: s.packages.map((p) => {
        if (p.id !== id) return p;
        const merged = { ...p, ...patch };
        // Chegirma maydoni tegilgan bo'lsa — qayta validatsiya (frontendga ishonmaslik).
        if (patch.discountType !== undefined || patch.discountValue !== undefined) {
          const d = normalizeDiscount({ type: merged.discountType, value: merged.discountValue });
          merged.discountType = d.type;
          merged.discountValue = d.value;
        }
        return merged;
      }),
    })),

  deletePackage: (id) => set((s) => ({ packages: s.packages.filter((p) => p.id !== id) })),

  createOrder: (input) => {
    const order: Order = {
      id: uid("ord"),
      ...input,
      status: "pending",
      createdAt: isoDate(0),
    };
    set((s) => ({ orders: [order, ...s.orders] }));
    return order;
  },

  setOrderStatus: (id, status, reason) =>
    set((s) => ({
      orders: s.orders.map((o) =>
        o.id === id ? { ...o, status, rejectionReason: reason ?? o.rejectionReason } : o,
      ),
    })),

  addReview: (input) => {
    const review: Review = {
      id: uid("rv"),
      ...input,
      status: "visible",
      createdAt: isoDate(0),
    };
    set((s) => {
      const svcReviews = [review, ...s.reviews.filter((r) => r.serviceId === input.serviceId)];
      const avg = svcReviews.reduce((a, r) => a + r.rating, 0) / Math.max(1, svcReviews.length);
      return {
        reviews: [review, ...s.reviews],
        services: s.services.map((sv) =>
          sv.id === input.serviceId
            ? { ...sv, reviewCount: sv.reviewCount + 1, rating: Math.round(avg * 10) / 10 }
            : sv,
        ),
      };
    });
    return review;
  },

  setReviewStatus: (id, status) =>
    set((s) => ({
      reviews: s.reviews.map((r) => (r.id === id ? { ...r, status } : r)),
    })),

  addCategory: (c) =>
    set((s) => ({ categories: [...s.categories, { ...c, id: uid("cat") }] })),

  updateCategory: (id, patch) =>
    set((s) => ({
      categories: s.categories.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    })),

  deleteCategory: (id) =>
    set((s) => ({
      categories: s.categories.filter((c) => c.id !== id),
      directions: s.directions.filter((d) => d.categoryId !== id),
    })),

  addDirection: (d) =>
    set((s) => ({ directions: [...s.directions, { ...d, id: uid("dir") }] })),

  updateDirection: (id, patch) =>
    set((s) => ({
      directions: s.directions.map((d) => (d.id === id ? { ...d, ...patch } : d)),
    })),

  deleteDirection: (id) => set((s) => ({ directions: s.directions.filter((d) => d.id !== id) })),

  addProvider: (p) => {
    const id = uid("p");
    const provider: Provider = {
      id,
      name: p.name,
      type: p.type,
      directionId: p.directionId ?? "boshlovchi",
      region: p.region,
      district: p.district ?? "",
      avatar: p.avatar ?? `https://i.pravatar.cc/200?img=${Math.floor(Math.random() * 70) + 1}`,
      cover: p.cover ?? `https://picsum.photos/seed/cs-np-${Math.floor(Math.random() * 999)}/1200/720`,
      bio: p.bio ?? "Yangi xizmat taqdimotchisi.",
      gallery: p.gallery ?? [],
      rating: 0,
      reviewCount: 0,
      startingPrice: p.startingPrice ?? 0,
      verified: false,
      completedOrders: 0,
      memberSince: isoDate(0),
      phone: p.phone,
      email: p.email,
      responsiblePerson: p.responsiblePerson,
      taxId: p.taxId,
    };
    set((s) => ({ providers: [provider, ...s.providers] }));
    return id;
  },

  updateProvider: (id, patch) =>
    set((s) => ({
      providers: s.providers.map((p) => (p.id === id ? { ...p, ...patch } : p)),
    })),
}));

/* ---------- Yordamchi selektorlar ---------- */
/** Ommaviy (nashr etilgan) — portal/qidiruv/statistika uchun. */
export const publishedOnly = <T extends { status: ServiceStatus }>(items: T[]) =>
  items.filter((i) => i.status === "PUBLISHED");
/** Admin navbati (tekshirish kutilmoqda). */
export const pendingAdminOnly = <T extends { status: ServiceStatus }>(items: T[]) =>
  items.filter((i) => i.status === "PENDING_ADMIN_REVIEW");
/** Vazirlik navbati (kelishuv kutilmoqda). */
export const pendingMinistryOnly = <T extends { status: ServiceStatus }>(items: T[]) =>
  items.filter((i) => i.status === "PENDING_MINISTRY_APPROVAL");
