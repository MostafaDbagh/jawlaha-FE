// Ported from data/http_helper.dart (auth requests) + data/repository.dart (auth side-effects).
// Mirrors HttpHelper auth endpoints and Repository auth-response wrappers.
import { apiClient, CustomResponse, API } from '@/lib/api';
import {
  AuthModel,
  parseAuthModel,
  ProfileModel,
  parseProfileModel,
  parseUser,
} from '@/types/auth';
import {
  CheckFormModel,
  parseCheckFormModel,
  VerifyCodeModel,
  parseVerifyCodeModel,
  CheckCodePasswordModel,
  parseCheckCodePasswordModel,
  CompanyModel,
  parseCompanyModel,
} from '@/types/authExtras';
import { useAuthStore } from '@/store/authStore';

// -------------------------------------------------------
// InputValidator (mirrors core/security/input_validator.dart) — used by login.
// -------------------------------------------------------
const _emailRegex = /^[a-zA-Z0-9.]+@[a-zA-Z0-9]+\.[a-zA-Z]+$/;

function sanitizeInput(input: string): string {
  if (input.length === 0) return input;
  return input
    .trim()
    .split('<').join('')
    .split('>').join('')
    .split('"').join('')
    .split("'").join('')
    .split('&').join('&amp;')
    .split(';').join('&#59;');
}

function validateEmail(email: string): string | null {
  const sanitizedEmail = sanitizeInput(email);
  if (sanitizedEmail.length === 0) {
    return 'Email is required';
  }
  if (!_emailRegex.test(sanitizedEmail)) {
    return 'Please enter a valid email address';
  }
  if (sanitizedEmail.length > 254) {
    return 'Email is too long';
  }
  return null;
}

function validatePassword(password: string): string | null {
  if (password.length === 0) {
    return 'Password is required';
  }
  if (password.length < 8) {
    return 'Password must be at least 8 characters long';
  }
  if (password.length > 128) {
    return 'Password is too long';
  }
  const weakPasswords = ['password', '123456', 'qwerty', 'admin'];
  if (weakPasswords.includes(password.toLowerCase())) {
    return 'Please choose a stronger password';
  }
  return null;
}

// -------------------------------------------------------
// -------------------[Auth Response]---------------------
// -------------------------------------------------------
export async function login(email: string, password: string): Promise<CustomResponse> {
  // Validate inputs
  const emailError = validateEmail(email);
  if (emailError != null) {
    return new CustomResponse(-1, null, emailError, false);
  }

  const passwordError = validatePassword(password);
  if (passwordError != null) {
    return new CustomResponse(-1, null, passwordError, false);
  }

  // Sanitize inputs
  const sanitizedEmail = sanitizeInput(email);

  const mapData = {
    email: sanitizedEmail,
    password_hash: password, // Don't sanitize password as it might contain special chars
  };

  const data = await apiClient.postV2<AuthModel>({
    subUrl: 'auth/login',
    needToken: false,
    data: mapData,
    fromJson: parseAuthModel,
  });
  if (data.success) {
    const authModel = data.object as AuthModel;
    if (authModel.token != null && authModel.token.length > 0) {
      useAuthStore.getState().setUser(authModel.user ?? null);
      await useAuthStore.getState().setToken(authModel.token);
      await getProfile();
    }
  }
  return data;
}

export async function getProfile(): Promise<CustomResponse> {
  const data = await apiClient.getV2<ProfileModel>({
    subUrl: 'auth/profile',
    needToken: true,
    fromJson: parseProfileModel,
  });
  if (data.success) {
    const profileModel = data.object as ProfileModel;
    if (profileModel.user != null) {
      useAuthStore.getState().setUser(profileModel.user);
    }
  }
  return data;
}

export async function getLogoutFromCurrentToken(): Promise<CustomResponse> {
  const data = await apiClient.getV2({
    subUrl: 'logoutFromCurrentToken',
    needToken: true,
  });
  if (data.success) {
    await logoutPref();
  }
  return data;
}

export async function checkField(checkFrom: string, value: string): Promise<CustomResponse> {
  const mapData = { check_from: checkFrom, value: value };
  const data = await apiClient.postV2<CheckFormModel>({
    subUrl: 'is_available',
    needToken: false,
    data: mapData,
    fromJson: parseCheckFormModel,
  });
  return data;
}

