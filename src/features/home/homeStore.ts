// Ported from:
//   lib/screens/home/controllers/home_controller.dart
//   lib/screens/home/controllers/home_state.dart
// GetX HomeController + HomeState -> zustand store.

import { create } from 'zustand';
import { repository } from '@/data/repository';
import { prefs } from '@/lib/storage';
import { showSnack } from '@/lib/snack';
import { useCityStore } from '@/features/location/cityStore';
import { createPaginateReqEntity } from '@/types/entities';
import { CategoryModel } from '@/types/category';
import { VendorModel } from '@/types/vendor';
import { BranchModel } from '@/types/branch';
import { OfferModel } from '@/types/offer';

// Mirrors entities/base_entities/page_entity.dart PageEntity<CategoryModel>.
// (distinct from the api-layer PageEntity; this one carries paginate flags + page counter)
export interface CategoriesPageEntity {
  totalPage: number;
  page: number;
  itemCount: number;
  loading: boolean;
  paginateLoading: boolean;
  data?: CategoryModel[];
  unreadCount?: number;
  total?: number;
}

function createCategoriesPageEntity(
  params?: Partial<CategoriesPageEntity>,
): CategoriesPageEntity {
  return {
    totalPage: params?.totalPage ?? 2,
    page: params?.page ?? 1,
    itemCount: params?.itemCount ?? 0,
    loading: params?.loading ?? false,
    paginateLoading: params?.paginateLoading ?? false,
    data: params?.data,
    unreadCount: params?.unreadCount,
    total: params?.total,
  };
}

// FCM token registration now lives in the dedicated push module
// (src/lib/push + src/features/push/usePushRegistration). This store no longer
// owns it.

interface HomeStore {
  // ---- Data Lists ----
  categories: CategoryModel[];
  categoriesPage: CategoriesPageEntity;
  popularVendors: VendorModel[];
  nearbyBranches: BranchModel[];
  banners: OfferModel[];

  // ---- Loading States ----
  isCategoriesLoading: boolean;
  isPopularVendorsLoading: boolean;
  isNearbyBranchesLoading: boolean;
  isBannersLoading: boolean;
  isBranchesLoading: boolean;
  isVendorsLoading: boolean;

  // ---- Location ----
  addressTitle: string;

  payrollLoader: boolean;
  leaverLoader: boolean;
  buttonLoader: boolean;
  oldSearchVale: string | null;

  // ---- Actions ----
  getHomeData: () => Promise<void>;
  getCurrentLocation: () => Promise<void>;
  getCategories: (opts?: { isRefresh?: boolean }) => Promise<void>;
  getPopularVendors: () => Promise<void>;
  getNearbyBranches: () => Promise<void>;
  getPopularBranches: () => Promise<void>;
  getBanners: () => Promise<void>;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
}

