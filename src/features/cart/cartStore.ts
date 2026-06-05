// Server-side cart state (one cart per authenticated user).
import { create } from 'zustand';
import { ordersRepo } from '@/data/repository/orders';
import { showSnack } from '@/lib/snack';

export interface CartItem {
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

interface CartState {
  items: CartItem[];
  summary: CartSummary;
  isLoading: boolean;
  loadCart: () => Promise<void>;
  addItem: (args: { product_id: string; qty?: number; variation_id?: string | null; options?: any }) => Promise<boolean>;
  updateItem: (productId: string, qty: number) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  clear: () => Promise<void>;
}

function applyCart(set: any, cart: any) {
  if (!cart) return;
  set({
    items: cart.items ?? [],
    summary: cart.summary ?? { items_count: 0, subtotal: 0 },
  });
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
        return true;
      }
      showSnack(res.msg || 'Failed to add to cart', 'error');
    } catch (e) {
      showSnack(String(e), 'error');
    }
    return false;
  },

  async updateItem(productId, qty) {
    const res = await ordersRepo.updateCartItem(productId, qty);
    if (res.success) await get().loadCart();
  },

  async removeItem(productId) {
    const res = await ordersRepo.removeCartItem(productId);
    if (res.success) await get().loadCart();
  },

  async clear() {
    const res = await ordersRepo.clearCart();
    if (res.success) set({ items: [], summary: { items_count: 0, subtotal: 0 } });
  },
}));
