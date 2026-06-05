// Ported from model/vendor_model.dart
// interface + parseVendorModel(json) (fromJson) + vendorModelToJson (toJson).

export interface VendorModel {
  id?: number;
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
}

export function parseVendorModel(json: any): VendorModel {
  return {
    id: json?.id,
    name: json?.name,
    description: json?.description,
    email: json?.email,
    phone: json?.phone,
    address: json?.address,
    city: json?.city,
    state: json?.state,
    country: json?.country,
    postalCode: json?.postal_code,
    website: json?.website,
    logoUrl: json?.logo_url,
    subscriptionType: json?.subscription_type,
    subscriptionStatus: json?.subscription_status,
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
