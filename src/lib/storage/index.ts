import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

// Mirrors Constant storage keys (core/constant.dart)
export const StorageKeys = {
  ACCESS_TOKEN: 'ACCESS_TOKEN',
  APP_LANGUAGE: 'APP_LANGUAGE',
  FIRST_OPEN: 'FIRST_OPEN',
  USER_ID: 'USER_ID',
  PAYMENT_CARD_ID: 'PAYMENT_CARD_ID',
  SAVED_ADDRESS_ID: 'SAVED_ADDRESS_ID',
  SAVED_ADDRESS_TITLE: 'SAVED_ADDRESS_TITLE',
  APP_THEME: 'APP_THEME',
  APP_NAME: 'app_name',
  APP_LOGO: 'app_logo',
} as const;

// Namespaced like GetStorage("MyPref")
const NS = 'MyPref:';
const k = (key: string) => NS + key;

// Generic typed AsyncStorage wrapper (mirrors GetStorage box read/write).
export const storage = {
  async getString(key: string): Promise<string | null> {
    return AsyncStorage.getItem(k(key));
  },
  async setString(key: string, value: string): Promise<void> {
    await AsyncStorage.setItem(k(key), value);
  },
  async getJSON<T>(key: string): Promise<T | null> {
    const raw = await AsyncStorage.getItem(k(key));
    if (raw == null) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  },
  async setJSON(key: string, value: unknown): Promise<void> {
    await AsyncStorage.setItem(k(key), JSON.stringify(value));
  },
  async getBool(key: string): Promise<boolean> {
    return (await AsyncStorage.getItem(k(key))) === 'true';
  },
  async setBool(key: string, value: boolean): Promise<void> {
    await AsyncStorage.setItem(k(key), value ? 'true' : 'false');
  },
  async getInt(key: string): Promise<number> {
    const raw = await AsyncStorage.getItem(k(key));
    const n = raw != null ? parseInt(raw, 10) : 0;
    return Number.isNaN(n) ? 0 : n;
  },
  async setInt(key: string, value: number): Promise<void> {
    await AsyncStorage.setItem(k(key), String(value));
  },
  async remove(key: string): Promise<void> {
    await AsyncStorage.removeItem(k(key));
  },
};

// Secure token storage (mirrors SecureStorageHelper).
const TOKEN_KEY = 'secure_access_token';

export const secureStorage = {
  async saveToken(token: string): Promise<void> {
    if (!token) {
      await SecureStore.deleteItemAsync(TOKEN_KEY).catch(() => {});
      // keep mirror in AsyncStorage for sync-style getToken() backward compat
      await storage.setString(StorageKeys.ACCESS_TOKEN, '');
      return;
    }
    await SecureStore.setItemAsync(TOKEN_KEY, token);
    await storage.setString(StorageKeys.ACCESS_TOKEN, token);
  },
  async getToken(): Promise<string> {
    const secure = await SecureStore.getItemAsync(TOKEN_KEY).catch(() => null);
    if (secure) return secure;
    return (await storage.getString(StorageKeys.ACCESS_TOKEN)) ?? '';
  },
  async clearToken(): Promise<void> {
    await SecureStore.deleteItemAsync(TOKEN_KEY).catch(() => {});
    await storage.setString(StorageKeys.ACCESS_TOKEN, '');
  },
  async clearAllData(): Promise<void> {
    await this.clearToken();
  },
};

// Convenience helpers mirroring GetStorageHelper named methods.
export const prefs = {
  saveToken: (token: string) => secureStorage.saveToken(token),
  getToken: () => secureStorage.getToken(),
  setAppLanguage: (v: string) => storage.setString(StorageKeys.APP_LANGUAGE, v),
  getAppLanguage: () => storage.getString(StorageKeys.APP_LANGUAGE),
  setIsFirstOpen: (v: boolean) => storage.setBool(StorageKeys.FIRST_OPEN, v),
  getIsFirstOpen: () => storage.getBool(StorageKeys.FIRST_OPEN),
  getPaymentCardId: () => storage.getInt(StorageKeys.PAYMENT_CARD_ID),
  savedPaymentCardId: (id: number) => storage.setInt(StorageKeys.PAYMENT_CARD_ID, id),
  getAddressId: () => storage.getInt(StorageKeys.SAVED_ADDRESS_ID),
  savedAddressId: (id: number) => storage.setInt(StorageKeys.SAVED_ADDRESS_ID, id),
  getAddressTitle: () => storage.getString(StorageKeys.SAVED_ADDRESS_TITLE),
  savedAddressTitle: (title: string) =>
    storage.setString(StorageKeys.SAVED_ADDRESS_TITLE, title),
  saveAppName: (appName: string) => storage.setString(StorageKeys.APP_NAME, appName),
  getAppName: () => storage.getString(StorageKeys.APP_NAME),
  saveAppLogo: (url: string) => storage.setString(StorageKeys.APP_LOGO, url),
  getAppLogo: () => storage.getString(StorageKeys.APP_LOGO),
};
