// Orders state — history, details/tracking, and checkout (Cash on Delivery).
import { create } from 'zustand';
import { ordersRepo } from '@/data/repository/orders';
import { showSnack } from '@/lib/snack';

export interface OrderItem {
  product_id?: string | null;
  name: string;
  image?: string | null;
  unit_price: number;
  qty: number;
  options?: any;
  // Customer's free-text special request for this line.
  note?: string | null;
}

export interface TimelineStep {
  status: string;
  label?: string | null;
  at?: string | null;
  done: boolean;
}

// Jawlaha Box sub-document — present only on errand/courier orders
// (order_type === 'box'). Items are free text and stops are non-restaurant
// pickup places; the driver fronts the purchase cash (COD).
export interface BoxStop {
  place_name: string;
  address?: string | null;
  lat?: number | null;
  lng?: number | null;
  note?: string | null;
}

export interface BoxItem {
  description: string;
  qty: number;
  category?: string | null;
  note?: string | null;
  stop_index?: number;
  status?: string | null;
  actual_price?: number | null;
}

export interface OrderBox {
  stops: BoxStop[];
  items: BoxItem[];
  budget_cap?: number;
  service_fee?: number;
  purchases_total?: number;
  instructions?: string | null;
}

export interface Order {
  order_id: string;
  // Discriminates a normal restaurant order from a Jawlaha Box errand. Defaults
  // to 'restaurant' when the backend omits it (older orders).
  order_type?: 'restaurant' | 'box';
  // Errand details — only populated when order_type === 'box'.
  box?: OrderBox | null;
  branch_id?: string | null;
  vendor_name?: string | null;
  items: OrderItem[];
  subtotal: number;
  delivery_fee: number;
  discount: number;
  total: number;
  currency: string;
  payment_method: string;
  status: string;
  // Merchant-supplied reason when the order was cancelled/rejected, else null.
  cancel_reason?: string | null;
  delivery_address?: string | null;
  delivery_lat?: number | null;
  delivery_lng?: number | null;
  delivery_note?: string | null;
  leave_at_door?: boolean;
  dont_ring_bell?: boolean;
  driver?: { name?: string; vehicle?: string; rating?: string; avatar?: string; phone?: string } | null;
  status_timeline: TimelineStep[];
  eta_minutes?: number | null;
  created_at?: string;
}

interface OrdersState {
  orders: Order[];
  totalOrders: number;
  currentOrder: Order | null;
  isLoading: boolean;
  // True when the last load failed (network/server). Lets screens show a
  // distinct "couldn't load — retry" state instead of a misleading "no orders".
  loadError: boolean;
  loadOrders: (status?: string) => Promise<void>;
  loadOrder: (id: string) => Promise<void>;
  refreshOrder: (id: string) => Promise<void>;
  createOrder: (args: {
    delivery_address?: string | null;
    delivery_lat?: number | null;
    delivery_lng?: number | null;
    delivery_note?: string | null;
    leave_at_door?: boolean;
    dont_ring_bell?: boolean;
  }) => Promise<Order | null>;
}

export const useOrdersStore = create<OrdersState>((set) => ({
  orders: [],
  totalOrders: 0,
  currentOrder: null,
  isLoading: false,
  loadError: false,

  async loadOrders(status) {
    try {
      set({ isLoading: true, loadError: false });
      const res = await ordersRepo.getOrders(status);
      if (res.success && res.object) {
        const data = res.object as { orders: Order[]; stats?: { total_orders: number } };
        set({ orders: data.orders ?? [], totalOrders: data.stats?.total_orders ?? 0 });
      } else {
        set({ loadError: true });
      }
    } catch (e) {
      set({ loadError: true });
    } finally {
      set({ isLoading: false });
    }
  },

  async loadOrder(id) {
    try {
      set({ isLoading: true, currentOrder: null, loadError: false });
      const res = await ordersRepo.getOrder(id);
      if (res.success) set({ currentOrder: res.object as Order });
      else set({ loadError: true });
    } catch (e) {
      set({ loadError: true });
    } finally {
      set({ isLoading: false });
    }
  },

  // Silent refetch for live status polling — updates currentOrder in place
  // without toggling isLoading or clearing the screen (no spinner flash).
  async refreshOrder(id) {
    try {
      const res = await ordersRepo.getOrder(id);
      if (res.success && res.object) set({ currentOrder: res.object as Order });
    } catch (e) {
      // keep the last known order on a transient failure
    }
  },

  async createOrder(args) {
    try {
      set({ isLoading: true });
      const res = await ordersRepo.createOrder(args);
      if (res.success) {
        const order = res.object as Order;
        // Surface the new order in history immediately (newest first) so the
        // user sees it without waiting for a refetch.
        set((state) => ({
          currentOrder: order,
          orders: [order, ...state.orders],
          totalOrders: state.totalOrders + 1,
        }));
        return order;
      }
      showSnack(res.msg || 'Failed to place order', 'error');
    } catch (e) {
      showSnack(String(e), 'error');
    } finally {
      set({ isLoading: false });
    }
    return null;
  },
  // No cancelOrder: once placed, a Cash-on-Delivery order is final and cannot be
  // cancelled or edited by the customer (Keeta-style). The backend exposes no
  // customer cancel endpoint.
}));
