// Global auth state — replaces LocalStaticVar.userInfo / token (GetX).
import { create } from 'zustand';
import { User } from '@/types/auth';
import { secureStorage } from '@/lib/storage';
import { setAuthToken, hydrateAuthToken } from '@/lib/api';

interface AuthState {
  token: string;
  refreshToken: string;
  user: User | null;
  isLoggedIn: boolean;
  hydrated: boolean;
  setToken: (token: string) => Promise<void>;
  setRefreshToken: (token: string) => Promise<void>;
  setUser: (user: User | null) => void;
  hydrate: () => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: '',
  refreshToken: '',
  user: null,
  isLoggedIn: false,
  hydrated: false,

  async setToken(token: string) {
    setAuthToken(token);
    await secureStorage.saveToken(token);
    set({ token, isLoggedIn: !!token });
  },

  async setRefreshToken(token: string) {
    await secureStorage.saveRefreshToken(token);
    set({ refreshToken: token });
  },

  setUser(user: User | null) {
    set({ user });
  },

  async hydrate() {
    const token = await hydrateAuthToken();
    const refreshToken = await secureStorage.getRefreshToken();
    set({ token, refreshToken, isLoggedIn: !!token, hydrated: true });
  },

  async logout() {
    await secureStorage.clearAllData();
    setAuthToken('');
    set({ token: '', refreshToken: '', user: null, isLoggedIn: false });
    // Favorites belong to the signed-out user — don't leak them to the next
    // session on this device. Lazy import avoids a store-to-store cycle.
    const { useFavoritesStore } = require('@/features/favorites/favoritesStore');
    useFavoritesStore.getState().reset();
  },
}));
