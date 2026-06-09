// Server-side cart state (one cart per authenticated user).
import { create } from 'zustand';
import { ordersRepo } from '@/data/repository/orders';
import { showSnack } from '@/lib/snack';

export interface CartItem {
  // Per-line id (distinguishes the same product added with different add-ons).
  id?: string;
  product_id: string;
  variation_id?: string | null;
  branch_id?: string | null;
  name: string;
  image?: string | null;
  unit_price: number;
  qty: number;
  options?: any;
}

export interface CartSummary {
  items_count: number;
  subtotal: number;
}

// `reset` is true when the backend cleared a previous restaurant's cart because
// this item came from a different branch (single-restaurant cart rule).
export interface AddItemResult {
  ok: boolean;
  reset: boolean;
}

interface CartState {
  items: CartItem[];
  summary: CartSummary;
  isLoading: boolean;
  loadCart: () => Promise<void>;
  addItem: (args: { product_id: string; qty?: number; variation_id?: string | null; options?: any }) => Promise<AddItemResult>;
  // `lineKey` is a cart line's id (preferred) or its product_id (fallback).
  updateItem: (lineKey: string, qty: number) => Promise<void>;
  removeItem: (lineKey: string) => Promise<void>;
  clear: () => Promise<void>;
}

// A line key matches a cart line by its id (preferred) or, for lines that
// predate per-line ids, by product_id.
function matchesLine(it: CartItem, lineKey: string): boolean {
  return it.id === lineKey || it.product_id === lineKey;
}

function applyCart(set: any, cart: any) {
  if (!cart) return;
  set({
    items: cart.items ?? [],
    summary: cart.summary ?? computeSummary(cart.items ?? []),
  });
}

// Local mirror of Cart.getSummary() on the backend — lets the UI update
// instantly (optimistically) before the server round-trip completes.
function computeSummary(items: CartItem[]): CartSummary {
  return items.reduce(
    (acc, it) => {
      const optionsTotal = Array.isArray(it.options)
        ? it.options.reduce((s: number, o: any) => s + (Number(o?.price) || 0), 0)
        : 0;
      const qty = Number(it.qty) || 0;
      acc.items_count += qty;
      acc.subtotal += (Number(it.unit_price) + optionsTotal) * qty;
      return acc;
    },
    { items_count: 0, subtotal: 0 } as CartSummary,
  );
}

// Cart-mutation endpoints (PATCH/DELETE) echo back the full updated cart in
// the response envelope's `data`, so we can reconcile without a second fetch.
function cartFromResponse(res: any): any {
  return res?.object?.data ?? null;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  summary: { items_count: 0, subtotal: 0 },
  isLoading: false,

  async loadCart() {
    try {
      set({ isLoading: true });
      const res = await ordersRepo.getCart();
      if (res.success) applyCart(set, res.object);
    } catch (e) {
      // keep current state on error
    } finally {
      set({ isLoading: false });
    }
  },

  async addItem(args) {
    try {
      const res = await ordersRepo.addCartItem(args);
      if (res.success) {
        applyCart(set, res.object);
        return { ok: true, reset: !!(res.object as any)?.cart_reset };
      }
      showSnack(res.msg || 'Failed to add to cart', 'error');
    } catch (e) {
      showSnack(String(e), 'error');
    }
    return { ok: false, reset: false };
  },

  async updateItem(lineKey, qty) {
    // qty 0 (or less) means "remove the line" — keep that intent explicit.
    if (qty <= 0) return get().removeItem(lineKey);

    // Optimistic update so the stepper responds instantly; roll back on failure.
    const prev = get().items;
    const next = prev.map((it) =>
      matchesLine(it, lineKey) ? { ...it, qty } : it,
    );
    set({ items: next, summary: computeSummary(next) });

    const res = await ordersRepo.updateCartItem(lineKey, qty);
    if (res.success) {
      // Reconcile with the authoritative cart echoed back by the server.
      applyCart(set, cartFromResponse(res));
    } else {
      set({ items: prev, summary: computeSummary(prev) });
      showSnack(res.msg || 'Failed to update cart', 'error');
    }
  },

  async removeItem(lineKey) {
    const prev = get().items;
    const next = prev.filter((it) => !matchesLine(it, lineKey));
    set({ items: next, summary: computeSummary(next) });

    const res = await ordersRepo.removeCartItem(lineKey);
    if (res.success) {
      applyCart(set, cartFromResponse(res));
    } else {
      set({ items: prev, summary: computeSummary(prev) });
      showSnack(res.msg || 'Failed to remove item', 'error');
    }
  },

  async clear() {
    const res = await ordersRepo.clearCart();
    if (res.success) set({ items: [], summary: { items_count: 0, subtotal: 0 } });
  },
}));
