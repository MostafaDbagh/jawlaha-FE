// Order total math shared by the cart and checkout screens so they never drift.
// The delivery fee is company-controlled (admin-set, and higher for farther
// cities); the backend resolves it for the cart's restaurant and returns it on
// the cart summary as `delivery_fee`. Pass that into computeTotals.

// Fallback delivery fee (SYP) used only until the server-resolved fee arrives
// (e.g. during the brief optimistic window of a quantity change). The real,
// admin-controlled fee comes from the cart summary's `delivery_fee`.
export const DELIVERY_FEE = 10000;

// Syria has no consumer VAT on these orders, so the tax line stays at 0 while
// keeping the row visible to match the design. Bump this if that ever changes.
export const VAT_RATE = 0;

export interface PromoResult {
  valid: boolean;
  /** Discount amount in SYP (already resolved against the given subtotal). */
  discount: number;
  /** Normalised code, e.g. 'WELCOME10'. */
  code: string;
}

// Minimal client-side promo table. Keys are upper-cased codes.
const PROMOS: Record<string, (subtotal: number) => number> = {
  WELCOME10: (s) => Math.round(s * 0.1),
};

export function applyPromo(rawCode: string, subtotal: number): PromoResult {
  const code = rawCode.trim().toUpperCase();
  const fn = PROMOS[code];
  if (!code || !fn) return { valid: false, discount: 0, code };
  return { valid: true, discount: fn(subtotal), code };
}

export interface Totals {
  subtotal: number;
  deliveryFee: number;
  tax: number;
  discount: number;
  total: number;
}

// `serverDeliveryFee` is the admin-resolved fee from the cart summary. When it's
// provided we use it verbatim (it already accounts for per-city pricing and the
// free-delivery threshold); otherwise we fall back to the flat constant.
export function computeTotals(subtotal: number, discount = 0, serverDeliveryFee?: number | null): Totals {
  const deliveryFee = serverDeliveryFee != null ? serverDeliveryFee : subtotal > 0 ? DELIVERY_FEE : 0;
  const tax = Math.round(subtotal * VAT_RATE);
  const total = Math.max(0, subtotal + deliveryFee + tax - discount);
  return { subtotal, deliveryFee, tax, discount, total };
}
