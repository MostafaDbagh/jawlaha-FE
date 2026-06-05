// Ported from model/auth_models/auth_model.dart + profile_model.dart
// Convention example for all models: interface + parseX(json) (fromJson) + xToJson (toJson).

export interface Companies {
  id?: number;
  name?: string;
  companyId?: number;
  empId?: string;
  departmentId?: number;
  costCenterId?: number;
  departmentName?: string;
  departmentCode?: string;
  costCenterName?: string;
  costCenterCode?: string;
  accountType?: string;
  isLeaver?: string;
  leavingDate?: string;
  leaveDateStatus?: string;
}

export function parseCompanies(json: any): Companies {
  return {
    id: json?.id,
    name: json?.name,
    companyId: json?.company_id,
    empId: json?.emp_id?.toString(),
    departmentId: json?.department_id,
    costCenterId: json?.cost_center_id,
    departmentName: json?.department_name,
    departmentCode: json?.department_code,
    costCenterName: json?.cost_center_name,
    costCenterCode: json?.cost_center_code,
    accountType: json?.account_type,
    isLeaver: json?.is_leaver?.toString(),
    leavingDate: json?.leaving_date,
    leaveDateStatus: json?.leave_date_status,
  };
}

export interface User {
  id?: number;
  customId?: string;
  name?: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  emailVerifiedAt?: string;
  verified?: number;
  status?: string;
  nationalInsuranceNumber?: string;
  createdAt?: string;
  updatedAt?: string;
  selectedCompany?: string;
  companies?: Companies[];
  accountType?: string;
}

export function parseUser(json: any): User {
  return {
    id: json?.id,
    customId: json?.custom_id,
    name: json?.name,
    firstName: json?.first_name,
    middleName: json?.middle_name,
    lastName: json?.last_name,
    email: json?.email,
    phone: json?.phone,
    emailVerifiedAt: json?.email_verified_at,
    verified: json?.verified,
    status: json?.status,
    nationalInsuranceNumber: json?.national_insurance_number,
    createdAt: json?.created_at,
    updatedAt: json?.updated_at,
    selectedCompany: json?.selected_company,
    accountType: json?.account_type,
    companies: Array.isArray(json?.companies) ? json.companies.map(parseCompanies) : undefined,
  };
}

export function userToJson(u: User): any {
  return {
    id: u.id,
    custom_id: u.customId,
    name: u.name,
    first_name: u.firstName,
    middle_name: u.middleName,
    last_name: u.lastName,
    email: u.email,
    phone: u.phone,
    email_verified_at: u.emailVerifiedAt,
    verified: u.verified,
    status: u.status,
    national_insurance_number: u.nationalInsuranceNumber,
    created_at: u.createdAt,
    updated_at: u.updatedAt,
    selected_company: u.selectedCompany,
    account_type: u.accountType,
  };
}

export interface AuthModel {
  success?: boolean;
  token?: string;
  user?: User | null;
}

export function parseAuthModel(json: any): AuthModel {
  return {
    success: json?.success,
    token: json?.token,
    user: json?.user != null ? parseUser(json.user) : null,
  };
}

export interface ProfileModel {
  user?: User | null;
  permissions?: string[];
  countUnread?: number;
}

export function parseProfileModel(json: any): ProfileModel {
  return {
    user: json?.user != null ? parseUser(json.user) : null,
    permissions: Array.isArray(json?.permissions) ? json.permissions : [],
    countUnread: json?.count_unread,
  };
}
