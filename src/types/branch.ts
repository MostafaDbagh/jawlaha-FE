// Ported from model/branch_model.dart
// interface + parseBranchModel(json) (fromJson) + branchModelToJson (toJson).

export interface BranchModel {
  id?: string | number;
  name?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  phone?: string;
  email?: string;
  latitude?: number;
  longitude?: number;
  isActive?: boolean;
  openingHours?: string;
  vendorId?: string | number;
  // Backend (jawlahapp) fields:
  image?: string;
  deliveryTime?: string;
  deliveryFee?: number;
  minOrder?: number;
  freeDelivery?: boolean;
  rating?: number;
  reviewsCount?: number;
  isOpen?: boolean;
  // Keeta-style self-service "busy / pause orders" toggle the restaurant flips
  // from the web portal. When false the branch stays listed but the menu is
  // shown disabled and checkout is blocked. Legacy branches without the field
  // (undefined) are treated as accepting (=== false check everywhere).
  isAcceptingOrders?: boolean;
  vendorName?: string;
  // Restaurant category keys set by the owner (up to 3). Resolved to labels for
  // the card's "cuisine" line via lib/cuisines.
  cuisines?: string[];
  distanceKm?: number;
  // True when the branch's restaurant is an admin "editor's pick" — surfaced
  // first on the home and tagged with a "مميز" badge.
  isFeatured?: boolean;
}

export function parseBranchModel(json: any): BranchModel {
  return {
    id: json?.id,
    name: json?.name,
    address: json?.address,
    city: json?.city,
    state: json?.state,
    country: json?.country,
    postalCode: json?.postal_code,
    phone: json?.phone,
    email: json?.email,
    // Backend sends `lat`/`lng`; keep latitude/longitude as fallback.
    latitude: (json?.lat ?? json?.latitude) != null ? Number(json.lat ?? json.latitude) : undefined,
    longitude: (json?.lng ?? json?.longitude) != null ? Number(json.lng ?? json.longitude) : undefined,
    isActive: json?.is_active,
    openingHours: json?.opening_hours,
    vendorId: json?.vendor_id,
    image: json?.image,
    deliveryTime: json?.delivery_time,
    deliveryFee: json?.delivery_fee != null ? Number(json.delivery_fee) : undefined,
    minOrder: json?.min_order != null ? Number(json.min_order) : undefined,
    freeDelivery: json?.free_delivery,
    rating: json?.rating != null ? Number(json.rating) : undefined,
    reviewsCount: json?.total_reviews != null ? Number(json.total_reviews) : undefined,
    isOpen: json?.is_open,
    isAcceptingOrders: json?.is_accepting_orders,
    vendorName: json?.vendor?.name,
    cuisines: Array.isArray(json?.vendor?.cuisines) ? json.vendor.cuisines : undefined,
    distanceKm: json?.distance != null ? Number(json.distance) : undefined,
    isFeatured: json?.vendor?.is_featured ?? json?.is_featured ?? false,
  };
}

export function branchModelToJson(b: BranchModel): any {
  return {
    id: b.id,
    name: b.name,
    address: b.address,
    city: b.city,
    state: b.state,
    country: b.country,
    postal_code: b.postalCode,
    phone: b.phone,
    email: b.email,
    latitude: b.latitude,
    longitude: b.longitude,
    is_active: b.isActive,
    opening_hours: b.openingHours,
    vendor_id: b.vendorId,
  };
}
