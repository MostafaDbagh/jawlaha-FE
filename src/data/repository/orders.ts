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
  note?: string | null;
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

// --------------------------- Jawlaha Box ---------------------------
// Errand/courier flow: the customer asks a driver to buy/pick up free-text
// items from NON-restaurant places and deliver them (COD). The server resolves
// the service fee and enforces all limits — the client only sends inputs.

export interface BoxConfig {
  base_fee: number;
  extra_item_fee: number;
  extra_stop_fee: number;
  included_items: number;
  max_items: number;
  max_stops: number;
  max_budget: number;
  currency: string;
}

export interface BoxStopInput {
  place_name: string;
  address?: string | null;
  lat?: number | null;
  lng?: number | null;
  note?: string | null;
}

export interface BoxItemInput {
  description: string;
  qty: number;
  category?: string | null;
  note?: string | null;
  stop_index: number;
}

export interface CreateBoxOrderInput {
  stops: BoxStopInput[];
  items: BoxItemInput[];
  budget_cap: number;
  instructions?: string | null;
  city?: string | null;
  delivery_address: string;
  delivery_lat?: number | null;
  delivery_lng?: number | null;
}

/** Box pricing + limits (admin-set, server-resolved). `city` scopes the fee. */
export async function getBoxConfig(city?: string | null): Promise<CustomResponse> {
  return await apiClient.getV2({
    subUrl: 'orders/box/config',
    query: city ? { city } : undefined,
    needToken: true,
    fromJson: identity,
  });
}

/** Place a Box order (COD). 409 = a pickup matches a listed restaurant;
 *  400 = a limit/budget/destination violation. Both carry a `message`. */
export async function createBoxOrder(payload: CreateBoxOrderInput): Promise<CustomResponse> {
  return await apiClient.postV2({
    subUrl: 'orders/box',
    data: payload,
    needToken: true,
    fromJson: identity,
  });
}

export const ordersRepo = {
  getCart,
  addCartItem,
  updateCartItem,
  removeCartItem,
  clearCart,
  createOrder,
  getOrders,
  getOrder,
  getBoxConfig,
  createBoxOrder,
};
