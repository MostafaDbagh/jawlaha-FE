// Ported from:
//   lib/screens/auth/controllers/auth/auth_controller.dart
//   lib/screens/auth/controllers/auth/auth_state.dart
// GetX AuthController + AuthState -> zustand store.
import { create } from 'zustand';
import { repository } from '@/data/repository';
import { showSnack } from '@/lib/snack';
import { useAuthStore as useGlobalAuthStore } from '@/store/authStore';
import { secureStorage } from '@/lib/storage';

// Ported from core/enums/gender_type.dart
export enum GenderType {
  male = 'male',
  female = 'female',
  preferNotSay = 'preferNotSay',
}

export function genderValue(type: GenderType): string {
  switch (type) {
    case GenderType.male:
      return 'male';
    case GenderType.female:
      return 'female';
    case GenderType.preferNotSay:
      return 'prefer_not_say';
  }
}

// Ported from core/widgets/country_code/init_country_code.dart (initCountry).
// Native country_pickers package is not used in RN; keep a plain country shape
// with the same fields the screens read (phoneCode/name/iso codes).
export interface Country {
  phoneCode: string;
  name: string;
  iso3Code: string;
  isoCode: string;
}

export function initCountry(num: string): Country {
  // Jawlah targets Syria; default dial code is +963. [[jawlaha-cash-on-delivery-only]]
  return {
    phoneCode: num,
    name: 'Syria',
    iso3Code: 'SYR',
    isoCode: 'SY',
  };
}

// showServerMessages([msg]) -> snackbar error (mirrors core/messages/show_errors_message.dart).
function showServerMessages(messages: string[]) {
  for (const m of messages) {
    showSnack(m, 'error');
  }
}

interface AuthStoreState {
  // ---- AuthState fields (auth_state.dart) ----
  countryCode: Country; // Rx<Country> countryCode = initCountry("963").obs
  isLoading: boolean; // Rx<bool> isLoading = false.obs
  isLoginWithPhone: boolean; // Rx<bool> isLoginWithPhone = false.obs
  genderType: GenderType; // GenderType genderType = GenderType.male
  lastDevOtp: string | null; // dev only: OTP returned by the backend to prefill

  // TextEditingControllers -> plain string fields
  email: string;
  password: string;
  phoneNumber: string;
  fullName: string;
  confirmPassword: string;
  birthDate: string;
  gender: string;

  // ---- field setters (replace controller.text = ... / .value = ...) ----
  setCountryCode: (country: Country) => void;
  setIsLoading: (v: boolean) => void;
  setIsLoginWithPhone: (v: boolean) => void;
  setGenderType: (g: GenderType) => void;
  setEmail: (v: string) => void;
  setPassword: (v: string) => void;
  setPhoneNumber: (v: string) => void;
  setFullName: (v: string) => void;
  setConfirmPassword: (v: string) => void;
  setBirthDate: (v: string) => void;
  setGender: (v: string) => void;

  // ---- AuthController actions (auth_controller.dart) ----
  loginRQ: (args: { email: string; password: string }) => Promise<boolean>;
  getProfile: () => Promise<boolean>;
  initSettings: () => Promise<void>;
  logoutFromCurrentToken: () => Promise<void>;
  getNewCode: (args: { email: string }) => Promise<boolean>;
  verifyCode: (args: { email: string; code: string }) => Promise<boolean>;
  changePasswordViaCode: (args: {
    email: string;
    code: string;
    confirmPassword: string;
    password: string;
  }) => Promise<boolean>;
  updateProfile: (data: Record<string, any>) => Promise<boolean>;
  requestOtpLogin: (phone: string) => Promise<boolean>;
  verifyOtpLogin: (phone: string, otp: string) => Promise<boolean>;
  refreshToken: () => Promise<boolean>;
  resendOtp: (email: string) => Promise<boolean>;
  verifyOtp: (email: string, otp: string) => Promise<boolean>;
  requestPasswordReset: (email: string) => Promise<boolean>;
  resetPassword: (args: {
    email: string;
    otp: string;
    newPassword: string;
  }) => Promise<boolean>;
  logout: () => Promise<void>;
  saveFcmToken: (token: string) => Promise<boolean>;
  clearFields: () => Promise<void>;
}

