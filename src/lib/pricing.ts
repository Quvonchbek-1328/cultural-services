import type { PriceType, RegionPrice, Service } from "./types";
import { applyDiscount, NO_DISCOUNT, type DiscountConfig, type DiscountType, type PriceBreakdown } from "./discount";

/** Berilgan hududdagi narx (mavjud bo'lmasa undefined). */
export function priceInRegion(prices: RegionPrice[], region: string): number | undefined {
  return prices.find((p) => p.region === region)?.price;
}

/** Xizmat mavjud bo'lgan hududlar ro'yxati. */
export function serviceRegions(prices: RegionPrice[]): string[] {
  return prices.map((p) => p.region);
}

/** Eng arzon hudud narxi ("dan" ko'rsatish uchun). 0 = narx yo'q. */
export function fromPrice(prices: RegionPrice[]): number {
  if (!prices.length) return 0;
  return Math.min(...prices.map((p) => p.price));
}

/**
 * Jamlanma chegirmasi. 3+ xizmat birlashtirilsa 15% chegirma qo'llanadi.
 * ponytail: yagona qoida (15% / 3 ta), kerak bo'lsa bosqichli darajaga kengaytiriladi.
 */
export const PACKAGE_DISCOUNT_RATE = 0.15;
export const PACKAGE_DISCOUNT_MIN_ITEMS = 3;

export function bundleDiscount(total: number, itemCount: number) {
  const qualifies = itemCount >= PACKAGE_DISCOUNT_MIN_ITEMS && total > 0;
  const saved = qualifies ? Math.round(total * PACKAGE_DISCOUNT_RATE) : 0;
  return { qualifies, original: total, saved, final: total - saved, rate: PACKAGE_DISCOUNT_RATE };
}

type ServiceLookup = (id: string) => Service | undefined;

function members(serviceIds: string[], getService: ServiceLookup): Service[] {
  return serviceIds.map(getService).filter(Boolean) as Service[];
}

/**
 * Jamlanma mavjud bo'lgan hududlar: BARCHA a'zo xizmatlar shu hududda
 * narxlangan bo'lishi shart (hududlar kesishmasi).
 */
export function packageRegions(serviceIds: string[], getService: ServiceLookup): string[] {
  const list = members(serviceIds, getService);
  if (!list.length) return [];
  let regions = serviceRegions(list[0].regionPrices);
  for (let i = 1; i < list.length; i++) {
    const set = new Set(serviceRegions(list[i].regionPrices));
    regions = regions.filter((r) => set.has(r));
  }
  return regions;
}

/** Jamlanma narxi tanlangan hududda = a'zo xizmatlar yig'indisi (mavjud bo'lmasa undefined). */
export function packagePriceInRegion(
  serviceIds: string[],
  getService: ServiceLookup,
  region: string,
): number | undefined {
  const list = members(serviceIds, getService);
  if (!list.length) return undefined;
  let sum = 0;
  for (const m of list) {
    const p = priceInRegion(m.regionPrices, region);
    if (p === undefined) return undefined;
    sum += p;
  }
  return sum;
}

/** Jamlanmaning eng arzon (mavjud hududlar bo'yicha) yig'indi narxi. */
export function packageFromPrice(serviceIds: string[], getService: ServiceLookup): number {
  const regions = packageRegions(serviceIds, getService);
  const sums = regions
    .map((r) => packagePriceInRegion(serviceIds, getService, r))
    .filter((v): v is number => v !== undefined);
  return sums.length ? Math.min(...sums) : 0;
}

/** Jamlanma narx turi: barcha a'zo "fixed" bo'lsa fixed, aks holda negotiable. */
export function packagePriceType(serviceIds: string[], getService: ServiceLookup): PriceType {
  const list = members(serviceIds, getService);
  return list.length && list.every((m) => m.priceType === "fixed") ? "fixed" : "negotiable";
}

/* ---------- Chegirma (discount) bilan narx ---------- */

/** Jamlanma yozuvidan chegirma konfiguratsiyasini oladi (yo'q bo'lsa NONE). */
export function packageDiscountConfig(pkg: {
  discountType?: DiscountType;
  discountValue?: number;
}): DiscountConfig {
  return pkg.discountType && pkg.discountType !== "NONE"
    ? { type: pkg.discountType, value: pkg.discountValue ?? 0 }
    : NO_DISCOUNT;
}

/** Tanlangan hududda chegirmali narx taqsimoti (mavjud bo'lmasa undefined). */
export function packagePriceBreakdown(
  serviceIds: string[],
  getService: ServiceLookup,
  region: string,
  cfg: DiscountConfig,
): PriceBreakdown | undefined {
  const sum = packagePriceInRegion(serviceIds, getService, region);
  return sum === undefined ? undefined : applyDiscount(sum, cfg);
}

/** Eng arzon hudud bo'yicha YAKUNIY (chegirmali) narx — kartalar/ro'yxat uchun. */
export function packageFinalFromPrice(
  serviceIds: string[],
  getService: ServiceLookup,
  cfg: DiscountConfig,
): number {
  const regions = packageRegions(serviceIds, getService);
  const finals = regions
    .map((r) => {
      const s = packagePriceInRegion(serviceIds, getService, r);
      return s === undefined ? undefined : applyDiscount(s, cfg).final;
    })
    .filter((v): v is number => v !== undefined);
  return finals.length ? Math.min(...finals) : 0;
}
