// Ported from Flutter:
//   lib/screens/vendor/controllers/vendor_controller.dart
//   lib/screens/vendor/controllers/vendor_state.dart  (empty in source)
// GetX VendorController -> zustand store. Same fields, same names, same logic.
import { create } from 'zustand';
import { repository } from '@/data/repository';
import { showSnack } from '@/lib/snack';
import type { VendorModel } from '@/types/vendor';

interface VendorStore {
  // observables (RxList / Rx<...> / RxBool) -> plain fields, same initial values
  vendors: VendorModel[];
  popularVendors: VendorModel[];
  expiredSubscriptions: VendorModel[];
  currentVendor: VendorModel | null;
  isLoading: boolean;

  // actions (controller methods)
  getVendors: () => Promise<void>;
  getPopularVendors: () => Promise<void>;
  getExpiredSubscriptions: () => Promise<void>;
  getVendor: (id: number) => Promise<void>;
  createVendor: (vendor: VendorModel) => Promise<boolean>;
  updateVendor: (id: number, vendor: VendorModel) => Promise<boolean>;
  deleteVendor: (id: number) => Promise<boolean>;
}

export const useVendorStore = create<VendorStore>((set, get) => ({
  vendors: [],
  popularVendors: [],
  expiredSubscriptions: [],
  currentVendor: null,
  isLoading: false,

  getVendors: async () => {
    try {
      set({ isLoading: true });
      const res = await repository.getVendors();
      if (res.success) {
        set({ vendors: res.object as VendorModel[] });
      } else {
        showSnack(res.msg, 'error');
      }
    } catch (e) {
      showSnack(String(e), 'error');
    } finally {
      set({ isLoading: false });
    }
  },

  getPopularVendors: async () => {
    try {
      set({ isLoading: true });
      const res = await repository.getPopularVendors();
      if (res.success) {
        set({ popularVendors: res.object as VendorModel[] });
      } else {
        showSnack(res.msg, 'error');
      }
    } catch (e) {
      showSnack(String(e), 'error');
    } finally {
      set({ isLoading: false });
    }
  },

  getExpiredSubscriptions: async () => {
    try {
      set({ isLoading: true });
      const res = await repository.getExpiredSubscriptions();
      if (res.success) {
        set({ expiredSubscriptions: res.object as VendorModel[] });
      } else {
        showSnack(res.msg, 'error');
      }
    } catch (e) {
      showSnack(String(e), 'error');
    } finally {
      set({ isLoading: false });
    }
  },

  getVendor: async (id: number) => {
    try {
      set({ isLoading: true });
      const res = await repository.getVendor(id);
      if (res.success) {
        set({ currentVendor: res.object as VendorModel });
      } else {
        showSnack(res.msg, 'error');
      }
    } catch (e) {
      showSnack(String(e), 'error');
    } finally {
      set({ isLoading: false });
    }
  },

  createVendor: async (vendor: VendorModel) => {
    try {
      set({ isLoading: true });
      const res = await repository.createVendor(vendor);
      if (res.success) {
        get().getVendors();
        return true;
      } else {
        showSnack(res.msg, 'error');
      }
    } catch (e) {
      showSnack(String(e), 'error');
    } finally {
      set({ isLoading: false });
    }
    return false;
  },

  updateVendor: async (id: number, vendor: VendorModel) => {
    try {
      set({ isLoading: true });
      const res = await repository.updateVendor(id, vendor);
      if (res.success) {
        get().getVendor(id);
        return true;
      } else {
        showSnack(res.msg, 'error');
      }
    } catch (e) {
      showSnack(String(e), 'error');
    } finally {
      set({ isLoading: false });
    }
    return false;
  },

  deleteVendor: async (id: number) => {
    try {
      set({ isLoading: true });
      const res = await repository.deleteVendor(id);
      if (res.success) {
        get().getVendors();
        return true;
      } else {
        showSnack(res.msg, 'error');
      }
    } catch (e) {
      showSnack(String(e), 'error');
    } finally {
      set({ isLoading: false });
    }
    return false;
  },
}));
