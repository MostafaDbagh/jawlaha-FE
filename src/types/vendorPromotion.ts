// A restaurant-authored promo banner shown on the vendor-details screen.
// Backed by jawlahapp's VendorPromotion model (GET /vendor-promotions/vendor/:id).
// Display-only: `code` is informational text, not validated at checkout.

export interface VendorPromotionModel {
  id?: string | number;
  vendorId?: string | number;
  title?: string;
  description?: string;
  code?: string;
  isActive?: boolean;
  sortOrder?: number;
}

export function parseVendorPromotionModel(json: any): VendorPromotionModel {
  return {
    id: json?.id,
    vendorId: json?.vendor_id,
    title: json?.title,
    description: json?.description ?? undefined,
    code: json?.code ?? undefined,
    isActive: json?.is_active,
    sortOrder: json?.sort_order != null ? Number(json.sort_order) : undefined,
  };
}
