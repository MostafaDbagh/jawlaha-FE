// Per-user favorites state (products + restaurants), mirrored from the server.
// Toggles are optimistic — the heart flips instantly and rolls back on failure.
import { create } from 'zustand';
import { favoritesRepo, type FavoriteType } from '@/data/repository/favorites';
import { showSnack } from '@/lib/snack';

export interface FavoriteEntry {
  item_type: FavoriteType;
  item_id: string;
  // The resolved product/branch document as returned by the backend.
  item: any;
}

const keyOf = (type: FavoriteType, id: string) => `${type}:${id}`;

interface FavoritesState {
  entries: FavoriteEntry[];
  // Fast lookup for hearts: "type:id" of every favorite.
  keys: Set<string>;
  isLoading: boolean;
  load: () => Promise<void>;
  isFavorite: (type: FavoriteType, id: string) => boolean;
  toggle: (type: FavoriteType, id: string) => Promise<boolean>;
  // Wipes local state on logout (favorites belong to the signed-in user).
  reset: () => void;
}

export const useFavoritesStore = create<FavoritesState>((set, get) => ({
  entries: [],
  keys: new Set<string>(),
  isLoading: false,

  async load() {
    try {
      set({ isLoading: true });
      const res = await favoritesRepo.getFavorites();
      if (res.success) {
        const entries: FavoriteEntry[] = (res.object as any)?.favorites ?? [];
        set({ entries, keys: new Set(entries.map((e) => keyOf(e.item_type, e.item_id))) });
      }
    } catch {
      // keep current state on error
    } finally {
      set({ isLoading: false });
    }
  },

  isFavorite(type, id) {
    return get().keys.has(keyOf(type, id));
  },

  // Returns the new favorited state (true = now a favorite). Optimistic:
  // flips immediately, rolls back if the server rejects.
  async toggle(type, id) {
    const key = keyOf(type, id);
    const wasFavorite = get().keys.has(key);

    const apply = (favored: boolean) => {
      const keys = new Set(get().keys);
      if (favored) keys.add(key);
      else keys.delete(key);
      set({
        keys,
        // The list screen reconciles on its own load(); here we only prune
        // removals so an unfavorited row disappears immediately.
        entries: favored ? get().entries : get().entries.filter((e) => keyOf(e.item_type, e.item_id) !== key),
      });
    };

    apply(!wasFavorite);
    const res = wasFavorite
      ? await favoritesRepo.removeFavorite(type, id)
      : await favoritesRepo.addFavorite(type, id);
    if (!res.success) {
      apply(wasFavorite); // roll back
      showSnack(res.msg || 'Failed to update favorites', 'error');
      return wasFavorite;
    }
    return !wasFavorite;
  },

  reset() {
    set({ entries: [], keys: new Set<string>(), isLoading: false });
  },
}));
