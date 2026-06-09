// Cart + Orders repository — talks to the cart/orders endpoints added to the
// jawlahapp backend. All routes require auth (Bearer token).
import { apiClient, CustomResponse } from '@/lib/api';

const identity = (x: any) => x;

// ----------------------------- Cart -----------------------------
export async function getCart(): Promise<CustomResponse> {
  return await apiClient.getV2({ subUrl: 'cart', needToken: true, fromJson: identity });
}

export async function addCartItem(args: {
  product_id: string;
  qty?: number;
  variation_id?: string | null;
  options?: any;
}): Promise<CustomResponse> {
  return await apiClient.postV2({
    subUrl: 'cart/items',
    data: args,
    needToken: true,
    fromJson: identity,
  });
}

export async function updateCartItem(productId: string, qty: number): Promise<CustomResponse> {
  return await apiClient.patch({
    subUrl: `cart/items/${productId}`,
    data: { qty },
    needToken: true,
  });
}

export async function removeCartItem(productId: string): Promise<CustomResponse> {
  return await apiClient.delete({ subUrl: `cart/items/${productId}`, needToken: true });
}

export async function clearCart(): Promise<CustomResponse> {
  return await apiClient.delete({ subUrl: 'cart', needToken: true });
}

// ----------------------------- Orders -----------------------------
export async function createOrder(args: {
  delivery_address?: string | null;
  delivery_lat?: number | null;
  delivery_lng?: number | null;
  delivery_note?: string | null;
  leave_at_door?: boolean;
  dont_ring_bell?: boolean;
}): Promise<CustomResponse> {
  return await apiClient.postV2({
    subUrl: 'orders',
    data: args,
    needToken: true,
    fromJson: identity,
  });
}

export async function getOrders(status?: string): Promise<CustomResponse> {
  return await apiClient.getV2({
    subUrl: 'orders',
    query: status ? { status } : undefined,
    needToken: true,
    fromJson: identity,
  });
}

export async function getOrder(id: string): Promise<CustomResponse> {
  return await apiClient.getV2({ subUrl: `orders/${id}`, needToken: true, fromJson: identity });
}

// No cancelOrder: a placed Cash-on-Delivery order is final and cannot be
// cancelled or edited by the customer (Keeta-style); the backend exposes no
// customer cancel endpoint.

export const ordersRepo = {
  getCart,
  addCartItem,
  updateCartItem,
  removeCartItem,
  clearCart,
  createOrder,
  getOrders,
  getOrder,
};
