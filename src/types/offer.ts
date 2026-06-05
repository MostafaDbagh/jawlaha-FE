// Ported from model/offer_model.dart
// interface + parseOfferModel(json) (fromJson) + offerModelToJson (toJson).

export interface OfferModel {
  id?: number;
  title?: string;
  description?: string;
  discountType?: string;
  discountValue?: number;
  startDate?: string;
  endDate?: string;
  isActive?: boolean;
  minPurchaseAmount?: number;
  maxDiscountAmount?: number;
}

export function parseOfferModel(json: any): OfferModel {
  return {
    id: json?.id,
    title: json?.title,
    description: json?.description,
    // Backend sends `type`/`value`; keep snake fallbacks for older contracts.
    discountType: json?.type ?? json?.discount_type,
    discountValue: (json?.value ?? json?.discount_value) != null
      ? Number(json.value ?? json.discount_value)
      : undefined,
    startDate: json?.start_date,
    endDate: json?.end_date,
    isActive: json?.is_active,
    minPurchaseAmount: json?.min_purchase_amount != null ? Number(json.min_purchase_amount) : undefined,
    maxDiscountAmount: json?.max_discount_amount != null ? Number(json.max_discount_amount) : undefined,
  };
}

export function offerModelToJson(o: OfferModel): any {
  return {
    id: o.id,
    title: o.title,
    description: o.description,
    discount_type: o.discountType,
    discount_value: o.discountValue,
    start_date: o.startDate,
    end_date: o.endDate,
    is_active: o.isActive,
    min_purchase_amount: o.minPurchaseAmount,
    max_discount_amount: o.maxDiscountAmount,
  };
}
