// Ported from entities/address/address_entity.dart, entities/address/payment_card_entity.dart,
// entities/checkout_entities/checkout_order_entity.dart, entities/filter_eintty.dart,
// entities/base_entities/paginate_req_entity.dart (+ core/enums/params_type.dart SortType).
// Convention: interface + parseX(json) (fromJson) + xToJson (toJson) when present.

export interface AddressEntity {
  id?: string;
  method?: string;
  title?: string;
  address?: string;
  lat?: string;
  long?: string;
}

export function parseAddressEntity(json: any): AddressEntity {
  return {
    id: json?.id,
    method: json?._method,
    title: json?.title,
    address: json?.address,
    lat: json?.lat,
    long: json?.long,
  };
}

export function addressEntityToJson(x: AddressEntity): any {
  const map: any = {};
  if (x.id != null) map['id'] = x.id;
  if (x.method != null) map['_method'] = x.method;
  if (x.title != null) map['title'] = x.title;
  if (x.address != null) map['address'] = x.address;
  if (x.lat != null) map['lat'] = x.lat;
  if (x.long != null) map['long'] = x.long;
  return map;
}

export interface PaymentCardEntity {
  cardNum?: string;
  expDate?: string;
  cvv?: string;
  cardHolderName?: string;
  cardTypeId?: string;
}

export function parsePaymentCardEntity(json: any): PaymentCardEntity {
  return {
    cardNum: json?.card_num,
    expDate: json?.exp_date,
    cvv: json?.cvv,
    cardHolderName: json?.card_holder_name,
    cardTypeId: json?.card_type_id,
  };
}

export function paymentCardEntityToJson(x: PaymentCardEntity): any {
  const map: any = {};
  if (x.cardNum != null && x.cardNum.length > 0) {
    map['card_num'] = x.cardNum;
  }
  if (x.expDate != null && x.expDate.length > 0) {
    map['exp_date'] = x.expDate;
  }
  if (x.cvv != null && x.cvv.length > 0) {
    map['cvv'] = x.cvv;
  }
  if (x.cardHolderName != null && x.cardHolderName.length > 0) {
    map['card_holder_name'] = x.cardHolderName;
  }
  if (x.cardTypeId != null && x.cardTypeId.length > 0) {
    map['card_type_id'] = x.cardTypeId;
  }
  return map;
}

export interface CheckoutOrderEntity {
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  state?: string;
  city?: string;
  zipCode?: string;
  shippingMethodId?: string;
  payStatus?: number;
  addressId?: string;
  fullAddress?: string;
  saveAddress?: number;
  lat?: string;
  long?: string;
  coupon?: string;
}

export function parseCheckoutOrderEntity(json: any): CheckoutOrderEntity {
  return {
    firstName: json?.first_name,
    lastName: json?.last_name,
    email: json?.email,
    phoneNumber: json?.phone_number,
    state: json?.state,
    city: json?.city,
    zipCode: json?.zip_code,
    shippingMethodId: json?.shipping_method_id,
    payStatus: json?.pay_status,
    addressId: json?.address_id,
    fullAddress: json?.full_address,
    saveAddress: json?.save_address,
    lat: json?.lat,
    long: json?.long,
    coupon: json?.coupon,
  };
}

export function checkoutOrderEntityToJson(x: CheckoutOrderEntity): any {
  const map: any = {};
  if (x.firstName != null) map['first_name'] = x.firstName.toString();
  if (x.lastName != null) map['last_name'] = x.lastName.toString();
  if (x.email != null) map['email'] = x.email.toString();
  if (x.phoneNumber != null) map['phone_number'] = x.phoneNumber.toString();
  if (x.state != null) map['state'] = x.state.toString();
  if (x.city != null) map['city'] = x.city.toString();
  if (x.zipCode != null) map['zip_code'] = x.zipCode.toString();
  if (x.shippingMethodId != null) {
    map['shipping_method_id'] = x.shippingMethodId.toString();
  }
  if (x.payStatus != null) map['pay_status'] = x.payStatus.toString();
  if (x.addressId != null) map['address_id'] = x.addressId.toString();
  if (x.fullAddress != null) map['full_address'] = x.fullAddress.toString();
  if (x.saveAddress != null) map['save_address'] = x.saveAddress.toString();
  if (x.lat != null) map['lat'] = x.lat.toString();
  if (x.long != null) map['long'] = x.long.toString();
  if (x.coupon != null) map['coupon'] = x.coupon.toString();
  return map;
}

export interface FilterEntity {
  categoryId?: string;
  subcategoryId?: string;
  brandId?: string;
  minPrice?: string;
  maxPrice?: string;
  rate?: string;
  hasOffer?: string;
}

export function parseFilterEntity(json: any): FilterEntity {
  return {
    categoryId: json?.category_id,
    subcategoryId: json?.subcategory_id,
    brandId: json?.brand_id,
    minPrice: json?.min_price,
    maxPrice: json?.max_price,
    rate: json?.rate,
    hasOffer: json?.has_offer,
  };
}

export function filterEntityToJson(x: FilterEntity): any {
  const map: any = {};
  if (x.categoryId != null) map['category_id'] = x.categoryId;
  if (x.subcategoryId != null) map['subcategory_id'] = x.subcategoryId;
  if (x.brandId != null) map['brand_id'] = x.brandId;
  if (x.minPrice != null) map['min_price'] = x.minPrice;
  if (x.maxPrice != null) map['max_price'] = x.maxPrice;
  if (x.rate != null) map['rate'] = x.rate;
  if (x.hasOffer != null) map['has_offer'] = x.hasOffer;
  return map;
}

// from core/enums/params_type.dart
export enum SortType {
  asc = 'asc',
  dsc = 'dsc',
}

export interface PaginateReqEntity {
  page: number;
  perPage: number;
  sortType: SortType;
}

export function createPaginateReqEntity(params?: {
  page?: number;
  sortType?: SortType;
  perPage?: number;
}): PaginateReqEntity {
  return {
    page: params?.page ?? 1,
    sortType: params?.sortType ?? SortType.asc,
    perPage: params?.perPage ?? 10,
  };
}
