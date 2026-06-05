// Ported from model/branch_model.dart
// interface + parseBranchModel(json) (fromJson) + branchModelToJson (toJson).

export interface BranchModel {
  id?: number;
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
  vendorId?: number;
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
    latitude: json?.latitude != null ? Number(json.latitude) : undefined,
    longitude: json?.longitude != null ? Number(json.longitude) : undefined,
    isActive: json?.is_active,
    openingHours: json?.opening_hours,
    vendorId: json?.vendor_id,
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
