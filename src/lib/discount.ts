/* ============================================================
   Chegirma (discount) moduli — sof, kengaytiriladigan yadro.

   Kelajakda yangi chegirma turini (promokod, mavsumiy aksiya,
   xizmat soniga qarab avto-chegirma, minimal summa, maksimal limit)
   qo'shish uchun FAQAT shu fayl o'zgaradi — UI va store tegilmaydi:
   `DiscountType` ga yangi qiymat + `applyDiscount` ga yangi `case`.
   ============================================================ */

export type DiscountType = "NONE" | "PERCENTAGE" | "FIXED_AMOUNT";

export interface DiscountConfig {
  type: DiscountType;
  /** PERCENTAGE: 1–100 foiz · FIXED_AMOUNT: so'mdagi summa · NONE: 0 */
  value: number;
}

export const NO_DISCOUNT: DiscountConfig = { type: "NONE", value: 0 };

export interface PriceBreakdown {
  /** Tanlangan xizmatlar yig'indisi (chegirmasiz). */
  original: number;
  /** Hisoblangan chegirma summasi (hech qachon `original` dan oshmaydi). */
  discount: number;
  /** Yakuniy narx = original − discount. */
  final: number;
}

const clamp = (n: number, min: number, max: number) => Math.min(Math.max(n, min), max);

/**
 * Chegirmani qo'llaydi. Sof funksiya — UI (real-time ko'rsatish) va
 * store (yakuniy validatsiya) IKKALASI shu funksiyani ishlatadi, shuning
 * uchun hisob-kitob hech qachon ikki joyda farq qilmaydi.
 *
 * Invariant: 0 ≤ discount ≤ original, final = original − discount ≥ 0.
 */
export function applyDiscount(original: number, cfg: DiscountConfig): PriceBreakdown {
  const base = Math.max(0, Math.round(original));
  if (base <= 0) return { original: base, discount: 0, final: base };

  let discount = 0;
  switch (cfg.type) {
    case "PERCENTAGE":
      discount = Math.round((base * clamp(cfg.value, 0, 100)) / 100);
      break;
    case "FIXED_AMOUNT":
      discount = Math.max(0, Math.round(cfg.value));
      break;
    case "NONE":
    default:
      discount = 0;
  }
  discount = Math.min(discount, base); // chegirma jami narxdan oshmaydi
  return { original: base, discount, final: base - discount };
}

/**
 * Store-darajadagi validatsiya: foydalanuvchi kiritgan qiymatni normallashtiradi.
 * "Frontend hisob-kitobiga ishonib qolmaslik" — qiymat shu yerda chegaralanadi.
 */
export function normalizeDiscount(cfg: Partial<DiscountConfig> | undefined): DiscountConfig {
  if (!cfg || !cfg.type || cfg.type === "NONE") return NO_DISCOUNT;
  if (cfg.type === "PERCENTAGE") return { type: "PERCENTAGE", value: clamp(Math.round(cfg.value ?? 0), 1, 100) };
  return { type: "FIXED_AMOUNT", value: Math.max(0, Math.round(cfg.value ?? 0)) };
}

/** UI label (forma + ko'rinishlar uchun yagona manba). */
export const DISCOUNT_TYPE_LABEL: Record<DiscountType, string> = {
  NONE: "Chegirma yo'q",
  PERCENTAGE: "Foiz (%)",
  FIXED_AMOUNT: "Fiks summa (so'm)",
};
