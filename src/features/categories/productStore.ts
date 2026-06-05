// Ported from:
//   lib/screens/categories/controllers/product_controller.dart
//   lib/screens/categories/controllers/product_state.dart  (empty in Flutter source)
//
// ProductController -> zustand store. Each GetX observable becomes a plain store
// field (same name + same initial value); each controller method becomes a store
// action. Repository calls go through `repository` and return a CustomResponse,
// which we check via res.success / res.object / res.msg exactly like the Dart.
// showServerMessages([res.msg]) (isError defaults true) -> showSnack(res.msg, 'error').

import { create } from 'zustand';
import { repository } from '@/data/repository';
import { showSnack } from '@/lib/snack';
import { PageEntity } from '@/lib/api';
import { createPaginateReqEntity } from '@/types/entities';
import { CategoryModel } from '@/types/category';
import { SubcategoryModel } from '@/types/subcategory';
import { ProductModel } from '@/types/product';
import { ReviewModel } from '@/types/review';
import { OfferModel } from '@/types/offer';

// NOTE: the RN catalog repository currently exposes the read endpoints used by
// the Flutter ProductController. The create/update/delete category/subcategory/
// product endpoints are admin-only and are not part of the RN repository barrel
// yet, so they are referenced through this loosely-typed view of `repository`
// (mirroring the Dart `_repository.createCategory(...)` etc.).
// TODO: add create/update/delete category/subcategory/product methods to
// src/data/repository when the admin flows are ported.
const repo = repository as unknown as Record<string, (...args: any[]) => Promise<any>>;

interface ProductState {
  // Categories
  categories: CategoryModel[];
  currentCategory: CategoryModel | null;

  // Subcategories
  subcategories: SubcategoryModel[];
  currentSubcategory: SubcategoryModel | null;

  // Products
  products: ProductModel[];
  currentProduct: ProductModel | null;

  // Reviews
  reviews: ReviewModel[];
  currentReview: ReviewModel | null;

  // Offers
  activeOffers: OfferModel[];
  expiredOffers: OfferModel[];
  currentOffer: OfferModel | null;

  isLoading: boolean;

  // Lifecycle (GetX onInit)
  onInit: () => void;

  // Categories
  getCategories: () => Promise<void>;
  getCategory: (id: number) => Promise<void>;
  createCategory: (category: CategoryModel) => Promise<boolean>;
  updateCategory: (id: number, category: CategoryModel) => Promise<boolean>;
  deleteCategory: (id: number) => Promise<boolean>;

  // Subcategories
  getBranchSubcategories: (branchId: number) => Promise<void>;
  searchSubcategories: (query: string) => Promise<void>;
  getSubcategory: (branchId: number, subId: number) => Promise<void>;
  createSubcategory: (branchId: number, subcategory: SubcategoryModel) => Promise<boolean>;
  updateSubcategory: (
    branchId: number,
    subId: number,
    subcategory: SubcategoryModel,
  ) => Promise<boolean>;
  deleteSubcategory: (branchId: number, subId: number) => Promise<boolean>;

  // Products
  getBranchProducts: (branchId: number) => Promise<void>;
  getSubcategoryProducts: (branchId: number, subId: number) => Promise<void>;
  getProduct: (id: number) => Promise<void>;
  createProduct: (branchId: number, product: ProductModel) => Promise<boolean>;
  updateProduct: (id: number, product: ProductModel) => Promise<boolean>;
  deleteProduct: (id: number) => Promise<boolean>;

  // Reviews
  getBranchReviews: (branchId: number) => Promise<void>;

  // Offers
  getActiveOffers: () => Promise<void>;
}

