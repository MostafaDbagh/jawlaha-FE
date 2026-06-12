// Favorites repository — per-user favorites (products and restaurants/branches)
// stored on the backend. All routes require auth.
import { apiClient, CustomResponse } from '@/lib/api';

const identity = (x: any) => x;

export type FavoriteType = 'product' | 'branch';

export async function getFavorites(): Promise<CustomResponse> {
  return await apiClient.getV2({ subUrl: 'favorites', needToken: true, fromJson: identity });
}

export async function addFavorite(itemType: FavoriteType, itemId: string): Promise<CustomResponse> {
  return await apiClient.postV2({
    subUrl: 'favorites',
    data: { item_type: itemType, item_id: itemId },
    needToken: true,
    fromJson: identity,
  });
}

export async function removeFavorite(itemType: FavoriteType, itemId: string): Promise<CustomResponse> {
  return await apiClient.delete({ subUrl: `favorites/${itemType}/${itemId}`, needToken: true });
}

export const favoritesRepo = { getFavorites, addFavorite, removeFavorite };
