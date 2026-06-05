// App preference toggles for the Settings screen. Persisted locally (no backend
// endpoint for these yet). Language lives in the i18n provider, so it's not here.
import { create } from 'zustand';
import { storage } from '@/lib/storage';

const STORAGE_KEY = 'APP_SETTINGS';

export interface AppSettings {
  darkMode: boolean;
  pushNotifications: boolean;
  promotions: boolean;
  orderUpdates: boolean;
  tripReminders: boolean;
}

const DEFAULTS: AppSettings = {
  darkMode: false,
  pushNotifications: true,
  promotions: true,
  orderUpdates: true,
  tripReminders: true,
};

interface SettingsState extends AppSettings {
  hydrated: boolean;
  hydrate: () => Promise<void>;
  set: (patch: Partial<AppSettings>) => void;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  ...DEFAULTS,
  hydrated: false,

  async hydrate() {
    if (get().hydrated) return;
    const saved = await storage.getJSON<AppSettings>(STORAGE_KEY);
    set({ ...DEFAULTS, ...(saved ?? {}), hydrated: true });
  },

  set(patch) {
    set(patch);
    const { darkMode, pushNotifications, promotions, orderUpdates, tripReminders } =
      get();
    void storage.setJSON(STORAGE_KEY, {
      darkMode,
      pushNotifications,
      promotions,
      orderUpdates,
      tripReminders,
    });
  },
}));
