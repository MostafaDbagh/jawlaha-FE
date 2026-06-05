// Global auth state — replaces LocalStaticVar.userInfo / token (GetX).
import { create } from 'zustand';
import { User } from '@/types/auth';
import { secureStorage } from '@/lib/storage';
import { setAuthToken, hydrateAuthToken } from '@/lib/api';

interface AuthState {
  token: string;
  user: User | null;
  isLoggedIn: boolean;
  hydrated: boolean;
  setToken: (token: string) => Promise<void>;
  setUser: (user: User | null) => void;
  hydrate: () => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: '',
  user: null,
  isLoggedIn: false,
  hydrated: false,

  async setToken(token: string) {
    setAuthToken(token);
    await secureStorage.saveToken(token);
    set({ token, isLoggedIn: !!token });
  },

  setUser(user: User | null) {
    set({ user });
  },

  async hydrate() {
    const token = await hydrateAuthToken();
    set({ token, isLoggedIn: !!token, hydrated: true });
  },

  async logout() {
    await secureStorage.clearAllData();
    setAuthToken('');
    set({ token: '', user: null, isLoggedIn: false });
  },
}));
