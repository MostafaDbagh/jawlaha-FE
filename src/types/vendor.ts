// Ported from model/vendor_model.dart
// interface + parseVendorModel(json) (fromJson) + vendorModelToJson (toJson).

export interface VendorModel {
  id?: string | number;
  name?: string;
  description?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  website?: string;
  logoUrl?: string;
  subscriptionType?: string;
  subscriptionStatus?: string;
  // Backend (jawlahapp) fields:
  image?: string;
  about?: string;
  rating?: number;
  reviewsCount?: number;
  branchCount?: number;
}

export function parseVendorModel(json: any): VendorModel {
  return {
    id: json?.id,
    name: json?.name,
    description: json?.about ?? json?.description,
    email: json?.email,
    phone: json?.phone,
    address: json?.address,
    city: json?.city,
    state: json?.state,
    country: json?.country,
    postalCode: json?.postal_code,
    website: json?.website,
    // Backend sends `image`; keep logo_url as a fallback for older contracts.
    logoUrl: json?.image ?? json?.logo_url,
    image: json?.image,
    about: json?.about,
    rating: json?.average_rating != null ? Number(json.average_rating) : undefined,
    reviewsCount: json?.total_reviews != null ? Number(json.total_reviews) : undefined,
    branchCount: json?.branch_count != null ? Number(json.branch_count) : undefined,
    subscriptionStatus: json?.is_subscription_active != null
      ? (json.is_subscription_active ? 'active' : 'expired')
      : json?.subscription_status,
  };
}

export function vendorModelToJson(v: VendorModel): any {
  return {
    id: v.id,
    name: v.name,
    description: v.description,
    email: v.email,
    phone: v.phone,
    address: v.address,
    city: v.city,
    state: v.state,
    country: v.country,
    postal_code: v.postalCode,
    website: v.website,
    logo_url: v.logoUrl,
    subscription_type: v.subscriptionType,
    subscription_status: v.subscriptionStatus,
  };
}
