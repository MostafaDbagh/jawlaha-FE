// Ported from model/base_respons/name_model.dart
// Convention: interface + parseX(json) (fromJson) + xToJson (toJson).

export interface NameModel {
  id?: number;
  name?: string;
}

export function parseNameModel(json: any): NameModel {
  return {
    id: json?.id,
    name: json?.name,
  };
}

export function nameModelToJson(n: NameModel): any {
  return {
    id: n.id,
    name: n.name,
  };
}
