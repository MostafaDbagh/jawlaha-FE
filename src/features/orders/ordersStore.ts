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
}

export interface TimelineStep {
  status: string;
  label?: string | null;
  at?: string | null;
  done: boolean;
}

export interface Order {
  order_id: string;
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
  delivery_address?: string | null;
  delivery_note?: string | null;
  leave_at_door?: boolean;
  dont_ring_bell?: boolean;
  driver?: { name?: string; vehicle?: string; rating?: string; avatar?: string } | null;
  status_timeline: TimelineStep[];
  eta_minutes?: number | null;
  created_at?: string;
}

interface OrdersState {
  orders: Order[];
  totalOrders: number;
  currentOrder: Order | null;
  isLoading: boolean;
  loadOrders: (status?: string) => Promise<void>;
  loadOrder: (id: string) => Promise<void>;
  createOrder: (args: {
    delivery_address?: string | null;
    delivery_note?: string | null;
    leave_at_door?: boolean;
    dont_ring_bell?: boolean;
  }) => Promise<Order | null>;
  cancelOrder: (id: string) => Promise<void>;
}

export const useOrdersStore = create<OrdersState>((set, get) => ({
  orders: [],
  totalOrders: 0,
  currentOrder: null,
  isLoading: false,

  async loadOrders(status) {
    try {
      set({ isLoading: true });
      const res = await ordersRepo.getOrders(status);
      if (res.success && res.object) {
        const data = res.object as { orders: Order[]; stats?: { total_orders: number } };
        set({ orders: data.orders ?? [], totalOrders: data.stats?.total_orders ?? 0 });
      }
    } catch (e) {
      // keep state
    } finally {
      set({ isLoading: false });
    }
  },

  async loadOrder(id) {
    try {
      set({ isLoading: true, currentOrder: null });
      const res = await ordersRepo.getOrder(id);
      if (res.success) set({ currentOrder: res.object as Order });
    } catch (e) {
      // keep state
    } finally {
      set({ isLoading: false });
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

  async cancelOrder(id) {
    const res = await ordersRepo.cancelOrder(id);
    if (res.success) {
      const order = (res.object as any)?.data as Order;
      if (order) set({ currentOrder: order });
      await get().loadOrders();
    }
  },
}));
