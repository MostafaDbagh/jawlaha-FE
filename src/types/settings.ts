// Ported from model/settings/content_us_model.dart + model/settings/global_text_model.dart
// Convention example for all models: interface + parseX(json) (fromJson) + xToJson (toJson).

export interface Data {
  email?: string;
  phone?: string;
  address?: string;
  facebook?: string;
  twitter?: string;
  instagram?: string;
  whatsapp?: string;
}

export function parseData(json: any): Data {
  return {
    email: json?.email,
    phone: json?.phone,
    address: json?.address,
    facebook: json?.facebook,
    twitter: json?.twitter,
    instagram: json?.instagram,
    whatsapp: json?.whatsapp,
  };
}

export function dataToJson(d: Data): any {
  return {
    email: d.email,
    phone: d.phone,
    address: d.address,
    facebook: d.facebook,
    twitter: d.twitter,
    instagram: d.instagram,
    whatsapp: d.whatsapp,
  };
}

export interface ContentUsModel {
  id?: number;
  key?: string;
  hyperText?: string;
  data?: Data | null;
  createdAt?: string;
  updatedAt?: string;
}

export function parseContentUsModel(json: any): ContentUsModel {
  return {
    id: json?.id,
    key: json?.key,
    hyperText: json?.hyper_text,
    data: json?.data != null ? parseData(json.data) : null,
    createdAt: json?.created_at,
    updatedAt: json?.updated_at,
  };
}

export function contentUsModelToJson(m: ContentUsModel): any {
  const map: any = {};
  map.id = m.id;
  map.key = m.key;
  map.hyper_text = m.hyperText;
  if (m.data != null) {
    map.data = dataToJson(m.data);
  }
  map.created_at = m.createdAt;
  map.updated_at = m.updatedAt;
  return map;
}

export interface GlobalTextModel {
  id?: number;
  key?: string;
  hyperText?: string;
  createdAt?: string;
  updatedAt?: string;
}

export function parseGlobalTextModel(json: any): GlobalTextModel {
  return {
    id: json?.id,
    key: json?.key,
    hyperText: json?.hyper_text,
    createdAt: json?.created_at,
    updatedAt: json?.updated_at,
  };
}

export function globalTextModelToJson(m: GlobalTextModel): any {
  return {
    id: m.id,
    key: m.key,
    hyper_text: m.hyperText,
    created_at: m.createdAt,
    updated_at: m.updatedAt,
  };
}