export const useAuthControllerStore = create<AuthStoreState>((set, get) => ({
  // ---- initial state (mirrors AuthState) ----
  countryCode: initCountry('963'),
  isLoading: false,
  isLoginWithPhone: false,
  genderType: GenderType.male,
  lastDevOtp: null,

  email: '',
  password: '',
  phoneNumber: '',
  fullName: '',
  confirmPassword: '',
  birthDate: '',
  gender: '',

  // ---- setters ----
  setCountryCode: (country) => set({ countryCode: country }),
  setIsLoading: (v) => set({ isLoading: v }),
  setIsLoginWithPhone: (v) => set({ isLoginWithPhone: v }),
  setGenderType: (g) => set({ genderType: g }),
  setEmail: (v) => set({ email: v }),
  setPassword: (v) => set({ password: v }),
  setPhoneNumber: (v) => set({ phoneNumber: v }),
  setFullName: (v) => set({ fullName: v }),
  setConfirmPassword: (v) => set({ confirmPassword: v }),
  setBirthDate: (v) => set({ birthDate: v }),
  setGender: (v) => set({ gender: v }),

  // ---- actions ----
  async loginRQ({ email, password }) {
    try {
      set({ isLoading: true });
      const response = await repository.login(email, password);
      if (response.success) {
        set({ isLoading: false });
        return true;
      } else {
        showServerMessages([response.msg]);
      }
    } catch (e) {
      showServerMessages([String(e)]);
    } finally {
      set({ isLoading: false });
    }
    return false;
  },

  async getProfile() {
    try {
      set({ isLoading: true });
      const response = await repository.getProfile();
      if (!response.success) {
        // showServerMessages([response.msg]);
      }
      return response.success;
    } catch (e) {
      // Handle error
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  async initSettings() {
    try {
      // await GetStorage.init("MyPref") — handled by storage init at app bootstrap.
      // await _appLangController.getInitLang() — handled by useI18n() bootstrap.
      const token = await secureStorage.getToken();
      if (token && token.length > 0) {
        // LocalStaticVar.token = token -> global auth store token.
        await useGlobalAuthStore.getState().setToken(token);
        await get().getProfile();
        // Get.offAllNamed(Routes.main) — navigation handled by the caller/router.
      } else {
        // Get.offAllNamed(Routes.main) — navigation handled by the caller/router.
      }
    } catch (e) {
      // Get.offAllNamed(Routes.main) — navigation handled by the caller/router.
    }
  },

  async logoutFromCurrentToken() {
    try {
      await repository.getLogoutFromCurrentToken();
    } catch (e) {
      // Handle error
    }
  },

  async getNewCode({ email }) {
    try {
      set({ isLoading: true });
      const res = await repository.getNewCode(email);
      if (res.success) {
        return true;
      } else {
        showServerMessages([res.msg]);
      }
    } catch (e) {
      showServerMessages([String(e)]);
    } finally {
      set({ isLoading: false });
    }
    return false;
  },

  async verifyCode({ email, code }) {
    try {
      set({ isLoading: true });
      const res = await repository.verifyCode(email, code);
      if (res.success) {
        const verifyCodeRes = res.object as { isExists?: boolean };
        return verifyCodeRes.isExists ?? false;
      } else {
        showServerMessages([res.msg]);
      }
    } catch (e) {
      showServerMessages([String(e)]);
    } finally {
      set({ isLoading: false });
    }
    return false;
  },

  async changePasswordViaCode({ email, code, confirmPassword, password }) {
    try {
      set({ isLoading: true });
      const res = await repository.changePasswordViaCode(
        email,
        code,
        password,
        confirmPassword,
      );
      if (res.success) {
        return true;
      } else {
        showServerMessages([res.msg]);
      }
    } catch (e) {
      showServerMessages([String(e)]);
    } finally {
      set({ isLoading: false });
    }
    return false;
  },

  async updateProfile(data) {
    try {
      set({ isLoading: true });
      const res = await repository.updateProfile(data);
      if (res.success) {
        await get().getProfile();
        return true;
      } else {
        showServerMessages([res.msg]);
      }
    } catch (e) {
      showServerMessages([String(e)]);
    } finally {
      set({ isLoading: false });
    }
    return false;
  },

  async requestOtpLogin(phone) {
    try {
      set({ isLoading: true });
      const res = await repository.requestOtpLogin(phone);
      if (res.success) {
        // Dev convenience: backend returns the OTP (and master code) so the
        // verification screen can prefill it without a real SMS gateway.
        const devOtp = (res.object as { devOtp?: string } | null)?.devOtp ?? null;
        set({ lastDevOtp: devOtp });
        return true;
      } else {
        showServerMessages([res.msg]);
      }
    } catch (e) {
      showServerMessages([String(e)]);
    } finally {
      set({ isLoading: false });
    }
    return false;
  },

  async verifyOtpLogin(phone, otp) {
    try {
      set({ isLoading: true });
      const res = await repository.verifyOtpLogin(phone, otp);
      if (res.success) {
        return true;
      } else {
        showServerMessages([res.msg]);
      }
    } catch (e) {
      showServerMessages([String(e)]);
    } finally {
      set({ isLoading: false });
    }
    return false;
  },

  async refreshToken() {
    try {
      const res = await repository.refreshToken();
      return res.success;
    } catch (e) {
      return false;
    }
  },

  async resendOtp(email) {
    try {
      set({ isLoading: true });
      const res = await repository.resendOtp(email);
      if (res.success) {
        return true;
      } else {
        showServerMessages([res.msg]);
      }
    } catch (e) {
      showServerMessages([String(e)]);
    } finally {
      set({ isLoading: false });
    }
    return false;
  },

  async verifyOtp(email, otp) {
    try {
      set({ isLoading: true });
      const res = await repository.verifyOtp(email, otp);
      if (res.success) {
        return true;
      } else {
        showServerMessages([res.msg]);
      }
    } catch (e) {
      showServerMessages([String(e)]);
    } finally {
      set({ isLoading: false });
    }
    return false;
  },

  async requestPasswordReset(email) {
    try {
      set({ isLoading: true });
      const res = await repository.requestPasswordReset(email);
      if (res.success) {
        return true;
      } else {
        showServerMessages([res.msg]);
      }
    } catch (e) {
      showServerMessages([String(e)]);
    } finally {
      set({ isLoading: false });
    }
    return false;
  },

  async resetPassword({ email, otp, newPassword }) {
    try {
      set({ isLoading: true });
      const res = await repository.resetPassword(email, otp, newPassword);
      if (res.success) {
        return true;
      } else {
        showServerMessages([res.msg]);
      }
    } catch (e) {
      showServerMessages([String(e)]);
    } finally {
      set({ isLoading: false });
    }
    return false;
  },

  async logout() {
    try {
      set({ isLoading: true });
      await repository.logout();
      // Get.offAllNamed(Routes.login) — navigation handled by the caller/router.
    } catch (e) {
      // Handle error, maybe still logout locally
    } finally {
      set({ isLoading: false });
    }
  },

  async saveFcmToken(token) {
    const res = await repository.saveFcmToken(token);
    return res.success;
  },

  // register() — kept commented out in the Flutter source; omitted faithfully.

  async clearFields() {
    set({
      genderType: GenderType.male,
      countryCode: initCountry('963'),
      email: '',
      phoneNumber: '',
      fullName: '',
      password: '',
      confirmPassword: '',
      birthDate: '',
      gender: '',
    });
  },
}));
