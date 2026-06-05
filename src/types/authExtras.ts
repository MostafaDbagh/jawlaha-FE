// Ported from:
//   model/auth_models/register_model.dart
//   model/auth_models/check_form_model.dart
//   model/auth_models/verify_code_model.dart
//   model/auth_models/check_code_password_model.dart
//   model/home/company_model.dart
// Convention: interface + parseX(json) (fromJson) + xToJson (toJson).

export interface RegisterModel {
  token?: string;
  customId?: string;
}

export function parseRegisterModel(json: any): RegisterModel {
  return {
    token: json?.token,
    customId: json?.custom_id,
  };
}

export function registerModelToJson(m: RegisterModel): any {
  return {
    token: m.token,
    custom_id: m.customId,
  };
}

export interface CheckFormModel {
  isAvailable?: boolean;
}

export function parseCheckFormModel(json: any): CheckFormModel {
  return {
    isAvailable: json?.is_available,
  };
}

export function checkFormModelToJson(m: CheckFormModel): any {
  return {
    is_available: m.isAvailable,
  };
}

export interface VerifyCodeModel {
  isExists?: boolean;
}

export function parseVerifyCodeModel(json: any): VerifyCodeModel {
  return {
    isExists: json?.is_exists,
  };
}

export function verifyCodeModelToJson(m: VerifyCodeModel): any {
  return {
    is_exists: m.isExists,
  };
}

export interface CheckCodePasswordModel {
  success?: boolean;
}

export function parseCheckCodePasswordModel(json: any): CheckCodePasswordModel {
  return {
    success: json?.success,
  };
}

export function checkCodePasswordModelToJson(m: CheckCodePasswordModel): any {
  return {
    success: m.success,
  };
}

export interface CompanyModel {
  id?: number;
  name?: string;
  isMember?: string;
  canJoin?: string;
  legalName?: string;
  registrationNumber?: string;
  vatNumber?: string;
  taxId?: string;
  country?: string;
  city?: string;
  addressLine?: string;
  postalCode?: string;
  phone?: string;
  status?: string;
  email?: string;
  website?: string;
  industryType?: string;
  logoPath?: string;
  translation?: string;
  ownerId?: number;
  deletedAt?: string;
  createdAt?: string;
  updatedAt?: string;
  accountType?: string;
}

export function parseCompanyModel(json: any): CompanyModel {
  return {
    id: json?.id,
    name: json?.name,
    isMember: json?.is_member?.toString(),
    canJoin: json?.can_join?.toString(),
    legalName: json?.legal_name,
    registrationNumber: json?.registration_number,
    vatNumber: json?.vat_number,
    taxId: json?.tax_id,
    country: json?.country,
    city: json?.city,
    addressLine: json?.address_line,
    postalCode: json?.postal_code,
    phone: json?.phone,
    status: json?.status,
    email: json?.email,
    website: json?.website,
    industryType: json?.industry_type,
    logoPath: json?.logo_path,
    translation: json?.translation,
    ownerId: json?.owner_id,
    deletedAt: json?.deleted_at,
    createdAt: json?.created_at,
    updatedAt: json?.updated_at,
    accountType: json?.account_type,
  };
}

export function companyModelToJson(m: CompanyModel): any {
  return {
    id: m.id,
    name: m.name,
    is_member: m.isMember,
    can_join: m.canJoin,
    legal_name: m.legalName,
    registration_number: m.registrationNumber,
    vat_number: m.vatNumber,
    tax_id: m.taxId,
    country: m.country,
    city: m.city,
    address_line: m.addressLine,
    postal_code: m.postalCode,
    phone: m.phone,
    status: m.status,
    email: m.email,
    website: m.website,
    industry_type: m.industryType,
    logo_path: m.logoPath,
    translation: m.translation,
    owner_id: m.ownerId,
    deleted_at: m.deletedAt,
    created_at: m.createdAt,
    updated_at: m.updatedAt,
    account_type: m.accountType,
  };
}
