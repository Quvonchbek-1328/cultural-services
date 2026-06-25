/* ============================================================
   Madaniy Xizmatlar — domen modellari (v2)
   ============================================================ */

import type { DiscountType } from "./discount";

/** Tizim rollari. "provider" = "Xizmat Taqdimotchisi" (ijrochi + tashkilot birlashgan).
 *  "ministry" = "Vazirlik koordinatori" — yakuniy ekspertiza va nashr qarori. */
export type Role = "user" | "provider" | "ministry" | "admin";

/** Taqdimotchi turi */
export type ProviderType = "individual" | "organization";

/**
 * Xizmat / jamlanma holati — ikki bosqichli tasdiqlash jarayoni:
 *   DRAFT → PENDING_ADMIN_REVIEW → (ADMIN_APPROVED) → PENDING_MINISTRY_APPROVAL
 *         → (MINISTRY_APPROVED) → PUBLISHED
 * ADMIN_APPROVED va MINISTRY_APPROVED — oraliq qarorlar (audit'ga yoziladi),
 * tizim ularni darhol keyingi holatga (PENDING_MINISTRY_APPROVAL / PUBLISHED) o'tkazadi.
 * Faqat PUBLISHED holati ommaviy portalda ko'rinadi.
 */
export type ServiceStatus =
  | "DRAFT"
  | "PENDING_ADMIN_REVIEW"
  | "ADMIN_APPROVED"
  | "PENDING_MINISTRY_APPROVAL"
  | "MINISTRY_APPROVED"
  | "PUBLISHED"
  | "ADMIN_REJECTED"
  | "MINISTRY_REJECTED";

/** Buyurtma holati */
export type OrderStatus =
  | "pending"
  | "accepted"
  | "rejected"
  | "completed"
  | "cancelled";

/** Narx turi */
export type PriceType = "fixed" | "negotiable";

/** Buyurtma predmeti turi */
export type ItemKind = "service" | "package";

/** Sharh moderatsiya holati */
export type ReviewStatus = "visible" | "hidden";

/** Hisob (foydalanuvchi) holati */
export type AccountStatus = "active" | "blocked";

/** Foydalanuvchi hisobi */
export interface Account {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  /** Soxta — faqat demo uchun */
  password: string;
  role: Role;
  avatar?: string;
  region: string;
  status: AccountStatus;
  createdAt: string;
  /** provider roli uchun bog'langan taqdimotchi profili */
  providerId?: string;
}

/* ---------- Taksonomiya: Kategoriya → Yo'nalish → Xizmat ---------- */

/** Yuqori daraja: Kategoriya (masalan "To'y va marosimlar") */
export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string; // lucide ikonka nomi
  description: string;
  color: string; // tailwind gradient klassi
}

/** O'rta daraja: Yo'nalish (masalan "Boshlovchi", "Maqom ansambli") */
export interface Direction {
  id: string;
  categoryId: string;
  name: string;
  slug: string;
  icon: string;
  description: string;
}

/* ---------- Narx ---------- */

/** Hududga bog'langan narx. Faqat ro'yxatdagi hududlarda xizmat mavjud. */
export interface RegionPrice {
  region: string;
  price: number;
}

/* ---------- Taqdimotchi (ijrochi yoki tashkilot) ---------- */

export interface Provider {
  id: string;
  name: string;
  /** Individual ijrochi yoki tashkilot */
  type: ProviderType;
  /** asosiy yo'nalish (profilda ko'rsatish uchun) */
  directionId: string;
  region: string;
  district: string;
  avatar: string;
  cover: string;
  bio: string;
  gallery: string[];
  rating: number;
  reviewCount: number;
  startingPrice: number;
  verified: boolean;
  completedOrders: number;
  memberSince: string;
  phone?: string;
  email?: string;
  /** type === "organization": mas'ul shaxs */
  responsiblePerson?: string;
  /** type === "organization": STIR (soliq id, ixtiyoriy) */
  taxId?: string;
}

/* ---------- Xizmat ---------- */

