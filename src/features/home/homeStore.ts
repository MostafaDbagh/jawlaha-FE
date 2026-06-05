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
      set({ addressTitle: 'Dubai, UAE' }); // Default or "Select Location"
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
      } else if (get().categories.length === 0) {
        loadDummyCategories(set, get);
      }
    } catch (e) {
      if (get().categories.length === 0) {
        loadDummyCategories(set, get);
      } else {
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
      if (result.success) {
        if (Array.isArray(result.object)) {
          set({ popularVendors: (result.object as VendorModel[]) });
        }
      } else if (get().popularVendors.length === 0) {
        loadDummyVendors(set);
      }
    } catch (e) {
      if (get().popularVendors.length === 0) {
        loadDummyVendors(set);
      }
    } finally {
      set({ isPopularVendorsLoading: false });
    }
  },

  getNearbyBranches: async () => {
    try {
      set({ isNearbyBranchesLoading: true });
      // Mock Lat/Lng for now (Dubai)
      const lat = 25.2048;
      const lng = 55.2708;
      const radius = 10.0;

      const result = await repository.getNearbyBranches(lat, lng, radius);

      if (result.success && Array.isArray(result.object)) {
        set({ nearbyBranches: (result.object as BranchModel[]) });
      } else if (get().nearbyBranches.length === 0) {
        loadDummyNearbyBranches(set);
      }
    } catch (e) {
      if (get().nearbyBranches.length === 0) {
        loadDummyNearbyBranches(set);
      }
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

      if (result.success) {
        if (Array.isArray(result.object)) {
          set({ banners: (result.object as OfferModel[]) });
        }
      } else if (get().banners.length === 0) {
        loadDummyBanners(set);
      }
    } catch (e) {
      if (get().banners.length === 0) {
        loadDummyBanners(set);
      }
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

type SetState = (
  partial: Partial<HomeStore> | ((state: HomeStore) => Partial<HomeStore>),
) => void;
type GetState = () => HomeStore;

function loadDummyCategories(set: SetState, get: GetState) {
  const categories: CategoryModel[] = [
    { id: 1, name: 'Restaurants', description: 'Delicious food', imageUrl: 'https://via.placeholder.com/150' },
    { id: 2, name: 'Cafes', description: 'Best coffee in town', imageUrl: 'https://via.placeholder.com/150' },
    { id: 3, name: 'Retail', description: 'Shopping & Retail', imageUrl: 'https://via.placeholder.com/150' },
    { id: 4, name: 'Services', description: 'Home Services', imageUrl: 'https://via.placeholder.com/150' },
  ];
  set({
    categories,
    categoriesPage: createCategoriesPageEntity({
      data: categories,
      itemCount: categories.length,
      page: 2,
      total: categories.length,
      totalPage: 1,
    }),
  });
}

function loadDummyVendors(set: SetState) {
  set({
    popularVendors: [
      { id: 1, name: 'Sample Vendor 1', description: 'Best products here', logoUrl: 'https://via.placeholder.com/150', subscriptionStatus: 'active' },
      { id: 2, name: 'Sample Vendor 2', description: 'Great deals daily', logoUrl: 'https://via.placeholder.com/150', subscriptionStatus: 'active' },
      { id: 3, name: 'Sample Vendor 3', description: 'Premium quality', logoUrl: 'https://via.placeholder.com/150', subscriptionStatus: 'active' },
    ],
  });
}

function loadDummyNearbyBranches(set: SetState) {
  set({
    nearbyBranches: [
      { id: 1, name: 'Downtown Branch', address: 'Sheikh Zayed Rd', city: 'Dubai', latitude: 25.2048, longitude: 55.2708, isActive: true },
      { id: 2, name: 'Marina Branch', address: 'Dubai Marina', city: 'Dubai', latitude: 25.0805, longitude: 55.1403, isActive: true },
    ],
  });
}

function loadDummyBanners(set: SetState) {
  set({
    banners: [
      { id: 1, title: 'Summer Sale', description: 'Up to 50% Off Everything', discountValue: 50.0, isActive: true },
      { id: 2, title: 'Weekend Special', description: 'Buy 1 Get 1 Free', discountValue: 100.0, isActive: true },
    ],
  });
}
