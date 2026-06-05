// Ported from model/category_model.dart

export interface CategoryModel {
  id?: number;
  name?: string;
  description?: string;
  imageUrl?: string;
}

export function parseCategoryModel(json: any): CategoryModel {
  return {
    id: json?.id,
    name: json?.name,
    description: json?.description,
    imageUrl: json?.image_url,
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
