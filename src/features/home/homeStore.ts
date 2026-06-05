// Ported from:
//   lib/screens/home/controllers/home_controller.dart
//   lib/screens/home/controllers/home_state.dart
// GetX HomeController + HomeState -> zustand store.

import { create } from 'zustand';
import { repository } from '@/data/repository';
import { prefs } from '@/lib/storage';
import { showSnack } from '@/lib/snack';
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

// TODO: native FCM/device-token fetch (firebase_messaging getToken). Stubbed.
async function getFCMToken(): Promise<string | null> {
  // TODO: integrate expo-notifications / firebase to return the real device FCM token.
  return null;
}

// TODO: native device details (getDeviceDetails -> [model, name, ?, id, manufacturer]).
async function getDeviceDetails(): Promise<(string | undefined)[]> {
  // TODO: integrate expo-device to populate [model, name, _, id, manufacturer].
  return [];
}

// TODO: native package info (PackageInfo.fromPlatform). Stubbed.
function getPackageInfo(): { version: string; buildNumber: string } {
  // TODO: integrate expo-application / Constants for real version + buildNumber.
  return { version: '', buildNumber: '' };
}

// TODO: native platform info (dart:io Platform). Stubbed.
const Platform = {
  operatingSystem: 'ios',
  operatingSystemVersion: '',
};

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
  saveFCMToken: () => Promise<void>;
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

  saveFCMToken: async () => {
    const fcmToken = await getFCMToken();
    if (fcmToken == null) return;
    const deviceDetails = await getDeviceDetails();
    const packageInfo = getPackageInfo();
    await repository.saveFCMToken({
      firebaseToken: fcmToken,
      deviceType: Platform.operatingSystem,
      deviceName: deviceDetails[1] ?? '',
      deviceId: deviceDetails[3] ?? '',
      deviceModel: deviceDetails[0] ?? '',
      deviceManufacturer: deviceDetails[4] ?? '',
      appVersion: packageInfo.version,
      buildNumber: packageInfo.buildNumber,
      appLanguage: (await prefs.getAppLanguage()) ?? '',
      platformVersion: Platform.operatingSystemVersion,
      timezone: 'UTF',
    });
  },

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
    if (storedAddress.length > 0) {
      set({ addressTitle: storedAddress });
    } else {
      set({ addressTitle: 'Damascus, Syria' }); // Default or "Select Location"
    }
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
      set({ isNearbyBranchesLoading: true });
      // Default location: central Damascus (Syria). [[jawlaha-cash-on-delivery-only]]
      const lat = 33.5138;
      const lng = 36.2765;
      const radius = 15.0;

      const result = await repository.getNearbyBranches(lat, lng, radius);

      if (result.success && Array.isArray(result.object)) {
        set({ nearbyBranches: (result.object as BranchModel[]) });
      }
    } catch (e) {
      // Leave list empty; the UI shows its empty/loading state.
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

