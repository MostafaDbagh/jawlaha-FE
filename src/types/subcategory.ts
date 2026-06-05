// Ported from model/subcategory_model.dart

export interface SubcategoryModel {
  id?: number;
  name?: string;
  description?: string;
  imageUrl?: string;
  categoryId?: number;
}

export function parseSubcategoryModel(json: any): SubcategoryModel {
  return {
    id: json?.id,
    name: json?.name,
    description: json?.description,
    imageUrl: json?.image_url,
    categoryId: json?.category_id,
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
