// Ported from model/review_model.dart
// interface + parseReviewModel(json) (fromJson) + reviewModelToJson (toJson).

import { User, parseUser, userToJson } from './auth';

export interface ReviewModel {
  id?: number;
  rating?: number;
  comment?: string;
  userId?: number;
  user?: User;
  createdAt?: string;
}

export function parseReviewModel(json: any): ReviewModel {
  const model: ReviewModel = {
    id: json?.id,
    rating: json?.rating,
    comment: json?.comment,
    userId: json?.user_id,
    createdAt: json?.created_at,
  };
  if (json?.user != null) {
    model.user = parseUser(json.user);
  }
  return model;
}

export function reviewModelToJson(model: ReviewModel): any {
  const map: any = {};
  map.id = model.id;
  map.rating = model.rating;
  map.comment = model.comment;
  map.user_id = model.userId;
  if (model.user != null) {
    map.user = userToJson(model.user);
  }
  map.created_at = model.createdAt;
  return map;
}