export interface Service {
  id: string;
  title: string;
  /** yo'nalish (kategoriya yo'nalish orqali aniqlanadi) */
  directionId: string;
  /** xizmat egasi (individual yoki tashkilot taqdimotchi) */
  providerId: string;
  /** bajaruvchi individual ijrochi (individual uchun = providerId, tashkilot uchun a'zo) */
  performerId: string;
  region: string;
  district: string;
  description: string;
  images: string[];
  /** hudud bo'yicha narxlar (faqat shu hududlarda mavjud) */
  regionPrices: RegionPrice[];
  priceType: PriceType;
  rating: number;
  reviewCount: number;
  status: ServiceStatus;
  rejectionReason?: string;
  featured: boolean;
  createdAt: string;
}

/* ---------- Jamlanma (bir nechta xizmat to'plami) ---------- */

export interface ServicePackage {
  id: string;
  title: string;
  providerId: string;
  performerId?: string;
  /** to'plamga kiruvchi xizmat id'lari */
  serviceIds: string[];
  description: string;
  images: string[];
  /** Chegirma turi (default: NONE). Narxlar hudud bo'yicha hisoblanadi —
   *  bu yerda faqat chegirma KONFIGURATSIYASI saqlanadi (absolyut narx emas). */
  discountType?: DiscountType;
  /** PERCENTAGE → foiz (1–100) · FIXED_AMOUNT → so'm · NONE → 0 */
  discountValue?: number;
  rating: number;
  reviewCount: number;
  status: ServiceStatus;
  rejectionReason?: string;
  featured: boolean;
  createdAt: string;
}

/* ---------- Buyurtma ---------- */

export interface Order {
  id: string;
  /** xizmat yoki jamlanma */
  kind: ItemKind;
  /** xizmat uchun serviceId, jamlanma uchun packageId (umumiy ref) */
  serviceId: string;
  serviceTitle: string;
  packageId?: string;
  /** mijoz tuzgan jamlanma (asosiy + qo'shimchalar) xizmat id'lari */
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
  /** narx kelishuv asosida bo'lsa true (amount = 0) */
  negotiated?: boolean;
  status: OrderStatus;
  rejectionReason?: string;
  createdAt: string;
}

/* ---------- Sharh ---------- */

export interface Review {
  id: string;
  serviceId: string;
  providerId: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  rating: number;
  text: string;
  status: ReviewStatus;
  createdAt: string;
}

/* ---------- Solishtirish ---------- */

export interface CompareItem {
  kind: ItemKind;
  id: string;
}

/* ---------- Audit jurnali (tasdiqlash jarayoni) ---------- */

export type AuditEntityType = "service" | "package";

export interface AuditEntry {
  id: string;
  entityType: AuditEntityType;
  entityId: string;
  /** Amalni bajargan rol, yoki avtomatik tizim amali uchun "system". */
  actorRole: Role | "system";
  actorName: string;
  /** Inson o'qiy oladigan qaror/amal: "Tasdiqladi", "Kelishildi", "Portalga joylashtirildi". */
  action: string;
  /** Ixtiyoriy izoh (rad etish sababi). */
  note?: string;
  createdAt: string;
}

/* ---------- Bildirishnoma ---------- */

export type NotificationKind = "info" | "success" | "warning" | "danger";

export interface Notification {
  id: string;
  /** Aniq qabul qiluvchi hisob (account id). */
  recipientId?: string;
  /** Taqdimotchi (provider) profili bo'yicha — provider o'z xizmati haqida xabar oladi. */
  recipientProviderId?: string;
  /** Yoki rol bo'yicha (masalan barcha vazirlik koordinatorlari). */
  recipientRole?: Role;
  kind: NotificationKind;
  title: string;
  message: string;
  /** Bosilganda o'tiladigan sahifa. */
  link?: string;
  read: boolean;
  createdAt: string;
}

/* ---------- Landing / kontent ---------- */

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  avatar: string;
  text: string;
  rating: number;
}

export interface UpcomingEvent {
  id: string;
  title: string;
  date: string;
  region: string;
  image: string;
  category: string;
}
