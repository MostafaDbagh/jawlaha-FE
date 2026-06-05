// Order total math shared by the cart and checkout screens so they never drift.
// The backend cart only returns a subtotal today; delivery fee / VAT / promo are
// computed client-side here until dedicated endpoints exist.

// Flat delivery fee placeholder (SYP). Replace with a backend value when available.
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

export function computeTotals(subtotal: number, discount = 0): Totals {
  const deliveryFee = subtotal > 0 ? DELIVERY_FEE : 0;
  const tax = Math.round(subtotal * VAT_RATE);
  const total = Math.max(0, subtotal + deliveryFee + tax - discount);
  return { subtotal, deliveryFee, tax, discount, total };
}
