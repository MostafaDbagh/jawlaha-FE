// Ported from model/product_model.dart
// interface + parseX(json) (fromJson) + xToJson (toJson).

export interface ProductVariation {
  id?: string | number;
  name?: string;
  priceModifier?: number;
  price?: number;
  stockQuantity?: number;
  sku?: string;
  isActive?: boolean;
}

export function parseProductVariation(json: any): ProductVariation {
  return {
    id: json?.id,
    // Backend stores the display name inside `attributes.name`.
    name: json?.attributes?.name ?? json?.name,
    priceModifier: json?.price_modifier != null ? Number(json.price_modifier) : undefined,
    price: json?.price != null ? Number(json.price) : undefined,
    stockQuantity: json?.stock_quantity,
    sku: json?.sku,
    isActive: json?.is_active,
  };
}

export function productVariationToJson(v: ProductVariation): any {
  return {
    id: v.id,
    name: v.name,
    price_modifier: v.priceModifier,
    stock_quantity: v.stockQuantity,
    sku: v.sku,
    is_active: v.isActive,
  };
}

// A single selectable add-on (e.g. "بطاطا مقلية" +3000).
export interface ProductOptionItem {
  id?: string;
  name?: string;
  price?: number;
  imageUrl?: string | null;
  popular?: boolean;
}

// A group of add-ons (e.g. "المقبلات", "الحجم"). multiple=false → single-select.
// `description` is an optional subtitle shown under the title (custom groups).
export interface ProductOptionGroup {
  id?: string;
  kind?: string | null;
  name?: string;
  description?: string | null;
  required?: boolean;
  multiple?: boolean;
  max?: number | null;
  items?: ProductOptionItem[];
}

export function parseProductOptionItem(json: any): ProductOptionItem {
  return {
    id: json?.id != null ? String(json.id) : undefined,
    name: json?.name,
    price: json?.price != null ? Number(json.price) : 0,
    imageUrl: json?.image ?? json?.image_url ?? null,
    popular: !!json?.popular,
  };
}

export function parseProductOptionGroup(json: any): ProductOptionGroup {
  return {
    id: json?.id != null ? String(json.id) : undefined,
    kind: json?.kind ?? null,
    name: json?.name,
    description: json?.description ?? null,
    required: !!json?.required,
    // Default to multi-select unless explicitly false (matches backend default).
    multiple: json?.multiple !== false,
    max: json?.max != null ? Number(json.max) : null,
    items: Array.isArray(json?.items) ? json.items.map(parseProductOptionItem) : [],
  };
}

export interface ProductModel {
  id?: string | number;
  name?: string;
  description?: string;
  price?: number;
  finalPrice?: number;
  stockQuantity?: number;
  sku?: string;
  imageUrl?: string;
  subcategoryId?: string | number;
  branchId?: string | number;
  isActive?: boolean;
  variations?: ProductVariation[];
  optionGroups?: ProductOptionGroup[];
}

export function parseProductModel(json: any): ProductModel {
  return {
    id: json?.id,
    name: json?.name,
    description: json?.description,
    price: json?.price != null ? Number(json.price) : undefined,
    finalPrice: json?.final_price != null ? Number(json.final_price) : undefined,
    stockQuantity: json?.stock_quantity,
    sku: json?.sku,
    // Backend sends `image`; keep image_url as a fallback.
    imageUrl: json?.image ?? json?.image_url,
    subcategoryId: json?.subcategory_id,
    branchId: json?.branch_id,
    isActive: json?.is_active,
    variations: json?.variations != null ? json.variations.map(parseProductVariation) : undefined,
    optionGroups: json?.option_groups != null ? json.option_groups.map(parseProductOptionGroup) : undefined,
  };
}

export function productModelToJson(p: ProductModel): any {
  const map: any = {
    id: p.id,
    name: p.name,
    description: p.description,
    price: p.price,
    stock_quantity: p.stockQuantity,
    sku: p.sku,
    image_url: p.imageUrl,
    subcategory_id: p.subcategoryId,
    is_active: p.isActive,
  };
  if (p.variations != null) {
    map.variations = p.variations.map(productVariationToJson);
  }
  return map;
}