export const useProductStore = create<ProductState>((set, get) => ({
  // Categories
  categories: [],
  currentCategory: null,

  // Subcategories
  subcategories: [],
  currentSubcategory: null,

  // Products
  products: [],
  currentProduct: null,

  // Reviews
  reviews: [],
  currentReview: null,

  // Offers
  activeOffers: [],
  expiredOffers: [],
  currentOffer: null,

  isLoading: false,

  onInit: () => {
    get().getCategories();
  },

  // Categories
  getCategories: async () => {
    try {
      set({ isLoading: true });
      const res = await repository.getCategories({
        paginateReqEntity: createPaginateReqEntity({ page: 1, perPage: 100 }),
      });
      if (res.success) {
        set({ categories: (res.object as PageEntity<CategoryModel>).data ?? [] });
      } else {
        showSnack(res.msg, 'error');
      }
    } catch (e) {
      showSnack(String(e), 'error');
    } finally {
      set({ isLoading: false });
    }
  },

  getCategory: async (id: number) => {
    try {
      set({ isLoading: true });
      const res = await repository.getCategory(id);
      if (res.success) {
        set({ currentCategory: res.object as CategoryModel });
      } else {
        showSnack(res.msg, 'error');
      }
    } catch (e) {
      showSnack(String(e), 'error');
    } finally {
      set({ isLoading: false });
    }
  },

  createCategory: async (category: CategoryModel) => {
    try {
      set({ isLoading: true });
      const res = await repo.createCategory(category);
      if (res.success) {
        get().getCategories();
        return true;
      } else {
        showSnack(res.msg, 'error');
        return false;
      }
    } catch (e) {
      showSnack(String(e), 'error');
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  updateCategory: async (id: number, category: CategoryModel) => {
    try {
      set({ isLoading: true });
      const res = await repo.updateCategory(id, category);
      if (res.success) {
        get().getCategories();
        return true;
      } else {
        showSnack(res.msg, 'error');
        return false;
      }
    } catch (e) {
      showSnack(String(e), 'error');
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  deleteCategory: async (id: number) => {
    try {
      set({ isLoading: true });
      const res = await repo.deleteCategory(id);
      if (res.success) {
        get().getCategories();
        return true;
      } else {
        showSnack(res.msg, 'error');
        return false;
      }
    } catch (e) {
      showSnack(String(e), 'error');
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  // Subcategories
  getBranchSubcategories: async (branchId: number) => {
    try {
      set({ isLoading: true });
      const res = await repository.getBranchSubcategories(branchId);
      if (res.success) {
        set({ subcategories: res.object as SubcategoryModel[] });
      } else {
        showSnack(res.msg, 'error');
      }
    } catch (e) {
      showSnack(String(e), 'error');
    } finally {
      set({ isLoading: false });
    }
  },

  // Search Subcategories
  searchSubcategories: async (query: string) => {
    try {
      set({ isLoading: true });
      const res = await repository.searchSubcategories(query);
      if (res.success) {
        set({ subcategories: res.object as SubcategoryModel[] });
      } else {
        showSnack(res.msg, 'error');
      }
    } catch (e) {
      showSnack(String(e), 'error');
    } finally {
      set({ isLoading: false });
    }
  },

  getSubcategory: async (branchId: number, subId: number) => {
    try {
      set({ isLoading: true });
      const res = await repository.getSubcategory(branchId, subId);
      if (res.success) {
        set({ currentSubcategory: res.object as SubcategoryModel });
      } else {
        showSnack(res.msg, 'error');
      }
    } catch (e) {
      showSnack(String(e), 'error');
    } finally {
      set({ isLoading: false });
    }
  },

  createSubcategory: async (branchId: number, subcategory: SubcategoryModel) => {
    try {
      set({ isLoading: true });
      const res = await repo.createSubcategory(branchId, subcategory);
      if (res.success) {
        return true;
      } else {
        showSnack(res.msg, 'error');
        return false;
      }
    } catch (e) {
      showSnack(String(e), 'error');
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  updateSubcategory: async (
    branchId: number,
    subId: number,
    subcategory: SubcategoryModel,
  ) => {
    try {
      set({ isLoading: true });
      const res = await repo.updateSubcategory(branchId, subId, subcategory);
      if (res.success) {
        return true;
      } else {
        showSnack(res.msg, 'error');
        return false;
      }
    } catch (e) {
      showSnack(String(e), 'error');
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  deleteSubcategory: async (branchId: number, subId: number) => {
    try {
      set({ isLoading: true });
      const res = await repo.deleteSubcategory(branchId, subId);
      if (res.success) {
        return true;
      } else {
        showSnack(res.msg, 'error');
        return false;
      }
    } catch (e) {
      showSnack(String(e), 'error');
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  // Products
  getBranchProducts: async (branchId: number) => {
    try {
      set({ isLoading: true });
      const res = await repository.getBranchProducts(branchId);
      if (res.success) {
        set({ products: res.object as ProductModel[] });
      } else {
        showSnack(res.msg, 'error');
      }
    } catch (e) {
      showSnack(String(e), 'error');
    } finally {
      set({ isLoading: false });
    }
  },

  getSubcategoryProducts: async (branchId: number, subId: number) => {
    try {
      set({ isLoading: true });
      const res = await repository.getSubcategoryProducts(branchId, subId);
      if (res.success) {
        set({ products: res.object as ProductModel[] });
      } else {
        showSnack(res.msg, 'error');
      }
    } catch (e) {
      showSnack(String(e), 'error');
    } finally {
      set({ isLoading: false });
    }
  },

  getProduct: async (id: number) => {
    try {
      set({ isLoading: true });
      const res = await repository.getProduct(id);
      if (res.success) {
        set({ currentProduct: res.object as ProductModel });
      } else {
        showSnack(res.msg, 'error');
      }
    } catch (e) {
      showSnack(String(e), 'error');
    } finally {
      set({ isLoading: false });
    }
  },

  createProduct: async (branchId: number, product: ProductModel) => {
    try {
      set({ isLoading: true });
      const res = await repo.createProduct(branchId, product);
      if (res.success) {
        return true;
      } else {
        showSnack(res.msg, 'error');
        return false;
      }
    } catch (e) {
      showSnack(String(e), 'error');
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  updateProduct: async (id: number, product: ProductModel) => {
    try {
      set({ isLoading: true });
      const res = await repo.updateProduct(id, product);
      if (res.success) {
        return true;
      } else {
        showSnack(res.msg, 'error');
        return false;
      }
    } catch (e) {
      showSnack(String(e), 'error');
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  deleteProduct: async (id: number) => {
    try {
      set({ isLoading: true });
      const res = await repo.deleteProduct(id);
      if (res.success) {
        return true;
      } else {
        showSnack(res.msg, 'error');
        return false;
      }
    } catch (e) {
      showSnack(String(e), 'error');
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  // Reviews
  getBranchReviews: async (branchId: number) => {
    try {
      set({ isLoading: true });
      const res = await repository.getBranchReviews(branchId);
      if (res.success) {
        set({ reviews: res.object as ReviewModel[] });
      } else {
        showSnack(res.msg, 'error');
      }
    } catch (e) {
      showSnack(String(e), 'error');
    } finally {
      set({ isLoading: false });
    }
  },

  // Offers
  getActiveOffers: async () => {
    try {
      set({ isLoading: true });
      const res = await repository.getActiveOffers();
      if (res.success) {
        set({ activeOffers: res.object as OfferModel[] });
      } else {
        showSnack(res.msg, 'error');
      }
    } catch (e) {
      showSnack(String(e), 'error');
    } finally {
      set({ isLoading: false });
    }
  },
}));
