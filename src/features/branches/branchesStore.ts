// Ported from screens/branshes/controllers/branshes_controller.dart (+ branshes_state.dart, which is empty).
// GetX BranchesController -> zustand store. Repository calls + showSnack mirror the Dart logic.
import { create } from 'zustand';
import { repository } from '@/data/repository';
import { BranchModel } from '@/types/branch';
import { showSnack } from '@/lib/snack';

// Mirrors core/messages/show_errors_message.dart -> showServerMessages (iterates non-null errors as red snackbars).
function showServerMessages(errors: (string | null | undefined)[]) {
  for (const element of errors) {
    if (element != null) {
      showSnack(element.toString(), 'error');
    }
  }
}

interface BranchesState {
  branches: BranchModel[];
  nearbyBranches: BranchModel[];
  popularBranches: BranchModel[];
  vendorBranches: BranchModel[];
  currentBranch: BranchModel | null;
  isLoading: boolean;

  getBranches: () => Promise<void>;
  getNearbyBranches: (lat: number, lng: number, radius: number) => Promise<void>;
  getPopularBranches: () => Promise<void>;
  getBranch: (id: number) => Promise<void>;
  getVendorBranches: (vendorId: number) => Promise<void>;
  createBranch: (vendorId: number, branch: BranchModel) => Promise<boolean>;
  updateBranch: (id: number, branch: BranchModel) => Promise<boolean>;
  activateBranch: (id: number) => Promise<boolean>;
  deleteBranch: (id: number) => Promise<boolean>;
}

export const useBranchesStore = create<BranchesState>((set) => ({
  branches: [],
  nearbyBranches: [],
  popularBranches: [],
  vendorBranches: [],
  currentBranch: null,
  isLoading: false,

  getBranches: async () => {
    try {
      set({ isLoading: true });
      const res = await repository.getBranches();
      if (res.success) {
        set({ branches: res.object as BranchModel[] });
      } else {
        showServerMessages([res.msg]);
      }
    } catch (e) {
      showServerMessages([String(e)]);
    } finally {
      set({ isLoading: false });
    }
  },

  getNearbyBranches: async (lat: number, lng: number, radius: number) => {
    try {
      set({ isLoading: true });
      const res = await repository.getNearbyBranches(lat, lng, radius);
      if (res.success) {
        set({ nearbyBranches: res.object as BranchModel[] });
      } else {
        showServerMessages([res.msg]);
      }
    } catch (e) {
      showServerMessages([String(e)]);
    } finally {
      set({ isLoading: false });
    }
  },

  getPopularBranches: async () => {
    try {
      set({ isLoading: true });
      const res = await repository.getPopularBranches();
      if (res.success) {
        set({ popularBranches: res.object as BranchModel[] });
      } else {
        showServerMessages([res.msg]);
      }
    } catch (e) {
      showServerMessages([String(e)]);
    } finally {
      set({ isLoading: false });
    }
  },

  getBranch: async (id: number) => {
    try {
      set({ isLoading: true });
      const res = await repository.getBranch(id);
      if (res.success) {
        set({ currentBranch: res.object as BranchModel });
      } else {
        showServerMessages([res.msg]);
      }
    } catch (e) {
      showServerMessages([String(e)]);
    } finally {
      set({ isLoading: false });
    }
  },

  getVendorBranches: async (vendorId: number) => {
    try {
      set({ isLoading: true });
      const res = await repository.getVendorBranches(vendorId);
      if (res.success) {
        set({ vendorBranches: res.object as BranchModel[] });
      } else {
        showServerMessages([res.msg]);
      }
    } catch (e) {
      showServerMessages([String(e)]);
    } finally {
      set({ isLoading: false });
    }
  },

  createBranch: async (vendorId: number, branch: BranchModel) => {
    try {
      set({ isLoading: true });
      // TODO: repository.createBranch not yet implemented in src/data/repository.
      const res = await (repository as any).createBranch(vendorId, branch);
      if (res.success) {
        return true;
      } else {
        showServerMessages([res.msg]);
        return false;
      }
    } catch (e) {
      showServerMessages([String(e)]);
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  updateBranch: async (id: number, branch: BranchModel) => {
    try {
      set({ isLoading: true });
      // TODO: repository.updateBranch not yet implemented in src/data/repository.
      const res = await (repository as any).updateBranch(id, branch);
      if (res.success) {
        return true;
      } else {
        showServerMessages([res.msg]);
        return false;
      }
    } catch (e) {
      showServerMessages([String(e)]);
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  activateBranch: async (id: number) => {
    try {
      set({ isLoading: true });
      // TODO: repository.activateBranch not yet implemented in src/data/repository.
      const res = await (repository as any).activateBranch(id);
      if (res.success) {
        return true;
      } else {
        showServerMessages([res.msg]);
        return false;
      }
    } catch (e) {
      showServerMessages([String(e)]);
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  deleteBranch: async (id: number) => {
    try {
      set({ isLoading: true });
      // TODO: repository.deleteBranch not yet implemented in src/data/repository.
      const res = await (repository as any).deleteBranch(id);
      if (res.success) {
        return true;
      } else {
        showServerMessages([res.msg]);
        return false;
      }
    } catch (e) {
      showServerMessages([String(e)]);
      return false;
    } finally {
      set({ isLoading: false });
    }
  },
}));
