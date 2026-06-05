// Ported from model/category_model.dart

export interface CategoryModel {
  id?: string | number;
  name?: string;
  description?: string;
  imageUrl?: string;
  freeDelivery?: boolean;
}

export function parseCategoryModel(json: any): CategoryModel {
  return {
    id: json?.id,
    name: json?.name,
    description: json?.description,
    // Backend sends `image`; keep image_url as a fallback.
    imageUrl: json?.image ?? json?.image_url,
    freeDelivery: json?.free_delivery,
  };
}

export function categoryModelToJson(c: CategoryModel): any {
  return {
    id: c.id,
    name: c.name,
    description: c.description,
    image_url: c.imageUrl,
  };
}
