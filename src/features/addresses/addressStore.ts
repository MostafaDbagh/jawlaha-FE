// Saved delivery addresses.
// The backend has no addresses API yet, so this is a local, AsyncStorage-backed
// store. The shape mirrors what checkout needs (a title + a single address line)
// plus an icon kind for the Saved Addresses list, and a default flag.
import { create } from 'zustand';
import { storage } from '@/lib/storage';

export type AddressIcon = 'home' | 'work' | 'other';

export interface Address {
  id: string;
  title: string;
  details: string;
  icon: AddressIcon;
  isDefault: boolean;
}

// v2: the v1 key was seeded with demo Home/Work addresses that got persisted on
// devices. Bumping the key abandons that stale seed so users start with none.
const STORAGE_KEY = 'SAVED_ADDRESSES_V2';

function genId(): string {
  return `addr_${Date.now()}_${Math.floor(Math.random() * 1e6)}`;
}

interface AddressState {
  addresses: Address[];
  selectedId: string | null;
  hydrated: boolean;
  hydrate: () => Promise<void>;
  addAddress: (a: Omit<Address, 'id'>) => Promise<Address>;
  updateAddress: (id: string, patch: Partial<Omit<Address, 'id'>>) => Promise<void>;
  removeAddress: (id: string) => Promise<void>;
  setDefault: (id: string) => Promise<void>;
  select: (id: string) => void;
  getSelected: () => Address | undefined;
}

function persist(items: Address[]) {
  // Fire-and-forget; the in-memory state is the source of truth for the UI.
  void storage.setJSON(STORAGE_KEY, items);
}

// If exactly one address ends up flagged default, keep it; otherwise make the
// first one default so checkout always has a sane pre-selection.
function normalizeDefaults(items: Address[]): Address[] {
  if (items.length === 0) return items;
  const hasDefault = items.some((a) => a.isDefault);
  if (hasDefault) {
    let seen = false;
    return items.map((a) => {
      if (a.isDefault && !seen) {
        seen = true;
        return a;
      }
      return a.isDefault ? { ...a, isDefault: false } : a;
    });
  }
  return items.map((a, i) => (i === 0 ? { ...a, isDefault: true } : a));
}

export const useAddressStore = create<AddressState>((set, get) => ({
  addresses: [],
  selectedId: null,
  hydrated: false,

  async hydrate() {
    if (get().hydrated) return;
    // New users start with no addresses; they add their own on first checkout.
    const items = normalizeDefaults((await storage.getJSON<Address[]>(STORAGE_KEY)) ?? []);
    const def = items.find((a) => a.isDefault) ?? items[0];
    set({ addresses: items, selectedId: def?.id ?? null, hydrated: true });
  },

  async addAddress(a) {
    const created: Address = { ...a, id: genId() };
    let items = [...get().addresses, created];
    items = normalizeDefaults(items);
    persist(items);
    set({ addresses: items, selectedId: created.id });
    return created;
  },

  async updateAddress(id, patch) {
    let items = get().addresses.map((a) => (a.id === id ? { ...a, ...patch } : a));
    items = normalizeDefaults(items);
    persist(items);
    set({ addresses: items });
  },

  async removeAddress(id) {
    let items = normalizeDefaults(get().addresses.filter((a) => a.id !== id));
    persist(items);
    set((s) => ({
      addresses: items,
      selectedId:
        s.selectedId === id
          ? items.find((a) => a.isDefault)?.id ?? items[0]?.id ?? null
          : s.selectedId,
    }));
  },

  async setDefault(id) {
    const items = get().addresses.map((a) => ({ ...a, isDefault: a.id === id }));
    persist(items);
    set({ addresses: items, selectedId: id });
  },

  select(id) {
    set({ selectedId: id });
  },

  getSelected() {
    const { addresses, selectedId } = get();
    return (
      addresses.find((a) => a.id === selectedId) ??
      addresses.find((a) => a.isDefault) ??
      addresses[0]
    );
  },
}));