export async function checkCompanyUser(empId: string, companyId: string): Promise<CustomResponse> {
  const mapData = { emp_id: empId, company_id: companyId };
  const data = await apiClient.postV2<CheckFormModel>({
    subUrl: 'check_company_user',
    needToken: false,
    data: mapData,
    fromJson: parseCheckFormModel,
  });
  return data;
}

export async function getNewCode(email: string): Promise<CustomResponse> {
  const mapData = { identifier: email };
  const data = await apiClient.postV2({
    subUrl: 'newCode',
    needToken: false,
    data: mapData,
  });
  return data;
}

export async function verifyCode(email: string, code: string): Promise<CustomResponse> {
  const mapData = { identifier: email, code: code };
  const data = await apiClient.postV2<VerifyCodeModel>({
    subUrl: 'verifyCode',
    needToken: false,
    data: mapData,
    fromJson: parseVerifyCodeModel,
  });
  return data;
}

export async function checkCodeForResetPassword(
  email: string,
  code: string,
): Promise<CustomResponse> {
  const mapData = { identifier: email, code: code };
  const data = await apiClient.postV2<CheckCodePasswordModel>({
    subUrl: 'checkCode',
    needToken: false,
    data: mapData,
    fromJson: parseCheckCodePasswordModel,
  });
  return data;
}

export async function changePasswordViaCode(
  email: string,
  code: string,
  password: string,
  confirmPassword: string,
): Promise<CustomResponse> {
  const mapData = {
    identifier: email,
    code: code,
    password: password,
    confirm_password: confirmPassword,
  };
  const data = await apiClient.postV2({
    subUrl: 'changePasswordViaCode',
    needToken: false,
    data: mapData,
  });
  return data;
}

export async function resetPasswordViaEmail(
  email: string,
  customId: string,
): Promise<CustomResponse> {
  const mapData = { email: email, custom_id: customId };
  const data = await apiClient.postV2({
    subUrl: 'resetPasswordViaEmail',
    needToken: false,
    data: mapData,
  });
  return data;
}

export async function register(args: {
  username: string;
  email: string;
  countryCode: string;
  phoneNumber: string;
  dateOfBirth: string;
  gender: string;
  passwordHash: string;
  accountType: string;
}): Promise<CustomResponse> {
  const mapData = {
    username: args.username,
    email: args.email,
    country_code: args.countryCode,
    phone_number: args.phoneNumber,
    date_of_birth: args.dateOfBirth,
    gender: args.gender,
    password_hash: args.passwordHash,
    account_type: args.accountType,
  };
  const data = await apiClient.postV2<AuthModel>({
    subUrl: 'auth/register',
    needToken: false,
    data: mapData,
    fromJson: parseAuthModel,
  });
  if (data.success) {
    const authModel = data.object as AuthModel;
    if (authModel.token != null && authModel.token.length > 0) {
      await useAuthStore.getState().setToken(authModel.token);
      await getProfile();
    }
  }
  return data;
}

export async function getCompaniesForRegister(search?: string): Promise<CustomResponse> {
  const queryMap: Record<string, string> = { dropDown: '1' };
  if (search != null && search.length > 0) {
    queryMap['search'] = search;
  }
  const data = await apiClient.getV2<CompanyModel>({
    subUrl: 'getActiveCompanies',
    query: queryMap,
    isListOfModel: true,
    fromJson: parseCompanyModel,
  });
  return data;
}

// -------------------------------------------------------
// -------------------[New Auth Requests]-----------------
// -------------------------------------------------------
export async function updateProfile(data: Record<string, any>): Promise<CustomResponse> {
  return await apiClient.put({
    subUrl: 'auth/profile',
    data: data,
    needToken: true,
  });
}

export async function requestOtpLogin(phone: string): Promise<CustomResponse> {
  return await apiClient.postV2({
    subUrl: 'auth/request-otp-login',
    data: { phone: phone },
    needToken: false,
  });
}

export async function verifyOtpLogin(phone: string, otp: string): Promise<CustomResponse> {
  const data = await apiClient.postV2<AuthModel>({
    subUrl: 'auth/verify-otp-login',
    data: { phone: phone, otp: otp },
    needToken: false,
    fromJson: parseAuthModel,
  });
  if (data.success) {
    const authModel = data.object as AuthModel;
    if (authModel.token != null && authModel.token.length > 0) {
      useAuthStore.getState().setUser(authModel.user ?? null);
      await useAuthStore.getState().setToken(authModel.token);
      await getProfile();
    }
  }
  return data;
}

