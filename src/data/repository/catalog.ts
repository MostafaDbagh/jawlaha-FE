// Ported from: lib/data/http_helper.dart + lib/data/repository.dart (catalog / food-delivery domain).
// NOTE: Offline caching (Connectivity + DatabaseCachingHelper) was omitted.
// These methods just call the API but keep the same return shape (CustomResponse
// with the parsed model / list / PageEntity) as the Flutter Repository.

import { apiClient, CustomResponse } from '@/lib/api';
import { PaginateReqEntity } from '@/types/entities';
import { parseCategoryModel } from '@/types/category';
import { parseVendorModel } from '@/types/vendor';
import { parseBranchModel } from '@/types/branch';
import { parseSubcategoryModel } from '@/types/subcategory';
import { parseProductModel } from '@/types/product';
import { parseReviewModel } from '@/types/review';
import { parseOfferModel } from '@/types/offer';

//-------------------------------------------------------
//-------------------[Categories Repository]-------------
//-------------------------------------------------------

export async function getCategories({
  paginateReqEntity,
}: {
  paginateReqEntity: PaginateReqEntity;
}): Promise<CustomResponse> {
  // jawlahapp returns { data: { categories: [...], pagination: {...} } }, so map
  // it into the { data, total, totalPage } shape the home/product stores expect.
  const queryMap = {
    page: `${paginateReqEntity.page}`,
    limit: `${paginateReqEntity.perPage}`,
  };
  return await apiClient.getV2({
    subUrl: 'categories',
    query: queryMap,
    needToken: false,
    fromJson: (data: any) => ({
      data: (data?.categories ?? []).map(parseCategoryModel),
      total: data?.pagination?.totalItems,
      totalPage: data?.pagination?.totalPages ?? 1,
    }),
  });
}

export async function getCategory(id: number): Promise<CustomResponse> {
  return await apiClient.getV2({
    subUrl: `categories/${id}`,
    fromJson: parseCategoryModel,
    needToken: false,
  });
}

//-------------------------------------------------------
//-------------------[Vendors Repository]----------------
//-------------------------------------------------------

export async function getVendors(): Promise<CustomResponse> {
  return await apiClient.getV2({
    subUrl: 'vendors',
    isListOfModel: true,
    fromJson: parseVendorModel,
    needToken: false,
  });
}

export async function getPopularVendors(): Promise<CustomResponse> {
  return await apiClient.getV2({
    subUrl: 'vendors/popular',
    isListOfModel: true,
    fromJson: parseVendorModel,
    needToken: false,
  });
}

export async function getVendor(id: number): Promise<CustomResponse> {
  return await apiClient.getV2({
    subUrl: `vendors/${id}`,
    fromJson: parseVendorModel,
    needToken: false,
  });
}

//-------------------------------------------------------
//-------------------[Branches Repository]---------------
//-------------------------------------------------------

export async function getBranches(): Promise<CustomResponse> {
  return await apiClient.getV2({
    subUrl: 'branches',
    isListOfModel: true,
    fromJson: parseBranchModel,
    needToken: false,
  });
}

export async function getNearbyBranches(
  lat: number,
  lng: number,
  radius: number,
): Promise<CustomResponse> {
  return await apiClient.getV2({
    subUrl: 'branches/nearby',
    query: { latitude: lat, longitude: lng, radius: radius },
    isListOfModel: true,
    fromJson: parseBranchModel,
    needToken: false,
  });
}

export async function getPopularBranches(): Promise<CustomResponse> {
  return await apiClient.getV2({
    subUrl: 'branches/popular',
    isListOfModel: true,
    fromJson: parseBranchModel,
    needToken: false,
  });
}

export async function getBranch(id: number): Promise<CustomResponse> {
  return await apiClient.getV2({
    subUrl: `branches/${id}`,
    fromJson: parseBranchModel,
    needToken: false,
  });
}

export async function getVendorBranches(vendorId: number): Promise<CustomResponse> {
  return await apiClient.getV2({
    subUrl: `branches/vendor/${vendorId}`,
    isListOfModel: true,
    fromJson: parseBranchModel,
    needToken: false,
  });
}

//-------------------------------------------------------
//-------------------[Subcategories Repository]----------
//-------------------------------------------------------

export async function searchSubcategories(query: string): Promise<CustomResponse> {
  return await apiClient.getV2({
    subUrl: 'subcategories/search',
    query: { q: query },
    isListOfModel: true,
    fromJson: parseSubcategoryModel,
    needToken: false,
  });
}

