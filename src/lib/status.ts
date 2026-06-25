/* ============================================================
   Tasdiqlash jarayoni — status yordamchilari (yagona manba).

   Ommaviy ko'rinish qoidasi BIR joyda: faqat PUBLISHED holati
   portalda/qidiruvda ko'rinadi va buyurtma qilinadi. Barcha public
   filtrlar `isPublic(status)` ni ishlatadi (avval `=== "approved"` edi).
   ============================================================ */

import type { ServiceStatus } from "./types";

/** Portalda ko'rinadimi (qidiruv + buyurtma uchun ham). */
export const isPublic = (s: ServiceStatus): boolean => s === "PUBLISHED";

/** Admin navbatida (tekshirish kutilmoqda). */
export const isPendingAdmin = (s: ServiceStatus): boolean => s === "PENDING_ADMIN_REVIEW";

/** Vazirlik navbatida (kelishuv kutilmoqda). */
export const isPendingMinistry = (s: ServiceStatus): boolean => s === "PENDING_MINISTRY_APPROVAL";

/** Rad etilgan (admin yoki vazirlik). */
export const isRejected = (s: ServiceStatus): boolean =>
  s === "ADMIN_REJECTED" || s === "MINISTRY_REJECTED";

/** Provider tahrirlashi/qayta yuborishi mumkin (qoralama yoki rad etilgan). */
export const isEditable = (s: ServiceStatus): boolean =>
  s === "DRAFT" || s === "ADMIN_REJECTED" || s === "MINISTRY_REJECTED";

/** Provider jarayonni kuzatish uchun bosqichlar tartibi (UI progress). */
export const PIPELINE: ServiceStatus[] = [
  "DRAFT",
  "PENDING_ADMIN_REVIEW",
  "PENDING_MINISTRY_APPROVAL",
  "PUBLISHED",
];
