// Ported from model/subcategory_model.dart

export interface SubcategoryModel {
  id?: string | number;
  name?: string;
  description?: string;
  imageUrl?: string;
  categoryId?: string | number;
  branchId?: string | number;
}

export function parseSubcategoryModel(json: any): SubcategoryModel {
  return {
    id: json?.id,
    name: json?.name,
    description: json?.description,
    // Backend sends `image`; keep image_url as a fallback.
    imageUrl: json?.image ?? json?.image_url,
    categoryId: json?.category_id,
    branchId: json?.branch_id,
  };
}

export function subcategoryModelToJson(s: SubcategoryModel): any {
  return {
    id: s.id,
    name: s.name,
    description: s.description,
    image_url: s.imageUrl,
    category_id: s.categoryId,
  };
}