export async function getBranchSubcategories(branchId: number): Promise<CustomResponse> {
  return await apiClient.getV2({
    subUrl: `subcategories/branches/${branchId}`,
    isListOfModel: true,
    fromJson: parseSubcategoryModel,
    needToken: false,
  });
}

export async function getSubcategory(
  branchId: number,
  subId: number,
): Promise<CustomResponse> {
  return await apiClient.getV2({
    subUrl: `subcategories/branches/${branchId}/${subId}`,
    fromJson: parseSubcategoryModel,
    needToken: false,
  });
}

//-------------------------------------------------------
//-------------------[Products Repository]---------------
//-------------------------------------------------------

export async function getProduct(id: number): Promise<CustomResponse> {
  return await apiClient.getV2({
    subUrl: `products/${id}`,
    fromJson: parseProductModel,
    needToken: false,
  });
}

export async function getBranchProducts(branchId: number): Promise<CustomResponse> {
  return await apiClient.getV2({
    subUrl: `products/branches/${branchId}`,
    isListOfModel: true,
    fromJson: parseProductModel,
    needToken: false,
  });
}

export async function getSubcategoryProducts(
  branchId: number,
  subId: number,
): Promise<CustomResponse> {
  return await apiClient.getV2({
    subUrl: `products/branches/${branchId}/subcategories/${subId}`,
    isListOfModel: true,
    fromJson: parseProductModel,
    needToken: false,
  });
}

//-------------------------------------------------------
//-------------------[Reviews Repository]----------------
//-------------------------------------------------------

export async function getBranchReviews(branchId: number): Promise<CustomResponse> {
  return await apiClient.getV2({
    subUrl: `reviews/branches/${branchId}`,
    isListOfModel: true,
    fromJson: parseReviewModel,
    needToken: false,
  });
}

export async function getBranchReviewStats(branchId: number): Promise<CustomResponse> {
  return await apiClient.getV2({
    subUrl: `reviews/branches/${branchId}/stats`,
    needToken: false,
  });
}

export async function getUserReviews(userId: number): Promise<CustomResponse> {
  return await apiClient.getV2({
    subUrl: `reviews/user/${userId}`,
    isListOfModel: true,
    fromJson: parseReviewModel,
    needToken: false,
  });
}

//-------------------------------------------------------
//-------------------[Offers Repository]-----------------
//-------------------------------------------------------

export async function getActiveOffers(): Promise<CustomResponse> {
  return await apiClient.getV2({
    subUrl: 'offers/active',
    isListOfModel: true,
    fromJson: parseOfferModel,
    needToken: false,
  });
}

export async function getExpiredOffers(): Promise<CustomResponse> {
  return await apiClient.getV2({
    subUrl: 'offers/expired',
    isListOfModel: true,
    fromJson: parseOfferModel,
    needToken: false,
  });
}

export async function getOffer(id: number): Promise<CustomResponse> {
  return await apiClient.getV2({
    subUrl: `offers/${id}`,
    fromJson: parseOfferModel,
    needToken: false,
  });
}

// Vendor admin/extra endpoints (ported from http_helper.dart)
export async function getExpiredSubscriptions(): Promise<CustomResponse> {
  return await apiClient.getV2({
    subUrl: 'vendors/expired-subscriptions',
    isListOfModel: true,
    fromJson: parseVendorModel,
    needToken: true,
  });
}

export async function createVendor(vendor: any): Promise<CustomResponse> {
  return await apiClient.postV2({
    subUrl: 'vendors',
    data: vendor,
    fromJson: parseVendorModel,
    needToken: true,
  });
}

export async function updateVendor(id: number, vendor: any): Promise<CustomResponse> {
  return await apiClient.put({ subUrl: `vendors/${id}`, data: vendor, needToken: true });
}

export async function deleteVendor(id: number): Promise<CustomResponse> {
  return await apiClient.delete({ subUrl: `vendors/${id}`, needToken: true });
}

export const catalogRepo = {
  getCategories,
  getCategory,
  getVendors,
  getPopularVendors,
  getVendor,
  getExpiredSubscriptions,
  createVendor,
  updateVendor,
  deleteVendor,
  getBranches,
  getNearbyBranches,
  getPopularBranches,
  getBranch,
  getVendorBranches,
  searchSubcategories,
  getBranchSubcategories,
  getSubcategory,
  getProduct,
  getBranchProducts,
  getSubcategoryProducts,
  getBranchReviews,
  getBranchReviewStats,
  getUserReviews,
  getActiveOffers,
  getExpiredOffers,
  getOffer,
};