export async function verifyEmail(email: string, otpCode: string): Promise<CustomResponse> {
  return await apiClient.postV2({
    subUrl: 'auth/verify-email',
    data: { email: email, otp_code: otpCode },
    needToken: false,
  });
}

export async function healthCheck(): Promise<CustomResponse> {
  return await apiClient.getV2({
    subUrl: 'health',
    url: API.baseUrl,
    needToken: false,
  });
}

export async function refreshToken(): Promise<CustomResponse> {
  const data = await apiClient.postV2<AuthModel>({
    subUrl: 'auth/refresh-token',
    needToken: true,
    fromJson: parseAuthModel,
  });
  if (data.success) {
    const authModel = data.object as AuthModel;
    if (authModel.token != null && authModel.token.length > 0) {
      await useAuthStore.getState().setToken(authModel.token);
    }
  }
  return data;
}

export async function resendOtp(email: string): Promise<CustomResponse> {
  return await apiClient.postV2({
    subUrl: 'auth/resend-otp',
    data: { email: email },
    needToken: false,
  });
}

export async function verifyOtp(email: string, otp: string): Promise<CustomResponse> {
  return await apiClient.postV2({
    subUrl: 'auth/verify-otp',
    data: { email: email, otp_code: otp },
    needToken: false,
  });
}

export async function requestPasswordReset(email: string): Promise<CustomResponse> {
  return await apiClient.postV2({
    subUrl: 'auth/request-password-reset',
    data: { email: email },
    needToken: false,
  });
}

export async function resetPassword(
  email: string,
  otp: string,
  newPassword: string,
): Promise<CustomResponse> {
  return await apiClient.postV2({
    subUrl: 'auth/reset-password',
    data: { email: email, otp_code: otp, new_password: newPassword },
    needToken: false,
  });
}

export async function logout(): Promise<CustomResponse> {
  await apiClient.postV2({ subUrl: 'auth/logout', needToken: true });
  // _secureStorageHelper.clearToken() — handled via the auth store logout.
  await useAuthStore.getState().logout();
  return new CustomResponse(200, null, 'Logged out successfully', true);
}

export async function saveFcmToken(token: string): Promise<CustomResponse> {
  return await apiClient.postV2({
    subUrl: 'users/fcm-token',
    data: { fcm_token: token },
    needToken: true,
  });
}

export async function saveFCMToken(args: {
  firebaseToken: string;
  deviceType: string;
  deviceName: string;
  deviceId: string;
  deviceModel: string;
  deviceManufacturer: string;
  appVersion: string;
  buildNumber: string;
  appLanguage: string;
  platformVersion: string;
  timezone: string;
}): Promise<CustomResponse> {
  const mapData = {
    firebase_token: args.firebaseToken,
    device_type: args.deviceType,
    device_name: args.deviceName,
    device_id: args.deviceId,
    device_model: args.deviceModel,
    device_manufacturer: args.deviceManufacturer,
    app_version: args.appVersion,
    build_number: args.buildNumber,
    app_language: args.appLanguage,
    platform_version: args.platformVersion,
    // timezone: args.timezone
  };
  const data = await apiClient.postV2({
    subUrl: 'saveToken',
    needToken: true,
    data: mapData,
  });
  return data;
}

// Mirrors Repository.logoutPref() — clears token + user.
async function logoutPref(): Promise<void> {
  await useAuthStore.getState().logout();
}

export const authRepo = {
  login,
  getProfile,
  getLogoutFromCurrentToken,
  checkField,
  checkCompanyUser,
  getNewCode,
  verifyCode,
  checkCodeForResetPassword,
  changePasswordViaCode,
  resetPasswordViaEmail,
  register,
  getCompaniesForRegister,
  updateProfile,
  requestOtpLogin,
  verifyOtpLogin,
  verifyEmail,
  healthCheck,
  refreshToken,
  resendOtp,
  verifyOtp,
  requestPasswordReset,
  resetPassword,
  logout,
  saveFcmToken,
  saveFCMToken,
};
