// The customer's selected city — drives which restaurants the home shows. Local
// (AsyncStorage-backed), like the addresses store. A customer in Latakia should
// only see Latakia restaurants, not Damascus ones.
import { create } from 'zustand';
import { storage } from '@/lib/storage';
import { City, findCity } from '@/lib/cities';

const STORAGE_KEY = 'SELECTED_CITY';

interface CityState {
  city: City | null;
  hydrated: boolean;
  hydrate: () => Promise<void>;
  setCity: (city: City) => Promise<void>;
  clear: () => Promise<void>;
}

export const useCityStore = create<CityState>((set, get) => ({
  city: null,
  hydrated: false,

  async hydrate() {
    if (get().hydrated) return;
    const saved = await storage.getJSON<City>(STORAGE_KEY);
    // Re-resolve against the canonical list so a renamed/removed city is dropped.
    const city = saved ? findCity(saved.en) ?? null : null;
    set({ city, hydrated: true });
  },

  async setCity(city) {
    await storage.setJSON(STORAGE_KEY, city);
    set({ city });
  },

  async clear() {
    await storage.remove(STORAGE_KEY);
    set({ city: null });
  },
}));