export const useHomeStore = create<HomeStore>((set, get) => ({
  // ---- Data Lists ----
  categories: [],
  categoriesPage: createCategoriesPageEntity(),
  popularVendors: [],
  nearbyBranches: [],
  banners: [],

  // ---- Loading States ----
  isCategoriesLoading: false,
  isPopularVendorsLoading: false,
  isNearbyBranchesLoading: false,
  isBannersLoading: false,
  isBranchesLoading: false,
  isVendorsLoading: false,

  // ---- Location ----
  addressTitle: '',

  payrollLoader: false,
  leaverLoader: false,
  buttonLoader: false,
  oldSearchVale: '',

  getHomeData: async () => {
    try {
      // 1. Get Location/Address
      get().getCurrentLocation();
      // (storage is async in RN; fire-and-forget to match the Flutter non-awaited call)

      // 2. Fetch Data in parallel or sequence
      await Promise.all([
        get().getCategories(),
        get().getPopularVendors(),
        get().getNearbyBranches(),
        get().getPopularBranches(),
        get().getBanners(),
      ]);
    } catch (e) {
      showSnack(`Failed to load home data: ${e}`);
    }
  },

  getCurrentLocation: async () => {
    // For now, load from stored address or default
    const storedAddress = (await prefs.getAddressTitle()) ?? '';
    // New users have no location yet — leave it empty so the header prompts them
    // to enter one (no fake default city).
    set({ addressTitle: storedAddress });
    // TODO: Implement real Geolocator logic here to update address
  },

  getCategories: async ({ isRefresh = false }: { isRefresh?: boolean } = {}) => {
    const page = get().categoriesPage;

    if (isRefresh) {
      set({
        categoriesPage: createCategoriesPageEntity(),
        categories: [],
      });
      // Need getting from page 1
    } else {
      if (
        page.paginateLoading ||
        (page.page > page.totalPage && page.totalPage > 0)
      ) {
        return;
      }
    }

    const currentPage = isRefresh ? 1 : page.page;

    try {
      if (currentPage === 1) {
        set({ isCategoriesLoading: true });
      } else {
        set({
          categoriesPage: { ...get().categoriesPage, paginateLoading: true },
        });
      }

      const result = await repository.getCategories({
        paginateReqEntity: createPaginateReqEntity({ page: currentPage }),
      });

      if (result.success) {
        const response = result.object as {
          data: CategoryModel[];
          total?: number;
          totalPage: number;
        };
        let categories: CategoryModel[];
        if (currentPage === 1) {
          categories = [...(response.data ?? [])];
        } else {
          categories = [...get().categories, ...(response.data ?? [])];
        }

        set({
          categories,
          categoriesPage: createCategoriesPageEntity({
            data: categories,
            itemCount: categories.length,
            page: currentPage + 1,
            total: response.total,
            totalPage: response.totalPage,
          }),
        });
      }
    } catch (e) {
      if (get().categories.length > 0) {
        set({
          categoriesPage: createCategoriesPageEntity({
            data: page.data,
            total: page.total,
            totalPage: page.totalPage,
            itemCount: page.data?.length ?? 0,
          }),
        });
      }
    } finally {
      set({
        isCategoriesLoading: false,
        categoriesPage: { ...get().categoriesPage, paginateLoading: false },
      });
    }
  },

  getPopularVendors: async () => {
    try {
      set({ isPopularVendorsLoading: true });
      const result = await repository.getPopularVendors();
      if (result.success && Array.isArray(result.object)) {
        set({ popularVendors: (result.object as VendorModel[]) });
      }
    } catch (e) {
      // Leave list empty; the UI shows its empty/loading state.
    } finally {
      set({ isPopularVendorsLoading: false });
    }
  },

  getNearbyBranches: async () => {
    try {
      // Restaurants are scoped to the customer's selected city — a Latakia
      // customer must not see Damascus restaurants. With no city chosen yet we
      // show nothing and the home prompts the user to pick one.
      const city = useCityStore.getState().city;
      if (!city) {
        set({ nearbyBranches: [], isNearbyBranchesLoading: false });
        return;
      }
      set({ isNearbyBranchesLoading: true });
      const result = await repository.getBranches({ city: city.en });
      set({ nearbyBranches: result.success && Array.isArray(result.object) ? (result.object as BranchModel[]) : [] });
    } catch (e) {
      set({ nearbyBranches: [] });
    } finally {
      set({ isNearbyBranchesLoading: false });
    }
  },

  getPopularBranches: async () => {
    try {
      set({ isBranchesLoading: true });
      const result = await repository.getPopularBranches();
      if (result.success && Array.isArray(result.object)) {
        // Here we could keep another variable if needed, but for now we'll just demonstrate it fetching
        // If the UI wants a popular branches carousel separate from nearby,
        // you would assign it to a new RxList<BranchModel> popularBranches.
      }
    } catch (e) {
      // Handle error
    } finally {
      set({ isBranchesLoading: false });
    }
  },

  getBanners: async () => {
    try {
      set({ isBannersLoading: true });
      // Using getActiveOffers for banners
      const result = await repository.getActiveOffers();

      if (result.success && Array.isArray(result.object)) {
        set({ banners: (result.object as OfferModel[]) });
      }
    } catch (e) {
      // Leave banners empty; the UI hides the banner when there are none.
    } finally {
      set({ isBannersLoading: false });
    }
  },

  loadMore: async () => {
    await get().getCategories();
  },

  refresh: async () => {
    await get().getCategories({ isRefresh: true });
  },
}));

